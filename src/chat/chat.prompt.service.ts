import { Injectable } from '@nestjs/common';
import {
  ChatCompletionMessageParam,
  ChatCompletionAssistantMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources';
import { ImageLogType } from './chat.dto';

@Injectable()
export class ChatPromptService {
  //구루의 페르소나 수정은 이곳에서
  private persona: ChatCompletionSystemMessageParam = {
    role: 'system',
    content: `your name is 구루(Guru).
    Guidelines: Think, speak according to 구루's persona. write in Korean language.
    Description of 구루: 구루 is a master of love life & romantic relationships. His role is to provide thoughtful guidance to individuals dealing with romantic concerns. 
    Communication Style: 구루 use polite language such as "자네" and employing a formal speech style like 하오체 or 하시게체 in Korean.
    This is how "구루" should talk: "마음이 맞지 않으면 관계를 유지할 수 없는것일세. 마찰과 불화는 명확하지 않은 행동과 방황으로 이어지지.",
    "탁월한 연설가가 되려면 감정, 힘, 신념을 가지고 말하는 능력이 중요하지만, 상대방의 기분은 생각하지 않고 말에 강요해서는 안 되네.", 
    "행동과 생각이 자네 스스로를 불행하게 만든다면 그것은 몹쓸 일일세. 건강한 신체와 정신은 평온한 마음을 가져다주니 그것이 행복의 근원이라네."

    Occasionally, some users come to him with gibberish that are completely unrelated to relationships, and in such cases, 구루 must firmly reply, "장난치지 말게" and end the conversation.
    However, be careful when you judge; if the question is even slightly and remotely related to romantic relationships in context, 구루 should use his wisdom to provide thoughtful and detailed advice on the user's concerns.
    Always stay in character. Continuously refine these settings as the situation evolves & adjust each sentence placement to create a natural flow.
    `,
  };

  //유저가 말을 시작하기 전 구루가 하는 인삿말, 페르소나 설정용이고 유저의 메시지 창에 나타나지 않습니다.
  private greeting: ChatCompletionAssistantMessageParam = {
    role: 'assistant',
    content: `구루 sits peacefully in thought in his Athenian Platonic hall of LOVE.
    People come to him all the time for advice on love matters. and today is no different.
    From now on, a user will open the door and come in and tell 구루 their love life problems.
    
    그래 그래 어서오시게, 사랑에 관한 고민이 있다면 이 구루에게 이야기 해 보시게. 이 늙은이에게 자네의 고민을 해결할 작은 지혜가 있을지 모른다네.`,
    name: 'Guru',
  };

  //질문 양식
  private prompt: ChatCompletionUserMessageParam = {
    role: 'user',
    content: '',
  };

  //구루 답변 양식
  private completion: ChatCompletionAssistantMessageParam = {
    role: 'assistant',
    content: '',
    name: 'Guru',
  };

  private answerFomatWithTitle: string = `
  Follow the format below for your answers
  <Format: JSON(json)>
  {title: Use up to seven Korean words to summarize "the question" with previous context., 
  answer: a thoughtful consultation on "the question", considering the previous context.}`;

  private answerFomatOnlyAnswer: string = `
  Follow the format below for your answers
  <Format: JSON(json)>
  {answer: a thoughtful consultation on "the question", considering the previous context.}`;

  private formatQuestion(
    question: string,
    format: string,
  ): ChatCompletionUserMessageParam {
    const result = { ...this.prompt };
    result.content = `"the question": ` + question + format;
    return result;
  }

  private addTestResulInGreeting(testResult: {
    classification: string;
    situation?: string[];
  }): ChatCompletionAssistantMessageParam {
    const result = { ...this.greeting };
    result.content += `
      <When answering the user's question, please also consider the additional information below. This is a questionnaire filled out by a user to consult 구루.>
        -Category of question: ${testResult.classification}
        `;
    if (testResult.situation) {
      result.content += `-user's romantic relationship situation: ${testResult.situation}`;
    }
    return result;
  }

  private addImageOCRInQuestion(question: string, imageOCR: string): string {
    console.log;
    question += `
    <Regarding "the question", user had the following conversation with a person of interest:
    ${imageOCR}>`;

    return question;
  }

  //free 챗 저장해주기

  //로그인유저 첫질문
  format1stPrompt(
    question: string,
    testResult?: { classification: string; situation?: string[] },
    imageOCR?: null | { text: string; log: ImageLogType },
  ): { prompt: ChatCompletionMessageParam[]; questionAndOCR: string } {
    const questionAndOCR = imageOCR
      ? this.addImageOCRInQuestion(question, imageOCR.text) //캡쳐를 새로 넣었다면, 질문에 끼워넣기
      : question;

    const persona = { ...this.persona }; //페르소나
    const greeting = testResult
      ? this.addTestResulInGreeting(testResult) //사전 질문지 답변이 있다면 greeting에 정보 포함
      : { ...this.greeting }; //사전 질문지 없다면 기본 greeting

    //유저 입력 질문을 프롬프트에 삽입 - title,answer 답변형식 지정
    const prompt = this.formatQuestion(
      questionAndOCR,
      this.answerFomatWithTitle,
    );
    //페르소나, 그리팅, 유저프롬프트 묶어서 결과 리턴
    const result = [persona, greeting, prompt];

    return { prompt: result, questionAndOCR: questionAndOCR };
  }

  //free chat 저장 위해 프롬프트 복원, 응답형태까지 복원해 덧붙이기
  formatFreePrompt(
    title: string,
    history: string[],
    testResult?: { classification: string; situation?: string[] },
  ): ChatCompletionMessageParam[] {
    const result = this.format1stPrompt(history[0], testResult);
    const firstAnswer = { ...this.completion }; //응답 객체 복사ㄴ
    const answerOBJ = { title, answer: history[1] }; //구루 응답 형식 가공
    const answerJSON = JSON.stringify(answerOBJ); //JSON화
    firstAnswer.content = answerJSON; //가공한 응답형식 밀어넣기
    result.prompt.push(firstAnswer); //프롬프트배열에 구루 응답까지 밀어넣기
    return result.prompt;
  }

  formatContinuePrompt(
    dialogue: ChatCompletionMessageParam[],
    question: string,
    imageOCR: null | { text: string; log: ImageLogType },
  ): { prompt: ChatCompletionMessageParam[]; questionAndOCR: string } {
    //캡쳐를 새로 넣었다면, 질문에 끼워넣기
    const questionAndOCR = imageOCR
      ? this.addImageOCRInQuestion(question, imageOCR.text) //캡쳐를 새로 넣었다면, 질문에 끼워넣기
      : question;

    // 새 질문 끼워서 다이알로그 생성
    //만약 다이알로그 배열 길이가 일정 이상이면(대화를 오래 했으면) 타이틀을 바꿔 달아줌
    //22개에 한 번씩 바꾼다고 가정..(약 10번씩 티키타카.. )
    const prompt = [...dialogue];
    const newProm =
      prompt.length % 22 === 0
        ? this.formatQuestion(questionAndOCR, this.answerFomatWithTitle)
        : this.formatQuestion(questionAndOCR, this.answerFomatOnlyAnswer);
    prompt.push(newProm);

    return { prompt: prompt, questionAndOCR: questionAndOCR };
  }
}
//무료->유료질문(2번째)
// format2ndPrompt(
//   question: string,
//   history: string[],
//   imageOCR?: null | { text: string; log: ImageLogType },
//   testResult?: { classification: string; situation?: string[] },
// ): { prompt: ChatCompletionMessageParam[]; questionAndOCR: string } {
//   //첫프롬프트의 system message, greeting 복원, 새 질문 형식 작성(imageOCR 끼우기, json 형식 지시)
//   const result = this.format1stPrompt(question, testResult, imageOCR);

//   //새 질문 분리
//   const newQuestion = result.prompt.pop();

//   //첫 질문과 첫 답변 형식 작성
//   const firstQuestion = { ...this.prompt };
//   firstQuestion.content = history[0];
//   const firstAnswer = { ...this.completion };
//   firstAnswer.content = history[1];

//   //첫 질문, 첫 답변, 새 질문 순서대로 끼우기
//   result.prompt.push(firstQuestion);
//   result.prompt.push(firstAnswer);
//   result.prompt.push(newQuestion);

//   return result;
// }
