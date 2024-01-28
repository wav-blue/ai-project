import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity({ name: 'PURCHASE' })
export class Purchase extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user_id: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'varchar' })
  product_id: string;

  @Column({ type: 'datetime' })
  created_at: Date;

  @Column({ type: 'varchar' })
  paymentKey: string;

  @PrimaryColumn({ type: 'varchar' })
  orderId: string;
}
