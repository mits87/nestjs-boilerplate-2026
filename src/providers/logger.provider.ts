import { randomUUID } from 'node:crypto';

import type { Params } from 'nestjs-pino';

/** HTTP status threshold above which a request is logged at error level. */
const SERVER_ERROR_STATUS = 500;

/** HTTP status threshold above which a request is logged at warn level. */
const CLIENT_ERROR_STATUS = 400;

/** Response header used to surface the active request identifier. */
const REQUEST_ID_HEADER = 'x-request-id';

/** Log paths that should always be redacted before leaving the process. */
const REDACTED_LOG_PATHS: Array<string> = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
];

/**
 * Minimal pino error shape used by the redacting `err` serializer.
 */
type SerializedPinoError = {
  /** Human-readable error description. */
  readonly message?: string;
  /** Error class name, when present on the thrown value. */
  readonly name?: string;
  /** Raw stack trace captured at throw time. */
  readonly stack?: string;
};

/**
 * Reads a single-value request header from the Node/Nest header bag.
 *
 * @param headerValue - Raw header value from the incoming request.
 * @returns The normalized string value when present.
 */
function getSingleHeaderValue(headerValue?: string | Array<string>): string | undefined {
  if (Array.isArray(headerValue)) {
    const [firstHeaderValue] = headerValue;

    return firstHeaderValue;
  }

  return headerValue;
}

/**
 * Determines whether the current runtime stage should behave as production.
 *
 * @returns `true` when `STAGE=prod`; otherwise `false`.
 */
function isProductionStage(): boolean {
  return (process.env.STAGE || 'local') === 'prod';
}

/**
 * Determines whether the current build is running in production mode.
 *
 * @returns `true` when `NODE_ENV=production`; otherwise `false`.
 */
function isProductionBuild(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Determines whether human-readable pretty logging is enabled.
 *
 * @returns `true` unless `LOG_PRETTY` is explicitly disabled.
 */
function isPrettyLoggingEnabled(): boolean {
  return process.env.LOG_PRETTY !== '0' && process.env.LOG_PRETTY !== 'false';
}

/**
 * Builds the `nestjs-pino` LoggerModule configuration for the application.
 *
 * Behavior:
 * - Default level honors `LOG_LEVEL`, falling back to `info` in production and `debug` elsewhere.
 * - `pino-pretty` is used only outside of production builds and when `LOG_PRETTY` is not disabled.
 * - HTTP responses are mapped to log levels by status code (5xx -> error, 4xx -> warn, otherwise info).
 * - Sensitive request/response headers are redacted before they are emitted.
 * - Every request gets a stable `x-request-id`, either propagated from the caller or generated locally.
 *
 * @returns The options to pass to `LoggerModule.forRoot`.
 */
export function createLoggerOptions(): Params {
  const transport =
    !isProductionBuild() && isPrettyLoggingEnabled()
      ? {
          target: 'pino-pretty',
        }
      : null;

  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL || (isProductionStage() ? 'info' : 'debug'),
      ...(transport !== null ? { transport } : {}),
      redact: {
        paths: REDACTED_LOG_PATHS,
        censor: '[Redacted]',
      },
      customLogLevel: (_request, response, error) => {
        if (error || response.statusCode >= SERVER_ERROR_STATUS) {
          return 'error';
        }
        if (response.statusCode >= CLIENT_ERROR_STATUS) {
          return 'warn';
        }
        return 'info';
      },
      genReqId: (request, response) => {
        const requestId = getSingleHeaderValue(request.headers[REQUEST_ID_HEADER]) ?? randomUUID();

        if (!response.headersSent) {
          response.setHeader(REQUEST_ID_HEADER, requestId);
        }

        return requestId;
      },
      serializers: {
        err: (error: SerializedPinoError) => ({
          type: error?.name,
          message: error?.message,
          stack: error?.stack,
        }),
      },
    },
  };
}
