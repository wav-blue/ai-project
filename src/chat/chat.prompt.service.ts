import { Injectable } from '@nestjs/common';
import {
  ChatCompletionMessageParam,
  ChatCompletionAssistantMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources';

@Injectable()
export class ChatPromptService {
  //구루의 페르소나 수정은 이곳에서
  persona: ChatCompletionSystemMessageParam = {
    role: 'system',
    content: `
    assistant "구루(Guru)" 는 연애의 달인으로, 
    "구루(Guru)" 의 역할은 사람들의 고민에 공감하고 해결책을 제시하는것이다. 
    "구루(Guru)" 는 공자, 맹자의 말투, 반말을 사용한다.
    때때로 연애와 전혀 관련없는 말을 하며 장난을 치는 user 도 찾아오는데, 이럴 때 "구루(Guru)" 는 단호하게 "장난치지 말게" 라고 단답하고 대화를 끝낸다.
    그러나 연애와 조금이라도 관련있는 질문이라면 "구루(Guru)" 는 현명한 지혜를 사용해서 고민에 대해 사려깊고 자세한 상담을 해준다.
    지금부터 user가 "구루(Guru)" 를 찾아와 고민을 털어놓을 것이다.`,
  };

  //유저가 말을 시작하기 전 구루가 하는 인삿말, 페르소나 설정용이고 유저의 메시지 창에 나타나지 않습니다.
  greeting: ChatCompletionAssistantMessageParam = {
    role: 'assistant',
    content: '그래, 자네의 고민이 무엇인지 자세히 이야기 해보시게',
    name: 'Guru',
  };

  //답변 양식
  prompt: ChatCompletionUserMessageParam = {
    role: 'user',
    content: `
    아래 답변 포맷을 지켜서 그대로 답변해.
    <답변 포맷: JSON>
    {title: "main question"을 최대 다섯단어로 요약, 
    answer: "main question"에 대한 자세한 상담}
    `,
  };

  format1stPrompt(
    question: string,
    testResult?: { classification: string; situation?: string[] },
    imageOCR?: string,
  ): ChatCompletionMessageParam[] {
    const persona = this.persona;
    const greeting = this.greeting;
    const prompt = this.prompt;

    //사전 질문지 답변이 있다면 system message 에 정보 포함
    if (testResult) {
      persona.content += `
        user의 질문에 답변할 때 아래 추가정보도 참고해줘.
        -질문의 카테고리: ${testResult.classification}
        `;
      if (testResult.situation) {
        persona.content += `
            -질문자의 연애 상황: ${testResult.situation}
            `;
      }
    }

    //카톡캡쳐 첨부를 했다면 greeting 메세지에 첨부
    if (imageOCR) {
      greeting.content += `
      [system: user가 앞으로 상담할 고민과 관련해서 user는 그 관심상대와 이런 대화를 하기도 했어:
      ${imageOCR}]
      
      이건 또 흥미로운 대화를 했구만, 그래 어쩌다가 이런 대화를 하게 됐나?
      `;
    }

    //유저 입력 질문을 프롬프트에 삽입
    prompt.content = `"main question": ` + question + prompt.content;

    //페르소나, 그리팅, 유저프롬프트 묶어서 결과 리턴
    const result = [persona, greeting, prompt];
    return result;
  }
}
