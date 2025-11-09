# Budgettier - Hierarchical Budget Management System

A full-stack web application for managing departmental budgets with hierarchical tree visualization, inline editing, and automatic parent node aggregation.

## Quick Start

### Prerequisites

- Node.js 24+ (LTS)
- npm

### Run the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm install
npm run seed      # First time only - creates database
npm run start:dev # Runs on http://localhost:3000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm install
npm run dev       # Runs on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## Tech Stack

**Backend**

- NestJS 11 - Progressive Node.js framework
- TypeORM - Database ORM with TypeScript support
- SQLite - Embedded database (no installation required)
- TypeScript - Type-safe development

**Frontend**

- React 19 - Latest React with modern features
- Vite - Lightning-fast build tool
- Tailwind CSS - Utility-first styling
- TypeScript - End-to-end type safety

**Development**

- Husky - Git hooks for code quality
- Prettier - Consistent code formatting
- Vitest/Jest - Comprehensive testing

## Key Features

### 🌳 Hierarchical Tree View

4-level department hierarchy with expand/collapse functionality. Visual indentation shows the organizational structure clearly.

### 💰 Budget Aggregation

Parent departments automatically sum their children's budgets across 8 cost codes (salary, supplies, hardware, travel, utilities, marketing, training, software).

### ✏️ Inline Editing

Click "Edit" on any leaf department to modify budget allocations. Changes propagate up the tree in real-time.

### 📊 Visual Feedback

- Color-coded utilization bars (green → yellow → red)
- Real-time percentage calculations
- Loading states and error handling
- Responsive design

## Project Structure

```
budgettier/
├── backend/
│   ├── src/
│   │   ├── entities/          # Department, BudgetItem
│   │   ├── departments/       # Service, Controller, Module
│   │   ├── dto/              # Request/Response types
│   │   └── seed.ts           # Database seeding script
│   └── budgettier.db         # SQLite database (created on seed)
│
└── frontend/
    ├── src/
    │   ├── components/       # DepartmentTree, DepartmentRow, BudgetEditModal
    │   ├── context/          # State management (Context API)
    │   ├── api/              # Backend API client
    │   ├── types/            # TypeScript interfaces
    │   └── utils/            # Formatting helpers
    └── ...
```

## API Design

### `GET /departments`

Returns hierarchical department tree with aggregated budgets.

**Response:**

```json
[
  {
    "id": 1,
    "name": "Head Office",
    "parentId": null,
    "budgetItems": [],
    "aggregatedBudget": {
      "salary": { "allocated": 1730000, "spent": 1660000 },
      "supplies": { "allocated": 45000, "spent": 36500 }
    },
    "children": [...],
    "isLeaf": false
  }
]
```

### `PATCH /departments/:id/budget`

Updates budget items for a leaf department (validated).

**Request:**

```json
{
  "budgetItems": [
    {
      "costCode": "salary",
      "allocatedAmount": 500000,
      "spentAmount": 450000
    }
  ]
}
```

## Testing

**Backend (Jest):**

```bash
cd backend
npm test          # Unit tests
npm run test:e2e  # E2E API tests
npm run test:cov  # With coverage
```

- ✅ 10 passing tests
- ✅ Service layer: tree building, aggregation, CRUD
- ✅ Controller: API endpoints
- ✅ E2E: Full request/response validation

**Frontend (Vitest):**

```bash
cd frontend
npm test              # All tests
npm run test:coverage # With coverage report
```

- ✅ 30 passing tests
- ✅ 100% coverage on tested components
- ✅ Utilities, Context, Components

## Key Design Decisions

**Single API Endpoint for Tree**
Instead of separate flat + tree endpoints, `GET /departments` returns the full hierarchy. This reduces round trips and keeps the API simple.

**Leaf-Only Editing**
Only leaf departments can be edited directly. Parent budgets are calculated automatically, preventing data inconsistencies.

**Context API for State**
Lightweight state management without Redux overhead. Sufficient for this app's complexity.

**SQLite for Development**
Zero-config database perfect for take-home assessments. Production would use PostgreSQL (TypeORM makes this swap trivial).

**Monorepo Structure**
Separate backend/frontend directories with shared root config (Husky, Prettier) for consistency.

## Sample Data

The seed script creates a realistic 4-level hierarchy:

```
Head Office
├── Region A - North America
│   ├── Division A1 - East Coast
│   │   ├── Team A1a - Sales
│   │   └── Team A1b - Engineering
│   └── Division A2 - West Coast
│       └── Team A2a - Marketing
└── Region B - Europe
    └── Division B1 - UK
        └── Team B1a - Operations
```

Total budget: **$2.41M allocated**, **$2.06M spent** (~85.5% utilization)

## Development Workflow

1. **Code** - Make your changes
2. **Auto-format** - Prettier runs on commit (Husky pre-commit hook)
3. **Hot reload** - Both backend and frontend reload automatically
4. **Test** - Run tests before pushing
5. **Type-check** - TypeScript catches errors at compile time

## Environment Configuration

**Frontend:**

- `.env.development` - Local development (http://localhost:3000)
- `.env.production` - Production build (configure your API URL)
- Fallback to `http://localhost:3000` if no env file found

**Backend:**

- Runs on port 3000 by default
- CORS enabled for frontend
- Global validation pipes for DTO validation

## Troubleshooting

**Backend won't start?**

- Run `npm run seed` first to create the database
- Check if port 3000 is already in use

**Frontend can't connect?**

- Ensure backend is running on port 3000
- Check browser console for CORS errors

**Database issues?**

- Delete `backend/budgettier.db` and run `npm run seed` again

## License

MIT
