import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('COMMENT_POSITION_COUNT')
export class CommentPositionCount extends BaseEntity {
  @PrimaryGeneratedColumn()
  commentCountId: number;

  @Column({ type: 'int' })
  boardId: number;

  @Column({ type: 'int', default: 0 })
  positiveCount: number;

  @Column({ type: 'int', default: 0 })
  negativeCount: number;
}
