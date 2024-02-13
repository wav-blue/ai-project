import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SurveyAnswerType, SurveyQuestionType } from "../../types/ChatTypes";
import { scenario0, scenario1, scenario2, scenario3 } from "@/src/utils/const/scripts";

const person = 'AI 구루';

const SurveyBox = () => {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState<string[]>([]);
  const [testResult, setTestResult] = useState('')
  const [scenario, setScenario] = useState<SurveyQuestionType[]>(scenario0);
  const [isEnd, setIsEnd] = useState(false);

  const handleAnswer = (option: SurveyAnswerType) => {
    setResult([...result, option.add]);

    if (scenario[0].question == scenario0[0].question) {
      if (option.answer === '아니오') {
        router.push('/chat/input');
      }
      else {
        setScenario(scenario1);
      }
    } 

    if (scenario[0].question == scenario1[0].question) {
      if (option.answer === '예') {
        setScenario(scenario2);
      }
      else if (currentQuestionIndex < scenario.length - 1) {
        if (option.answer === '최근에 이별했습니다.') {
          setScenario(scenario3);
          setCurrentQuestionIndex(0);
          console.log(currentQuestionIndex)
          console.log(scenario)
          return ;
        }
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }

    if (scenario[0].question === scenario3[0].question) {
      if (option.answer === '헤어져서 오히려 후련합니다.') {
        setScenario(scenario1)
        setCurrentQuestionIndex(3)
      }
      else if (currentQuestionIndex < scenario.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
      else if (option.answer === '아니오') {
        setScenario(scenario1)
        setCurrentQuestionIndex(3)
      }
    }

    if (scenario !== scenario0 && currentQuestionIndex === (scenario.length - 1)) {
      setIsEnd(true)
    }
  }

  const handleNavigate = () => {
    setTestResult(result.join(''))
    setScenario(scenario0)
    setCurrentQuestionIndex(0)
    router.push('/chat/input')
    setIsEnd(false)
  }

  useEffect(() => {
    localStorage.setItem(`testResult`, JSON.stringify(testResult))
  }, [testResult])

  return (
    <div className="max-w-3/4">
      <div>
        <div className="mb-5 flex mx-2">
          <div className="w-20 h-8 border-2 border-white flex justify-center items-center bg-white/70 rounded-md drop-shadow-md">
            {person}
          </div>
        </div>

        <div>
            {!isEnd && scenario[currentQuestionIndex].question &&
            <div className="w-[60vw] min-h-16 border-2 border-white flex flex-col justify-center items-center bg-white/70 break-words rounded-md p-3 drop-shadow-md">
              {scenario[currentQuestionIndex].question}
              <div className="grid grid-cols-1 divide-y-2 mt-10 w-80 bg-white/70 border-2 border-white p-2 rounded-md drop-shadow-2xl">
                {scenario[currentQuestionIndex].options.map((option, idx) => (
                  <button 
                  className="p-1 mb-4 rounded-md hover:bg-[#c0bbbc] drop-shadow-lg z-10"
                  key={idx} 
                  onClick={() => handleAnswer(option)}
                  >
                    {option.answer}
                  </button>
                ))}
              </div>
            </div>}
            {isEnd &&
            <div className="w-[60vw] min-h-16 border-2 border-white flex flex-col justify-center items-center bg-white/70 break-words rounded-md p-3 drop-shadow-md">
              그렇구만.. 말해줘서 고맙네. 이제 자유롭게 사연을 얘기해보게나. 
              <div className="grid grid-cols-1 divide-y-2 mt-10 w-80 bg-white/70 border-2 border-white p-2 rounded-md drop-shadow-2xl">
                <button 
                className="p-1 mb-2 rounded-md hover:bg-[#c0bbbc] drop-shadow-lg z-10"
                onClick={handleNavigate}>
                  ✏고민 작성하기
                </button>
              </div>
            </div>}
        </div>
      </div>
    </div>
  );
};

export default SurveyBox;
