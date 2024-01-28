import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../user/guards/local-service.guard';
import { PurchaseService } from './purchase.service';
import { MembershipService } from 'src/user/membership.service';
import { PurchaseDto } from './purchase.dto';

@Controller('purchase')
export class PurchaseController {
  constructor(
    private purchaseService: PurchaseService,
    private membershipService: MembershipService,
  ) {}
  @Get('/my')
  @UseGuards(LocalAuthGuard)
  async getPurchasesMy() {
    // 결제했던 내역들 가져옴
  }

  @Post('/success')
  successPay(@Body() purchaseDto: PurchaseDto) {
    console.log(purchaseDto);
    const userId = 'a809686d-a78b-4936-85b6-5133afca4bf9';
    return this.purchaseService.successPay(userId, purchaseDto);
  }

  @Get('/success')
  successPay2(@Query() purchaseQuery) {
    console.log('sdaf');
    console.log(purchaseQuery);

    const purchaseDto = purchaseQuery;
    const userId = 'a809686d-a78b-4936-85b6-5133afca4bf9';

    return this.purchaseService.successPay(userId, purchaseDto);
  }
  @Post('/membership')
  @UseGuards(LocalAuthGuard)
  async createPurchaset() {
    //멤버십
  }
}
