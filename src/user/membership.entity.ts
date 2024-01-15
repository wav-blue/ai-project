import {
  PrimaryColumn,
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class MemberShip extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 50, name: 'user_id' })
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  userId: string;

  @Column({ type: 'datetime' })
  start_at: Date;

  @Column({ type: 'datetime' })
  end_at: Date;

  @Column({ type: 'enum', enum: ['non-member', 'trail', 'basic', 'premium'] })
  usingService: string;

  @Column({ type: 'int' })
  remainChances: number;

  @Column({ type: 'datetime' })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true })
  deleted_at: Date;
}
