import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { PurchaseRepository } from './purchase.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './purchase.entity';
import { MemberShip } from 'src/user/membership.entity';
import { MembershipService } from 'src/user/membership.service';
import { MembershipRepository } from 'src/user/membership.repository';
import { ProductRepository } from './product.repository';
import { Product } from './product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, MemberShip, Product])],
  controllers: [PurchaseController],
  providers: [
    PurchaseService,
    MembershipService,
    PurchaseRepository,
    MembershipRepository,
    ProductRepository,
  ],
})
export class PurchaseModule {}
