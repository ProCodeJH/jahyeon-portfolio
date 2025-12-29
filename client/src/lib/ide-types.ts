/**
 * Professional Web IDE Types
 * Figma/Notion style design system
 */

export type Language = 'python' | 'cpp' | 'arduino' | 'javascript' | 'typescript';

export type ExecutionStatus = 'idle' | 'compiling' | 'running' | 'error' | 'success';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  language?: Language;
  children?: FileNode[];
  isOpen?: boolean;
  isPinned?: boolean;
  isDirty?: boolean;
}

export interface EditorTab {
  id: string;
  fileId: string;
  name: string;
  language: Language;
  content: string;
  isDirty: boolean;
  isPinned: boolean;
}

export interface ExecutionResult {
  status: ExecutionStatus;
  output: string;
  error?: string;
  executionTime?: number;
  memoryUsed?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  language: Language;
  code: string;
  tags: string[];
  icon: string;
}

export interface Problem {
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  file: string;
}

export interface IDEState {
  // File System
  files: FileNode[];
  activeFileId: string | null;

  // Editor
  tabs: EditorTab[];
  activeTabId: string | null;

  // Execution
  executionStatus: ExecutionStatus;
  executionResult: ExecutionResult | null;

  // UI State
  isCommandPaletteOpen: boolean;
  isShareDialogOpen: boolean;
  isTemplateGalleryOpen: boolean;
  leftSidebarWidth: number;
  bottomDockHeight: number;

  // Problems
  problems: Problem[];
}
