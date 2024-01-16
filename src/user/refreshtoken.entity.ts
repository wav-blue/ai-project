import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: 'REFRESHTOKEN' })
export class RefreshToken extends BaseEntity {
  @OneToOne(() => User)
  @Column({ type: 'varchar', length: 50 })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  token: string;

  @PrimaryGeneratedColumn('uuid')
  token_id: string;

  @BeforeInsert()
  createTokenId() {
    if (!this.token_id) {
      this.token_id = uuidv4();
    }
    console.log(this);
  }
}
