import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as config from 'config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
dotenv.config();
const dbConfig = config.get('db');

export const typeORMConfig: TypeOrmModuleOptions = {
  type: dbConfig.type,
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT || dbConfig.port,
  username: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
  entities: [__dirname + '/../**/*.entity.{js, ts}'],
  synchronize: dbConfig.synchronize,
  logging: dbConfig.logging,
  namingStrategy: new SnakeNamingStrategy(),
};
