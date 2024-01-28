import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  BeforeInsert,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MemberShip } from './membership.entity';
import { RefreshToken } from './refreshtoken.entity';
import { v4 as uuidv4 } from 'uuid';
@Entity({ name: 'USER' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

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
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  membership: MemberShip;

  @OneToOne(() => RefreshToken)
  //@JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  RefreshToken: RefreshToken;

  @BeforeInsert()
  createUserId() {
    if (!this.user_id) {
      this.user_id = uuidv4();
    }
  }

  readonlyData() {
    return {
      userId: this.user_id,
      logintype: this.logintype,
      membership: this.membership,
    };
  }
}
