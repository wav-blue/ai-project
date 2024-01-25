import { openai } from 'src/configs/openai.config';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './chat.schema';
import { CreateFreeChatDto } from './chat.dto';
import { ChatCompletionMessageParam } from 'openai/resources';

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

  formatPreInfo(testResult: {
    classification: string;
    situation?: string[];
  }): string {
    const result = `
    "main question" 에 대한 상담을 할 때 아래 추가정보도 참고해줘.
    -질문의 카테고리: ${testResult.classification}
    -질문자의 연애 상황: ${testResult.situation}
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
  formatPersona(testResult: { classification: string; situation?: string[] }) {
    if (testResult) {
      // 사전질문 답안 정리해서 프롬프트에 넣기
      const preInfo = this.formatPreInfo(testResult);
      prePrompt.preInfo = preInfo;
    }
    const result = `너는 연애의 달인으로, 너의 역할은 사람들의 고민에 공감하고 해결책을 제시하는거야. 공자, 맹자의 말투, 반말을 사용해서 대답해야해. 너의 역할에 대해서는 언급하지마.`;

    return result;
  }

  formatMainQuestion(question: string, imageUrl: string): string {
    if (imageUrl) {
      // s3 경로에서 이미지 가져와서, OCR 연결해서 대화내역 따와서 프롬프트로 정리.
      const ocrText = await this.getImageText(imageUrl);
      const tikitaka = this.formatTikitaka(ocrText);
      prePrompt.tikitaka = tikitaka;
    }
    const result = `
  main question: "${prePrompt.question}"

  "main question" 이 연애와 전혀 관련이 없을 경우 "장난칠거면 가라."라고 짧게 대답해.
  "main question" 이 연애와 관련된 고민이라면 지혜를 발휘해서 자세히 상담해줘.
  ${prePrompt.preInfo}
  ${prePrompt.tikitaka}

  아래 답변 포맷을 지켜서 그대로 답변해.
    
  <답변 포맷: JSON>
  {title: "main question"을 최대 세 단어로 요약, 
  answer: "main question"에 대한 자세한 상담}
  `;
    return result;
  }

  async startFisrtChat(chatDto: CreateFreeChatDto): Promise<string> {
    const { userId, question, testResult, imageUrl } = chatDto;
    try {
      //사전질문과 페르소나로 시스템 메시지 포맷팅
      const persona = this.formatPersona(testResult);

      //사전질문과 대화방캡쳐를 포함해서 프롬프트 포맷팅
      const prompt = this.formatMainQuestion(question, imageUrl);

      const gptResponse = await initiateChat(question, testResult, imageUrl);
      //이니챗:{페르소나, 프롬프트 가공, 질문쏘기}
      const newChatDoc = await creteNewChatDoc(gptResponse) 
      //클라이언트에 답변 쏘기
      //[["chatId-string", "title-string"] , [question-string, answer-string]]
      //const result = [[chatId, title], [question, answer]]

      //채팅 객체
      //데이터
      // 페르소나, 그리팅, 프롬프트
      //메소드
      //페르소나, 그리팅, 프롬프트를 사용해서 메타데이터raw와 답변 받음

      //레포지토리
      //데이터
      //페르소나, 그리팅, 프롬프트, 메타데이터raw, 답변
      //메소드
      //메타데이터raw 가공해서 DB 저장


      
      console.log(prompt);

      //완성된 프롬프트를 open ai에 쏴주기
      const response = await this.getCompletion(persona, prompt);

      //구루 답변 가공

      const responseJSON = response.choices[0].message.content; //구루 답변: json string
      const responseOBJ = JSON.parse(responseJSON); //js obj 파싱
      const { title, answer } = responseOBJ;
      console.log('타이틀:', title);
      console.log('토큰 사용량:', usage);
      console.log(
        '컴플아이디:',
        id,
        ', 날짜: ',
        new Date(created * 1000).toISOString(),
        ', 핑거프린트: ',
        system_fingerprint,
      );
      };
      //DB 저장
      this.chatRepository.create();

      

      return answer;
    } catch (err) {
      throw err;
    }
  }
  const messages:ChatCompletionMessageParam[]=[
    {
        role: 'system',
        content: '너는 연애의 달인으로, 너의 역할은 사람들의 고민에 공감하고 해결책을 제시하는거야. 공자, 맹자의 말투, 반말을 사용해서 대답해야해. 너의 역할에 대해서는 언급하지마.'
    },
    {
        role: 'user',
        content: '어쩌고저쩌고'
    },
  ],

  async getCompletion(persona: string, prompt: string) {
    try {
      console.log('질문시작');
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: messages,
      });
      const { id, created, usage, system_fingerprint, choices } = response;
      const resOBJ = JSON.parse(choices[0].message.content);
      const { title, answer } = resOBJ;
      return {
        title: title,
        dialogue: [
          [
            { role: 'system', content: persona },
            { role: 'assistant', content: greeting, name: '구루' },
          ],
          [{ role: 'user', content: prompt }, choices[0].message],
        ],
        nextPromptToken: usage.total_tokens,
        sessions: 1,
        log: [
          {
            no: 1,
            completionId: id,
            token: usage,
            fingerPrint: system_fingerprint,
            date: new Date(created * 1000).toISOString(),
          },
        ],
        imageLog: [],
        tokenUsageRecords: usage.total_tokens,
        cretedAt: new Date(),
        updatedAt: new Date(),
      };
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
