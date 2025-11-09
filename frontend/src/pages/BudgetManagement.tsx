import React, { useEffect } from 'react';
import { useDepartments } from '../context/DepartmentContext';
import { DepartmentRow } from '../components/DepartmentRow';

export const BudgetManagement: React.FC = () => {
  const { departments, loading, error, loadDepartments, updateDepartmentBudget } = useDepartments();

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleSaveBudget = async (departmentId: number, data: any) => {
    await updateDepartmentBudget(departmentId, data);
  };

  if (loading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <button
          onClick={loadDepartments}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
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
