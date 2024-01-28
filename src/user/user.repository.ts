import { DataSource, QueryRunner, Repository } from 'typeorm';
import { User } from './user.entity';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { MemberShip } from './membership.entity';

@Injectable()
export class UserRepository {
  private userRepository: Repository<User>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  async getUserbyId(userId: string): Promise<User> {
    const found = await this.userRepository
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.user_id = :userId', { userId })
      .getOne();

    return found;
  }

  async getUserbyEmail(email: string): Promise<User> {
    const found = await this.userRepository
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.email = :email', { email })
      .getOne();

    return found;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, logintype, password } = createUserDto;

    const newUserResults = await this.userRepository
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
    );
    return newUser;
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    const { userId, password } = updateUserDto;

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        password: password,
      })
      .where('user_id = :userId', { userId })
      .execute();

    const found = await this.getUserbyId(userId);

    return found;
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
