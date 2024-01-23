import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { RefreshTokenRepository } from './refreshtoken.repository';
import { User } from './user.entity';
import { RefreshToken } from './refreshtoken.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import * as dotenv from 'dotenv';
import { LoginUserDto } from './dtos/login-user.dto';

dotenv.config();
//const jwtConfig = config.get('jwt');

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    // @InjectRepository(User)
    private userRepository: UserRepository,

    // @InjectRepository(RefreshToken)
    private refreshTokenRepository: RefreshTokenRepository,
    private jwt: JwtService,
  ) {}

  async connectDB(operation: () => Promise<any>): Promise<any> {
    const queryRunner = await this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await operation(); // 비동기 작업 앞에 await 추가
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    } finally {
      await queryRunner.release();
    }
  }

  async getUserById(userId: string): Promise<User> {
    const found = await this.userRepository.getUserbyId(userId);
    if (!found) throw new UnauthorizedException('존재하지 않는 계정입니다.');
    return found;
  }
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const found = await this.userRepository.getUserbyEmail(createUserDto.email);
    if (found) throw new ConflictException('이미 존재하는 이메일입니다.');

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

  async userLogin(
    loginUser: LoginUserDto,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    let found = await this.userRepository.getUserbyEmail(loginUser.email);

    // 없는 유저면 DB에 유저정보 저장
    if (!found) {
      if (loginUser.logintype != 'EMAIL') {
        found = await this.userRepository.createUser(loginUser);
      } else {
        throw new BadRequestException('존재하지 않는 계정입니다.');
      }
    }

    const { accessToken, refreshToken } = await this.TokenCreate(found.user_id);

    return { user: found, accessToken, refreshToken };
  }

  async findUserRefreshToken(userId: string): Promise<RefreshToken> {
    const userRefreshToken =
      await this.refreshTokenRepository.getRefreshTokenbyUserId(userId);

    return userRefreshToken;
  }

  async TokenCreate(
    user_id: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const findUserPayload = { user_id: user_id };

    const accessToken = this.jwt.sign(findUserPayload, {
      expiresIn: 600,
    });

    const refreshToken = this.jwt.sign(findUserPayload, {
      expiresIn: 3600,
    });

    const foundRefeshToken =
      await this.refreshTokenRepository.getRefreshTokenbyUserId(user_id);

    if (foundRefeshToken) {
      await this.refreshTokenRepository.updateRefreshToken(
        user_id,
        refreshToken,
      );
    } else {
      await this.refreshTokenRepository.createRefreshToken(
        user_id,
        refreshToken,
      );
    }

    return { accessToken, refreshToken };
  }
}
