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
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { LoginRequestType } from './dtos/loginrequesttype .dto';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-service.guard';
import { GoogleRequest } from 'passport-google-oauth20';

import { Response } from 'express';

import * as config from 'config';

const jwtConfig = config.get('jwt');

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  private logger = new Logger('userController');

  @Post('/register')
  @UsePipes(ValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto) {
    this.logger.log(' user create 요청 실행 !');
    const newUser = (
      await this.userService.createUser(createUserDto)
    ).readonlyData();
    return newUser;
  }

  @Post('/resign')
  @UsePipes(ValidationPipe)
  @UseGuards()
  async deleteUser(): Promise<boolean> {
    this.logger.log(' user create 요청 실행 !');

    // 유저 탈퇴 처리
    // 유저 쿠키 삭제
    return true;
  }

  @Put('/edit')
  @UsePipes(ValidationPipe)
  @UseGuards(LocalAuthGuard)
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ): Promise<User> {
    this.logger.log(' user put 요청 실행 !');
    console.log(req['user']);
    const userId = req['user'];

    if (updateUserDto.userId != userId) {
      throw new UnauthorizedException('다른 유저의 정보를 수정할수 없습니다.');
    }

    const newUser = await this.userService.updateUser(updateUserDto);
    return newUser;
  }

  @Post('/login/email')
  async userLoginbyEmail(
    @Body() loginRequest: LoginRequestType,
    @Res() res: Response,
  ) {
    const { email, password } = loginRequest;
    this.logger.log(' user login 요청 실행 !');

    const { user, accessToken, refreshToken } =
      await this.userService.userLoginbyEmail(email, password);

    this.setCookies(res, accessToken, refreshToken);
    res.send(user.readonlyData());
  }

  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {}

  @Get('/login/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: GoogleRequest,
    @Res() res: Response, // : Promise<GoogleLoginAuthOutputDto>
  ) {
    console.log('callback tests, google');
    const userDto = req['user'];

    console.log(userDto);

    const { user, accessToken, refreshToken } =
      await this.userService.googleLogin(userDto);

    console.log('cont', user, accessToken, refreshToken);

    this.setCookies(res, accessToken, refreshToken);
    console.log('user login end');
    res.send(user.readonlyData());
  }

  setCookies(@Res() res: Response, accessToken, refreshToken): void {
    //토큰 설정
    res.cookie('accessToken', accessToken, {
      domain: 'localhost',
      maxAge: 600 * 1000,
      httpOnly: true,
      path: '/',
    });
    res.cookie('refreshToken', refreshToken, {
      domain: 'localhost',
      maxAge: 3600 * 1000,
      httpOnly: true,
      path: '/',
    });

    return;
  }
}
