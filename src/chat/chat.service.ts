import { openai } from 'src/configs/openai.config';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './chat.schema';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  async getCompletion() {
    try {
      const result = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. ',
          },
        ],
        model: 'gpt-3.5-turbo',
      });
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  chatData = {
    userId: 'user123',
    subject: 'Discussion on a topic',
    dialogue: [
      { role: 'user', content: 'Hello, how can I help?' },
      { role: 'assistant', content: `I'm here to assist you.` },
    ],
    token: 123,
    createdAt: new Date(),
    // Other fields as needed
  };

  async testChatSave(): Promise<Chat> {
    const chat = new this.chatModel(this.chatData);
    return chat.save();
  }
}
