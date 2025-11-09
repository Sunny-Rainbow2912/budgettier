import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as departmentsApi from './api/departments';
import { CostCode } from './types/department';

vi.mock('./api/departments');

describe('App Integration', () => {
  const mockDepartments = [
    {
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
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);
  });

  describe('Application Layout', () => {
    it('should render application title', async () => {
      render(<App />);

      expect(screen.getByText('Budgettier - Department Budget Management')).toBeInTheDocument();
    });

    it('should render application description', async () => {
      render(<App />);

      expect(
        screen.getByText('Manage hierarchical department budgets with real-time aggregation'),
      ).toBeInTheDocument();
    });

    it('should render footer', async () => {
      render(<App />);

      expect(
        screen.getByText('Built with React 19, NestJS, TypeORM, and Tailwind CSS'),
      ).toBeInTheDocument();
    });

    it('should render navigation tabs', async () => {
      render(<App />);

      expect(screen.getByText('Budget Management')).toBeInTheDocument();
      expect(screen.getByText('Organization Structure')).toBeInTheDocument();
    });
  });

  describe('Routing', () => {
    it('should render Budget Management page by default', async () => {
      render(<App />);

      await waitFor(() => {
        // Check for page-specific content
        expect(
          screen.getByText('View and edit budget allocations for leaf departments'),
        ).toBeInTheDocument();
      });
    });

    it('should navigate to Organization Structure page', async () => {
      render(<App />);

      // Click on Organization Structure tab
      const orgTab = screen.getByText('Organization Structure');
      fireEvent.click(orgTab);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Manage your organizational hierarchy - add, rename, and delete departments',
          ),
        ).toBeInTheDocument();
      });
    });

    it('should navigate between pages', async () => {
      const { container } = render(<App />);

      // Wait for initial page load
      await screen.findByText('View and edit budget allocations for leaf departments');

      // Navigate to Organization Structure using the nav link
      const orgNavLink = container.querySelector('a[href="/organization"]');
      expect(orgNavLink).toBeInTheDocument();

      fireEvent.click(orgNavLink!);

      // Wait for Organization Structure page to load
      await screen.findByText(/Manage your organizational hierarchy/);

      // Navigate back to Budget Management
      const budgetNavLink = container.querySelector('a[href="/"]');
      expect(budgetNavLink).toBeInTheDocument();

      fireEvent.click(budgetNavLink!);

      // Wait for Budget Management page to load again
      await screen.findByText('View and edit budget allocations for leaf departments');
    });

    it('should highlight active tab', async () => {
      const { container } = render(<App />);

      // Wait for initial page load
      await screen.findByText('View and edit budget allocations for leaf departments');

      // Budget Management should be active by default
      const budgetNavLink = container.querySelector('a[href="/"]');
      expect(budgetNavLink?.className).toContain('border-blue-600');
      expect(budgetNavLink?.className).toContain('text-blue-600');

      // Click Organization Structure using nav link
      const orgNavLink = container.querySelector('a[href="/organization"]');
      expect(orgNavLink).toBeInTheDocument();

      fireEvent.click(orgNavLink!);

      // Wait for navigation to complete
      await screen.findByText(/Manage your organizational hierarchy/);

      // Organization Structure tab should now be active
      const activeOrgLink = container.querySelector('a[href="/organization"]');
      expect(activeOrgLink?.className).toContain('border-blue-600');
      expect(activeOrgLink?.className).toContain('text-blue-600');
    });
  });

  describe('DepartmentContext Integration', () => {
    it('should provide context to all pages', async () => {
      const { container } = render(<App />);

      // Budget Management page should load departments
      await waitFor(() => {
        expect(screen.getByText('Test Department')).toBeInTheDocument();
      });

      // Navigate to Organization Structure using nav link
      const orgNavLink = container.querySelector('a[href="/organization"]');
      if (orgNavLink) {
        fireEvent.click(orgNavLink);
      }

      // Organization Structure should also see departments
      await waitFor(() => {
        expect(screen.getByText('Test Department')).toBeInTheDocument();
      });
    });

    it('should maintain state across page navigation', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockResolvedValue(mockDepartments);

      const { container } = render(<App />);

      // Wait for initial load on Budget Management
      await screen.findByText('Test Department');

      // Verify first call happened
      expect(departmentsApi.departmentsApi.getDepartments).toHaveBeenCalledTimes(1);

      // Navigate to Organization Structure using nav link
      const orgNavLink = container.querySelector('a[href="/organization"]');
      expect(orgNavLink).toBeInTheDocument();

      fireEvent.click(orgNavLink!);

      // Wait for Organization Structure page to load and call getDepartments again
      await screen.findByText(/Manage your organizational hierarchy/);

      // Wait a bit for the useEffect to trigger
      await waitFor(
        () => {
          expect(departmentsApi.departmentsApi.getDepartments).toHaveBeenCalledTimes(2);
        },
        { timeout: 3000 },
      );
    });
  });

  describe('Responsive Layout', () => {
    it('should render with container styling', async () => {
      const { container } = render(<App />);

      const mainContainer = container.querySelector('.container');
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer?.className).toContain('mx-auto');
    });

    it('should render with background gradient', async () => {
      const { container } = render(<App />);

      const background = container.querySelector('.bg-gradient-to-br');
      expect(background).toBeInTheDocument();
      expect(background?.className).toContain('min-h-screen');
    });
  });

  describe('Error Handling Across Pages', () => {
    it('should handle errors independently on each page', async () => {
      vi.mocked(departmentsApi.departmentsApi.getDepartments).mockRejectedValue(
        new Error('Load failed'),
      );

      render(<App />);

      // Budget Management should show error
      await waitFor(() => {
        expect(screen.getByText('Load failed')).toBeInTheDocument();
      });

      // Navigate to Organization Structure
      const orgTab = screen.getByText('Organization Structure');
      fireEvent.click(orgTab);

      // Organization Structure should also show error
      await waitFor(() => {
        expect(screen.getByText('Load failed')).toBeInTheDocument();
      });
    });
  });
});
