import ConversationBox from '@/src/components/common/ConversationBox';
import { scriptForLoading } from '@/src/utils/const/scripts';
import { motion } from 'framer-motion';

const AnswerLoadingPage = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-cover bg-[url('/images/background-home.jpg')]">
      <div className='mt-20'>
        <ConversationBox text={scriptForLoading.text} isGuru={scriptForLoading.isGuru}/>
      </div>

      <motion.div 
        animate={{ y: 100}} 
        transition={{ 
          type: 'spring',
          repeat: Infinity,
          repeatDelay: 0.5}}>
        <img src="/images/guru.png" alt='guru' className="h-[300px] mt-20"></img>
      </motion.div>
    </div>
  );
};

export default AnswerLoadingPage;
