import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'PURCHASE' })
export class Purchase extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  userId: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'varchar' })
  productId: string;

  @CreateDateColumn({ type: 'datetime', nullable: true })
  createdAt: Date;

  @Column({ type: 'varchar' })
  paymentKey: string;

  @PrimaryColumn({ type: 'varchar' })
  orderId: string;
}
