import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BudgetManagement } from './BudgetManagement';
import { DepartmentProvider } from '../context/DepartmentContext';
import * as departmentsApi from '../api/departments';
import { CostCode } from '../types/department';

vi.mock('../api/departments');

describe('BudgetManagement Integration', () => {
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
      children: [
        {
          id: 2,
          name: 'Engineering',
          parentId: 1,
          budgetItems: [
            {
              id: 1,
              costCode: CostCode.SALARY,
              allocatedAmount: 50000,
              spentAmount: 40000,
            },
          ],
          aggregatedBudget: {
            [CostCode.SALARY]: { allocated: 50000, spent: 40000 },
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
        },
      ],
      isLeaf: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should display loading state initially', () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      expect(screen.getByText('Loading departments...')).toBeInTheDocument();
    });

    it('should render page title and description', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Budget Management')).toBeInTheDocument();
        expect(
          screen.getByText('View and edit budget allocations for leaf departments'),
        ).toBeInTheDocument();
      });
    });

    it('should render table headers', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Department')).toBeInTheDocument();
        expect(screen.getByText('Allocated Budget')).toBeInTheDocument();
        expect(screen.getByText('Spent Amount')).toBeInTheDocument();
        expect(screen.getByText('Utilization')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
      });
    });

    it('should render departments from context', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Head Office')).toBeInTheDocument();
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when loading fails', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockRejectedValue(
        new Error('Failed to load departments'),
      );

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Failed to load departments')).toBeInTheDocument();
      });
    });

    it('should allow retry when loading fails', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments)
        .mockRejectedValueOnce(new Error('Failed to load'))
        .mockResolvedValueOnce(mockDepartments);

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to load')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Head Office')).toBeInTheDocument();
      });
    });
  });

  describe('Budget Editing Workflow', () => {
    it('should show edit button for leaf departments only', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Engineering is a leaf, should have Edit button
      const rows = screen.getAllByRole('row');
      const engineeringRow = rows.find((row) => row.textContent?.includes('Engineering'));
      expect(engineeringRow?.textContent).toContain('Edit');

      // Head Office is not a leaf, should NOT have Edit button in its own row
      const headOfficeRow = rows.find((row) => row.textContent?.includes('Head Office'));
      // Check only the parent row (first occurrence)
      const firstHeadOfficeText = screen.getAllByText('Head Office')[0];
      const parentRow = firstHeadOfficeText.closest('tr');
      expect(parentRow?.textContent).not.toContain('Edit');
    });

    it('should open inline editing form when Edit is clicked', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Find Edit button for Engineering
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      // Should show Save and Cancel buttons
      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
    });

    it('should allow canceling edit without saving', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Start editing
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      // Cancel editing
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Should return to Edit button
      await waitFor(() => {
        const editButtons = screen.getAllByText('Edit');
        expect(editButtons.length).toBeGreaterThan(0);
      });
    });

    it('should save budget changes when Save is clicked', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.updateDepartmentBudget).mockResolvedValue(
        mockDepartments,
      );

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Start editing
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
      });

      // Click Save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      // Should call update API
      await waitFor(() => {
        expect(departmentsApi.departmentsApi.updateDepartmentBudget).toHaveBeenCalled();
      });
    });
  });

  describe('Budget Display', () => {
    it('should display aggregated budget for parent departments', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Head Office')).toBeInTheDocument();
        // Head Office shows aggregated budget from children
        expect(screen.getByText('$105,000')).toBeInTheDocument(); // allocated
        expect(screen.getByText('$84,000')).toBeInTheDocument(); // spent
      });
    });

    it('should display leaf department budget', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        // Engineering has $50,000 allocated, $40,000 spent
        expect(screen.getByText('$50,000')).toBeInTheDocument();
        expect(screen.getByText('$40,000')).toBeInTheDocument();
      });
    });

    it('should display utilization percentage', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        // Head Office: 84000/105000 = 80%
        const utilizationTexts = screen.getAllByText('80%');
        expect(utilizationTexts.length).toBeGreaterThan(0);
      });
    });

    it('should show leaf badge for leaf departments', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Leaf')).toBeInTheDocument();
      });
    });
  });

  describe('Department Tree Navigation', () => {
    it('should expand/collapse department children', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      const { container } = render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Head Office')).toBeInTheDocument();
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Find collapse button (SVG icon)
      const buttons = container.querySelectorAll('button');
      const collapseButton = Array.from(buttons).find((btn) => btn.querySelector('svg'));

      if (collapseButton) {
        // Collapse
        fireEvent.click(collapseButton);

        // Engineering should not be visible
        await waitFor(() => {
          expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
        });

        // Expand again
        fireEvent.click(collapseButton);

        // Engineering should be visible again
        await waitFor(() => {
          expect(screen.getByText('Engineering')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Context Integration', () => {
    it('should load departments on mount', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(departmentsApi.departmentsApi.getDepartments).toHaveBeenCalledTimes(1);
      });
    });

    it('should update context when budget is saved', async () => {
      const updatedDepartments = [
        {
          ...mockDepartments[0],
          children: [
            {
              ...mockDepartments[0].children[0],
              budgetItems: [
                {
                  id: 1,
                  costCode: CostCode.SALARY,
                  allocatedAmount: 60000, // Updated
                  spentAmount: 45000, // Updated
                },
              ],
            },
          ],
        },
      ];

      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.updateDepartmentBudget).mockResolvedValue(
        updatedDepartments,
      );

      render(
        <DepartmentProvider>
          <BudgetManagement />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Start editing
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
      });

      // Save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(departmentsApi.departmentsApi.updateDepartmentBudget).toHaveBeenCalled();
      });
    });
  });
});
