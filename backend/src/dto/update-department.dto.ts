import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  parentId?: number | null;
}
