import { SurveyAnswerType, SurveyQuestionType } from "../../components/types/ChatTypes";

const scriptForQnA = {text: '잠깐, 내 이따 자네가 얘기할 시간을 충분히 줄테니 간단하게 질문 좀 합세.', isGuru: true}
const scriptForMain = {text: '연애에 대한 고민이 있는자 나에게로..', isGuru: true}
const scriptForInput = {text: '그렇구만.. 대강 감이 오는구만. 어디 한 번 상세하게 고민을 읊어보게나.', isGuru: true}
const scriptForLoading = {text: '오오 영감이 떠오른다!', isGuru: true}

export {scriptForInput, scriptForQnA, scriptForMain, scriptForLoading}

export const scenario0: SurveyQuestionType[] = [
  {
    question: '음 추가정보를 제공하면 자세한 답변을 할 수 있다네. 추가정보를 제공할텐가?\n("아니오" 를 누르면 바로 질문 작성 화면으로 이동합니다.)',
    options: [{answer: '예', add: ''}, {answer: '아니오', add: ''}],
  },
]

export const scenario1: SurveyQuestionType[] = [
  {
    question: '자네 혹시 교제 중인 이성이 있는가?',
    options: [{answer: '예', add: '현재 연애 중이다. '}, {answer: '아니요, 없습니다.', add: '현재 연애를 하고 있지 않다.'}],
  },
  {
    question: '언제가 마지막 연애인가?',
    options: [{answer: '최근에 이별했습니다.', add: ' 최근에 이별했다.'}, {answer: 'n년 전이 마지막 연애입니다.', add: ' 마지막 연애로부터 시간이 꽤 흘렀다.'}, {answer: '노코멘트 하겠습니다.', add: ' 연애 경험에 대해 밝히고 싶지 않아한다.'}, {answer: '아니요 연애경험이 없습니다.', add: ' 연애경험 자체가 없다.'},],
  },
  {
    question: '음. 최근 관심이 있는 이성이 있는가?',
    options: [{answer: '예', add: ' 현재 관심있는 이성이 있다.'}, {answer: '아니오', add: ' 현재 관심있는 이성도 없다.'},],
  },
  {
    question: '음음.. 그러면 연애하고 싶은 마음은 있는가?',
    options: [{answer: '예', add: ' 질문자는 연애를 하고 싶어한다.'}, {answer: '아니오', add: ' 질문자는 연애를 하고 싶은 마음도 없다.'},],
  },
]

export const scenario2: SurveyQuestionType[] = [
  {
    question: '호오.. 지금 연인관계는 건강한가? 무언가 고민이 있는가?',
    options: [{answer: '관계를 더 발전시키고 싶어요.', add: ' 연인과의 관계를 발전시키고 싶어한다.'}, {answer: '연인의 마음이 식은 것 같아요.', add: ' 연인의 마음이 변한 것 같아서 고민한다.'}, {answer: '서로 사랑하긴 하는데, 자주 다퉈요.', add: ' 서로 사랑하지만 자주 싸운다.'}, {answer: '기타 고민', add: ' 무언가 고민이 있어보인다.'}, {answer: '아니요. 그냥 궁금해서 왔습니다.', add: ''},],
  },
  // {
  //   question: '',
  //   options: [{answer: '', add: ''},],
  // },
  // {
  //   question: '',
  //   options: [{answer: '', add: ''},],
  // },
]

export const scenario3: SurveyQuestionType[] = [
  {
    question: '음. 어째 자네 마음은 좀 괜찮은가?',
    options: [{answer: '헤어져서 오히려 후련합니다.', add: ' 연인과 헤어진 것이 다행이라고 생각한다.'}, {answer: '아무렇지 않아요.', add: ' 관계를 잘 매듭지은듯 하다.'}, {answer: '많이 보고싶네요.', add: ' 지난 연인에게 미련이 남아있다.'},],
  },
  {
    question: '연인과 재회하고 싶은 마음이 있는가?',
    options: [{answer: '예', add: ' 연인과 재회하고 싶은 마음이 있다.'}, {answer: '아니오', add: ' 연인과 재회하고 싶지는 않다.'},],
  },
]

export const scenario4: SurveyQuestionType[] = [
  {
    question: '',
    options: [{answer: '', add: ''},],
  },
  {
    question: '',
    options: [{answer: '', add: ''},],
  },
  {
    question: '',
    options: [{answer: '', add: ''},],
  },
]