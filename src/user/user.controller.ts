import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  private logger = new Logger('userController');

  @Get('/login')
  userLogin(): Promise<User[]> {
    this.logger.log(' user get 요청 실행 !');
    return this.userService.userLogin();
  }

  @Post('/regist')
  @UsePipes(ValidationPipe)
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(' item post 요청 실행 !');
    const newUser = this.userService.registUser(createUserDto);
    return newUser;
  }
}
