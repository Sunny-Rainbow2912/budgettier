import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CostCode } from '../src/entities/budget-item.entity';

describe('DepartmentsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/departments (GET)', () => {
    it('should return hierarchical department tree', () => {
      return request(app.getHttpServer())
        .get('/departments')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);

          const rootDept = res.body[0];
          expect(rootDept).toHaveProperty('id');
          expect(rootDept).toHaveProperty('name');
          expect(rootDept).toHaveProperty('parentId');
          expect(rootDept).toHaveProperty('budgetItems');
          expect(rootDept).toHaveProperty('aggregatedBudget');
          expect(rootDept).toHaveProperty('children');
          expect(rootDept).toHaveProperty('isLeaf');
        });
    });

    it('should have correct aggregatedBudget structure', () => {
      return request(app.getHttpServer())
        .get('/departments')
        .expect(200)
        .expect((res) => {
          const rootDept = res.body[0];
          const aggregated = rootDept.aggregatedBudget;

          // Check all cost codes exist
          Object.values(CostCode).forEach((code) => {
            expect(aggregated).toHaveProperty(code);
            expect(aggregated[code]).toHaveProperty('allocated');
            expect(aggregated[code]).toHaveProperty('spent');
            expect(typeof aggregated[code].allocated).toBe('number');
            expect(typeof aggregated[code].spent).toBe('number');
          });
        });
    });

    it('should have nested children', () => {
      return request(app.getHttpServer())
        .get('/departments')
        .expect(200)
        .expect((res) => {
          const rootDept = res.body[0];
          expect(rootDept.children.length).toBeGreaterThan(0);

          const childDept = rootDept.children[0];
          expect(childDept).toHaveProperty('id');
          expect(childDept).toHaveProperty('name');
          expect(childDept.parentId).toBe(rootDept.id);
        });
    });
  });

  describe('/departments/:id/budget (PATCH)', () => {
    let leafDepartmentId: number;

    beforeAll(async () => {
      // Find a leaf department
      const response = await request(app.getHttpServer()).get('/departments');
      const findLeaf = (dept: any): any => {
        if (dept.isLeaf) return dept;
        for (const child of dept.children) {
          const found = findLeaf(child);
          if (found) return found;
        }
        return null;
      };

      const leafDept = findLeaf(response.body[0]);
      leafDepartmentId = leafDept.id;
    });

    it('should update budget for leaf department', () => {
      const updateDto = {
        budgetItems: [
          {
            costCode: CostCode.SALARY,
            allocatedAmount: 150000,
            spentAmount: 120000,
          },
          {
            costCode: CostCode.SUPPLIES,
            allocatedAmount: 10000,
            spentAmount: 8000,
          },
        ],
      };

      return request(app.getHttpServer())
        .patch(`/departments/${leafDepartmentId}/budget`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should validate cost code enum', () => {
      const invalidDto = {
        budgetItems: [
          {
            costCode: 'invalid_code',
            allocatedAmount: 100000,
            spentAmount: 80000,
          },
        ],
      };

      return request(app.getHttpServer())
        .patch(`/departments/${leafDepartmentId}/budget`)
        .send(invalidDto)
        .expect(400);
    });

    it('should validate negative amounts', () => {
      const invalidDto = {
        budgetItems: [
          {
            costCode: CostCode.SALARY,
            allocatedAmount: -100000,
            spentAmount: 80000,
          },
        ],
      };

      return request(app.getHttpServer())
        .patch(`/departments/${leafDepartmentId}/budget`)
        .send(invalidDto)
        .expect(400);
    });

    it('should return 404 for non-existent department', () => {
      const updateDto = {
        budgetItems: [
          {
            costCode: CostCode.SALARY,
            allocatedAmount: 100000,
            spentAmount: 80000,
          },
        ],
      };

      return request(app.getHttpServer())
        .patch('/departments/99999/budget')
        .send(updateDto)
        .expect(404);
    });
  });
});
