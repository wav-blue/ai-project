import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'BOARD' })
export class Board extends BaseEntity {
  //user, report 보드와 관계 맺어야 함

  // 이거 왜 안되지?
  // @AfterSoftRemove()
  // updateStatus() {
  //   console.log('이거 왜 안되는데');
  //   this.status = 'deleted';
  // }

  @PrimaryGeneratedColumn({ name: 'board_id' })
  boardId: number;

  @Column({ type: 'varchar', length: 50, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 100, name: 'title' })
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

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true, name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: true, name: 'deleted_at' })
  deletedAt: Date;
}
