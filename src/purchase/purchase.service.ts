import { ForbiddenException, Injectable } from '@nestjs/common';
import { PurchaseDto } from './purchase.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { MembershipService } from 'src/user/membership.service';
import { PurchaseRepository } from './purchase.repository';
import * as dotenv from 'dotenv';
import { ProductRepository } from './product.repository';

dotenv.config();
@Injectable()
export class PurchaseService {
  constructor(
    private dataSource: DataSource,
    private membershipService: MembershipService,
    private purchaseRepository: PurchaseRepository,
    private productRepository: ProductRepository,
  ) {}

  //승인 대기중인 결제가 맞는지 확인
  //tossUrl = 'https://api.tosspayments.com/v1/payments/';
  async successPay(userId: string, purchaseDto: PurchaseDto) {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const { orderId, amount, paymentKey } = purchaseDto;
    try {
      const encryptedSecretKey =
        'Basic ' +
        Buffer.from(process.env.TOSS_TEST_KEY + ':').toString('base64');

      const found = await fetch(
        `https://api.tosspayments.com/v1/payments/${paymentKey}`,
        {
          method: 'GET',
          headers: {
            Authorization: encryptedSecretKey,
            'Content-Type': 'application/json',
          },
        },
      );
      const founddata = await found.json();
      const productId = founddata.orderName;

      //productId 를 통해 검증, 성공하면 confirm
      const foundproduct = await this.productRepository.getProductbyId(
        productId,
        queryRunner,
      );

      // 에러코드 변경해야함, 찾은 상품과 실제 결제 가격 비교도 해야함
      if (!foundproduct || foundproduct.price != amount) {
        throw new ForbiddenException('존재하지 않는 상품입니다.');
      }

      // 결제 승인 요청
      const response = await fetch(
        'https://api.tosspayments.com/v1/payments/confirm',
        {
          method: 'POST',
          body: JSON.stringify({ orderId, amount, paymentKey }),
          headers: {
            Authorization: encryptedSecretKey,
            'Content-Type': 'application/json',
          },
        },
      );

      // 결제 결과
      const data = await response.json();

      // 멤버십 업데이트
      await this.membershipService.updateMembership(userId, foundproduct.name);

      //결제 내역 저장
      purchaseDto.productId = foundproduct.productId;
      await this.purchaseRepository.createPurchase(
        purchaseDto,
        userId,
        queryRunner,
      );
      // 트랜젝션 처리
      await queryRunner.commitTransaction();

      // 성공
      return {
        ok: true,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async getPurchases(userId) {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      return await this.purchaseRepository.getPurchasesbyuserId(
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
  async useMembershipRemain(userId) {
    return await this.membershipService.useMembership(userId);
  }
}
