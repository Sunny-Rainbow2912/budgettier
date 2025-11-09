import { DataSource } from 'typeorm';
import { Department } from './entities/department.entity';
import { BudgetItem, CostCode } from './entities/budget-item.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'budgettier.db',
  entities: [Department, BudgetItem],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();

  const departmentRepo = AppDataSource.getRepository(Department);
  const budgetItemRepo = AppDataSource.getRepository(BudgetItem);

  // Clear existing data
  await budgetItemRepo.clear();
  await departmentRepo.clear();

  console.log('📦 Seeding database...');

  // Create departments hierarchy
  const headOffice = await departmentRepo.save({
    name: 'Head Office',
    parentId: null,
  });

  const regionA = await departmentRepo.save({
    name: 'Region A - North America',
    parentId: headOffice.id,
  });

  const regionB = await departmentRepo.save({
    name: 'Region B - Europe',
    parentId: headOffice.id,
  });

  const divisionA1 = await departmentRepo.save({
    name: 'Division A1 - East Coast',
    parentId: regionA.id,
  });

  const divisionA2 = await departmentRepo.save({
    name: 'Division A2 - West Coast',
    parentId: regionA.id,
  });

  const divisionB1 = await departmentRepo.save({
    name: 'Division B1 - UK',
    parentId: regionB.id,
  });

  const teamA1a = await departmentRepo.save({
    name: 'Team A1a - Sales',
    parentId: divisionA1.id,
  });

  const teamA1b = await departmentRepo.save({
    name: 'Team A1b - Engineering',
    parentId: divisionA1.id,
  });

  const teamA2a = await departmentRepo.save({
    name: 'Team A2a - Marketing',
    parentId: divisionA2.id,
  });

  const teamB1a = await departmentRepo.save({
    name: 'Team B1a - Operations',
    parentId: divisionB1.id,
  });

  console.log('✅ Departments created');

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
    await budgetItemRepo.save(items);
  }

  console.log('✅ Budget items created');
  console.log('🎉 Database seeded successfully!');

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
