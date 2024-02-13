import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../user/guards/local-service.guard';
import { PurchaseService } from './purchase.service';
import { PurchaseDto } from './purchase.dto';

@Controller('purchase')
export class PurchaseController {
  constructor(private purchaseService: PurchaseService) {}
  @Get('/my')
  @UseGuards(LocalAuthGuard)
  async getPurchasesMy(@Req() req: Request) {
    const userId = req['user'];
    return await this.purchaseService.getPurchases(userId);
  }

  @Post('/success')
  @UseGuards(LocalAuthGuard)
  successPay(@Req() req: Request, @Body() purchaseDto: PurchaseDto) {
    const userId = req['user'];
    return this.purchaseService.successPay(userId, purchaseDto);
  }

  // 멤버십 사용 테스트용
  // @Get('/usememebership')
  // @UseGuards(LocalAuthGuard)
  // usemembership(@Req() req: Request) {
  //   const userId = req['user'];

  //   return this.purchaseService.useMembershipRemain(userId);
  // }
}
