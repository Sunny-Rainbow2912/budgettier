import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="Loading departments..." />);
    expect(screen.getByText('Loading departments...')).toBeInTheDocument();
  });

  it('should display spinner animation', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should be centered vertically', () => {
    const { container } = render(<LoadingSpinner />);
    const wrapper = container.querySelector('.min-h-\\[400px\\]');
    expect(wrapper).toBeInTheDocument();
  });

  it('should have proper styling for spinner', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-12');
    expect(spinner?.className).toContain('w-12');
    expect(spinner?.className).toContain('border-b-2');
    expect(spinner?.className).toContain('border-blue-600');
  });
});
