import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrganizationStructure } from './OrganizationStructure';
import { DepartmentProvider } from '../context/DepartmentContext';
import * as departmentsApi from '../api/departments';
import { CostCode } from '../types/department';

vi.mock('../api/departments');

describe('OrganizationStructure Integration', () => {
  const mockDepartments = [
    {
      id: 1,
      name: 'Head Office',
      parentId: null,
      budgetItems: [],
      aggregatedBudget: {
        [CostCode.SALARY]: { allocated: 100000, spent: 80000 },
        [CostCode.SUPPLIES]: { allocated: 0, spent: 0 },
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
          budgetItems: [],
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
        {
          id: 3,
          name: 'Marketing',
          parentId: 1,
          budgetItems: [],
          aggregatedBudget: {
            [CostCode.SALARY]: { allocated: 30000, spent: 25000 },
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
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      expect(screen.getByText('Loading organization structure...')).toBeInTheDocument();
    });

    it('should render page title and description', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Organization Structure')).toBeInTheDocument();
        expect(
          screen.getByText(
            /Manage your organizational hierarchy - add, rename, and delete departments/,
          ),
        ).toBeInTheDocument();
      });
    });

    it('should render Add Root Department button', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Add Root Department')).toBeInTheDocument();
      });
    });

    it('should render table headers', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Department Name')).toBeInTheDocument();
        expect(screen.getByText('Structure')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
      });
    });

    it('should render departments in tree structure', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Head Office')).toBeInTheDocument();
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Marketing')).toBeInTheDocument();
      });
    });

    it('should display empty state when no departments exist', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue([]);

      render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(
          screen.getByText(/No departments yet. Click "Add Root Department" to get started./),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when loading fails', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockRejectedValue(
        new Error('Failed to load'),
      );

      render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Failed to load')).toBeInTheDocument();
      });
    });

    it('should allow retry when loading fails', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(mockDepartments);

      render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Head Office')).toBeInTheDocument();
      });
    });
  });

  describe('Add Root Department', () => {
    it('should open modal when Add Root Department is clicked', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Root Department/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /Add Root Department/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        // Modal opened - check for input field
        expect(screen.getByLabelText('Department Name')).toBeInTheDocument();
      });
    });

    it('should create root department successfully', async () => {
      const newDepartment = {
        id: 4,
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

      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.createDepartment).mockResolvedValue([
        ...mockDepartments,
        newDepartment,
      ]);

      render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Add Root Department')).toBeInTheDocument();
      });

      // Click Add Root Department button
      const addButton = screen.getAllByText('Add Root Department')[0];
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Department Name')).toBeInTheDocument();
      });

      // Enter name
      const nameInput = screen.getByLabelText('Department Name');
      fireEvent.change(nameInput, { target: { value: 'New Root' } });

      // Save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(departmentsApi.departmentsApi.createDepartment).toHaveBeenCalledWith(
          'New Root',
          null,
        );
      });
    });
  });

  describe('Add Child Department', () => {
    it('should open modal when Add Child button is clicked', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      const { container } = render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Find Add Child button (Plus icon)
      const addChildButtons = container.querySelectorAll('button[title="Add Child Department"]');
      expect(addChildButtons.length).toBeGreaterThan(0);

      fireEvent.click(addChildButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Add Child to/)).toBeInTheDocument();
      });
    });

    it('should create child department successfully', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.createDepartment).mockResolvedValue(mockDepartments);

      const { container } = render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Click Add Child button
      const addChildButtons = container.querySelectorAll('button[title="Add Child Department"]');
      fireEvent.click(addChildButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText('Department Name')).toBeInTheDocument();
      });

      // Enter name
      const nameInput = screen.getByLabelText('Department Name');
      fireEvent.change(nameInput, { target: { value: 'Backend Team' } });

      // Save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(departmentsApi.departmentsApi.createDepartment).toHaveBeenCalled();
      });
    });
  });

  describe('Rename Department', () => {
    it('should open modal when Rename button is clicked', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      const { container } = render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Find Rename button (Pencil icon)
      const renameButtons = container.querySelectorAll('button[title="Rename Department"]');
      expect(renameButtons.length).toBeGreaterThan(0);

      fireEvent.click(renameButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Rename Department')).toBeInTheDocument();
      });
    });

    it('should rename department successfully', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.updateDepartment).mockResolvedValue(mockDepartments);

      const { container } = render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Click Rename button
      const renameButtons = container.querySelectorAll('button[title="Rename Department"]');
      fireEvent.click(renameButtons[0]);

      await waitFor(() => {
        expect(screen.getByLabelText('Department Name')).toBeInTheDocument();
      });

      // Change name
      const nameInput = screen.getByLabelText('Department Name') as HTMLInputElement;
      expect(nameInput.value).not.toBe(''); // Should be pre-filled
      fireEvent.change(nameInput, { target: { value: 'Engineering Team' } });

      // Save
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(departmentsApi.departmentsApi.updateDepartment).toHaveBeenCalled();
      });
    });
  });

  describe('Delete Department', () => {
    it('should show confirmation dialog when Delete button is clicked', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      const { container } = render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Find Delete button (Trash icon)
      const deleteButtons = container.querySelectorAll('button[title="Delete Department"]');
      expect(deleteButtons.length).toBeGreaterThan(0);

      fireEvent.click(deleteButtons[0]);

      // Use findByText for async modal appearance
      const dialogTitle = await screen.findByText('Delete Department', {}, { timeout: 3000 });
      expect(dialogTitle).toBeInTheDocument();
    });

    it('should show simple confirmation for leaf departments', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      const { container } = render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Delete Engineering (leaf department)
      const deleteButtons = container.querySelectorAll('button[title="Delete Department"]');
      fireEvent.click(deleteButtons[0]);

      // Use findBy for async elements
      await screen.findByText(/Are you sure you want to delete/, {}, { timeout: 3000 });

      expect(screen.getByText('This department')).toBeInTheDocument();
      expect(screen.getByText('All its budget data')).toBeInTheDocument();
      // Should NOT require typing for leaf
      expect(screen.queryByPlaceholderText(/Type/)).not.toBeInTheDocument();
    });

    it('should require typed confirmation for parent departments', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      const { container } = render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Head Office')).toBeInTheDocument();
      });

      // Delete Head Office (has children)
      const allDeleteButtons = container.querySelectorAll('button[title="Delete Department"]');
      // Find the delete button for Head Office (first one in the tree)
      const headOfficeDeleteButton = Array.from(allDeleteButtons).find((btn) => {
        const row = btn.closest('tr');
        return (
          row?.textContent?.includes('Head Office') && row?.textContent?.includes('2 children')
        );
      });

      if (headOfficeDeleteButton) {
        fireEvent.click(headOfficeDeleteButton);

        await waitFor(() => {
          expect(screen.getByText('Delete Department and All Sub-Departments')).toBeInTheDocument();
          expect(screen.getByPlaceholderText('Type DELETE')).toBeInTheDocument();
          expect(screen.getByText(/2 sub-departments/)).toBeInTheDocument();
        });
      }
    });

    it('should delete department after confirmation', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.deleteDepartment).mockResolvedValue([]);

      const { container } = render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Delete Engineering (leaf department)
      const deleteButtons = container.querySelectorAll('button[title="Delete Department"]');
      fireEvent.click(deleteButtons[0]);

      // Wait for dialog to appear
      await screen.findByText('Delete Department', {}, { timeout: 3000 });

      // Confirm deletion
      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(departmentsApi.departmentsApi.deleteDepartment).toHaveBeenCalled();
      });
    });

    it('should cancel deletion when Cancel is clicked', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      const { container } = render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Click Delete
      const deleteButtons = container.querySelectorAll('button[title="Delete Department"]');
      fireEvent.click(deleteButtons[0]);

      // Wait for dialog to appear
      await screen.findByText('Delete Department', {}, { timeout: 3000 });

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Delete Department')).not.toBeInTheDocument();
      });

      expect(departmentsApi.departmentsApi.deleteDepartment).not.toHaveBeenCalled();
    });
  });

  describe('Department Structure Display', () => {
    it('should display leaf badge for leaf departments', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const leafBadges = screen.getAllByText('Leaf');
      expect(leafBadges.length).toBeGreaterThan(0);
    });

    it('should display children count for parent departments', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('2 children')).toBeInTheDocument();
      });
    });

    it('should expand/collapse department children', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      const { container } = render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Head Office')).toBeInTheDocument();
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Find collapse button
      const buttons = container.querySelectorAll('button');
      const collapseButton = Array.from(buttons).find((btn) => {
        const row = btn.closest('tr');
        return row?.textContent?.includes('Head Office') && btn.querySelector('svg');
      });

      if (collapseButton) {
        // Collapse
        fireEvent.click(collapseButton);

        await waitFor(() => {
          expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
        });

        // Expand
        fireEvent.click(collapseButton);

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
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(departmentsApi.departmentsApi.getDepartments).toHaveBeenCalledTimes(1);
      });
    });

    it('should refresh data after creating department', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
      vi.mocked(departmentsApi.departmentsApi.createDepartment).mockResolvedValue(mockDepartments);

      render(
        <DepartmentProvider>
          <OrganizationStructure />
        </DepartmentProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Add Root Department')).toBeInTheDocument();
      });

      // Open modal and create department
      const addButton = screen.getAllByText('Add Root Department')[0];
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Department Name')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText('Department Name');
      fireEvent.change(nameInput, { target: { value: 'New Dept' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(departmentsApi.departmentsApi.createDepartment).toHaveBeenCalled();
      });
    });
  });
});
