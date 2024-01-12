import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { MemberShip } from './membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, MemberShip])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
