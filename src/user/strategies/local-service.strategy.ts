import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { Request } from 'express';
import * as dotenv from 'dotenv';
import * as config from 'config';
import { UserService } from '../user.service';
import { JwtService } from '@nestjs/jwt';
dotenv.config();
const jwtConfig = config.get('jwt');
const domainConfig = config.get('domain');
@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
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
    const userId = payload.userId;

    return userId;
  }
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const userRefreshToken = req.cookies.refreshToken;
        return userRefreshToken; // 쿠키에서 토큰 추출
      },
      secretOrKey: jwtConfig.secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const userId = payload.userId;

    // foundRefreshToken이 존재하는지 확인하고 속성에 접근하기 전에 확인
    const foundRefreshToken =
      await this.userService.findUserRefreshToken(userId);

    if (foundRefreshToken.token != req.cookies.refreshToken) {
      throw new UnauthorizedException('로그인정보가 없습니다.');
    }
    const accessToken = this.jwt.sign({ user_id: userId }, { expiresIn: 600 });

    req.res.cookie('accessToken', accessToken, {
      domain: domainConfig.address,
      maxAge: 600 * 1000,
      httpOnly: true,
      path: '/',
    });

    return userId;
  }
}
