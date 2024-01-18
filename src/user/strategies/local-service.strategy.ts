import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { Request } from 'express';
import * as dotenv from 'dotenv';
import * as config from 'config';
import { UserService } from '../user.service';

dotenv.config();
const jwtConfig = config.get('jwt');

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        const userAccessToken = req.cookies.accessToken;
        return userAccessToken; // 쿠키에서 토큰 추출
      },
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: any) {
    const userId = payload.user_id;

    return userId;
  }
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: (req: Request) => {
        const userRefreshToken = req.cookies.refreshToken;
        return userRefreshToken; // 쿠키에서 토큰 추출
      },
      secretOrKey: jwtConfig.secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, res: Response, payload: any) {
    const userId = payload.user_id;

    const foundRefreshToken =
      await this.userService.findUserRefreshToken(userId);

    if (foundRefreshToken.token != req.cookies.refreshToken) {
      throw new UnauthorizedException('로그인정보가 없습니다.');
    }

    return userId;
  }
}
