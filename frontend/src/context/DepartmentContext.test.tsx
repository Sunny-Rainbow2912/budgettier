import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { DepartmentProvider, useDepartments } from './DepartmentContext';
import * as departmentsApi from '../api/departments';
import { CostCode } from '../types/department';

vi.mock('../api/departments');

describe('DepartmentContext', () => {
  const mockDepartments = [
    {
      id: 1,
      name: 'Head Office',
      parentId: null,
      budgetItems: [],
      aggregatedBudget: {
        [CostCode.SALARY]: { allocated: 100000, spent: 80000 },
        [CostCode.SUPPLIES]: { allocated: 5000, spent: 4000 },
        [CostCode.HARDWARE]: { allocated: 0, spent: 0 },
        [CostCode.TRAVEL]: { allocated: 0, spent: 0 },
        [CostCode.UTILITIES]: { allocated: 0, spent: 0 },
        [CostCode.MARKETING]: { allocated: 0, spent: 0 },
        [CostCode.TRAINING]: { allocated: 0, spent: 0 },
        [CostCode.SOFTWARE]: { allocated: 0, spent: 0 },
      },
      children: [],
      isLeaf: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial state', () => {
    const { result } = renderHook(() => useDepartments(), {
      wrapper: DepartmentProvider,
    });

    expect(result.current.departments).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load departments successfully', async () => {
    vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

    const { result } = renderHook(() => useDepartments(), {
      wrapper: DepartmentProvider,
    });

    await result.current.loadDepartments();

    await waitFor(() => {
      expect(result.current.departments).toEqual(mockDepartments);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle load error', async () => {
    const errorMessage = 'Failed to fetch';
    vi.mocked(departmentsApi.departmentsApi.getDepartments).mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useDepartments(), {
      wrapper: DepartmentProvider,
    });

    await result.current.loadDepartments();

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.departments).toEqual([]);
  });

  it('should update department budget successfully', async () => {
    const updateRequest = {
      budgetItems: [
        {
          costCode: CostCode.SALARY,
          allocatedAmount: 150000,
          spentAmount: 120000,
        },
      ],
    };

    const updatedDepartments = [
      {
        ...mockDepartments[0],
        budgetItems: [
          {
            id: 1,
            costCode: CostCode.SALARY,
            allocatedAmount: 150000,
            spentAmount: 120000,
          },
        ],
      },
    ];

    vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
    vi.mocked(departmentsApi.departmentsApi.updateDepartmentBudget).mockResolvedValue(
      updatedDepartments,
    );

    const { result } = renderHook(() => useDepartments(), {
      wrapper: DepartmentProvider,
    });

    await result.current.loadDepartments();

    await result.current.updateDepartmentBudget(1, updateRequest);

    await waitFor(() => {
      expect(result.current.departments).toEqual(updatedDepartments);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle update error', async () => {
    const updateRequest = {
      budgetItems: [
        {
          costCode: CostCode.SALARY,
          allocatedAmount: 150000,
          spentAmount: 120000,
        },
      ],
    };

    const errorMessage = 'Failed to update';
    vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
    vi.mocked(departmentsApi.departmentsApi.updateDepartmentBudget).mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useDepartments(), {
      wrapper: DepartmentProvider,
    });

    await result.current.loadDepartments();

    await expect(result.current.updateDepartmentBudget(1, updateRequest)).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    expect(result.current.loading).toBe(false);
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useDepartments());
    }).toThrow('useDepartments must be used within a DepartmentProvider');
  });

  describe('hierarchy management', () => {
    it('should create department successfully', async () => {
      const newDepartment = {
        id: 2,
        name: 'New Department',
        parentId: 1,
        budgetItems: [],
        aggregatedBudget: {
          [CostCode.SALARY]: { allocated: 0, spent: 0 },
          [CostCode.SUPPLIES]: { allocated: 0, spent: 0 },
          [CostCode.HARDWARE]: { allocated: 0, spent: 0 },
          [CostCode.TRAVEL]: { allocated: 0, spent: 0 },
          [CostCode.UTILITIES]: { allocated: 0, spent: 0 },
          [CostCode.MARKETING]: { allocated: 0, spent: 0 },
          [CostCode.TRAINING]: { allocated: 0, spent: 0 },
          [CostCode.SOFTWARE]: { allocated: 0, spent: 0 },
        },
        children: [],
        isLeaf: true,
      };

      const updatedDepartments = [...mockDepartments, newDepartment];

      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.createDepartment).mockResolvedValue(
        updatedDepartments,
      );

      const { result } = renderHook(() => useDepartments(), {
        wrapper: DepartmentProvider,
      });

      await result.current.loadDepartments();

      await result.current.createDepartment('New Department', 1);

      await waitFor(() => {
        expect(result.current.departments).toEqual(updatedDepartments);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should create root department successfully', async () => {
      const newRootDepartment = {
        id: 2,
        name: 'New Root',
        parentId: null,
        budgetItems: [],
        aggregatedBudget: {
          [CostCode.SALARY]: { allocated: 0, spent: 0 },
          [CostCode.SUPPLIES]: { allocated: 0, spent: 0 },
          [CostCode.HARDWARE]: { allocated: 0, spent: 0 },
          [CostCode.TRAVEL]: { allocated: 0, spent: 0 },
          [CostCode.UTILITIES]: { allocated: 0, spent: 0 },
          [CostCode.MARKETING]: { allocated: 0, spent: 0 },
          [CostCode.TRAINING]: { allocated: 0, spent: 0 },
          [CostCode.SOFTWARE]: { allocated: 0, spent: 0 },
        },
        children: [],
        isLeaf: true,
      };

      const updatedDepartments = [...mockDepartments, newRootDepartment];

      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.createDepartment).mockResolvedValue(
        updatedDepartments,
      );

      const { result } = renderHook(() => useDepartments(), {
        wrapper: DepartmentProvider,
      });

      await result.current.loadDepartments();

      await result.current.createDepartment('New Root', null);

      await waitFor(() => {
        expect(result.current.departments).toEqual(updatedDepartments);
      });

      expect(departmentsApi.departmentsApi.createDepartment).toHaveBeenCalledWith('New Root', null);
    });

    it('should handle create department error', async () => {
      const errorMessage = 'Failed to create department';
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.createDepartment).mockRejectedValue(
        new Error(errorMessage),
      );

      const { result } = renderHook(() => useDepartments(), {
        wrapper: DepartmentProvider,
      });

      await result.current.loadDepartments();

      await expect(result.current.createDepartment('New Dept', 1)).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
    });

    it('should update department successfully', async () => {
      const updatedDepartments = [
        {
          ...mockDepartments[0],
          name: 'Updated Name',
        },
      ];

      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.updateDepartment).mockResolvedValue(
        updatedDepartments,
      );

      const { result } = renderHook(() => useDepartments(), {
        wrapper: DepartmentProvider,
      });

      await result.current.loadDepartments();

      await result.current.updateDepartment(1, { name: 'Updated Name' });

      await waitFor(() => {
        expect(result.current.departments).toEqual(updatedDepartments);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should move department to new parent', async () => {
      const updatedDepartments = [
        {
          ...mockDepartments[0],
          parentId: 2,
        },
      ];

      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.updateDepartment).mockResolvedValue(
        updatedDepartments,
      );

      const { result } = renderHook(() => useDepartments(), {
        wrapper: DepartmentProvider,
      });

      await result.current.loadDepartments();

      await result.current.updateDepartment(1, { parentId: 2 });

      await waitFor(() => {
        expect(result.current.departments).toEqual(updatedDepartments);
      });

      expect(departmentsApi.departmentsApi.updateDepartment).toHaveBeenCalledWith(1, {
        parentId: 2,
      });
    });

    it('should handle update department error', async () => {
      const errorMessage = 'Failed to update department';
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.updateDepartment).mockRejectedValue(
        new Error(errorMessage),
      );

      const { result } = renderHook(() => useDepartments(), {
        wrapper: DepartmentProvider,
      });

      await result.current.loadDepartments();

      await expect(result.current.updateDepartment(1, { name: 'Test' })).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
    });

    it('should delete department successfully', async () => {
      const updatedDepartments: typeof mockDepartments = [];

      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.deleteDepartment).mockResolvedValue(
        updatedDepartments,
      );

      const { result } = renderHook(() => useDepartments(), {
        wrapper: DepartmentProvider,
      });

      await result.current.loadDepartments();

      await result.current.deleteDepartment(1);

      await waitFor(() => {
        expect(result.current.departments).toEqual(updatedDepartments);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle delete department error', async () => {
      const errorMessage = 'Failed to delete department';
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.deleteDepartment).mockRejectedValue(
        new Error(errorMessage),
      );

      const { result } = renderHook(() => useDepartments(), {
        wrapper: DepartmentProvider,
      });

      await result.current.loadDepartments();

      await expect(result.current.deleteDepartment(1)).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
    });
  });
});
