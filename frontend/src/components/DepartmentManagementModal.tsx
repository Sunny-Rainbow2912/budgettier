import React, { useState } from 'react';
import type { Department } from '../types/department';
import { Button } from './Button';

interface DepartmentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'rename' | 'add' | 'move';
  department?: Department;
  allDepartments?: Department[];
  onSubmit: (data: { name?: string; parentId?: number | null }) => Promise<void>;
}

export const DepartmentManagementModal: React.FC<DepartmentManagementModalProps> = ({
  isOpen,
  onClose,
  mode,
  department,
  allDepartments = [],
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setName(department?.name || '');
      // For 'add' mode without a department, parentId should be null (root level)
      // For 'add' mode with a department, parentId should be that department's id (adding as child)
      if (mode === 'add') {
        setParentId(department?.id ?? null);
      } else {
        setParentId(department?.parentId ?? null);
      }
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, department, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'add' && !name.trim()) {
      setError('Department name is required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'rename' && name.trim()) {
        await onSubmit({ name: name.trim() });
      } else if (mode === 'add' && name.trim()) {
        await onSubmit({ name: name.trim(), parentId });
      } else if (mode === 'move') {
        await onSubmit({ parentId });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (mode === 'rename') return 'Rename Department';
    if (mode === 'add') {
      return department ? `Add Child to ${department.name}` : 'Add Root Department';
    }
    return 'Move Department';
  };

  // Flatten departments for parent selection
  const flattenDepartments = (
    depts: Department[],
    level = 0,
  ): Array<{ dept: Department; level: number }> => {
    const result: Array<{ dept: Department; level: number }> = [];
    for (const dept of depts) {
      // Don't allow department to be its own parent
      if (mode !== 'move' || dept.id !== department?.id) {
        result.push({ dept, level });
        result.push(...flattenDepartments(dept.children, level + 1));
      }
    }
    return result;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {(mode === 'rename' || mode === 'add') && (
              <div className="mb-4">
                <label htmlFor="dept-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name
                </label>
                <input
                  id="dept-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter department name"
                  required
                  autoFocus
                />
              </div>
            )}

            {(mode === 'add' || mode === 'move') && (
              <div className="mb-4">
                <label
                  htmlFor="dept-parent"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Parent Department
                  {mode === 'add' && !department && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">
                      (Will be created at root level)
                    </span>
                  )}
                </label>
                <select
                  id="dept-parent"
                  value={parentId ?? ''}
                  onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={mode === 'add' && !department}
                >
                  <option value="">Root Level (No Parent)</option>
                  {flattenDepartments(allDepartments).map(({ dept, level }) => (
                    <option key={dept.id} value={dept.id}>
                      {'  '.repeat(level)} {level > 0 ? '└─ ' : ''}
                      {dept.name}
                    </option>
                  ))}
                </select>
                {mode === 'add' && !department && (
                  <p className="mt-1 text-xs text-gray-500">
                    This will create a new top-level department (same level as existing roots)
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <Button type="button" variant="neutral" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
