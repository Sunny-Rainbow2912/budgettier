import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { BudgetItem, CostCode } from '../entities/budget-item.entity';
import { DepartmentTreeDto } from '../dto/department-tree.dto';
import { UpdateBudgetDto } from '../dto/update-budget.dto';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(BudgetItem)
    private budgetItemRepository: Repository<BudgetItem>,
  ) {}

  async findAllAsTree(): Promise<DepartmentTreeDto[]> {
    const departments = await this.departmentRepository.find({
      relations: ['budgetItems'],
      order: { id: 'ASC' },
    });

    const departmentMap = new Map<number, Department>();
    departments.forEach((dept) => {
      departmentMap.set(dept.id, dept);
    });

    const rootDepartments = departments.filter(
      (dept) => dept.parentId === null,
    );

    return rootDepartments.map((dept) => this.buildTree(dept, departmentMap));
  }

  private buildTree(
    department: Department,
    departmentMap: Map<number, Department>,
  ): DepartmentTreeDto {
    const children: DepartmentTreeDto[] = [];

    // Find all children
    for (const dept of departmentMap.values()) {
      if (dept.parentId === department.id) {
        children.push(this.buildTree(dept, departmentMap));
      }
    }

    const isLeaf = children.length === 0;

    // Calculate aggregated budget
    const aggregatedBudget = this.calculateAggregatedBudget(
      department,
      children,
    );

    return {
      id: department.id,
      name: department.name,
      parentId: department.parentId,
      budgetItems: department.budgetItems.map((item) => ({
        id: item.id,
        costCode: item.costCode,
        allocatedAmount: Number(item.allocatedAmount),
        spentAmount: Number(item.spentAmount),
      })),
      aggregatedBudget,
      children,
      isLeaf,
    };
  }

  private calculateAggregatedBudget(
    department: Department,
    children: DepartmentTreeDto[],
  ): Record<CostCode, { allocated: number; spent: number }> {
    const aggregated: Record<CostCode, { allocated: number; spent: number }> =
      {} as any;

    // Initialize all cost codes
    Object.values(CostCode).forEach((code) => {
      aggregated[code] = { allocated: 0, spent: 0 };
    });

    // Add current department's budget items
    department.budgetItems.forEach((item) => {
      aggregated[item.costCode].allocated += Number(item.allocatedAmount);
      aggregated[item.costCode].spent += Number(item.spentAmount);
    });

    // Add children's aggregated budgets
    children.forEach((child) => {
      Object.entries(child.aggregatedBudget).forEach(([costCode, amounts]) => {
        aggregated[costCode as CostCode].allocated += amounts.allocated;
        aggregated[costCode as CostCode].spent += amounts.spent;
      });
    });

    return aggregated;
  }

  async updateDepartmentBudget(
    departmentId: number,
    updateBudgetDto: UpdateBudgetDto,
  ): Promise<DepartmentTreeDto[]> {
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
      relations: ['budgetItems'],
    });

    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`,
      );
    }

    // Check if it's a leaf department (no children)
    const childCount = await this.departmentRepository.count({
      where: { parentId: departmentId },
    });

    if (childCount > 0) {
      throw new NotFoundException('Cannot edit budget of non-leaf departments');
    }

    // Delete existing budget items
    await this.budgetItemRepository.delete({ departmentId });

    // Create new budget items
    const newBudgetItems = updateBudgetDto.budgetItems.map((item) => {
      const budgetItem = new BudgetItem();
      budgetItem.departmentId = departmentId;
      budgetItem.costCode = item.costCode;
      budgetItem.allocatedAmount = item.allocatedAmount;
      budgetItem.spentAmount = item.spentAmount;
      return budgetItem;
    });

    await this.budgetItemRepository.save(newBudgetItems);

    // Return updated tree
    return this.findAllAsTree();
  }

  async seedData(): Promise<void> {
    // Clear existing data
    await this.budgetItemRepository.delete({});
    await this.departmentRepository.delete({});

    // Create departments hierarchy
    const headOffice = await this.departmentRepository.save({
      name: 'Head Office',
      parentId: null,
    });

    const regionA = await this.departmentRepository.save({
      name: 'Region A - North America',
      parentId: headOffice.id,
    });

    const regionB = await this.departmentRepository.save({
      name: 'Region B - Europe',
      parentId: headOffice.id,
    });

    const divisionA1 = await this.departmentRepository.save({
      name: 'Division A1 - East Coast',
      parentId: regionA.id,
    });

    const divisionA2 = await this.departmentRepository.save({
      name: 'Division A2 - West Coast',
      parentId: regionA.id,
    });

    const divisionB1 = await this.departmentRepository.save({
      name: 'Division B1 - UK',
      parentId: regionB.id,
    });

    const teamA1a = await this.departmentRepository.save({
      name: 'Team A1a - Sales',
      parentId: divisionA1.id,
    });

    const teamA1b = await this.departmentRepository.save({
      name: 'Team A1b - Engineering',
      parentId: divisionA1.id,
    });

    const teamA2a = await this.departmentRepository.save({
      name: 'Team A2a - Marketing',
      parentId: divisionA2.id,
    });

    const teamB1a = await this.departmentRepository.save({
      name: 'Team B1a - Operations',
      parentId: divisionB1.id,
    });

    // Seed budget items for leaf teams
    const budgetData = [
      {
        team: teamA1a,
        items: [
          { costCode: CostCode.SALARY, allocated: 450000, spent: 380000 },
          { costCode: CostCode.TRAVEL, allocated: 35000, spent: 28000 },
          { costCode: CostCode.SUPPLIES, allocated: 8000, spent: 6500 },
          { costCode: CostCode.SOFTWARE, allocated: 12000, spent: 12000 },
        ],
      },
      {
        team: teamA1b,
        items: [
          { costCode: CostCode.SALARY, allocated: 680000, spent: 680000 },
          { costCode: CostCode.HARDWARE, allocated: 120000, spent: 95000 },
          { costCode: CostCode.SOFTWARE, allocated: 85000, spent: 82000 },
          { costCode: CostCode.SUPPLIES, allocated: 15000, spent: 12000 },
        ],
      },
      {
        team: teamA2a,
        items: [
          { costCode: CostCode.SALARY, allocated: 320000, spent: 320000 },
          { costCode: CostCode.MARKETING, allocated: 250000, spent: 185000 },
          { costCode: CostCode.TRAVEL, allocated: 45000, spent: 32000 },
          { costCode: CostCode.SOFTWARE, allocated: 28000, spent: 28000 },
        ],
      },
      {
        team: teamB1a,
        items: [
          { costCode: CostCode.SALARY, allocated: 280000, spent: 280000 },
          { costCode: CostCode.UTILITIES, allocated: 45000, spent: 38000 },
          { costCode: CostCode.SUPPLIES, allocated: 22000, spent: 18000 },
          { costCode: CostCode.TRAINING, allocated: 15000, spent: 9000 },
        ],
      },
    ];

    for (const data of budgetData) {
      const items = data.items.map((item) => ({
        departmentId: data.team.id,
        costCode: item.costCode,
        allocatedAmount: item.allocated,
        spentAmount: item.spent,
      }));
      await this.budgetItemRepository.save(items);
    }
  }

  async createDepartment(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentTreeDto[]> {
    // Validate parent exists if parentId is provided
    if (
      createDepartmentDto.parentId !== null &&
      createDepartmentDto.parentId !== undefined
    ) {
      const parent = await this.departmentRepository.findOne({
        where: { id: createDepartmentDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent department with ID ${createDepartmentDto.parentId} not found`,
        );
      }
    }

    // Create new department
    const department = this.departmentRepository.create({
      name: createDepartmentDto.name,
      parentId: createDepartmentDto.parentId || null,
    });

    await this.departmentRepository.save(department);
    return this.findAllAsTree();
  }

  async updateDepartment(
    id: number,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentTreeDto[]> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Validate parent if being changed
    if (updateDepartmentDto.parentId !== undefined) {
      // Prevent circular reference
      if (updateDepartmentDto.parentId === id) {
        throw new BadRequestException('Department cannot be its own parent');
      }

      // Check if new parent would create a cycle
      if (updateDepartmentDto.parentId !== null) {
        const isDescendant = await this.isDescendant(
          updateDepartmentDto.parentId,
          id,
        );
        if (isDescendant) {
          throw new BadRequestException(
            'Cannot move department under its own descendant',
          );
        }

        const parent = await this.departmentRepository.findOne({
          where: { id: updateDepartmentDto.parentId },
        });
        if (!parent) {
          throw new NotFoundException(
            `Parent department with ID ${updateDepartmentDto.parentId} not found`,
          );
        }
      }
    }

    // Update department
    if (updateDepartmentDto.name !== undefined) {
      department.name = updateDepartmentDto.name;
    }
    if (updateDepartmentDto.parentId !== undefined) {
      department.parentId = updateDepartmentDto.parentId;
    }

    await this.departmentRepository.save(department);
    return this.findAllAsTree();
  }

  async deleteDepartment(id: number): Promise<DepartmentTreeDto[]> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Recursively delete this department and all its descendants
    await this.deleteDepartmentCascade(id);

    return this.findAllAsTree();
  }

  private async deleteDepartmentCascade(departmentId: number): Promise<void> {
    // Find all children
    const children = await this.departmentRepository.find({
      where: { parentId: departmentId },
    });

    // Recursively delete all children first
    for (const child of children) {
      await this.deleteDepartmentCascade(child.id);
    }

    // Delete all budget items for this department
    await this.budgetItemRepository.delete({ departmentId });

    // Delete the department itself
    await this.departmentRepository.delete(departmentId);
  }

  private async isDescendant(
    potentialDescendantId: number,
    ancestorId: number,
  ): Promise<boolean> {
    if (potentialDescendantId === ancestorId) {
      return true;
    }

    const department = await this.departmentRepository.findOne({
      where: { id: potentialDescendantId },
    });

    if (!department || department.parentId === null) {
      return false;
    }

    return this.isDescendant(department.parentId, ancestorId);
  }
}
