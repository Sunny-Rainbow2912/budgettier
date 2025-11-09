import type { Department, UpdateBudgetRequest } from '../types/department';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const departmentsApi = {
  async getDepartments(): Promise<Department[]> {
    const response = await fetch(`${API_BASE_URL}/departments`);
    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }
    return response.json();
  },

  async updateDepartmentBudget(
    departmentId: number,
    data: UpdateBudgetRequest,
  ): Promise<Department[]> {
    const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/budget`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update department budget');
    }
    return response.json();
  },

  async createDepartment(name: string, parentId: number | null): Promise<Department[]> {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, parentId }),
    });
    if (!response.ok) {
      throw new Error('Failed to create department');
    }
    return response.json();
  },

  async updateDepartment(
    departmentId: number,
    data: { name?: string; parentId?: number | null },
  ): Promise<Department[]> {
    const response = await fetch(`${API_BASE_URL}/departments/${departmentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update department');
    }
    return response.json();
  },

  async deleteDepartment(departmentId: number): Promise<Department[]> {
    const response = await fetch(`${API_BASE_URL}/departments/${departmentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete department');
    }
    return response.json();
  },
};
