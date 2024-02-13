import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  //ManyToOne,
} from 'typeorm';
//import { User } from 'src/user/user.entity';

@Entity({ name: 'BOARD' })
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  boardId: number;

  @Column({ type: 'varchar', length: 50 })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 50 })
  tag: string;

  @Column({ type: 'int', default: 0 })
  views: number;

  @Column({
    type: 'enum',
    enum: ['nomal', 'deleted', 'reported'],
    default: 'nomal',
  })
  status: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt: Date;
}

@Entity({ name: 'REPORT_BOARD' })
export class BoardReport extends BaseEntity {
  @PrimaryGeneratedColumn()
  reportBoardId: number;

  @Column({ type: 'int' })
  boardId: number;

  @Column({ type: 'varchar', length: 50 })
  reportUserId: string;

  @Column({ type: 'varchar', length: 50 })
  targetUserId: string;

  @Column({ type: 'varchar', length: 100 })
  reportType: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true })
  deletedAt: Date;
}
