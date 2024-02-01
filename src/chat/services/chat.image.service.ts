import { Injectable } from '@nestjs/common';
import { ImageLogType } from '../dtos/chat.dto';

@Injectable()
export class ChatImageService {
  async getImageText(
    imageUrl: string,
  ): Promise<{ text: string; log: ImageLogType }> {
    console.log(imageUrl);
    return { text: '카톡캡쳐내용', log: { count: 1, uploadedAt: new Date() } };
  }
}
