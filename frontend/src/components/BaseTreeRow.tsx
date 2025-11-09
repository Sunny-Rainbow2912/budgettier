import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Department } from '../types/department';

interface BaseTreeRowProps {
  department: Department;
  level: number;
  children: (props: {
    department: Department;
    level: number;
    indent: number;
    isExpanded: boolean;
    hasChildren: boolean;
  }) => React.ReactNode;
  renderExpandButton?: boolean;
}

export const BaseTreeRow: React.FC<BaseTreeRowProps> = ({
  department,
  level,
  children,
  renderExpandButton = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = department.children.length > 0;
  const indent = level * 24;

  return (
    <>
      {children({ department, level, indent, isExpanded, hasChildren })}

      {renderExpandButton &&
        isExpanded &&
        department.children.map((child) => (
          <BaseTreeRow key={child.id} department={child} level={level + 1}>
            {children}
          </BaseTreeRow>
        ))}
    </>
  );
};

interface TreeCellProps {
  department: Department;
  indent: number;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  showLeafBadge?: boolean;
}

export const TreeCell: React.FC<TreeCellProps> = ({
  department,
  indent,
  isExpanded,
  hasChildren,
  onToggle,
  showLeafBadge = true,
}) => {
  return (
    <div className="flex items-center">
      {hasChildren && (
        <button
          onClick={onToggle}
          className="mr-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      )}
      {!hasChildren && <span className="mr-2 w-4"></span>}
      <span className={department.isLeaf ? 'text-gray-700' : 'font-medium text-gray-900'}>
        {department.name}
      </span>
      {showLeafBadge && department.isLeaf && (
        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Leaf</span>
      )}
    </div>
  );
};
