import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  describe('variants', () => {
    it('should render primary variant (default)', () => {
      const { container } = render(<Button>Primary</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('bg-blue-600');
    });

    it('should render secondary variant', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('bg-gray-600');
    });

    it('should render success variant', () => {
      const { container } = render(<Button variant="success">Success</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('bg-green-600');
    });

    it('should render danger variant', () => {
      const { container } = render(<Button variant="danger">Danger</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('bg-red-600');
    });

    it('should render warning variant', () => {
      const { container } = render(<Button variant="warning">Warning</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('bg-yellow-600');
    });

    it('should render neutral variant', () => {
      const { container } = render(<Button variant="neutral">Neutral</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('bg-gray-100');
    });

    it('should render outline variant', () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('border');
      expect(button?.className).toContain('bg-white');
    });

    it('should render icon variant with different styling', () => {
      const { container } = render(<Button variant="icon">Icon</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('p-2');
      expect(button?.className).not.toContain('px-4');
    });
  });

  describe('sizes', () => {
    it('should render medium size (default)', () => {
      const { container } = render(<Button>Medium</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('px-4 py-2 text-sm');
    });

    it('should render small size', () => {
      const { container } = render(<Button size="sm">Small</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('px-3 py-1.5 text-xs');
    });

    it('should render large size', () => {
      const { container } = render(<Button size="lg">Large</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('px-6 py-3 text-base');
    });

    it('should not apply size classes to icon variant', () => {
      const { container } = render(
        <Button variant="icon" size="lg">
          Icon
        </Button>,
      );
      const button = container.querySelector('button');
      expect(button?.className).toContain('p-2');
      expect(button?.className).not.toContain('px-6');
    });
  });

  describe('disabled state', () => {
    it('should show disabled styling when disabled', () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('opacity-50');
      expect(button?.className).toContain('cursor-not-allowed');
      expect(button).toBeDisabled();
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      );

      const button = screen.getByText('Disabled');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByText('Click me');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should support custom className', () => {
      const { container } = render(<Button className="custom-class">Button</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('custom-class');
    });

    it('should support type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByText('Submit');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should support title attribute', () => {
      render(<Button title="Tooltip text">Button</Button>);
      const button = screen.getByText('Button');
      expect(button).toHaveAttribute('title', 'Tooltip text');
    });
  });

  describe('focus and accessibility', () => {
    it('should be focusable', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByText('Focusable');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should have focus ring classes', () => {
      const { container } = render(<Button>Button</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('focus:outline-none');
      expect(button?.className).toContain('focus:ring-2');
    });
  });
});
