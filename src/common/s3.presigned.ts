import { Injectable } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3config } from '../configs/s3.config';

//이미지 파일 검증 이 단계에서 할 수 있는지??
@Injectable()
export class S3Service {
  async createPresignedUrl({
    bucket,
    keys,
  }: {
    bucket: string;
    keys: string[];
  }): Promise<string[]> {
    const client = s3config;

    try {
      const urls = await Promise.all(
        keys.map(async (key) => {
          const command = new PutObjectCommand({ Bucket: bucket, Key: key });
          return await getSignedUrl(client, command, { expiresIn: 3600 });
        }),
      );
      return urls;
    } catch (error) {
      throw error;
    }
  }
}
