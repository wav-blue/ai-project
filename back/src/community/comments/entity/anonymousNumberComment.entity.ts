import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ANONYMOUS_NUMBER_COMMENT')
export class AnonymousNumberComment extends BaseEntity {
  @PrimaryColumn({ type: 'int' })
  boardId: number;

  @PrimaryColumn({ type: 'varchar', length: 50 })
  userId: string;

  @Column({ type: 'int' })
  anonymousNumber: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date;
}
