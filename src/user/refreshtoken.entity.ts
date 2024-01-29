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
  userId: string;

  @Column({ type: 'varchar', length: 250 })
  token: string;

  @PrimaryGeneratedColumn('uuid')
  tokenId: string;

  @BeforeInsert()
  createTokenId() {
    if (!this.tokenId) {
      this.tokenId = uuidv4();
    }
    console.log(this);
  }
}
