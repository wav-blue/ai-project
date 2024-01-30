import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  BeforeInsert,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { MemberShip } from './membership.entity';
import { v4 as uuidv4 } from 'uuid';
@Entity({ name: 'USER' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string;

  @Column({ type: 'enum', enum: ['EMAIL', 'GOOGLE', 'KAKAO'] })
  logintype: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt: Date;

  @OneToOne(() => MemberShip)
  membership: MemberShip;

  @BeforeInsert()
  createUserId() {
    if (!this.userId) {
      this.userId = uuidv4();
    }
  }

  readonlyData() {
    return {
      userId: this.userId,
      logintype: this.logintype,
      membership: this.membership?.readonlyData(),
    };
  }
}
