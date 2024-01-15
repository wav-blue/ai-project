import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'boards' })
export class Board extends BaseEntity {
  //user, report 보드와 관계 맺어야 함

  @PrimaryGeneratedColumn({ name: 'board_id' })
  boardId: number;

  @Column({ type: 'varchar', length: 50, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({
    type: 'enum',
    enum: ['nomal', 'deleted', 'reported'],
    default: 'nomal',
  })
  status: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'deleted_at' })
  deletedAt: Date;
}
