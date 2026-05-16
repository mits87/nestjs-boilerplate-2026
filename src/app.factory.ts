import { type INestApplication, type NestApplicationOptions, ValidationPipe, VersioningType } from '@nestjs/common';
import { type AbstractHttpAdapter, NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { useContainer, type ValidationError } from 'class-validator';
import { json, type Request, type Response } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import favicon from 'serve-favicon';

import { IS_PRODUCTION_BUILD } from './app.constants';
import { base64Favicon } from './app.favicon';
import { AppModule } from './app.module';
import { useSwagger } from './app.swagger';
import { BadRequestValidationException } from './exceptions';

/**
 * Applies shared HTTP middleware and global Nest configuration.
 *
 * @param app - The Nest application instance to configure.
 * @returns The configured Nest application instance.
 */
export function useMiddleware(app: INestApplication): INestApplication {
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(favicon(base64Favicon));
  app.use(
    helmet(
      !IS_PRODUCTION_BUILD
        ? {
            contentSecurityPolicy: false,
            crossOriginEmbedderPolicy: false,
            crossOriginOpenerPolicy: false,
            crossOriginResourcePolicy: false,
          }
        : undefined,
    ),
  );
  app.use(json({ limit: '1mb' }));

  app.use('/robots.txt', (_request: Request, res: Response) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  });

  // Sets a global prefix of api https://docs.nestjs.com/faq/global-prefix
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  // Enable validation using Nestjs pipes and class directives
  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: !IS_PRODUCTION_BUILD,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestValidationException(validationErrors, 'Validation failed');
      },
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      whitelist: true,
    }),
  );

  return app;
}

/**
 * Builds the default Nest application options for this project.
 *
 * @param options - NestJS application options.
 * @returns Default NestJS application options merged with custom overrides.
 */
export function nestApplicationOptions(options?: NestApplicationOptions): NestApplicationOptions {
  return {
    bufferLogs: true,
    forceCloseConnections: true,
    ...options,
  };
}

/**
 * Creates a platform agnostic Nest Application by loading the application module and pipeline configurations.
 *
 * @param httpAdapter - An optional HTTP adapter, usually Express.
 * @param settings - Additional Nest application settings.
 * @returns The fully configured Nest HTTP application.
 */
export async function createNestHttpApp(
  httpAdapter?: AbstractHttpAdapter,
  settings?: NestApplicationOptions,
): Promise<INestApplication> {
  const options = nestApplicationOptions(settings);

  // prevents automatic etags from being added
  if (httpAdapter && httpAdapter instanceof ExpressAdapter) {
    httpAdapter.set('etag', false);
    httpAdapter.disable('x-powered-by');
  }

  let app = httpAdapter
    ? await NestFactory.create(AppModule, httpAdapter, options)
    : await NestFactory.create(AppModule, options);

  // This lets class-validator resolve validators from the Nest container.
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app = useMiddleware(app);
  app.useLogger(app.get(Logger));
  app.flushLogs();

  // Starts listening for shutdown hooks.
  app.enableShutdownHooks();

  // Add swagger documentation for the application.
  useSwagger(app);

  return app;
}
