import React, { useEffect } from 'react';
import { useDepartments } from '../context/DepartmentContext';
import { DepartmentRow } from '../components/DepartmentRow';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const BudgetManagement: React.FC = () => {
  const { departments, loading, error, loadDepartments, updateDepartmentBudget } = useDepartments();

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleSaveBudget = async (departmentId: number, data: any) => {
    await updateDepartmentBudget(departmentId, data);
  };

  if (loading && departments.length === 0) {
    return <LoadingSpinner message="Loading departments..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDepartments} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Budget Management</h2>
        <p className="text-gray-600 mt-1">View and edit budget allocations for leaf departments</p>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Department</th>
              <th className="py-3 px-4 text-right">Allocated Budget</th>
              <th className="py-3 px-4 text-right">Spent Amount</th>
              <th className="py-3 px-4 text-left">Utilization</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((department) => (
              <DepartmentRow
                key={department.id}
                department={department}
                level={0}
                onSave={handleSaveBudget}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
