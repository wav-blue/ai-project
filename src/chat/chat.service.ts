import { openai } from 'src/configs/openai.config';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './chat.schema';
import { CreateFreeChatDto } from './chat.dto';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  //   - 자네 혹시 교제 중인 이성이 있는가?
  // 예
  // result.append(‘현재 연애 중이다.’)
  // >아니요, 없습니다.
  // result.append(‘연애를 하고 있지 않다.’)
  // 1-아니요
  // - 언제가 마지막 연애인가?
  // 1) 최근에 이별했습니다.
  // result.append(‘최근에 이별했다.’)
  // 2) ${}년 전이 마지막 연애입니다.
  // result.append(`${}`년 전이 마지막 연애이다.)
  // 3) 노코멘트 하겠습니다.
  // result.append(‘연애 경험에 대해 밝히고 싶지 않아한다.’)
  // > 4) 아니요. 원래 없었는데요? (잘 기억나지 않는데요?)
  // result.append(‘마지막 연애로부터 오랜 시간이 지났다.’)
  // 1-아니요-4)
  // - 음. 그렇다면 좋아하는 사람은 있는가?
  // 예
  // result.append(‘좋아하는 이성이 있다.’)
  // >아니요
  // result.append(‘좋아하는 이성도 없다.’)
  // 1-아니요-아니요
  // - 음음.. 그러면 연애하고 싶은 마음은 있는가?
  // 예
  // result.append(‘연애를 하고 싶어한다.’)
  // >아니요
  // result.append(‘연애를 하고 싶은 마음도 없다.’)
  // 1-아니요-아니요-아니요
  // - 그렇구만.. 소인을 찾아온 이유가 더 궁금해지는데? 어디 고민을 말해보게나.
  // (‘/chat/input’)으로 이동, result도 함께 전달.
  // [시나리오 2]
  // 질문1
  // 자네 혹시 교제 중인 이성이 있는가?
  // >예
  // 1-예
  prompt = `
  -질문의 카테고리: {questionType}
  -이전 대화: {lastChat}
  -질문이 연애와 관련이 없을 경우 "장난칠거면 가라."라고 짧게 대답할 것.
 
  ''{question}''

  질문에 대한 추가 정보:
  "{additional_info}"

  참고사항과 추가정보를 참고해서 ""로 감싸진 질문에 대해 답변해줘.
  아래 답변 포맷을 지켜서 그대로 답변해.
    
  <답변 포맷>
  [주제]: "질문을 한 문장 이내로 요약" \n 
  [상담]: \n  "질문에 대한 답변."
  `;

  formatPreInfo(testResult: {
    classification: string;
    situation?: string[];
  }): string {
    const result = `
    "main question" 에 대한 상담을 할 때 아래 추가정보도 참고해줘.
    -질문의 카테고리: ${testResult.classification}
    -질문에 대한 추가 정보: ${testResult.situation}
    `;
    console.log('사전질문 포맷팅', result);
    return result;
  }

  getImageText(imageUrl: string) {
    //OCR 연결, 텍스트 가져오기
    console.log('이미지ocr', imageUrl);
    return '텍스트 결과';
  }

  formatTikitaka(ocrText: string): string {
    const result = `
    "main question" 과 관련해서 상담자는 상대방과 이런 대화를 하기도 했어:
    ${ocrText}
    `;
    console.log('ocr 포맷팅', result);
    return result;
  }

  formatMainQuestion(prePrompt: {
    preInfo: string;
    tikitaka: string;
    question: string;
  }): string {
    const result = `
  main question: "${prePrompt.question}"

  "main question" 이 연애와 전혀 관련이 없을 경우 "장난칠거면 가라."라고 짧게 대답해.
  "main question" 이 연애와 관련된 고민이라면 지혜를 발휘해서 상담해줘.
  ${prePrompt.preInfo}
  ${prePrompt.tikitaka}

  아래 답변 포맷을 지켜서 그대로 답변해.
    
  <답변 포맷>
  [주제]: "질문을 한 문장 이내로 요약" \n 
  [상담]: \n  "질문에 대한 답변."
  `;
    return result;
  }

  async startFisrtChat(chatDto: CreateFreeChatDto): Promise<void> {
    const { question, testResult, imageUrl } = chatDto;
    const prePrompt = { preInfo: '', tikitaka: '', question };
    try {
      if (testResult) {
        // 사전질문 답안 정리해서 프롬프트에 넣기
        const preInfo = this.formatPreInfo(testResult);
        console.log('사전질문', testResult);
        prePrompt.preInfo = preInfo;
      }
      if (imageUrl) {
        // s3 경로에서 이미지 가져와서, OCR 연결해서 대화내역 따와서 프롬프트로 정리.
        const ocrText = await this.getImageText(imageUrl);
        console.log('대화캡쳐', ocrText);
        const tikitaka = this.formatTikitaka(ocrText);
        prePrompt.tikitaka = tikitaka;
      }
      //사전질문과 대화방캡쳐를 포함해서 프롬프트 포맷팅
      const prompt = this.formatMainQuestion(prePrompt);

      //완성된 프롬프트를 open ai에 쏴주기
      const result = await this.getCompletion(prompt);
      console.log(result);

      //답변 가공
      //DB 저장 and 프론트에 보내주기
    } catch (err) {
      throw err;
    }
  }

  async getCompletion(prompt: string) {
    try {
      const result = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              '너는 연애의 달인으로, 너의 역할은 사람들의 고민에 공감하고 해결책을 제시하는거야. 공자, 맹자의 말투, 반말을 사용해서 대답해야해. 너의 역할에 대해서는 언급하지마.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
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
