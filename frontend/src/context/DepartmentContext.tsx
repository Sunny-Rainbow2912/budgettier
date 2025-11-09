import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Department, UpdateBudgetRequest } from '../types/department';
import { departmentsApi } from '../api/departments';

interface DepartmentContextType {
  departments: Department[];
  loading: boolean;
  error: string | null;
  loadDepartments: () => Promise<void>;
  updateDepartmentBudget: (departmentId: number, data: UpdateBudgetRequest) => Promise<void>;
  createDepartment: (name: string, parentId: number | null) => Promise<void>;
  updateDepartment: (
    departmentId: number,
    data: { name?: string; parentId?: number | null },
  ) => Promise<void>;
  deleteDepartment: (departmentId: number) => Promise<void>;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const useDepartments = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartments must be used within a DepartmentProvider');
  }
  return context;
};

interface DepartmentProviderProps {
  children: ReactNode;
}

export const DepartmentProvider: React.FC<DepartmentProviderProps> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await departmentsApi.getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDepartmentBudget = useCallback(
    async (departmentId: number, data: UpdateBudgetRequest) => {
      setLoading(true);
      setError(null);
      try {
        const updatedDepartments = await departmentsApi.updateDepartmentBudget(departmentId, data);
        setDepartments(updatedDepartments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update department budget');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createDepartment = useCallback(async (name: string, parentId: number | null) => {
    try {
      setLoading(true);
      setError(null);
      const updatedDepartments = await departmentsApi.createDepartment(name, parentId);
      setDepartments(updatedDepartments);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create department';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDepartment = useCallback(
    async (departmentId: number, data: { name?: string; parentId?: number | null }) => {
      try {
        setLoading(true);
        setError(null);
        const updatedDepartments = await departmentsApi.updateDepartment(departmentId, data);
        setDepartments(updatedDepartments);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update department';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteDepartment = useCallback(async (departmentId: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedDepartments = await departmentsApi.deleteDepartment(departmentId);
      setDepartments(updatedDepartments);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete department';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    departments,
    loading,
    error,
    loadDepartments,
    updateDepartmentBudget,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };

  return <DepartmentContext.Provider value={value}>{children}</DepartmentContext.Provider>;
};
