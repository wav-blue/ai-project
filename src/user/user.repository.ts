import { DataSource, QueryRunner, Repository } from 'typeorm';
import { User } from './user.entity';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

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
      console.error('getuserbyid error', err.message);
      throw new Error('게시글 카운팅 실패');
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

    return found;}
  }

  async createUser(createUserDto: CreateUserDto, queryRunner: QueryRunner): Promise<User> {
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
      newUserResults.identifiers[0].user_id,queryRunner
    );
    return newUser;}
  }

  async updateUser(updateUserDto: UpdateUserDto, queryRunner: QueryRunner): Promise<User> {
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
  }}
}
