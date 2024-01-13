import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MemberShip } from './membership.entity';
@Entity({ name: 'User' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Column({ type: 'varchar', length: 50, name: 'user_id' })
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

  @BeforeInsert()
  generateUserId() {
    if (!this.userId) {
      this.userId = uuidv4();
    }
  }

  @OneToOne(() => MemberShip)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  membership: MemberShip;

  readonlyData() {
    return {
      userId: this.userId,
      membership: this.membership,
    };
  }
}
