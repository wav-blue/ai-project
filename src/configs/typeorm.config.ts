import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as config from 'config';

dotenv.config();
const dbConfig = config.get('db');

const connectDB = new DataSource({
  type: dbConfig.type,
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT || dbConfig.port,
  username: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
  entities: [__dirname + '/../**/*.entity.{js, ts}'],
  synchronize: dbConfig.synchronize,
});

connectDB
  .initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

export default connectDB;
