import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from './refreshtoken.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenRepository {
  private userRepository: Repository<RefreshToken>;

  constructor(private readonly dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(RefreshToken);
  }

  async getRefreshTokenbyUserId(userId: string): Promise<RefreshToken> {
    const found = await this.userRepository
      .createQueryBuilder()
      .select('refreshtoken')
      .from(RefreshToken, 'refreshtoken')
      .where('refreshtoken.userId = :userId', { userId })
      .getOne();

    return found;
  }

  async getRefreshTokenbyTokenId(tokenId: string): Promise<RefreshToken> {
    const found = await this.userRepository
      .createQueryBuilder()
      .select('refreshtoken')
      .from(RefreshToken, 'refreshtoken')
      .where('refreshtoken.tokenId = :tokenId', { tokenId })
      .getOne();

    return found;
  }

  async createRefreshToken(userId, refreshToken): Promise<RefreshToken> {
    let found = this.getRefreshTokenbyUserId(userId);

    if (found) {
      await this.userRepository
        .createQueryBuilder()
        .update(RefreshToken)
        .set({
          token: refreshToken,
        })
        .where('user.userId = :userId', { userId })
        .execute();
    }

    //const newTokenResults =
    else {
      await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(RefreshToken)
        .values({
          userId,
          token: refreshToken,
        })
        .execute();
    }

    found = this.getRefreshTokenbyUserId(userId);
    return found;
  }
}
