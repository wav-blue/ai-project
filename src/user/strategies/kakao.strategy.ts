// kakao.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-kakao';
import * as dotenv from 'dotenv';
import * as config from 'config';

dotenv.config();
const domainConfig = config.get('domain');
@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_ID,
      callbackURL: `http://${domainConfig.address}:5001/api/user/login/kakao/callback`,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { _json } = profile;
    const user = {
      email: _json.kakao_account.email,
      logintype: 'KAKAO',
    };

    done(null, user);
  }
}
