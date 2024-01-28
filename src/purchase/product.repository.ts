import { QueryRunner } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Product } from './product.entity';

@Injectable()
export class ProductRepository {
  async getProductbyId(
    productId: string,
    queryRunner: QueryRunner,
  ): Promise<Product> {
    try {
      const found = await queryRunner.manager
        .createQueryBuilder()
        .select('product')
        .from(Product, 'product')
        .where('product.productId = :productId', { productId })
        .getOne();
      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }
  async getProducts(queryRunner: QueryRunner): Promise<Product[]> {
    try {
      const founds = await queryRunner.manager
        .createQueryBuilder()
        .select('product')
        .from(Product, 'product')
        .getMany();
      return founds;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }
}
