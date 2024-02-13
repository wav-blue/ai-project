import { S3Client } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
dotenv.config();

export const s3config = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
