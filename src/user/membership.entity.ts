import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
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

  @CreateDateColumn()
  @UpdateDateColumn({ type: 'datetime', nullable: true })
  startAt: Date;

  @Column({ type: 'datetime', nullable: true })
  endAt: Date;

  @Column({ type: 'enum', enum: ['normal', 'basic', 'premium'] })
  usingService: string;

  @Column({ type: 'int' })
  remainChances: number;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt: Date;

  readonlyData() {
    return {
      usingService: this.usingService,
      remainChances: this.remainChances,
    };
  }
}
