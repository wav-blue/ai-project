import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn()
  board_id: number;

  @Column({ type: 'varchar', length: 50 })
  user_id: string;

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

  @Column({ type: 'datetime' })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true })
  deleted_at: Date;
}
