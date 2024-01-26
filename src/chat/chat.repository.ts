import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './chat.schema';
import { Return1stCompletionDTO, ImageLogType } from './chat.dto';
import { ChatCompletionMessageParam } from 'openai/resources';

@Injectable()
export class ChatRepository {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  async create1stChat(
    userId: string,
    dialogue: ChatCompletionMessageParam[],
    response: Return1stCompletionDTO,
    imageLog: ImageLogType,
  ): Promise<string> {
    const chatDoc = {
      userId: userId,
      title: response.title,
      dialogue: dialogue,
      nextPromptToken: response.nextPromptToken,
      sessions: 1,
      log: [response.log],
      imageLog: [imageLog],
      tokenUsageRecords: response.tokenUsageRecords,
    };

    try {
      const newChat = new this.chatModel(chatDoc);
      const savedChat = await newChat.save();

      return savedChat._id.toString();
    } catch (err) {
      throw err;
    }
  }

  //   async findOne(id: string): Promise<Cat | null> {
  //     return this.catModel.findById(id).exec();
  //   }

  //   async findAll(): Promise<Cat[]> {
  //     return this.catModel.find().exec();
  //   }

  // async findOne(id: string): Promise<Cat | null> {
  //   return this.catModel.findById(id).exec();
  // }

  //   async create(cat: Cat): Promise<Cat> {
  //     const createdCat = new this.catModel(cat);
  //     return createdCat.save();
  //   }

  //   async update(id: string, cat: Cat): Promise<Cat | null> {
  //     return this.catModel.findByIdAndUpdate(id, cat, { new: true }).exec();
  //   }

  //   async delete(id: string): Promise<Cat | null> {
  //     return this.catModel.findByIdAndDelete(id).exec();
}
