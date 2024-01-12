import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { GoogleRequest } from 'passport-google-oauth20';

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
    private jwt: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const found = await this.userRepository.getUserbyEmail(createUserDto.email);
    if (found) throw new ConflictException('이미 존재하는 계정입니다.');

    const createdUser = await this.userRepository.createUser(createUserDto);
    return createdUser;
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    const found = await this.userRepository.getUserbyId(updateUserDto.userId);
    if (!found) throw new BadRequestException('존재하지 않는 계정입니다.');

    const updateUser = await this.userRepository.updateUser(updateUserDto);
    return updateUser;
  }

  async userLogin(email: string, password: string): Promise<User> {
    const found = await this.userRepository.getUserbyEmail(email);

    if (!found) throw new BadRequestException('존재하지 않는 계정입니다.');

    //해시화된 비밀번호와 비교하도록 수정해야 함

    return found;
  }

  async googleLogin(
    req: GoogleRequest,
    res: Response,
    // googleLoginAuthInputDto, // : Promise<GoogleLoginAuthOutputDto>
  ) {
    try {
      const { user } = req;
      user.logintype = 'google';

      // 유저 중복 검사
      let findUser = await this.userRepository.getUserbyEmail(user.email);

      const createuserDto = {
        logintype: 'GOOGLE',
        email: user.email,
      };
      // 없는 유저면 DB에 유저정보 저장
      if (!findUser) {
        findUser = await this.userRepository.createUser(createuserDto);
      }

      // 구글 가입이 되어 있는 경우 accessToken 및 refreshToken 발급
      const findUserPayload = { user_id: findUser.user_id };
      
      const eid_access_token = this.jwt.sign(
        findUserPayload,
        jwtConfig.SECRET,
        {
          expiresIn: jwtConfig.access_expiresIn,
        },
      );
      
      res.
      // refreshToken나중에..
      // const eid_refresh_token = this.jwt.sign(
      //   findUserPayload,
      //   jwtConfig.SECRET,
      //   {
      //     expiresIn: jwtConfig.refresh_expiresIn,
      //     audience: String(findUser.id),
      //   },
      // );

      // /* refreshToken 필드 업데이트 */
      // findUser.eid_refresh_token = eid_refresh_token;
      // await this.userQueryRepository.save(findUser);

      // 쿠키 설정 refresh만 쿠키로 넣어주는듯
      // const now = new Date();
      // now.setDate(now.getDate() + +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DATE'));
      // res.cookie('eid_refresh_token', eid_refresh_token, {
      //   expires: now,
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production' ? true : false,
      //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      // });
      return {
        ok: true,
        eid_access_token,
      };
    } catch (error) {
      return { ok: false, error: '구글 로그인 인증을 실패 하였습니다.' };
    }
  }
}
