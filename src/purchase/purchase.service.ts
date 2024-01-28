import { Injectable } from '@nestjs/common';
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

  // tossUrl env든 config든 옮기긴 해야함
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
      if (!foundproduct) {
        throw new Error('잘못된 프로덕트를 결제ㅏ');
      }

      //const nesPurchase = await this.purchaseRepository.createPurchase();

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
      console.log(response);
      console.log(data, 'df');

      // 멤버십 변경, 결제 내역 저장
      const updatedMembership = await this.membershipService.updateMembership(
        userId,
        foundproduct.name,
      );
      //
      purchaseDto.productId = foundproduct.productId;
      const newPurchase = await this.purchaseRepository.createPurchase(
        purchaseDto,
        userId,
        queryRunner,
      );

      // 트랜젝션 처리
      await queryRunner.commitTransaction();

      // 성공한 결과 알려주기 or redirect
      return {
        title: '성공적으로 구매했습니다',
        ok: true,
        // amount: response.body.totalAmount,
      };
    } catch (e) {
      console.log('토스 페이먼츠 에러 코드', e);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
