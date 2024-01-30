import { QueryRunner } from 'typeorm';
import { User } from './user.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserRepository {
  async getUserbyId(userId: string, queryRunner: QueryRunner): Promise<User> {
    try {
      const found = await queryRunner.manager
        .createQueryBuilder(User, 'user')
        .select('user')
        .where('user.userId = :userId', { userId })
        .getOne();

      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async getUserbyEmail(email: string, queryRunner: QueryRunner): Promise<User> {
    try {
      const found = await queryRunner.manager
        .createQueryBuilder(User, 'user')
        .select('user')
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
        newUserResults.identifiers[0].userId,
        queryRunner,
      );
      return newUser;
    } catch (err) {
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
        .where('userId = :userId', { userId })
        .execute();

      const found = await this.getUserbyId(userId, queryRunner);

      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }
}
