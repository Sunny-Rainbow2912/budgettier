import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { useDepartments } from '../context/DepartmentContext';
import type { Department } from '../types/department';
import { DepartmentManagementModal } from '../components/DepartmentManagementModal';
import { ConfirmDialog } from '../components/ConfirmDialog';

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
          <div className="flex items-center">
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mr-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            {!hasChildren && <span className="mr-2 w-4"></span>}
            <span className={department.isLeaf ? 'text-gray-700' : 'font-medium text-gray-900'}>
              {department.name}
            </span>
            {department.isLeaf && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                Leaf
              </span>
            )}
          </div>
        </td>
        <td className="py-3 px-4 text-center text-gray-600">
          {hasChildren ? `${department.children.length} children` : 'Leaf department'}
        </td>
        <td className="py-3 px-4 text-center">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => onRename(department)}
              className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              title="Rename Department"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onAddChild(department)}
              className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              title="Add Child Department"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => onDelete(department)}
              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              title="Delete Department"
            >
              <Trash2 size={16} />
            </button>
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization structure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <button
          onClick={loadDepartments}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
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
        <button
          onClick={handleAddRoot}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
        >
          Add Root Department
        </button>
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
