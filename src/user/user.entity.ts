import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Column({ type: 'varchar', length: 50 })
  userid: string;

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
    if (!this.userid) {
      this.userid = uuidv4();
    }
  }
}
