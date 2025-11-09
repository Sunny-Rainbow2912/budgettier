import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentsService } from './departments.service';
import { Department } from '../entities/department.entity';
import { BudgetItem, CostCode } from '../entities/budget-item.entity';
import { NotFoundException } from '@nestjs/common';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let departmentRepo: Repository<Department>;
  let budgetItemRepo: Repository<BudgetItem>;

  const mockDepartmentRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    clear: jest.fn(),
  };

  const mockBudgetItemRepo = {
    delete: jest.fn(),
    save: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: getRepositoryToken(Department),
          useValue: mockDepartmentRepo,
        },
        {
          provide: getRepositoryToken(BudgetItem),
          useValue: mockBudgetItemRepo,
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    departmentRepo = module.get<Repository<Department>>(
      getRepositoryToken(Department),
    );
    budgetItemRepo = module.get<Repository<BudgetItem>>(
      getRepositoryToken(BudgetItem),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllAsTree', () => {
    it('should return hierarchical tree structure', async () => {
      const mockDepartments: Department[] = [
        {
          id: 1,
          name: 'Head Office',
          parentId: null,
          budgetItems: [],
          parent: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Region A',
          parentId: 1,
          budgetItems: [
            {
              id: 1,
              departmentId: 2,
              costCode: CostCode.SALARY,
              allocatedAmount: 100000,
              spentAmount: 80000,
              department: null as any,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          parent: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDepartmentRepo.find.mockResolvedValue(mockDepartments);

      const result = await service.findAllAsTree();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Head Office');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].name).toBe('Region A');
    });

    it('should calculate aggregated budgets correctly', async () => {
      const mockDepartments: Department[] = [
        {
          id: 1,
          name: 'Parent',
          parentId: null,
          budgetItems: [],
          parent: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Child',
          parentId: 1,
          budgetItems: [
            {
              id: 1,
              departmentId: 2,
              costCode: CostCode.SALARY,
              allocatedAmount: 50000,
              spentAmount: 40000,
              department: null as any,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 2,
              departmentId: 2,
              costCode: CostCode.SUPPLIES,
              allocatedAmount: 5000,
              spentAmount: 3000,
              department: null as any,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          parent: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDepartmentRepo.find.mockResolvedValue(mockDepartments);

      const result = await service.findAllAsTree();

      expect(result[0].aggregatedBudget.salary.allocated).toBe(50000);
      expect(result[0].aggregatedBudget.salary.spent).toBe(40000);
      expect(result[0].aggregatedBudget.supplies.allocated).toBe(5000);
      expect(result[0].aggregatedBudget.supplies.spent).toBe(3000);
    });

    it('should mark leaf departments correctly', async () => {
      const mockDepartments: Department[] = [
        {
          id: 1,
          name: 'Parent',
          parentId: null,
          budgetItems: [],
          parent: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Child',
          parentId: 1,
          budgetItems: [],
          parent: null,
          children: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDepartmentRepo.find.mockResolvedValue(mockDepartments);

      const result = await service.findAllAsTree();

      expect(result[0].isLeaf).toBe(false);
      expect(result[0].children[0].isLeaf).toBe(true);
    });
  });

  describe('updateDepartmentBudget', () => {
    it('should update budget for leaf department', async () => {
      const mockDepartment: Department = {
        id: 1,
        name: 'Team A',
        parentId: 2,
        budgetItems: [],
        parent: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDepartmentRepo.findOne.mockResolvedValue(mockDepartment);
      mockDepartmentRepo.count.mockResolvedValue(0); // No children
      mockBudgetItemRepo.delete.mockResolvedValue({ affected: 0 });
      mockBudgetItemRepo.save.mockResolvedValue([]);
      mockDepartmentRepo.find.mockResolvedValue([mockDepartment]);

      const updateDto = {
        budgetItems: [
          {
            costCode: CostCode.SALARY,
            allocatedAmount: 100000,
            spentAmount: 80000,
          },
        ],
      };

      await service.updateDepartmentBudget(1, updateDto);

      expect(mockBudgetItemRepo.delete).toHaveBeenCalledWith({
        departmentId: 1,
      });
      expect(mockBudgetItemRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if department does not exist', async () => {
      mockDepartmentRepo.findOne.mockResolvedValue(null);

      const updateDto = {
        budgetItems: [
          {
            costCode: CostCode.SALARY,
            allocatedAmount: 100000,
            spentAmount: 80000,
          },
        ],
      };

      await expect(
        service.updateDepartmentBudget(999, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if trying to update non-leaf department', async () => {
      const mockDepartment: Department = {
        id: 1,
        name: 'Parent',
        parentId: null,
        budgetItems: [],
        parent: null,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDepartmentRepo.findOne.mockResolvedValue(mockDepartment);
      mockDepartmentRepo.count.mockResolvedValue(1); // Has children

      const updateDto = {
        budgetItems: [
          {
            costCode: CostCode.SALARY,
            allocatedAmount: 100000,
            spentAmount: 80000,
          },
        ],
      };

      await expect(
        service.updateDepartmentBudget(1, updateDto),
      ).rejects.toThrow();
    });
  });
});
