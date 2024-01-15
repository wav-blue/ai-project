import { DataSource, Repository } from 'typeorm';
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
      .where('user.userId = :userId', { userId })
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
    const { email, logintype } = createUserDto;

    const newUserResults = await this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        email: email,
        logintype: logintype,
      })
      .execute();

    const newItem = this.getUserbyId(newUserResults.identifiers[0].user_id);
    return newItem;
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<any> {
    const { userId, password } = updateUserDto;

    const updatedUserResults = await this.userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        userId: userId,
        password: password,
      })
      .execute();

    const newUser = (
      await this.getUserbyId(updatedUserResults.identifiers[0].userId)
    ).readonlyData();

    //return newUser;
  }
}
