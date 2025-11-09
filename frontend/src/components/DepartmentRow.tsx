import React, { useState } from 'react';
import type { Department } from '../types/department';
import { CostCode } from '../types/department';
import {
  formatCurrency,
  calculateUtilization,
  getUtilizationColor,
  capitalize,
} from '../utils/format';
import { Button } from './Button';
import { TreeCell } from './BaseTreeRow';

interface DepartmentRowProps {
  department: Department;
  level: number;
  onSave: (departmentId: number, budgetItems: any) => Promise<void>;
}

interface BudgetItemEdit {
  id?: number;
  costCode: CostCode;
  allocatedAmount: number;
  spentAmount: number;
}

export const DepartmentRow: React.FC<DepartmentRowProps> = ({ department, level, onSave }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBudgetItems, setEditingBudgetItems] = useState<BudgetItemEdit[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const hasChildren = department.children.length > 0;
  const indent = level * 24;

  const totalAllocated = Object.values(department.aggregatedBudget).reduce(
    (sum, item) => sum + item.allocated,
    0,
  );

  const totalSpent = Object.values(department.aggregatedBudget).reduce(
    (sum, item) => sum + item.spent,
    0,
  );

  const utilization = calculateUtilization(totalSpent, totalAllocated);

  const handleEditClick = () => {
    setIsEditing(true);
    // Initialize with existing budget items or empty array
    const items: BudgetItemEdit[] =
      department.budgetItems.length > 0
        ? department.budgetItems.map((item) => ({
            id: item.id,
            costCode: item.costCode,
            allocatedAmount: item.allocatedAmount,
            spentAmount: item.spentAmount,
          }))
        : [
            {
              costCode: CostCode.SALARY,
              allocatedAmount: 0,
              spentAmount: 0,
            },
          ];
    setEditingBudgetItems(items);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingBudgetItems([]);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      await onSave(department.id, {
        budgetItems: editingBudgetItems.map((item) => ({
          costCode: item.costCode,
          allocatedAmount: item.allocatedAmount,
          spentAmount: item.spentAmount,
        })),
      });
      setIsEditing(false);
      setEditingBudgetItems([]);
    } catch (error) {
      alert('Failed to save: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleItemChange = (
    index: number,
    field: 'allocatedAmount' | 'spentAmount',
    value: string,
  ) => {
    const newItems = [...editingBudgetItems];
    newItems[index][field] = parseFloat(value) || 0;
    setEditingBudgetItems(newItems);
  };

  const handleCostCodeChange = (index: number, costCode: CostCode) => {
    const newItems = [...editingBudgetItems];
    newItems[index].costCode = costCode;
    setEditingBudgetItems(newItems);
  };

  const handleAddItem = () => {
    // Find the first unused cost code
    const usedCostCodes = new Set(editingBudgetItems.map((item) => item.costCode));
    const allCostCodes = Object.values(CostCode);
    const availableCostCode = allCostCodes.find((code) => !usedCostCodes.has(code));

    if (!availableCostCode) {
      alert('All cost codes are already in use. You cannot add more budget items.');
      return;
    }

    setEditingBudgetItems([
      ...editingBudgetItems,
      {
        costCode: availableCostCode,
        allocatedAmount: 0,
        spentAmount: 0,
      },
    ]);
  };

  const getAvailableCostCodes = (currentIndex: number): CostCode[] => {
    const usedCostCodes = new Set(
      editingBudgetItems
        .map((item, idx) => (idx === currentIndex ? null : item.costCode))
        .filter((code): code is CostCode => code !== null),
    );
    return Object.values(CostCode).filter((code) => !usedCostCodes.has(code));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editingBudgetItems.filter((_, i) => i !== index);
    setEditingBudgetItems(newItems);
  };

  return (
    <>
      <tr className="border-b hover:bg-gray-50">
        <td className="py-3 px-4" style={{ paddingLeft: `${16 + indent}px` }}>
          <TreeCell
            department={department}
            indent={indent}
            isExpanded={isExpanded}
            hasChildren={hasChildren}
            onToggle={() => setIsExpanded(!isExpanded)}
          />
        </td>
        <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(totalAllocated)}</td>
        <td className="py-3 px-4 text-right text-gray-900">{formatCurrency(totalSpent)}</td>
        <td className="py-3 px-4">
          <div className="flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 overflow-hidden">
              <div
                className={`h-2 rounded-full ${getUtilizationColor(utilization)} ${utilization > 100 ? 'animate-pulse' : ''}`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              ></div>
            </div>
            <span
              className={`text-sm font-medium w-14 text-right ${utilization > 100 ? 'text-red-600 font-bold' : 'text-gray-600'}`}
            >
              {utilization.toFixed(0)}%
            </span>
          </div>
        </td>
        <td className="py-3 px-4 text-center">
          {department.isLeaf && !isEditing && (
            <Button onClick={handleEditClick} title="Edit" size="sm">
              Edit
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2 justify-center">
              <Button variant="success" onClick={handleSaveEdit} disabled={isSaving} size="sm">
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="secondary" onClick={handleCancelEdit} disabled={isSaving} size="sm">
                Cancel
              </Button>
            </div>
          )}
        </td>
      </tr>

      {/* Inline Editing Row */}
      {isEditing && (
        <tr className="bg-blue-50 border-b">
          <td colSpan={5} className="py-4 px-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-blue-300">
              <h3 className="font-bold text-lg mb-4 text-gray-900">
                Edit Budget Items for {department.name}
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {editingBudgetItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded"
                  >
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cost Code
                      </label>
                      <select
                        value={item.costCode}
                        onChange={(e) => handleCostCodeChange(index, e.target.value as CostCode)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {getAvailableCostCodes(index).map((code) => (
                          <option key={code} value={code}>
                            {capitalize(code)}
                          </option>
                        ))}
                        {!getAvailableCostCodes(index).includes(item.costCode) && (
                          <option value={item.costCode}>{capitalize(item.costCode)}</option>
                        )}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Allocated
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.allocatedAmount}
                        onChange={(e) => handleItemChange(index, 'allocatedAmount', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Spent</label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.spentAmount}
                        onChange={(e) => handleItemChange(index, 'spentAmount', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="col-span-2 flex justify-end">
                      {editingBudgetItems.length > 1 && (
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-medium transition-colors"
                          title="Remove item"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddItem}
                disabled={editingBudgetItems.length >= Object.values(CostCode).length}
                className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                title={
                  editingBudgetItems.length >= Object.values(CostCode).length
                    ? 'All cost codes are already in use'
                    : 'Add a new budget item'
                }
              >
                Add Budget Item
                {editingBudgetItems.length >= Object.values(CostCode).length && ' (Max reached)'}
              </button>
            </div>
          </td>
        </tr>
      )}

      {isExpanded &&
        department.children.map((child) => (
          <DepartmentRow key={child.id} department={child} level={level + 1} onSave={onSave} />
        ))}
    </>
  );
};
