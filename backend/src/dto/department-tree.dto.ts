import { CostCode } from '../entities/budget-item.entity';

export class BudgetItemResponseDto {
  id: number;
  costCode: CostCode;
  allocatedAmount: number;
  spentAmount: number;
}

export class DepartmentTreeDto {
  id: number;
  name: string;
  parentId: number | null;
  budgetItems: BudgetItemResponseDto[];
  aggregatedBudget: Record<CostCode, { allocated: number; spent: number }>;
  children: DepartmentTreeDto[];
  isLeaf: boolean;
}
