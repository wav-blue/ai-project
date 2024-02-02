import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'MEMBERSHIP' })
export class MemberShip extends BaseEntity {
  @OneToOne(() => User, (user) => user.membership)
  @PrimaryColumn('uuid')
  userId: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  startAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP + INTERVAL 1 MONTH',
  })
  endAt: Date;

  @Column({
    type: 'enum',
    enum: ['normal', 'basic', 'premium'],
    default: 'normal',
  })
  usingService: string;

  @Column({ type: 'int', default: 5 })
  remainChances: number;

  @CreateDateColumn({ type: 'datetime' }) //가입하면 무조건 basic 생성해주므로 가입일자가 될것.
  createdAt: Date;

  // @UpdateDateColumn({ type: 'datetime', nullable: true })
  // updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt: Date;

  readonlyData() {
    return {
      usingService: this.usingService,
      remainChances: this.remainChances,
    };
  }
}
