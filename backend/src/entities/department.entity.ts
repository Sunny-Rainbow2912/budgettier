import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { BudgetItem } from './budget-item.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  parentId: number | null;

  @ManyToOne(() => Department, (department) => department.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: Department | null;

  @OneToMany(() => Department, (department) => department.parent)
  children: Department[];

  @OneToMany(() => BudgetItem, (budgetItem) => budgetItem.department, {
    cascade: true,
    eager: true,
  })
  budgetItems: BudgetItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
