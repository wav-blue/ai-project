import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'MEMBERSHIP' })
export class MemberShip extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'user_id' })
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ type: 'datetime' })
  startAt: Date;

  @Column({ type: 'datetime' })
  endAt: Date;

  @Column({ type: 'enum', enum: ['non-member', 'trail', 'basic', 'premium'] })
  usingService: string;

  @Column({ type: 'int' })
  remainChances: number;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date;
}
