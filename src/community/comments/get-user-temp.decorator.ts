import { createParamDecorator } from '@nestjs/common';

// Access token이 구현되기 전에, 임시로 user 값을 설정하기 위해 만든 더미
// type으로 string을 사용 (나중에 변경되어야 함)

export const GetUserTemp = createParamDecorator(() => {
  console.log('임시 유저아이디 설정');
  return 'user001';
});
