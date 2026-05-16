import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

import { IS_PRODUCTION } from './app.constants';
import { Metadata } from './app.metadata';

/**
 * Configures Swagger for the provided NestJS application.
 *
 * @param app - The Nest application to configure Swagger for.
 */
export function useSwagger(app: INestApplication): void {
  const {
    app: { title, description, version },
  } = Metadata;

  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth()
    .build();

  const options: SwaggerCustomOptions = {
    customSiteTitle: title,
    swaggerOptions: {
      persistAuthorization: !IS_PRODUCTION,
    },
    useGlobalPrefix: true,
  };

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, options);
}
