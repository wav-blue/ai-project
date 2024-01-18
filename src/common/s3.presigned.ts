import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

//이부분 그냥 congig 에 넣어놔도 되나..?
@Injectable()
export class S3Service {
  createPresignedUrlWithClient({
    region,
    bucket,
    key,
  }: {
    region: string;
    bucket: string;
    key: string;
  }): Promise<string> {
    const client = new S3Client({ region });
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
  }
}
