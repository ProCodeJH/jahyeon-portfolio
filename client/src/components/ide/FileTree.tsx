/**
 * Professional File Tree Explorer
 * Notion/Figma style
 */

import { useState } from 'react';
import { FileNode } from '@/lib/ide-types';
import { useIDEStore } from '@/lib/ide-store';
import {
  FileCode,
  FolderOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FileTreeItemProps {
  file: FileNode;
  depth: number;
}

function FileTreeItem({ file, depth }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { openTab, activeFileId } = useIDEStore();
  const isActive = activeFileId === file.id;

  const handleClick = () => {
    if (file.type === 'folder') {
      setIsOpen(!isOpen);
    } else {
      openTab(file);
    }
  };

  const getFileIcon = () => {
    if (file.type === 'folder') {
      return isOpen ? (
        <FolderOpen className="w-4 h-4 text-blue-500" />
      ) : (
        <Folder className="w-4 h-4 text-blue-500" />
      );
    }
    return <FileCode className="w-4 h-4 text-gray-500" />;
  };

  const getLanguageColor = () => {
    if (file.type === 'folder') return '';
    switch (file.language) {
      case 'python':
        return 'text-yellow-600';
      case 'cpp':
        return 'text-blue-600';
      case 'arduino':
        return 'text-teal-600';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div>
      <div
        className={`
          flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-lg
          transition-all duration-150
          ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}
        `}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        onClick={handleClick}
      >
        {file.type === 'folder' && (
          <span className="w-4 h-4 flex items-center justify-center">
            {isOpen ? (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-500" />
            )}
          </span>
        )}
        {file.type === 'file' && <span className="w-4" />}

        {getFileIcon()}

        <span className={`flex-1 text-sm truncate ${getLanguageColor()}`}>
          {file.name}
        </span>

        {file.isDirty && (
          <span className="w-2 h-2 rounded-full bg-blue-500" />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded p-1 transition-opacity">
              <MoreVertical className="w-3 h-3 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {file.type === 'folder' && isOpen && file.children && (
        <div>
          {file.children.map((child) => (
            <FileTreeItem key={child.id} file={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree() {
  const { files = [] } = useIDEStore();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">EXPLORER</h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Plus className="w-4 h-4 text-gray-500" />
        </Button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        <div className="space-y-0.5">
          {files.map((file) => (
            <FileTreeItem key={file.id} file={file} depth={0} />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {files.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="space-y-3">
            <FileCode className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500">No files yet</p>
            <Button variant="outline" size="sm">
              <Plus className="w-3 h-3 mr-1.5" />
              Create File
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
