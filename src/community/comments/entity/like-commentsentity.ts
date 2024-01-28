import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('COMMENT_LIKE')
export class CommentLike extends BaseEntity {
  @PrimaryColumn()
  @Column({ type: 'int' })
  commentId: number;

  @PrimaryColumn()
  @Column({ type: 'varchar', length: 50 })
  user_id: number;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date;
}
