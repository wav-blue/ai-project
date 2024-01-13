import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { LoginRequestType } from './dtos/loginrequesttype .dto';
import { AuthGuard } from '@nestjs/passport';
import { GoogleRequest } from 'passport-google-oauth20';
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  private logger = new Logger('userController');

  @Post('/regist')
  @UsePipes(ValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(' user create 요청 실행 !');
    const newUser = await this.userService.createUser(createUserDto);
    return newUser;
  }

  @Put('/edit')
  @UsePipes(ValidationPipe)
  async updateUser(@Body() updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(' user put 요청 실행 !');
    const newUser = await this.userService.updateUser(updateUserDto);
    return newUser;
  }

  @Post('/login/email')
  async userLogin(@Body() loginRequestType: LoginRequestType): Promise<User> {
    const { email, password } = loginRequestType;
    this.logger.log(' user login 요청 실행 !');
    const user = await this.userService.userLogin(email, password);
    return user;
  }

  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {}
  /* Get Google Auth Callback */
  @Get('/auth/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: GoogleRequest,
    @Res() res: Response, // : Promise<GoogleLoginAuthOutputDto>
  ) {
    // return res.send(user);
    return this.userService.googleLogin(req, res);
  }

  // @Post('/logout')
  // userLogout(): Promise<User[]> {
  //   this.logger.log(' user logout 요청 실행 !');
  //   return this.userService.userLogout();
  // }
}
