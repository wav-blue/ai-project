import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { MemberShip } from './membership.entity';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenRepository } from './refreshtoken.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, MemberShip]),
    JwtModule.register({
      secret: 'SECRET_KEY', // JWT Signature의 Secret 값 입력
      signOptions: { expiresIn: '300s' }, // JWT 토큰의 만료시간 입력
    }),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, RefreshTokenRepository],
})
export class UserModule {}
