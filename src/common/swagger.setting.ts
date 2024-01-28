import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('GuruGuru API Document')
    .setDescription('GuruGuru API description')
    .setVersion('1.0')
    .addTag('elice9')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);
}
