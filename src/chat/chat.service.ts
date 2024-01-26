import { Injectable } from '@nestjs/common';
import { CreateFreeChatDto } from './chat.dto';
import { ChatPromptService } from './chat.prompt.service';
import { ChatOpenAi } from './chat.openai.service';
import { ChatRepository } from './chat.repository';
import { ChatImageService } from './chat.image.service';

@Injectable()
export class ChatService {
  constructor(
    private promptService: ChatPromptService,
    private openAiService: ChatOpenAi,
    private chatImageService: ChatImageService,
    private chatRepository: ChatRepository,
  ) {}

  async start1stChat(chatDto: CreateFreeChatDto): Promise<any> {
    const { userId, question, testResult, imageUrl } = chatDto;

    const imageOCR = [];
    try {
      if (imageUrl) {
        // s3 경로에서 이미지 가져와서, OCR 연결해서 대화내역 텍스트로 따옴.
        // 리턴 - {text: string, log: {count:number, uploadeaAt: Date}}
        const resultOCR = await this.chatImageService.getImageText(imageUrl);
        imageOCR.push(resultOCR);
      }
      //사전질문과 대화방캡쳐OCR 가공, 유저 입력 질문 포함해서 프롬프트 포맷팅
      //리턴- 유저의 질문 배열:ChatCompletionMessageParam[]
      const prompt = this.promptService.format1stPrompt(
        question,
        testResult,
        imageOCR[0], //임시, 마저 구현하면 타입 변경
      );

      //작성된 prompt 사용해서 구루에게 첫 채팅 날림
      //리턴- 구루의 답변과 1st chat 메타데이터: Return1stCompletionDTO
      const response = await this.openAiService.get1stCompletion(prompt);

      //유저 질문, 구루 답변, 메타데이터 가공
      const dialogue = [...prompt];
      dialogue[2].content = question;
      dialogue.push(response.answer);
      console.log('다이알: ', dialogue);

      //DB 저장, 저장결과 조회
      const savedId = await this.chatRepository.create1stChat(
        userId,
        dialogue,
        response,
        imageOCR[0], //임시, 마저 구현하면 타입 변경
      );

      //결과 가공해서 컨트롤러에 전송
      const result = [
        [savedId, response.title],
        [question, response.answer.content],
      ];

      return result;
    } catch (err) {
      throw err;
    }
  }
}
