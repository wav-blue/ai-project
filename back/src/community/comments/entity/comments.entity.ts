import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommentPosition } from '../enum/CommentPosition.enum';
import { CommentStatus } from '../enum/CommentStatus.enum';

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
  position: string;

  @Column({ type: 'enum', enum: CommentStatus })
  status: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt: Date;
}
