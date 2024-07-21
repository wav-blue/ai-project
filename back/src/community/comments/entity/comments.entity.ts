import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommentPosition } from '../enum/commentPosition.enum';
import { CommentStatus } from '../enum/commentStatus.enum';

@Entity('COMMENT')
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  commentId: number;

  @Column({ type: 'int' })
  boardId: number;

  @Column({ type: 'varchar', length: 50 })
  userId: string;

  @Column({ type: 'int' })
  anonymousNumber: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: CommentPosition })
  position: CommentPosition;

  @Column({ type: 'enum', enum: CommentStatus })
  status: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date;
}
