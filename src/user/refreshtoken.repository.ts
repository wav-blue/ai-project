import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from './refreshtoken.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenRepository {
  private refreshRepository: Repository<RefreshToken>;

  constructor(private readonly dataSource: DataSource) {
    this.refreshRepository = this.dataSource.getRepository(RefreshToken);
  }

  async getRefreshTokenbyUserId(userId: string): Promise<RefreshToken> {
    const found = await this.refreshRepository
      .createQueryBuilder()
      .select('refreshtoken')
      .from(RefreshToken, 'refreshtoken')
      .where('refreshtoken.user_id = :userId', { userId })
      .getOne();

    return found;
  }

  async getRefreshTokenbyTokenId(tokenId: string): Promise<RefreshToken> {
    const found = await this.refreshRepository
      .createQueryBuilder()
      .select('tokenId')
      .from(RefreshToken, 'refreshtoken')
      .where('refreshtoken.token_id = :tokenId', { tokenId })
      .getOne();

    return found;
  }

  async createRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.refreshRepository
      .createQueryBuilder()
      .insert()
      .into(RefreshToken)
      .values({
        user_id: userId,
        token: refreshToken,
      })
      .execute();
    return;
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.refreshRepository
      .createQueryBuilder()
      .update(RefreshToken)
      .set({
        token: refreshToken,
      })
      .where('user_id = :userId', { userId })
      .execute();
    return;
  }
}
