import { motion } from 'framer-motion';

const AdditionalLoading = () => {
  console.log('로딩으로 넘어옴')
  return (
    <div>
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1.2, 1.1, 1],
          rotate: [0, 360, 0, 360]
        }} 
        transition={{ 
          ease: 'easeIn',
          repeat: Infinity,
          repeatDelay: 0.5}}>
        <img src="/images/guru.png" alt='guru' className="h-[15vh] mt-20"></img>
      </motion.div>
    </div>
  );
};

export default AdditionalLoading;
