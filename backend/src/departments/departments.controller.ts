import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Post,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { UpdateBudgetDto } from '../dto/update-budget.dto';
import { DepartmentTreeDto } from '../dto/department-tree.dto';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async getDepartments(): Promise<DepartmentTreeDto[]> {
    return this.departmentsService.findAllAsTree();
  }

  @Patch(':id/budget')
  async updateBudget(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ): Promise<DepartmentTreeDto[]> {
    return this.departmentsService.updateDepartmentBudget(id, updateBudgetDto);
  }

  @Post('seed')
  async seedData(): Promise<{ message: string }> {
    await this.departmentsService.seedData();
    return { message: 'Database seeded successfully' };
  }

  @Post()
  async createDepartment(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentTreeDto[]> {
    return this.departmentsService.createDepartment(createDepartmentDto);
  }

  @Patch(':id')
  async updateDepartment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentTreeDto[]> {
    return this.departmentsService.updateDepartment(id, updateDepartmentDto);
  }

  @Delete(':id')
  async deleteDepartment(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DepartmentTreeDto[]> {
    return this.departmentsService.deleteDepartment(id);
  }
}
