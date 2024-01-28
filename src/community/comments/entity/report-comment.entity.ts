import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('REPORT_COMMENT')
export class CommentReport extends BaseEntity {
  @PrimaryGeneratedColumn()
  reportCommentId: number;

  @Column({ type: 'int' })
  commentId: number;

  @Column({ type: 'varchar', length: 50 })
  reportUserId: string;

  @Column({ type: 'varchar', length: 50 })
  targetUserId: string;

  @Column({ type: 'varchar', length: 100 })
  reportType: string;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date;
}
