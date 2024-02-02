import { QueryRunner } from 'typeorm';
import { MemberShip } from './membership.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

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
      throw new InternalServerErrorException(
        '멤버십 정보 조회 중 DB 오류 발생',
      );
    }
  }

  async createWelcomeMembership(
    //가입 후 노말멤버십 5회짜리 생성해줌. default 값 설정했으므로 user_id 만 넣으면 OK
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<any> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(MemberShip)
        .values({ userId })
        .execute();

      return result.generatedMaps[0];
    } catch (err) {
      throw new InternalServerErrorException(
        '웰컴 멤버십 생성 중 DB 오류 발생',
      );
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
    membershipType: string,
    remainChances: number,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(MemberShip)
        .set({ usingService: membershipType, remainChances }) //entity에서 default를 설정했으므로 여기서 안넣어도 됨
        .where('userId = :userId', { userId })
        .execute();
    } catch (err) {
      throw new InternalServerErrorException('멤버십 갱신 중 DB 오류 발생');
    }
  }

  async useRemain(userId: string, queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(MemberShip)
        .set({ remainChances: () => 'remainChances - 1' })
        .where('userId = :userId', { userId })
        .execute();
    } catch (err) {
      throw err;
    }
  }

  // validateRemain(found: MemberShip) {
  //   if (found.remainChances <= 0) {
  //     throw new UnauthorizedException('질문 횟수가 부족합니다.');
  //   }
  //   return true;
  // }

  //userId 로 멤버십 조회해서 expired 시키는 쿼리(기한 만료된 사실은 서비스계층에서 확인함)
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
        .where('userId = :userId', { userId })
        .execute();
    } catch (err) {
      throw err;
    }
  }
}
