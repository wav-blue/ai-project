import { IsNotEmpty, IsEnum, IsString } from 'class-validator';

export class PurchaseDto {
  @IsNotEmpty()
  paymentKey: string;

  @IsNotEmpty()
  orderId: string;

  @IsNotEmpty()
  amount: number;

  productId: string;
}
