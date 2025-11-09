import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { DepartmentProvider } from './context/DepartmentContext';
import { BudgetManagement } from './pages/BudgetManagement';
import { OrganizationStructure } from './pages/OrganizationStructure';

function App() {
  return (
    <BrowserRouter>
      <DepartmentProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Budgettier - Department Budget Management
              </h1>
              <p className="text-gray-600 mb-6">
                Manage hierarchical department budgets with real-time aggregation
              </p>

              {/* Navigation Tabs */}
              <nav className="border-b border-gray-200">
                <div className="flex space-x-8">
                  <NavLink
                    to="/"
                    className={({ isActive }: { isActive: boolean }) =>
                      `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        isActive
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`
                    }
                  >
                    Budget Management
                  </NavLink>
                  <NavLink
                    to="/organization"
                    className={({ isActive }: { isActive: boolean }) =>
                      `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        isActive
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`
                    }
                  >
                    Organization Structure
                  </NavLink>
                </div>
              </nav>
            </header>

            <main>
              <Routes>
                <Route path="/" element={<BudgetManagement />} />
                <Route path="/organization" element={<OrganizationStructure />} />
              </Routes>
            </main>

            <footer className="mt-8 text-center text-gray-500 text-sm">
              <p>Built with React 19, NestJS, TypeORM, and Tailwind CSS</p>
            </footer>
          </div>
        </div>
      </DepartmentProvider>
    </BrowserRouter>
  );
}

export default App;
