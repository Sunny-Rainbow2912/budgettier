import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('should render error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    const handleRetry = vi.fn();
    render(<ErrorMessage message="Failed to load" onRetry={handleRetry} />);
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Failed to load" />);
    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const handleRetry = vi.fn();
    render(<ErrorMessage message="Failed to load" onRetry={handleRetry} />);

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should have proper error styling', () => {
    const { container } = render(<ErrorMessage message="Error occurred" />);
    const errorBox = container.querySelector('.bg-red-100');
    expect(errorBox).toBeInTheDocument();
    expect(errorBox?.className).toContain('border-red-400');
    expect(errorBox?.className).toContain('text-red-700');
  });

  it('should have accessible structure', () => {
    render(<ErrorMessage message="Test error" onRetry={vi.fn()} />);
    const heading = screen.getByText('Error');
    expect(heading).toHaveClass('font-bold');
  });

  it('should render retry button with proper styling', () => {
    const { container } = render(<ErrorMessage message="Error" onRetry={vi.fn()} />);
    const button = screen.getByText('Retry');
    expect(button?.className).toContain('bg-red-600');
    expect(button?.className).toContain('text-white');
    expect(button?.className).toContain('hover:bg-red-700');
  });
});
