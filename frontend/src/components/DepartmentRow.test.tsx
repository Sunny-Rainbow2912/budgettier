import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DepartmentRow } from './DepartmentRow';
import type { Department } from '../types/department';
import { CostCode } from '../types/department';

describe('DepartmentRow', () => {
  const mockOnEdit = vi.fn();

  const createMockDepartment = (overrides?: Partial<Department>): Department => ({
    id: 1,
    name: 'Test Department',
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
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render department name', () => {
    const department = createMockDepartment({ name: 'Engineering' });

    render(<DepartmentRow department={department} level={0} onEdit={mockOnEdit} />);

    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('should display "Leaf" badge for leaf departments', () => {
    const department = createMockDepartment({ isLeaf: true });

    render(<DepartmentRow department={department} level={0} onEdit={mockOnEdit} />);

    expect(screen.getByText('Leaf')).toBeInTheDocument();
  });

  it('should not display "Leaf" badge for non-leaf departments', () => {
    const department = createMockDepartment({
      isLeaf: false,
      children: [],
    });

    const { container } = render(
      <table>
        <tbody>
          <DepartmentRow department={department} level={0} onEdit={mockOnEdit} />
        </tbody>
      </table>,
    );

    // Get only the parent row's content (first row)
    const rows = container.querySelectorAll('tr');
    const parentRowText = rows[0].textContent;

    expect(parentRowText).not.toContain('Leaf');
  });

  it('should show Edit button for leaf departments', () => {
    const department = createMockDepartment({ isLeaf: true });

    render(<DepartmentRow department={department} level={0} onEdit={mockOnEdit} />);

    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('should not show Edit button for non-leaf departments', () => {
    const department = createMockDepartment({
      isLeaf: false,
      children: [],
    });

    render(<DepartmentRow department={department} level={0} onEdit={mockOnEdit} />);

    // Get the first row (parent) only
    const rows = screen.getAllByRole('row');
    const parentRow = rows[0];

    // Edit button should not be in the parent row's actions cell
    expect(parentRow.textContent).not.toContain('Edit');
  });

  it('should call onEdit when Edit button is clicked', () => {
    const department = createMockDepartment({ isLeaf: true });

    render(<DepartmentRow department={department} level={0} onEdit={mockOnEdit} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(department);
  });

  it('should display formatted budget amounts', () => {
    const department = createMockDepartment({
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
    });

    render(<DepartmentRow department={department} level={0} onEdit={mockOnEdit} />);

    expect(screen.getByText('$105,000')).toBeInTheDocument(); // Total allocated
    expect(screen.getByText('$84,000')).toBeInTheDocument(); // Total spent
  });

  it('should display correct utilization percentage', () => {
    const department = createMockDepartment({
      aggregatedBudget: {
        [CostCode.SALARY]: { allocated: 100, spent: 75 },
        [CostCode.SUPPLIES]: { allocated: 0, spent: 0 },
        [CostCode.HARDWARE]: { allocated: 0, spent: 0 },
        [CostCode.TRAVEL]: { allocated: 0, spent: 0 },
        [CostCode.UTILITIES]: { allocated: 0, spent: 0 },
        [CostCode.MARKETING]: { allocated: 0, spent: 0 },
        [CostCode.TRAINING]: { allocated: 0, spent: 0 },
        [CostCode.SOFTWARE]: { allocated: 0, spent: 0 },
      },
    });

    render(<DepartmentRow department={department} level={0} onEdit={mockOnEdit} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should render children recursively', () => {
    const department = createMockDepartment({
      name: 'Parent',
      isLeaf: false,
      children: [
        createMockDepartment({ id: 2, name: 'Child 1', isLeaf: true }),
        createMockDepartment({ id: 3, name: 'Child 2', isLeaf: true }),
      ],
    });

    render(<DepartmentRow department={department} level={0} onEdit={mockOnEdit} />);

    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('should toggle expand/collapse for departments with children', () => {
    const department = createMockDepartment({
      name: 'Parent',
      isLeaf: false,
      children: [createMockDepartment({ id: 2, name: 'Child Dept', isLeaf: true })],
    });

    const { container } = render(
      <table>
        <tbody>
          <DepartmentRow department={department} level={0} onEdit={mockOnEdit} />
        </tbody>
      </table>,
    );

    // Initially expanded
    expect(screen.getByText('Child Dept')).toBeInTheDocument();

    // Find and click the expand/collapse button (the one with SVG)
    const buttons = container.querySelectorAll('button');
    const collapseButton = Array.from(buttons).find((btn) => btn.querySelector('svg'));

    if (collapseButton) {
      fireEvent.click(collapseButton);

      // After collapse, child should not be visible
      expect(screen.queryByText('Child Dept')).not.toBeInTheDocument();
    }
  });
});
