import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useDepartments } from '../context/DepartmentContext';
import type { Department } from '../types/department';
import { DepartmentManagementModal } from '../components/DepartmentManagementModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Button } from '../components/Button';
import { TreeCell } from '../components/BaseTreeRow';

interface OrgRowProps {
  department: Department;
  level: number;
  onRename: (dept: Department) => void;
  onAddChild: (dept: Department) => void;
  onDelete: (dept: Department) => void;
}

const OrganizationRow: React.FC<OrgRowProps> = ({
  department,
  level,
  onRename,
  onAddChild,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = department.children.length > 0;
  const indent = level * 24;

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
        <td className="py-3 px-4 text-center text-gray-600">
          {hasChildren ? `${department.children.length} children` : 'Leaf department'}
        </td>
        <td className="py-3 px-4 text-center">
          <div className="flex gap-2 justify-center">
            <Button
              variant="secondary"
              onClick={() => onRename(department)}
              title="Rename Department"
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant="success"
              onClick={() => onAddChild(department)}
              title="Add Child Department"
            >
              <Plus size={16} />
            </Button>
            <Button variant="danger" onClick={() => onDelete(department)} title="Delete Department">
              <Trash2 size={16} />
            </Button>
          </div>
        </td>
      </tr>

      {isExpanded &&
        department.children.map((child) => (
          <OrganizationRow
            key={child.id}
            department={child}
            level={level + 1}
            onRename={onRename}
            onAddChild={onAddChild}
            onDelete={onDelete}
          />
        ))}
    </>
  );
};

export const OrganizationStructure: React.FC = () => {
  const {
    departments,
    loading,
    error,
    loadDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  } = useDepartments();
  const [managementModal, setManagementModal] = useState<{
    isOpen: boolean;
    mode: 'rename' | 'add' | 'move';
    department?: Department;
  }>({ isOpen: false, mode: 'rename' });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    department: Department | null;
  }>({ isOpen: false, department: null });

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleRename = (department: Department) => {
    setManagementModal({ isOpen: true, mode: 'rename', department });
  };

  const handleAddChild = (department: Department) => {
    setManagementModal({ isOpen: true, mode: 'add', department });
  };

  const handleAddRoot = () => {
    setManagementModal({ isOpen: true, mode: 'add', department: undefined });
  };

  const countDescendants = (dept: Department): number => {
    let count = dept.children.length;
    for (const child of dept.children) {
      count += countDescendants(child);
    }
    return count;
  };

  const handleDeleteClick = (department: Department) => {
    setDeleteConfirm({ isOpen: true, department });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.department) return;

    try {
      await deleteDepartment(deleteConfirm.department.id);
      setDeleteConfirm({ isOpen: false, department: null });
    } catch (err) {
      alert(
        'Failed to delete department: ' + (err instanceof Error ? err.message : 'Unknown error'),
      );
    }
  };

  const getDeleteDialogProps = () => {
    if (!deleteConfirm.department) {
      return {
        title: '',
        message: '',
        details: [],
        requiresTyping: false,
        variant: 'warning' as const,
      };
    }

    const dept = deleteConfirm.department;
    const descendantCount = countDescendants(dept);

    if (dept.isLeaf) {
      return {
        title: 'Delete Department',
        message: `Are you sure you want to delete "${dept.name}"?`,
        details: ['This department', 'All its budget data'],
        requiresTyping: false,
        variant: 'warning' as const,
      };
    } else {
      return {
        title: 'Delete Department and All Sub-Departments',
        message: `You are about to delete "${dept.name}" and ALL its sub-departments!`,
        details: [
          'This department',
          `${descendantCount} sub-department${descendantCount === 1 ? '' : 's'}`,
          'All budget data for ALL these departments',
        ],
        requiresTyping: true,
        variant: 'danger' as const,
      };
    }
  };

  const handleManagementSubmit = async (data: { name?: string; parentId?: number | null }) => {
    if (managementModal.mode === 'rename' && managementModal.department) {
      await updateDepartment(managementModal.department.id, { name: data.name });
    } else if (managementModal.mode === 'add') {
      await createDepartment(data.name!, managementModal.department?.id ?? null);
    }
  };

  const handleCloseManagementModal = () => {
    setManagementModal({ isOpen: false, mode: 'rename' });
  };

  if (loading && departments.length === 0) {
    return <LoadingSpinner message="Loading organization structure..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDepartments} />;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organization Structure</h2>
          <p className="text-gray-600 mt-1">
            Manage your organizational hierarchy - add, rename, and delete departments
          </p>
        </div>
        <Button onClick={handleAddRoot} size="md">
          Add Root Department
        </Button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Department Name</th>
              <th className="py-3 px-4 text-center">Structure</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500">
                  No departments yet. Click "Add Root Department" to get started.
                </td>
              </tr>
            ) : (
              departments.map((department) => (
                <OrganizationRow
                  key={department.id}
                  department={department}
                  level={0}
                  onRename={handleRename}
                  onAddChild={handleAddChild}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <DepartmentManagementModal
        isOpen={managementModal.isOpen}
        onClose={handleCloseManagementModal}
        mode={managementModal.mode}
        department={managementModal.department}
        allDepartments={departments}
        onSubmit={handleManagementSubmit}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, department: null })}
        onConfirm={handleDeleteConfirm}
        {...getDeleteDialogProps()}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};
