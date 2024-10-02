import {
  BaseEntity,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity('REPORT_TYPE')
export class CommentReport extends BaseEntity {
  @PrimaryColumn()
  reportCode: number;

  @Column({ type: 'varchar', length: 100 })
  commentDescribe: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date;
}
