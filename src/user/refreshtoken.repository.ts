import { QueryRunner } from 'typeorm';
import { RefreshToken } from './refreshtoken.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class RefreshTokenRepository {
  async getRefreshTokenbyUserId(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<RefreshToken> {
    try {
      const found = await queryRunner.manager
        .createQueryBuilder()
        .select('refreshtoken')
        .from(RefreshToken, 'refreshtoken')
        .where('refreshtoken.user_id = :userId', { userId })
        .getOne();

      return found;
    } catch (err) {
      console.error('getuserbyid error', err.message);
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async getRefreshTokenbyTokenId(
    tokenId: string,
    queryRunner: QueryRunner,
  ): Promise<RefreshToken> {
    try {
      const found = await queryRunner.manager
        .createQueryBuilder()
        .select('refreshtoken')
        .from(RefreshToken, 'refreshtoken')
        .where('refreshtoken.token_id = :tokenId', { tokenId })
        .getOne();

      console.log(found);
      return found;
    } catch (err) {
      console.error('getuserbyid error', err.message);
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async createRefreshToken(
    userId: string,
    refreshToken: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(RefreshToken)
        .values({
          user_id: userId,
          token: refreshToken,
        })
        .execute();
      return;
    } catch (err) {
      console.error('getuserbyid error', err.message);
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(RefreshToken)
        .set({
          token: refreshToken,
        })
        .where('user_id = :userId', { userId })
        .execute();
      return;
    } catch (err) {
      console.error('getuserbyid error', err.message);
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }
}
