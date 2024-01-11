import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    //@InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async registUser(createUserDto: CreateUserDto): Promise<User> {
    const found = await this.userRepository.getUserbyEmail(createUserDto.email);
    if (found) throw new ConflictException('이미 존재하는 계정입니다.');

    const createdUser = await this.userRepository.createUser(createUserDto);
    return createdUser;
  }

//   async userLogin({ LoginRequestType : LoginRequestType}) {

//     return true
//   }

}
