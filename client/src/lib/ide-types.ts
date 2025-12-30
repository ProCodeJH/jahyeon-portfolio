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

export type Theme = 'light' | 'dark' | 'high-contrast';
export type ActivityBarItem = 'explorer' | 'search' | 'git' | 'extensions' | 'settings';

export interface EditorGroup {
  id: string;
  tabs: EditorTab[];
  activeTabId: string | null;
}

export interface IDESettings {
  theme: Theme;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  formatOnSave: boolean;
}

export interface IDEState {
  // File System
  files: FileNode[];
  activeFileId: string | null;

  // Editor Groups (Split Editor)
  editorGroups: EditorGroup[];
  activeGroupId: string | null;

  // Legacy (deprecated, use editorGroups)
  tabs: EditorTab[];
  activeTabId: string | null;

  // Execution
  executionStatus: ExecutionStatus;
  executionResult: ExecutionResult | null;

  // UI State
  isCommandPaletteOpen: boolean;
  isShareDialogOpen: boolean;
  isTemplateGalleryOpen: boolean;
  isSettingsOpen: boolean;
  isSearchOpen: boolean;
  activeActivityBarItem: ActivityBarItem;
  isZenMode: boolean;
  leftSidebarWidth: number;
  bottomDockHeight: number;

  // Problems
  problems: Problem[];

  // Settings
  settings: IDESettings;
}
