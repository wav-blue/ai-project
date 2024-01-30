import { QueryRunner } from 'typeorm';
import { MemberShip } from './membership.entity';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class MembershipRepository {
  async getMembershipbyuserId(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<MemberShip> {
    try {
      const found = await queryRunner.manager
        .createQueryBuilder()
        .select('membership')
        .from(MemberShip, 'membership')
        .where('membership.userId = :userId', { userId })
        .getOne();

      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async createMembership(
    userId: string,
    queryRunner: QueryRunner,
    membershipType: string,
  ): Promise<MemberShip> {
    try {
      const membershipvalues = new MemberShip();
      membershipvalues.userId = userId;
      //시작날짜 추가필요
      //membershipvalues.startAt

      switch (membershipType) {
        case 'basic':
          membershipvalues.usingService = 'basic';
          membershipvalues.remainChances = 50;
          break;
        case 'premium':
          membershipvalues.usingService = 'premium';
          membershipvalues.remainChances = 5000;
          break;
        default:
          membershipvalues.usingService = 'normal';
          membershipvalues.remainChances = 5;
          break;
      }
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(MemberShip)
        .values({
          ...membershipvalues,
        })
        .execute();

      const found = await this.getMembershipbyuserId(userId, queryRunner);

      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async updateMembership(
    userId: string,
    queryRunner: QueryRunner,
    membershipType: string,
  ): Promise<MemberShip> {
    try {
      const membershipvalues = new MemberShip();
      membershipvalues.userId = userId;
      //시작날짜 추가필요

      switch (membershipType) {
        case 'basic':
          membershipvalues.usingService = 'basic';
          membershipvalues.remainChances = 50;
          break;
        case 'premium':
          membershipvalues.usingService = 'premium';
          membershipvalues.remainChances = 5000;
          break;
        default:
          membershipvalues.usingService = 'normal';
          membershipvalues.remainChances = 5;
          break;
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(MemberShip)
        .set({ ...membershipvalues })
        .where('userId = :userId', { userId })
        .execute();

      const found = await this.getMembershipbyuserId(userId, queryRunner);
      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async useRemain(
    userId: string,
    remain: number,
    queryRunner: QueryRunner,
  ): Promise<MemberShip> {
    try {
      const found = await this.getMembershipbyuserId(userId, queryRunner);

      // 멤버십 기간에 대한 검증도 추가필요함
      if (found.remainChances <= 0) {
        throw new UnauthorizedException('질문 횟수가 부족합니다.');
      }
      await queryRunner.manager
        .createQueryBuilder()
        .update(MemberShip)
        .set({ remainChances: found.remainChances - 1 })
        .where('membership.user_id = :userId', { userId })
        .execute();

      return await this.getMembershipbyuserId(userId, queryRunner);
    } catch (err) {
      throw err;
    }
  }

  validateRemain(found: MemberShip) {
    if (found.remainChances <= 0) {
      throw new UnauthorizedException('질문 횟수가 부족합니다.');
    }
    return true;

    // if (found.endAt <= new Date(Date.now())) {
    //   throw new UnauthorizedException('멤버십 기간이 종료되었습니다.');
    // }
  }

  // !!! 원민님 아직 작업중이신 것 같아서 채팅 테스트 용으로 아래에 임시 코드를 작성했습니다~
  // 멤버십 완성하시면 develop 에 merge 하실때 지워주시고 말씀해주세요! - (hy)

  //userId 로 멤버십 조회해서 expired 시키는 쿼리(기한 만료된것은 서비스계층에서 확인함)
  //그냥 간단히 soft-delete 시켜서 기본 selet() 쿼리로는 검색이 안되도록 만들어줍니다.
  //deletedAt 과 updatedAt 이 자동으로 들어감
  async expireMembership(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      await queryRunner.manager
        .createQueryBuilder(MemberShip, 'MBS')
        .softDelete()
        .where('MBS.userId = :userId', { userId })
        .execute();
    } catch (err) {
      throw err;
    }
  }

  //userId로 멤버쉽 조회해서 횟수 1번 까주는 쿼리
  async deductMembership(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(MemberShip)
        .set({ remainChances: () => 'remainChances - 1' })
        .where('membership.userId = :userId', { userId })
        .execute();
    } catch (err) {
      throw err;
    }
  }

  //멤버쉽 다시 돌려주는 쿼리
  async restoreBalance(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(MemberShip)
        .set({ remainChances: () => 'remainChances + 1' })
        .where('membership.userId = :userId', { userId })
        .execute();
    } catch (err) {
      throw err;
    }
  }
}
