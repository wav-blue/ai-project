import { BaseEntity, Column, Entity, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class MemberShip extends BaseEntity {
  @OneToOne(() => User)
  @Column({ type: 'varchar', length: 50, name: 'user_id' })
  userId: string;

  @Column({ type: 'datetime' })
  start_at: Date;

  @Column({ type: 'datetime' })
  end_at: Date;

  @Column({ type: 'enum', enum: ['non-member', 'trail', 'basic', 'premium'] })
  usingService: string;

  @Column({ type: 'number' })
  remainChances: number;

  @Column({ type: 'datetime' })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true })
  deleted_at: Date;
}