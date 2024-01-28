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
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ type: 'datetime', nullable: true })
  start_at: Date;

  @Column({ type: 'datetime', nullable: true })
  end_at: Date;

  @Column({ type: 'enum', enum: ['non-member', 'trail', 'basic', 'premium'] })
  using_service: string;

  @Column({ type: 'int' })
  remain_chances: number;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true })
  deleted_at: Date;
}
