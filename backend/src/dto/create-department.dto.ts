import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  parentId?: number | null;
}
