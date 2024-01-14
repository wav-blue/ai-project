import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryColumn,
  Generated,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefreshToken extends BaseEntity {
  @OneToOne(() => User)
  @Column({ type: 'varchar', length: 50, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  token: string;

  @PrimaryColumn({ type: 'varchar', length: 50, name: 'token_id' })
  @Generated('uuid')
  tokenId: string;
}
