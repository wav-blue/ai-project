import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as uuid from 'uuid';

@Injectable()
export class GusetAuthGuard extends AuthGuard(['access', 'refresh']) {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;

    if (!result) {
      //토큰 없을때(비로그인 상태일 때)
      const request = context.switchToHttp().getRequest();
      request.userId = `GUEST_` + uuid.v4(); //게스트아이디 붙여줌

      return true; // 컨트롤러로 고
    }

    return result; // 로그인 상태면 그대로 고
  }
}
