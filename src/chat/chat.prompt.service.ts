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
    content: `your name: 구루(Guru)
    Guidelines: Think, speak according to 구루's persona. write in Korean language.
    Description of 구루: 구루 is a master of love life & romantic relationships. His role is to provide thoughtful guidance to individuals dealing with romantic concerns. 
    Communication Style: 구루 use polite language such as "자네" and employing a formal speech style like 하오체 or 하시게체 in Korean.
    This is how "구루" should talk: "마음이 맞지 않으면 관계를 유지할 수 없는것일세. 마찰과 불화는 명확하지 않은 행동과 방황으로 이어지지.",
    "탁월한 연설가가 되려면 감정, 힘, 신념을 가지고 말하는 능력이 중요하지만, 상대방의 기분은 생각하지 않고 말에 강요해서는 안 되네.", 
    "행동과 생각이 자네 스스로를 불행하게 만든다면 그것은 몹쓸 일일세. 건강한 신체와 정신은 평온한 마음을 가져다주니 그것이 행복의 근원이라네."
    
    From now on, users will open the door and come in and tell 구루 their problems.
    Occasionally, some users come to him with questions that are completely unrelated to relationships, and in such cases, 구루 must firmly reply, "장난치지 말게" and end the conversation.
    However, if the question is even remotely related to romantic relationships, 구루 should use his wisdom to provide thoughtful and detailed advice on user's concerns.`,
  };

  //유저가 말을 시작하기 전 구루가 하는 인삿말, 페르소나 설정용이고 유저의 메시지 창에 나타나지 않습니다.
  greeting: ChatCompletionAssistantMessageParam = {
    role: 'assistant',
    content:
      '그래 그래 어서오시게, 사랑에 관한 고민이 있다면 내게 이야기 해 보시게. 이 늙은이에게 자네의 고민을 해결할 작은 지혜가 있을지 모른다네.',
    name: 'Guru',
  };

  //답변 양식
  prompt: ChatCompletionUserMessageParam = {
    role: 'user',
    content: '',
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
      persona.content += `When answering the user's question, please also consider the additional information below.
        -Category of question: ${testResult.classification}
        `;
      if (testResult.situation) {
        persona.content += `-user's relationship situation: ${testResult.situation}`;
      }
    }

    //카톡캡쳐 첨부를 했다면 greeting 메세지에 첨부
    if (imageOCR) {
      greeting.content += `<user had below conversation with the person of interest:
      ${imageOCR}>
      
      이건 또 흥미로운 대화를 했구만, 그래 어쩌다가 이런 대화를 하게 됐나?`;
    }

    //유저 입력 질문을 프롬프트에 삽입
    prompt.content =
      `"main question": ` +
      question +
      `
      Follow the format below for your answers
    <답변 포맷: JSON(json)>
    {title: Summarize "main question" in one Korean sentence of up to five words, 
    answer: a thoughtful consultation on "main question"}`;

    //페르소나, 그리팅, 유저프롬프트 묶어서 결과 리턴
    const result = [persona, greeting, prompt];
    return result;
  }

  formatContinuePrompt(
    dialogue: ChatCompletionMessageParam[],
    question: string,
    imageOCR: string,
  ): ChatCompletionMessageParam[] {
    const prompt = [...dialogue];

    //만약 다이알로그 배열 길이가 일정 이상이면(대화를 오래 했으면) 타이틀을 바꿔 달아줌
    //22개에 한 번씩 바꾼다고 가정..(약 10번씩 티키타카.. )

    if (prompt.length % 22 === 0) {
      const newProm = this.prompt;
      newProm.content =
        question +
        `
        <Guidelines: Follow the format below for your answers. Think, speak according to 구루's persona>
        <Format: JSON(json)>
        {title: summarize the guru and user's recent conversation in one Korean sentence of up to five words,
        answer: a thoughtful consultation on user's question}`;
      prompt.push(newProm);
    } else {
      const newProm = this.prompt;
      newProm.content =
        question +
        `
        
        <Guidelines: Follow the format below for your answers. Think, speak according to 구루's persona>
        <Format: JSON(json)>
        {answer: a thoughtful consultation on user's question}`;
      prompt.push(newProm);
    }

    if (imageOCR) {
      const newProm = prompt.pop();
      newProm.content =
        `
        <user had below conversation with the person of interest:
        ${imageOCR}>
        ` + newProm;
      prompt.push(newProm);
    }

    return prompt;
  }
}
