import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';
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
import * as dayjs from 'dayjs';

dotenv.config();
//const jwtConfig = config.get('jwt');

@Injectable()
export class UserService {
  constructor(
    private dataSource: DataSource,
    private userRepository: UserRepository,

    private refreshTokenRepository: RefreshTokenRepository,
    private jwt: JwtService,
  ) {}

  async getUserById(userId: string): Promise<User> {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const found = await this.userRepository.getUserbyId(userId, queryRunner);
      if (!found) throw new UnauthorizedException('존재하지 않는 계정입니다.');
      await queryRunner.commitTransaction();
      return found;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    } finally {
      await queryRunner.release();
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const found = await this.userRepository.getUserbyEmail(
        createUserDto.email,
        queryRunner,
      );
      if (found) throw new ConflictException('이미 존재하는 이메일입니다.');

      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);

      const createdUser = await this.userRepository.createUser(
        createUserDto,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return createdUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    } finally {
      await queryRunner.release();
    }
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const found = await this.userRepository.getUserbyId(
        updateUserDto.userId,
        queryRunner,
      );
      if (!found) throw new BadRequestException('존재하지 않는 계정입니다.');

      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);

      const updateUser = await this.userRepository.updateUser(
        updateUserDto,
        queryRunner,
      );
      await queryRunner.commitTransaction();

      return updateUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    } finally {
      await queryRunner.release();
    }
  }

  async userLogin(
    loginUser: LoginUserDto,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let found = await this.userRepository.getUserbyEmail(
        loginUser.email,
        queryRunner,
      );
      // 없는 유저면 DB에 유저정보 저장
      if (!found) {
        if (loginUser.logintype != 'EMAIL') {
          found = await this.userRepository.createUser(loginUser, queryRunner);
        } else {
          throw new BadRequestException('존재하지 않는 계정입니다.');
        }
      }

      const { accessToken, refreshToken } = await this.TokenCreate(
        found.user_id,
      );
      await queryRunner.commitTransaction();

      return { user: found, accessToken, refreshToken };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findUserRefreshToken(userId: string): Promise<RefreshToken> {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userRefreshToken =
        await this.refreshTokenRepository.getRefreshTokenbyUserId(
          userId,
          queryRunner,
        );
      await queryRunner.commitTransaction();

      return userRefreshToken; // 비동기 작업 앞에 await 추가
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async TokenCreate(
    user_id: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findUserPayload = { user_id: user_id };

      const accessToken = this.jwt.sign(findUserPayload, {
        expiresIn: 600,
      });

      const refreshToken = this.jwt.sign(findUserPayload, {
        expiresIn: 3600,
      });

      const foundRefeshToken =
        await this.refreshTokenRepository.getRefreshTokenbyUserId(
          user_id,
          queryRunner,
        );

      if (foundRefeshToken) {
        await this.refreshTokenRepository.updateRefreshToken(
          user_id,
          refreshToken,
          queryRunner,
        );
      } else {
        await this.refreshTokenRepository.createRefreshToken(
          user_id,
          refreshToken,
          queryRunner,
        );
      }
      await queryRunner.commitTransaction();
      return { accessToken, refreshToken };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //채팅용 멤버십 확인, 횟수 차감 비지니스로직
  async checkAndDeductMembership(userId: string): Promise<boolean> {
    const now = dayjs();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const status = await this.userRepository.findMembershipById(
        userId,
        queryRunner,
      );
      const expiryDate = dayjs(status.endAt);

      if (expiryDate >= now) {
        if (status.usingService == 'premium') {
          //잔여기간이 남은 프리미엄: 바로 true
          await queryRunner.commitTransaction();
          return true;
        } else if (
          status.usingService != 'non-member' &&
          status.remainChances > 0
        ) {
          //잔여기간이 남고 프리미엄이나 비구독이 아님: 즉 체험이나 베이직이면서 횟수가 남은 경우,
          await this.userRepository.deductBalance(userId, queryRunner); //횟수 차감후 커밋
          await queryRunner.commitTransaction();
          return true;
        }
      }

      //non-member 이거나,
      //프리미엄인데 잔여기간이 끝났거나,
      //체험|베이직인데 잔여기간이 끝났거나,
      //체험|베이직이고 잔여기간이 남았지만 횟수가 부족
      await queryRunner.commitTransaction();
      return false;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  //채팅용 차감된 잔여횟수 다시 돌려주는 비즈니스 로직
  async restoreMembershipBalance(userId: string): Promise<void> {
    const now = dayjs();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 돈이 달린 영역이기 때문에 1회 돌려주기 전에 다시 한번 확인..
      const status = await this.userRepository.findMembershipById(
        userId,
        queryRunner,
      );
      const expiryDate = dayjs(status.endAt);

      if (
        expiryDate >= now &&
        (status.usingService == 'trail' || status.usingService == 'basic')
      ) {
        await this.userRepository.restoreBalance(userId, queryRunner);
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
