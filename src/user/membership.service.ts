import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { DataSource } from 'typeorm';
import { MembershipRepository } from './membership.repository';
import { MemberShip } from './membership.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class MembershipService {
  constructor(
    private dataSource: DataSource,
    private membershipRepository: MembershipRepository,
  ) {}

  async getMembershipById(userId: string): Promise<MemberShip> {
    const queryRunner = this.dataSource.createQueryRunner();
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

  async useMembership(userId: string) {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let found = await this.membershipRepository.getMembershipbyuserId(
        userId,
        queryRunner,
      );

      if (!found) {
        found = await this.membershipRepository.createMembership(
          userId,
          queryRunner,
          'normal',
        );
      }
      if (this.membershipRepository.validateRemain(found)) {
        await this.membershipRepository.useRemain(
          userId,
          found.remainChances - 1,
          queryRunner,
        );
      }
      return await this.membershipRepository.getMembershipbyuserId(
        userId,
        queryRunner,
      );
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  // !!! 원민님 아직 작업중이신 것 같아서 채팅 테스트 용으로 아래에 임시 코드를 작성했습니다~
  // 멤버십 완성하시면 develop 에 merge 하실때 지워주시고 말씀해주세요! - (hy)

  //채팅용 멤버십 확인, 횟수 차감 비지니스로직
  // 사용기간 만료된 것들은 soft-delete 되어있는 상태라고 가정,
  // 사용기간 만료되었는데 soft-delete 안되어있는 게 만약에 걸리면 여기서 soft-delete 처리
  // normal (이게 체험판이죠?) 은 expire 따로 없고 횟수만 따진다고 가정
  async checkAndDeductMembership(userId: string): Promise<boolean> {
    const now = dayjs();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const status = await this.membershipRepository.getMembershipbyuserId(
        userId,
        queryRunner,
      );
      const expiryDate = dayjs(status.endAt);
      const remainChances = status.remainChances;

      // 사용기간 만료되었는데 soft-delete 안되어있는 게 만약에 걸리면 여기서 soft-delete 처리
      if (expiryDate < now) {
        await this.membershipRepository.expireMembership(userId, queryRunner);
        return false;
      }

      //사용기간 남은것 중에서만 switch
      switch (status.usingService) {
        case 'premium': {
          return true;
        }
        case 'basic': {
          if (remainChances > 0) {
            return true;
          }
          return false;
        }
        case 'normal': {
          if (remainChances > 0) {
            return true;
          }
          return false;
        }
        default: {
          return false;
        }
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async restoreMembershipBalance(userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.membershipRepository.restoreBalance(userId, queryRunner);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
