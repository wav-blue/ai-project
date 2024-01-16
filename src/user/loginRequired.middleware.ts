import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import * as config from 'config';

dotenv.config();
const jwtConfig = config.get('jwt');
@Injectable()
export class LoginRequiredMiddleware implements NestMiddleware {
  constructor(private jwt: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    console.log('login확인');
    // 쿠키에서 토큰을 가져옵니다.
    const userAccessToken = req.cookies.accessToken;
    const userRefreshToken = req.cookies.refreshToken;

    //access token을 우선 검사함
    if (userAccessToken != null) {
      const jwtDecoded = this.jwt.verify(userAccessToken);

      const userId = jwtDecoded.userId;
      //req.currentUserId = userId;

      next();
    }

    // access token이 없는경우 refreshtoken 검사, refreshtoken도 없는 경우 로그인 유지
    else if (userRefreshToken != null) {
      const jwtDecoded = this.jwt.verify(userRefreshToken);
      // token이 유효한 경우 새로운 access token 생성하여 쿠키에 저장해줌

      const userId = jwtDecoded.userId;
      //req.currentUserId = userId;

      const findUserPayload = { userId: userId };
      const accessToken = this.jwt.sign(findUserPayload, {
        expiresIn: jwtConfig.access_expiresIn,
      });

      const accesscookieExpires = new Date();
      accesscookieExpires.setDate(
        accesscookieExpires.getDate() + +jwtConfig.refresh_expiresIn,
      );
      res.cookie('accessToken', accessToken, {
        expires: accesscookieExpires,
        httpOnly: true,
      });

      next();
    } else {
      // token을 가지고 있지 않은 유저
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }
  }
}
