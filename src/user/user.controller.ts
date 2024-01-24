import {
  Body,
  Controller,
  Get,
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

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
  @UsePipes(ValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const newUser = (
      await this.userService.createUser(createUserDto)
    ).readonlyData();
    return newUser;
  }

  @Post('/resign')
  @UsePipes(ValidationPipe)
  @UseGuards(LocalAuthGuard)
  async deleteUser(@Res() res: Response): Promise<boolean> {
    // 유저 탈퇴 처리
    // 유저 쿠키 삭제
    this.clearTokens(res);

    return true;
  }

  @Get('/logout')
  @UseGuards(LocalAuthGuard)
  async logout(@Res() res: Response) {
    this.clearTokens(res);

    res.send({ ok: true });
  }

  @Get('/me')
  @UseGuards(LocalAuthGuard)
  async getUser(@Req() req: Request) {
    const userId = req['user'];

    const user = await this.userService.getUserById(userId);

    return user.readonlyData();
  }

  @Put('/edit')
  @UsePipes(ValidationPipe)
  @UseGuards(LocalAuthGuard)
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    console.log(req['user']);
    const userId = req['user'];

    if (updateUserDto.userId != userId) {
      throw new UnauthorizedException('다른 유저의 정보를 수정할수 없습니다.');
    }

    const newUser = await this.userService.updateUser(updateUserDto);
    return newUser.readonlyData();
  }

  @Post('/login/email')
  @UsePipes(ValidationPipe)
  async userLoginbyEmail(
    @Body() loginRequest: LoginRequestType,
    @Res() res: Response,
  ) {
    const { email, password } = loginRequest;
    const loginUser = { email, logintype: 'EMAIL', password };

    const { user, accessToken, refreshToken } =
      await this.userService.userLogin(loginUser);

    this.setTokens(res, accessToken, refreshToken);
    res.send(user.readonlyData());
  }

  @Get('/login/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('/login/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: GoogleRequest,
    @Res() res: Response, // : Promise<GoogleLoginAuthOutputDto>
  ) {
    console.log('callback tests, google');
    const userDto = req.user;

    const { user, accessToken, refreshToken } =
      await this.userService.userLogin(userDto);

    await this.setTokens(res, accessToken, refreshToken);
    res.redirect('http://localhost:3000');
  }

  @Get('/login/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth() {}

  @Get('/login/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req: Request, @Res() res: Response) {
    const userDto = req['user'];

    console.log(userDto);

    const { user, accessToken, refreshToken } =
      await this.userService.userLogin(userDto);

    await this.setTokens(res, accessToken, refreshToken);
    res.redirect('http://localhost:3000');
  }

  setTokens(@Res() res: Response, accessToken, refreshToken): void {
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
  clearTokens(@Res() res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return;
  }
}
