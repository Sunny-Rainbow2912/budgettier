import {
  IsEnum,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CostCode } from '../entities/budget-item.entity';

export class BudgetItemDto {
  @IsEnum(CostCode)
  costCode: CostCode;

  @IsNumber()
  @Min(0)
  allocatedAmount: number;

  @IsNumber()
  @Min(0)
  spentAmount: number;
}

export class UpdateBudgetDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetItemDto)
  budgetItems: BudgetItemDto[];
}
