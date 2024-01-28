import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';
import { MembershipRepository } from './membership.repository';
import { MemberShip } from './membership.entity';

@Injectable()
export class MembershipService {
  constructor(
    private dataSource: DataSource,
    private membershipRepository: MembershipRepository,
  ) {}

  async getMembershipById(userId: string): Promise<MemberShip> {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const found = await this.membershipRepository.getMembershipbyuserId(
        userId,
        queryRunner,
      );

      if (!found) {
        //가입된 멤버십이 없으면 기본 멤버십생성해서 반환
        await this.membershipRepository.createMembership(
          userId,
          queryRunner,
          'normal',
        );
        const newfound = await this.membershipRepository.getMembershipbyuserId(
          userId,
          queryRunner,
        );

        await queryRunner.commitTransaction();
        return newfound;
      }

      await queryRunner.commitTransaction();
      return found;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    } finally {
      await queryRunner.release();
    }
  }

  async updateMembership(
    userId: string,
    membershipType: string,
  ): Promise<MemberShip> {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const found = await this.membershipRepository.getMembershipbyuserId(
        userId,
        queryRunner,
      );
      console.log('membership확인', found);

      if (found) {
        await this.membershipRepository.updateMembership(
          userId,
          queryRunner,
          membershipType,
        );
        await queryRunner.commitTransaction();
        return found;
      }

      const newMembership = await this.membershipRepository.createMembership(
        userId,
        queryRunner,
        membershipType,
      );

      await queryRunner.commitTransaction();
      return newMembership;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    } finally {
      await queryRunner.release();
    }
  }
}
