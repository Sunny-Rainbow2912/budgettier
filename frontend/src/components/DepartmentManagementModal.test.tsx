import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DepartmentManagementModal } from './DepartmentManagementModal';
import type { Department } from '../types/department';
import { CostCode } from '../types/department';

describe('DepartmentManagementModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const createMockDepartment = (overrides?: Partial<Department>): Department => ({
    id: 1,
    name: 'Test Department',
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
    ...overrides,
  });

  const allDepartments = [
    createMockDepartment({ id: 1, name: 'Head Office' }),
    createMockDepartment({ id: 2, name: 'Engineering', parentId: 1 }),
    createMockDepartment({ id: 3, name: 'Marketing', parentId: 1 }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <DepartmentManagementModal
          isOpen={false}
          onClose={mockOnClose}
          mode="add"
          allDepartments={[]}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={[]}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText('Add Root Department')).toBeInTheDocument();
    });
  });

  describe('add mode', () => {
    it('should show "Add Root Department" title when no parent department', () => {
      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText('Add Root Department')).toBeInTheDocument();
    });

    it('should show "Add Child to X" title when parent department provided', () => {
      const parentDept = createMockDepartment({ name: 'Engineering' });

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          department={parentDept}
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText('Add Child to Engineering')).toBeInTheDocument();
    });

    it('should disable parent selector for root department', () => {
      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      // Check that parent selector exists and is disabled for root-level creation
      const parentSelect = screen.getByLabelText(/Parent Department/i);
      expect(parentSelect).toBeDisabled();
    });

    it('should show descriptive text for root-level creation', () => {
      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText(/This will create a new top-level department/i)).toBeInTheDocument();
    });

    it('should submit with correct data for root department', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const nameInput = screen.getByLabelText('Department Name');
      fireEvent.change(nameInput, { target: { value: 'New Root Dept' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'New Root Dept',
          parentId: null,
        });
      });
    });

    it('should submit with correct parent for child department', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const parentDept = createMockDepartment({ id: 1, name: 'Engineering' });

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          department={parentDept}
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const nameInput = screen.getByLabelText('Department Name');
      fireEvent.change(nameInput, { target: { value: 'New Child Dept' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'New Child Dept',
          parentId: 1,
        });
      });
    });
  });

  describe('rename mode', () => {
    it('should show "Rename Department" title', () => {
      const dept = createMockDepartment({ name: 'Engineering' });

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="rename"
          department={dept}
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText('Rename Department')).toBeInTheDocument();
    });

    it('should populate name input with existing department name', () => {
      const dept = createMockDepartment({ name: 'Engineering' });

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="rename"
          department={dept}
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const nameInput = screen.getByLabelText('Department Name') as HTMLInputElement;
      expect(nameInput.value).toBe('Engineering');
    });

    it('should submit with only name when renaming', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const dept = createMockDepartment({ id: 2, name: 'Engineering' });

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="rename"
          department={dept}
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const nameInput = screen.getByLabelText('Department Name');
      fireEvent.change(nameInput, { target: { value: 'Engineering Team' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Engineering Team',
        });
      });
    });
  });

  describe('move mode', () => {
    it('should show "Move Department" title', () => {
      const dept = createMockDepartment({ name: 'Engineering' });

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="move"
          department={dept}
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      expect(screen.getByText('Move Department')).toBeInTheDocument();
    });

    it('should allow changing parent department', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      const dept = createMockDepartment({ id: 2, name: 'Engineering', parentId: 1 });

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="move"
          department={dept}
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const parentSelect = screen.getByLabelText('Parent Department');
      fireEvent.change(parentSelect, { target: { value: '3' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          parentId: 3,
        });
      });
    });
  });

  describe('validation', () => {
    it('should show error when name is empty', async () => {
      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const form = screen.getByRole('button', { name: /save/i }).closest('form');
      if (form) {
        // Submit form programmatically to bypass HTML5 validation
        fireEvent.submit(form);

        await waitFor(
          () => {
            expect(screen.getByText('Department name is required')).toBeInTheDocument();
          },
          { timeout: 3000 },
        );

        expect(mockOnSubmit).not.toHaveBeenCalled();
      }
    });

    it('should clear error when form is resubmitted with valid data', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const form = screen.getByRole('button', { name: /save/i }).closest('form');
      if (form) {
        // Submit form programmatically to show error
        fireEvent.submit(form);

        await waitFor(
          () => {
            expect(screen.getByText('Department name is required')).toBeInTheDocument();
          },
          { timeout: 3000 },
        );

        // Enter valid name
        const nameInput = screen.getByLabelText('Department Name');
        fireEvent.change(nameInput, { target: { value: 'New Name' } });

        // Submit again - error should clear
        fireEvent.submit(form);

        await waitFor(
          () => {
            expect(screen.queryByText('Department name is required')).not.toBeInTheDocument();
          },
          { timeout: 3000 },
        );
      }
    });
  });

  describe('interactions', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when X button is clicked', () => {
      const { container } = render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      // Find close button by SVG (X icon)
      const closeButton = container.querySelector('button svg')?.parentElement;
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should show loading state while submitting', async () => {
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockReturnValue(submitPromise);

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const nameInput = screen.getByLabelText('Department Name');
      fireEvent.change(nameInput, { target: { value: 'New Dept' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });

      // Resolve the promise
      resolveSubmit!();

      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      });
    });

    it('should disable buttons while submitting', async () => {
      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });
      mockOnSubmit.mockReturnValue(submitPromise);

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const nameInput = screen.getByLabelText('Department Name');
      fireEvent.change(nameInput, { target: { value: 'New Dept' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel');
        expect(cancelButton).toBeDisabled();
        expect(screen.getByText('Saving...')).toBeDisabled();
      });

      resolveSubmit!();
    });

    it('should close modal after successful submit', async () => {
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const nameInput = screen.getByLabelText('Department Name');
      fireEvent.change(nameInput, { target: { value: 'New Dept' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show error message on submit failure', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Submit failed'));

      render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const nameInput = screen.getByLabelText('Department Name');
      fireEvent.change(nameInput, { target: { value: 'New Dept' } });

      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      await waitFor(
        () => {
          expect(screen.getByText('Submit failed')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('state initialization', () => {
    it('should reset form when modal opens', async () => {
      const { rerender } = render(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      const nameInput = screen.getByLabelText('Department Name') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Test' } });
      expect(nameInput.value).toBe('Test');

      // Close modal
      rerender(
        <DepartmentManagementModal
          isOpen={false}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      // Reopen modal
      rerender(
        <DepartmentManagementModal
          isOpen={true}
          onClose={mockOnClose}
          mode="add"
          allDepartments={allDepartments}
          onSubmit={mockOnSubmit}
        />,
      );

      await waitFor(() => {
        const newInput = screen.getByLabelText('Department Name') as HTMLInputElement;
        expect(newInput.value).toBe('');
      });
    });
  });
});
