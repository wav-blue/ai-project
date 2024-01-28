import { QueryRunner } from 'typeorm';
import { User } from './user.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { MemberShip } from './membership.entity';

@Injectable()
export class UserRepository {
  async getUserbyId(userId: string, queryRunner: QueryRunner): Promise<User> {
    try {
      const found = await queryRunner.manager
        .createQueryBuilder()
        .select('user')
        .from(User, 'user')
        .where('user.user_id = :userId', { userId })
        .getOne();

      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async getUserbyEmail(email: string, queryRunner: QueryRunner): Promise<User> {
    try {
      const found = await queryRunner.manager
        .createQueryBuilder()
        .select('user')
        .from(User, 'user')
        .where('user.email = :email', { email })
        .getOne();

      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async createUser(
    createUserDto: CreateUserDto,
    queryRunner: QueryRunner,
  ): Promise<User> {
    try {
      const { email, logintype, password } = createUserDto;

      const newUserResults = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email: email,
          logintype: logintype,
          password: password,
        })
        .execute();

      const newUser = await this.getUserbyId(
        newUserResults.identifiers[0].user_id,
        queryRunner,
      );
      return newUser;
    } catch (err) {
      console.error('createuser error', err.message);
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    queryRunner: QueryRunner,
  ): Promise<User> {
    try {
      const { userId, password } = updateUserDto;

      await queryRunner.manager
        .createQueryBuilder()
        .update(User)
        .set({
          password: password,
        })
        .where('user_id = :userId', { userId })
        .execute();

      const found = await this.getUserbyId(userId, queryRunner);

      return found;
    } catch (err) {
      console.error('updateuser error', err.message);
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  //채팅용 멤버십 확인 쿼리
  async findMembershipById(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<{ usingService: string; remainChances: number; endAt: Date }> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder(MemberShip, 'MS')
        .select(['MS.usingService', 'MS.remainChances', 'MS.endAt'])
        .where('MS.userId = :userId', { userId })
        .getOneOrFail();

      return result;
    } catch (err) {
      throw err;
    }
  }

  //채팅을 위한 멤버십 차감 쿼리
  async deductBalance(userId: string, queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(MemberShip)
        .set({ remainChances: () => 'remainChances - 1' })
        .where('userId = :userId', { userId })
        .execute();
    } catch (err) {
      throw err;
    }
  }

  //채팅을 위한 멤버십 잔여횟수 반환 쿼리
  async restoreBalance(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(MemberShip)
        .set({ remainChances: () => 'remainChances + 1' })
        .where('userId = :userId', { userId })
        .andWhere('usingService IN (:...services)', {
          services: ['trail', 'basic'],
        })
        .execute();
    } catch (err) {
      throw err;
    }
  }
}
