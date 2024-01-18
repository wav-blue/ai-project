import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('report_comment')
export class commentReport extends BaseEntity {
  @PrimaryGeneratedColumn()
  reportCommentId: number;

  @Column({ type: 'int' })
  commentId: number;

  @Column({ type: 'varchar', length: 50 })
  reportUserId: string;

  @Column({ type: 'varchar', length: 50 })
  targetUserId: string;

  @Column({ type: 'varchar', length: 100 })
  reportType: number;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date;
}
