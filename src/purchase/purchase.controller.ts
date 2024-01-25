import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../user/guards/local-service.guard';
import { PurchaseService } from './purchase.service';
//import { MemberShipService } from 'src/purchase/membership.service.ts';

@Controller('purchase')
export class PurchaseController {
  constructor(
    private purchaseService: PurchaseService,
    //private membershipService: MemberShipService,
  ) {}
  @Get('/my')
  @UseGuards(LocalAuthGuard)
  async getPurchasesMy() {
    // 결제했던 내역들 가져옴
  }

  @Post('/my')
  @UseGuards(LocalAuthGuard)
  async createPurchaset() {}
}
