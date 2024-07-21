import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('REPORT_COMMENT')
export class CommentReport extends BaseEntity {
  @PrimaryGeneratedColumn()
  reportCommentId: number;

  @Column({ type: 'int' })
  commentId: number;

  @Column({ type: 'varchar', length: 50 })
  reportUserId: string;

  @Column({ type: 'varchar', length: 100 })
  reportType: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date;
}
