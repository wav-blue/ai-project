import { DataSource, QueryRunner, Repository } from 'typeorm';
import { User } from './user.entity';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

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

    // const found = await this.userRepository.findOne({
    //   where: { user_id: userId },
    // });
    return found;
  }

  async getUserbyEmail(email: string): Promise<User> {
    const found = await this.userRepository
      .createQueryBuilder()
      .select('user')
      //.select(['user.user_id', 'user.email', 'user.password']) // 원하는 컬럼을 명시적으로 선택
      .from(User, 'user')
      .where('user.email = :email', { email })
      .getOne();

    // const found = await this.userRepository.findOne({ where: { email } });
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
    // const newUser = await this.userRepository.create({
    //   email: email,
    //   logintype: logintype,
    //   password: password,
    // });
    // await this.userRepository.save(newUser);

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
    // found.password = password;
    // await this.userRepository.save(found);

    return found;
  }
}
