# Budgetier - Hierarchical Budget Management System

A modern web application for managing departmental budgets with hierarchical structure visualization.

## Project Structure

```
budgetier/
├── backend/          # NestJS backend with TypeORM and SQLite
└── frontend/         # React frontend with Vite and Tailwind CSS
```

## Features

- 🌳 **Hierarchical Tree View** - Expand/collapse departments to see nested sub-departments
- 💰 **Budget Management** - View allocated budget and current spend for each department
- ✏️ **Inline Editing** - Edit budget values directly in the tree table
- 🔄 **Auto Recalculation** - Parent nodes automatically update when children change
- 📊 **Multiple Cost Codes** - Track different budget categories (supplies, hardware, salary, etc.)

## Tech Stack

### Backend

- NestJS
- TypeORM
- SQLite
- TypeScript

### Frontend

- React 18
- Vite
- Tailwind CSS
- TypeScript

## Getting Started

### Prerequisites

- Node.js 24+ (LTS recommended)
- npm or yarn

### Installation

#### Backend

```bash
cd backend
npm install
npm run seed      # Seed database with dummy data
npm run start:dev # Start development server
```

#### Frontend

```bash
cd frontend
npm install
npm run dev       # Start development server
```

### Development

Both projects are configured with:

- ✨ Prettier for code formatting
- 🐶 Husky for git hooks
- 📝 TypeScript for type safety

## API Endpoints

- `GET /departments` - Fetch hierarchical department tree with budgets
- `PATCH /departments/:id/budget` - Update budget items for a department

## License

MIT
