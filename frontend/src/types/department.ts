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

export interface BudgetItem {
  id: number;
  costCode: CostCode;
  allocatedAmount: number;
  spentAmount: number;
}

export interface AggregatedBudget {
  [key: string]: {
    allocated: number;
    spent: number;
  };
}

export interface Department {
  id: number;
  name: string;
  parentId: number | null;
  budgetItems: BudgetItem[];
  aggregatedBudget: AggregatedBudget;
  children: Department[];
  isLeaf: boolean;
}

export interface UpdateBudgetRequest {
  budgetItems: {
    costCode: CostCode;
    allocatedAmount: number;
    spentAmount: number;
  }[];
}
