import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { CostCode } from '../entities/budget-item.entity';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let service: DepartmentsService;

  const mockDepartmentsService = {
    findAllAsTree: jest.fn(),
    updateDepartmentBudget: jest.fn(),
    seedData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        {
          provide: DepartmentsService,
          useValue: mockDepartmentsService,
        },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    service = module.get<DepartmentsService>(DepartmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDepartments', () => {
    it('should return array of departments', async () => {
      const mockResult = [
        {
          id: 1,
          name: 'Head Office',
          parentId: null,
          budgetItems: [],
          aggregatedBudget: {},
          children: [],
          isLeaf: false,
        },
      ];

      mockDepartmentsService.findAllAsTree.mockResolvedValue(mockResult);

      const result = await controller.getDepartments();

      expect(result).toEqual(mockResult);
      expect(service.findAllAsTree).toHaveBeenCalled();
    });
  });

  describe('updateBudget', () => {
    it('should update department budget', async () => {
      const updateDto = {
        budgetItems: [
          {
            costCode: CostCode.SALARY,
            allocatedAmount: 100000,
            spentAmount: 80000,
          },
        ],
      };

      const mockResult = [
        {
          id: 1,
          name: 'Updated Department',
          parentId: null,
          budgetItems: updateDto.budgetItems,
          aggregatedBudget: {},
          children: [],
          isLeaf: true,
        },
      ];

      mockDepartmentsService.updateDepartmentBudget.mockResolvedValue(
        mockResult,
      );

      const result = await controller.updateBudget(1, updateDto);

      expect(result).toEqual(mockResult);
      expect(service.updateDepartmentBudget).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('seedData', () => {
    it('should seed the database', async () => {
      mockDepartmentsService.seedData.mockResolvedValue(undefined);

      const result = await controller.seedData();

      expect(result).toEqual({ message: 'Database seeded successfully' });
      expect(service.seedData).toHaveBeenCalled();
    });
  });
});
