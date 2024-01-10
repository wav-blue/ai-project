import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Item extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // 임시로 string으로 설정
  // 추후에 type -> User 클래스로 변경해야 함
  @Column()
  user: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: string;
}
