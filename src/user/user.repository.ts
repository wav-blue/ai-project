import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserRepository {
  private userRepository: Repository<User>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  async getUserbyID(userid: string): Promise<User> {
    const found = await this.userRepository
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.userid = :userid', { userid })
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

    const newItem = this.getUserbyID(newUserResults.identifiers[0].userid);
    return newItem;
  }
}
