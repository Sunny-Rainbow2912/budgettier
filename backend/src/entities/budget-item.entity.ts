import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Department } from './department.entity';

export enum CostCode {
  SUPPLIES = 'supplies',
  HARDWARE = 'hardware',
  SALARY = 'salary',
  TRAVEL = 'travel',
  UTILITIES = 'utilities',
  MARKETING = 'marketing',
  TRAINING = 'training',
  SOFTWARE = 'software',
}

@Entity('budget_items')
export class BudgetItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  departmentId: number;

  @ManyToOne(() => Department, (department) => department.budgetItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'departmentId' })
  department: Department;

  @Column({
    type: 'text',
    enum: CostCode,
  })
  costCode: CostCode;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  allocatedAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  spentAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
