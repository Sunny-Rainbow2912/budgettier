import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { Department } from '../entities/department.entity';
import { BudgetItem } from '../entities/budget-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, BudgetItem])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
