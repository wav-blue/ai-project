import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';
import { MembershipRepository } from './membership.repository';
import { MemberShip } from './membership.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class MembershipService {
  constructor(
    private dataSource: DataSource,
    private membershipRepository: MembershipRepository,
  ) {}

  //조회용 + 만료처리용 내부 함수
  // 가입할 때 웰컴멤버십(normal) 생성해주므로, 걸리는 게 없는 경우 만료처리 된것임.
  // delete 처리되지 않은 normal, basic, prmium 이 모두 걸림
  // expire 처리 여기서 하기로.
  private async searchMembershipByUser(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<MemberShip> {
    const now = dayjs();
    try {
      const found = await this.membershipRepository.getMembershipbyuserId(
        userId,
        queryRunner,
      );
      if (!found) {
        //가입할때 모두 생성시켜줬는데 찾은게 없는 경우, 이미 만료처리(softdelete)까지 완료된것임.
        throw new UnauthorizedException('이용중인 멤버십이 없습니다.');
      } else if (dayjs(found.endAt) < now) {
        //찾았지만 기한 지난경우 만료시킴
        await this.membershipRepository.expireMembership(userId, queryRunner);
        throw new UnauthorizedException('멤버십이 만료되었습니다.');
      }
      return found;
    } catch (error) {
      throw error;
    }
  }
  // 유저 마이페이지 용도 조회 서비스
  async getMembershipbyUser(userId: string): Promise<{
    usingService: string;
    remainChances?: number;
    startAt: Date;
    endAt: Date;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const found = await this.searchMembershipByUser(userId, queryRunner);
      await queryRunner.commitTransaction();
      const { startAt, endAt, usingService, remainChances } = found;
      const result =
        usingService == 'premium'
          ? { usingService, startAt, endAt }
          : { usingService, remainChances, startAt, endAt };

      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  //결제용도
  //새로 결제해야만 업데이트 된다...!
  //만료처리는 조회에서 하고 있음.
  //가입하면 무조건 normal 멤버십 생성됐다가 1달 후 만료되므로, softdelete 된 데이터라도 반드시 있다고 가정.
  //업그레이드만 한다고 가정: 노-> 베, 베-> 프 업그레이드 혹은 구독갱신은 가능하지만
  //구독기간이 남았을 때 베->베 , 프->프 를 다시 할 수 는 없음.

  async checkMembershipPrePurchase(
    userId: string,
    usingService: string,
    queryRunner: QueryRunner,
  ): Promise<void> {
    try {
      const found = await this.membershipRepository.getMembershipbyuserId(
        userId,
        queryRunner,
      );

      if (usingService == found.usingService) {
        throw new ServiceUnavailableException(
          '구독기간이 남은 서비스를 중도 갱신 할 수 없습니다.',
        );
      }
    } catch (err) {
      throw err;
    }
  }
  //노말 기간 남았는데 베이직 업그레이드: 100 + 남은횟수 해줌
  //노말 기간 남았는데 프리미엄 업그레이드: 상관없음..
  //베이직 기간 남았는데 프리미엄 업그레이드: 상관없음
  //베이직이 베이직 갱신(구독 정기결제 완료): 100 초기화.
  //프리미엄이 프리미엄 갱신: 상관없음.
  // 따라서 basic 업데이트 일 경우에만 원래 노말인지 아닌지 확인하면 됨.
  //원래 노말일경우 =+5, 아닐경우 그냥 100
  //업그레이드는 일어날 수 있으나 다ㅜ

  //다운그레이드 할 경우
  //프리미엄-> 베이직: 그냥 돈을 일할 계산 해서 돌려주고 베이직 결제를 해줘서 100개를 준다.
  //베이직-> 취소: 그냥 돈을 돌려주고 0으로 만듦.
  //노말에서 노말 업데이트는 없다고 가정

  //perchase에서 트랜잭션 받아와야 할 것 같음
  async updateMembership(
    userId: string,
    membershipType: string,
    queryRunner: QueryRunner,
  ): Promise<MemberShip> {
    let remainChances = 100; //프리미엄은 차감 안하므로 basic 기준으로 맞춘다
    try {
      if (membershipType === 'basic') {
        const found = await this.membershipRepository.getMembershipbyuserId(
          userId,
          queryRunner,
        );
        remainChances =
          found.usingService === 'normal'
            ? found.remainChances + remainChances
            : remainChances;
      }

      await this.membershipRepository.updateMembership(
        //멤버십종류, 남은횟수, 시작일 만료일 업데이트
        userId,
        membershipType,
        remainChances,
        queryRunner,
      );
      const newMembership = //업데이트 된 결과 조회
        await this.membershipRepository.getMembershipbyuserId(
          userId,
          queryRunner,
        );
      return newMembership;
    } catch (error) {
      throw error;
    }
  }

  async useMembership(userId: string): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //정상 멤버십 가지고 있는지 체크
      const found = await this.searchMembershipByUser(userId, queryRunner);
      // 만료기간 체크는 이미 한 결과이므로 또 할 필요 없다.
      // 만료일 경우 앞에서 이미 에러 반환됨.

      if (found.usingService == 'premium') {
        await queryRunner.commitTransaction();
        return true;
      } //프리미엄을 먼저 걸러서 다른 작업 없이 반환시킴

      //premium 거르고 나면 남은것은 basic, normal 뿐임
      //남은 횟수가 부족한 경우 에러
      if (found.remainChances <= 0) {
        throw new UnauthorizedException('잔여 질문권 횟수가 부족합니다.');
      }

      //정상적인 basic, normal 횟수 차감
      await this.membershipRepository.useRemain(userId, queryRunner);
      await queryRunner.commitTransaction();
      return true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async restoreMembershipBalance(userId: string): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const status = await this.membershipRepository.getMembershipbyuserId(
        userId,
        queryRunner,
      );
      //normal 이나 basic 인 경우만 돌려줌
      if (status.usingService == 'basic' || status.usingService == 'normal') {
        await this.membershipRepository.restoreBalance(userId, queryRunner);
        await queryRunner.commitTransaction();
        return '채팅 진행중 문제가 발생하여 차감 멤버십을 반환하였습니다.';
      }
      await queryRunner.commitTransaction(); //프리미엄인 경우 반환 문구 x
      return '채팅 진행중 문제가 발생하여 중단되었습니다. 다시 시도해주세요';
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new ServiceUnavailableException(
        '멤버십 반환중 오류가 발생했습니다. 운영진에게 연락해주세요',
      );
    } finally {
      await queryRunner.release();
    }
  }

  //가입시 웰컴멤버십 생성
  async createWelcomeMembership(userId: string, queryRunner: QueryRunner) {
    try {
      await this.membershipRepository.createWelcomeMembership(
        userId,
        queryRunner,
      );
    } catch (err) {
      throw err;
    }
  }
}
