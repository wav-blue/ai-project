import * as dotenv from 'dotenv';
import * as config from 'config';
import { DataSource } from 'typeorm';

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

// dataSource: db 커넥션 정보 저장?
const dataSource = new DataSource({
  type: dbConfig.type,
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT || dbConfig.port,
  username: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
  entities: [__dirname + '/../**/*.entity.{js, ts}'],
  synchronize: dbConfig.synchronize,
});

dataSource
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });
