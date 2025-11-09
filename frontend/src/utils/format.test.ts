import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCostCode,
  calculateUtilization,
  getUtilizationColor,
  capitalize,
} from './format';

describe('formatCurrency', () => {
  it('should format number as USD currency', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1234567)).toBe('$1,234,567');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('should handle decimal values', () => {
    expect(formatCurrency(1000.5)).toBe('$1,001');
    expect(formatCurrency(1234.99)).toBe('$1,235');
  });

  it('should handle negative values', () => {
    expect(formatCurrency(-1000)).toBe('-$1,000');
  });
});

describe('formatCostCode', () => {
  it('should capitalize first letter of each word', () => {
    expect(formatCostCode('supplies')).toBe('Supplies');
    expect(formatCostCode('hardware')).toBe('Hardware');
    expect(formatCostCode('salary')).toBe('Salary');
  });

  it('should handle snake_case', () => {
    expect(formatCostCode('cost_code')).toBe('Cost Code');
    expect(formatCostCode('travel_expenses')).toBe('Travel Expenses');
  });

  it('should handle uppercase input', () => {
    expect(formatCostCode('SUPPLIES')).toBe('Supplies');
    expect(formatCostCode('HARDWARE')).toBe('Hardware');
  });
});

describe('calculateUtilization', () => {
  it('should calculate correct percentage', () => {
    expect(calculateUtilization(50, 100)).toBe(50);
    expect(calculateUtilization(75, 100)).toBe(75);
    expect(calculateUtilization(100, 100)).toBe(100);
  });

  it('should handle zero allocated amount', () => {
    expect(calculateUtilization(50, 0)).toBe(0);
    expect(calculateUtilization(0, 0)).toBe(0);
  });

  it('should allow values over 100%', () => {
    expect(calculateUtilization(150, 100)).toBe(150);
    expect(calculateUtilization(200, 100)).toBe(200);
  });

  it('should handle decimal values', () => {
    expect(calculateUtilization(33.33, 100)).toBe(33.33);
    expect(calculateUtilization(66.67, 100)).toBe(66.67);
  });
});

describe('getUtilizationColor', () => {
  it('should return green for low utilization', () => {
    expect(getUtilizationColor(0)).toBe('bg-green-500');
    expect(getUtilizationColor(25)).toBe('bg-green-500');
    expect(getUtilizationColor(49)).toBe('bg-green-500');
  });

  it('should return blue for medium utilization', () => {
    expect(getUtilizationColor(50)).toBe('bg-blue-500');
    expect(getUtilizationColor(60)).toBe('bg-blue-500');
    expect(getUtilizationColor(74)).toBe('bg-blue-500');
  });

  it('should return yellow for high utilization', () => {
    expect(getUtilizationColor(75)).toBe('bg-yellow-500');
    expect(getUtilizationColor(80)).toBe('bg-yellow-500');
    expect(getUtilizationColor(89)).toBe('bg-yellow-500');
  });

  it('should return red for very high utilization', () => {
    expect(getUtilizationColor(90)).toBe('bg-red-500');
    expect(getUtilizationColor(95)).toBe('bg-red-500');
    expect(getUtilizationColor(100)).toBe('bg-red-500');
  });

  it('should return dark red for over budget', () => {
    expect(getUtilizationColor(101)).toBe('bg-red-600');
    expect(getUtilizationColor(150)).toBe('bg-red-600');
    expect(getUtilizationColor(200)).toBe('bg-red-600');
  });
});

describe('capitalize', () => {
  it('should capitalize first letter and lowercase rest', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
    expect(capitalize('test')).toBe('Test');
  });

  it('should handle all uppercase input', () => {
    expect(capitalize('HELLO')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
  });

  it('should handle all lowercase input', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
  });

  it('should handle mixed case input', () => {
    expect(capitalize('hELLO')).toBe('Hello');
    expect(capitalize('WoRlD')).toBe('World');
  });

  it('should handle single character', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('Z')).toBe('Z');
  });

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('');
  });
});
