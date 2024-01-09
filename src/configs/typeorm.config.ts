import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as config from 'config';

dotenv.config();
const dbConfig = config.get('db');

console.log(
  'db 정보',
  process.env.RDS_HOSTNAME,
  process.env.RDS_PORT || dbConfig.port,
  process.env.RDS_USERNAME,
  process.env.RDS_PASSWORD,
  process.env.RDS_DB_NAME,
);

export const typeORMConfig: TypeOrmModuleOptions = {
  type: dbConfig.type,
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT || dbConfig.port,
  username: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
  entities: [__dirname + '/../**/*.entity.{js, ts}'],
  synchronize: dbConfig.synchronize,
};
