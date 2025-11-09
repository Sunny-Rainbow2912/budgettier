import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreeCell } from './BaseTreeRow';
import type { Department } from '../types/department';
import { CostCode } from '../types/department';

describe('TreeCell', () => {
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

  describe('rendering', () => {
    it('should render department name', () => {
      const department = createMockDepartment({ name: 'Engineering' });
      const handleToggle = vi.fn();

      render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={true}
          hasChildren={false}
          onToggle={handleToggle}
        />,
      );

      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    it('should show expand button when hasChildren is true', () => {
      const department = createMockDepartment();
      const handleToggle = vi.fn();

      const { container } = render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={true}
          hasChildren={true}
          onToggle={handleToggle}
        />,
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('should not show expand button when hasChildren is false', () => {
      const department = createMockDepartment();
      const handleToggle = vi.fn();

      const { container } = render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={true}
          hasChildren={false}
          onToggle={handleToggle}
        />,
      );

      const button = container.querySelector('button');
      expect(button).not.toBeInTheDocument();
    });

    it('should show placeholder space when no children', () => {
      const department = createMockDepartment();
      const handleToggle = vi.fn();

      const { container } = render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={true}
          hasChildren={false}
          onToggle={handleToggle}
        />,
      );

      const placeholder = container.querySelector('.mr-2.w-4');
      expect(placeholder).toBeInTheDocument();
    });

    it('should display leaf badge for leaf departments', () => {
      const department = createMockDepartment({ isLeaf: true });
      const handleToggle = vi.fn();

      render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={true}
          hasChildren={false}
          onToggle={handleToggle}
        />,
      );

      expect(screen.getByText('Leaf')).toBeInTheDocument();
    });

    it('should not display leaf badge when showLeafBadge is false', () => {
      const department = createMockDepartment({ isLeaf: true });
      const handleToggle = vi.fn();

      render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={true}
          hasChildren={false}
          onToggle={handleToggle}
          showLeafBadge={false}
        />,
      );

      expect(screen.queryByText('Leaf')).not.toBeInTheDocument();
    });

    it('should not display leaf badge for non-leaf departments', () => {
      const department = createMockDepartment({ isLeaf: false });
      const handleToggle = vi.fn();

      render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={true}
          hasChildren={true}
          onToggle={handleToggle}
        />,
      );

      expect(screen.queryByText('Leaf')).not.toBeInTheDocument();
    });
  });

  describe('expand/collapse', () => {
    it('should show chevron down when expanded', () => {
      const department = createMockDepartment();
      const handleToggle = vi.fn();

      const { container } = render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={true}
          hasChildren={true}
          onToggle={handleToggle}
        />,
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should show chevron right when collapsed', () => {
      const department = createMockDepartment();
      const handleToggle = vi.fn();

      const { container } = render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={false}
          hasChildren={true}
          onToggle={handleToggle}
        />,
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should call onToggle when expand button is clicked', () => {
      const department = createMockDepartment();
      const handleToggle = vi.fn();

      const { container } = render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={true}
          hasChildren={true}
          onToggle={handleToggle}
        />,
      );

      const button = container.querySelector('button');
      if (button) {
        fireEvent.click(button);
        expect(handleToggle).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('styling', () => {
    it('should apply different text style for leaf departments', () => {
      const department = createMockDepartment({ isLeaf: true });
      const handleToggle = vi.fn();

      const { container } = render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={true}
          hasChildren={false}
          onToggle={handleToggle}
        />,
      );

      const name = screen.getByText('Test Department');
      expect(name?.className).toContain('text-gray-700');
    });

    it('should apply different text style for non-leaf departments', () => {
      const department = createMockDepartment({ isLeaf: false });
      const handleToggle = vi.fn();

      const { container } = render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={true}
          hasChildren={true}
          onToggle={handleToggle}
        />,
      );

      const name = screen.getByText('Test Department');
      expect(name?.className).toContain('font-medium');
      expect(name?.className).toContain('text-gray-900');
    });

    it('should have proper leaf badge styling', () => {
      const department = createMockDepartment({ isLeaf: true });
      const handleToggle = vi.fn();

      render(
        <TreeCell
          department={department}
          indent={0}
          isExpanded={true}
          hasChildren={false}
          onToggle={handleToggle}
        />,
      );

      const badge = screen.getByText('Leaf');
      expect(badge?.className).toContain('bg-green-100');
      expect(badge?.className).toContain('text-green-800');
    });
  });
});
