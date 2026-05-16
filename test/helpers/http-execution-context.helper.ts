import type { ArgumentsHost, ExecutionContext } from '@nestjs/common';
import type { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { mock } from '@suites/doubles.vitest';

/**
 * Options used to build an HTTP execution context test double.
 */
export interface HttpExecutionContextOptions {
  /** Class metadata exposed by the execution context. */
  readonly classRef: ReturnType<ExecutionContext['getClass']>;
  /** Handler metadata exposed by the execution context. */
  readonly handler: ReturnType<ExecutionContext['getHandler']>;
  /** Request URL surfaced by the exception filter. */
  readonly path: string;
  /** Response double returned by the HTTP arguments host. */
  readonly response: {
    readonly json: ReturnType<typeof mock>;
    readonly status: ReturnType<typeof mock>;
  };
}

/**
 * Builds a typed HTTP execution context for exception filter unit tests.
 *
 * @param options - Request path and response mocks exposed through the host.
 * @returns Execution context exposing the configured HTTP request/response pair.
 */
export function createHttpExecutionContext(options: HttpExecutionContextOptions): ArgumentsHost {
  const context = mock<ArgumentsHost>();
  const httpArgumentsHost = mock<HttpArgumentsHost>();

  context.getType.mockReturnValue('http');
  context.switchToHttp.mockReturnValue(httpArgumentsHost);
  httpArgumentsHost.getNext.mockReturnValue(undefined);
  httpArgumentsHost.getRequest.mockReturnValue({ url: options.path });
  httpArgumentsHost.getResponse.mockReturnValue(options.response);

  return context;
}
