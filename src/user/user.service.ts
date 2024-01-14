import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { RefreshTokenRepository } from './refreshtoken.repository';

import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { GoogleRequest } from 'passport-google-oauth20';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import * as dotenv from 'dotenv';
import * as config from 'config';

dotenv.config();
const jwtConfig = config.get('jwt');

@Injectable()
export class UserService {
  constructor(
    //@InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,

    private jwt: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const found = await this.userRepository.getUserbyEmail(createUserDto.email);
    if (found) throw new ConflictException('이미 존재하는 계정입니다.');

    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = await this.userRepository.createUser(createUserDto);
    return createdUser;
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    const found = await this.userRepository.getUserbyId(updateUserDto.userId);
    if (!found) throw new BadRequestException('존재하지 않는 계정입니다.');

    updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);

    const updateUser = await this.userRepository.updateUser(updateUserDto);
    return updateUser;
  }

  async userLoginbyEmail(
    email: string,
    password: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const found = await this.userRepository.getUserbyEmail(email);

    if (!found) throw new BadRequestException('존재하지 않는 계정입니다.');

    //해시화된 비밀번호와 비교
    const passwordCompare = await bcrypt.compare(password, found.password);

    if (!passwordCompare) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }
    // 토큰 할당
    const { accessToken, refreshToken } = await this.TokenCreate(found.userId);
    return { user: found, accessToken, refreshToken };
  }

  // async googleLogin(
  //   req: GoogleRequest,
  //   res: Response,
  //   // googleLoginAuthInputDto, // : Promise<GoogleLoginAuthOutputDto>
  // ) {
  //   const { user } = req;
  //   user.logintype = 'google';

  //   // 유저 중복 검사
  //   let found = await this.userRepository.getUserbyEmail(user.email);

  //   const createuserDto = {
  //     logintype: 'GOOGLE',
  //     email: user.email,
  //   };
  //   // 없는 유저면 DB에 유저정보 저장
  //   if (!found) {
  //     found = await this.userRepository.createUser(createuserDto);
  //   }

  //   await this.userTokenSetting(res, found.userId);
  // }

  async TokenCreate(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const findUserPayload = { userId: userId };

    const accessToken = this.jwt.sign(findUserPayload, {
      expiresIn: jwtConfig.access_expiresIn,
    });

    const refreshToken = this.jwt.sign(findUserPayload, {
      expiresIn: jwtConfig.refresh_expiresIn,
      audience: String(userId), // 수신대상 표시?
    });

    /* refreshToken 필드 업데이트 */
    const refreshTokenId = await this.refreshTokenRepository.createRefreshToken(
      userId,
      refreshToken,
    );
    // 토큰 확인
    console.log(accessToken, refreshTokenId);
    return { accessToken, refreshToken: refreshTokenId.tokenId };
  }
}
