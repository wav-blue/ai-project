import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { MemberShip } from './membership.entity';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenRepository } from './refreshtoken.repository';
import { RefreshToken } from './refreshtoken.entity';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import {
  AccessStrategy,
  RefreshStrategy,
} from './strategies/local-service.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';

import * as config from 'config';
const jwtConfig = config.get('jwt');
@Module({
  imports: [
    TypeOrmModule.forFeature([User, MemberShip, RefreshToken]),
    JwtModule.register({
      secret: jwtConfig.secret, // JWT Signature의 Secret 값 입력
    }),
    PassportModule.register({ session: false }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    RefreshTokenRepository,
    GoogleStrategy,
    AccessStrategy,
    RefreshStrategy,
    KakaoStrategy,
  ],
})
export class UserModule {}
