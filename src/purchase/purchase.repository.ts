import { QueryRunner } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Purchase } from './purchase.entity';
import { PurchaseDto } from './purchase.dto';

@Injectable()
export class PurchaseRepository {
  async getPurchasesbyuserId(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<Purchase[]> {
    try {
      const found = await queryRunner.manager
        .createQueryBuilder()
        .select('purchase')
        .from(Purchase, 'purchase')
        .where('purchase.user_id = :userId', { userId })
        .getMany();
      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async getPurchasebyId(
    orderId: string,
    queryRunner: QueryRunner,
  ): Promise<Purchase> {
    try {
      const found = await queryRunner.manager
        .createQueryBuilder()
        .select('purchase')
        .from(Purchase, 'purchase')
        .where('purchase.orderId = :orderId', { orderId })
        .getOne();
      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async createPurchase(
    purchaseDto: PurchaseDto,
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<Purchase> {
    const { paymentKey, orderId, amount, productId } = purchaseDto;
    try {
      const newPurchaseResult = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Purchase)
        .values({
          user_id: userId,
          price: amount,
          product_id: productId,
          paymentKey,
          orderId,
        })
        .execute();

      const newPurchase = await this.getPurchasebyId(
        newPurchaseResult.identifiers[0].orderId,
        queryRunner,
      );
      return newPurchase;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }
}
