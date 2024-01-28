import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'PRODUCT' })
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  productId: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  descript: string;
}
