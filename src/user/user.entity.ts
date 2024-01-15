import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryColumn,
  Generated,
  JoinColumn,
} from 'typeorm';
import { MemberShip } from './membership.entity';
@Entity({ name: 'User' })
export class User extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 50, name: 'user_id' })
  @Generated('uuid')
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string;

  @Column({ type: 'enum', enum: ['EMAIL', 'GOOGLE', 'KAKAO'] })
  logintype: string;

  @Column({ type: 'datetime' })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true })
  deleted_at: Date;

  @OneToOne(() => MemberShip)
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  membership: MemberShip;

  readonlyData() {
    return {
      userId: this.userId,
      membership: this.membership,
    };
  }
}
