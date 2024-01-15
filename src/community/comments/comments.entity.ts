import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommentPosition } from './enum/CommentPosition.enum';
import { CommentStatus } from './enum/CommentStatus.enum';

@Entity('comments')
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  commentId: number;

  @Column({ type: 'int' })
  boardId: number;

  @Column({ type: 'varchar', length: 50 })
  userId: string;

  // 해당 게시글에서 익명으로 부여되는 숫자 (ex. 익명3)
  @Column({ type: 'int' })
  anonymous_number: number;

  @Column({ type: 'text' })
  content: string;

  // type: set?
  @Column({ type: 'enum', enum: CommentPosition })
  position: string;

  @Column({ type: 'enum', enum: CommentStatus })
  status: string;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date;
}
