/**
 * Professional Web IDE Store
 * Using Zustand for clean state management
 */

import { create } from 'zustand';
import { IDEState, EditorTab, FileNode, ExecutionStatus, ExecutionResult, Problem } from './ide-types';

interface IDEActions {
  // File operations
  addFile: (file: FileNode) => void;
  deleteFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  setActiveFile: (fileId: string | null) => void;

  // Tab operations
  openTab: (file: FileNode) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  pinTab: (tabId: string) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;

  // Execution
  setExecutionStatus: (status: ExecutionStatus) => void;
  setExecutionResult: (result: ExecutionResult) => void;

  // UI State
  toggleCommandPalette: () => void;
  toggleShareDialog: () => void;
  toggleTemplateGallery: () => void;
  setLeftSidebarWidth: (width: number) => void;
  setBottomDockHeight: (height: number) => void;

  // Problems
  setProblems: (problems: Problem[]) => void;
  addProblem: (problem: Problem) => void;
  clearProblems: () => void;
}

// Default files
const defaultFiles: FileNode[] = [
  {
    id: 'main-py',
    name: 'main.py',
    type: 'file',
    path: '/main.py',
    language: 'python',
    content: `# Python Hello World
print("Hello from Professional IDE!")

# Example: Calculate fibonacci
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
`,
    isOpen: false,
    isPinned: false,
    isDirty: false,
  },
  {
    id: 'main-cpp',
    name: 'main.cpp',
    type: 'file',
    path: '/main.cpp',
    language: 'cpp',
    content: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++!" << endl;

    // Example: Calculate factorial
    int n = 10;
    long long factorial = 1;

    for (int i = 1; i <= n; i++) {
        factorial *= i;
    }

    cout << "Factorial of " << n << " is " << factorial << endl;

    return 0;
}
`,
    isOpen: false,
    isPinned: false,
    isDirty: false,
  },
  {
    id: 'sketch-ino',
    name: 'sketch.ino',
    type: 'file',
    path: '/sketch.ino',
    language: 'arduino',
    content: `// Arduino Blink Example
#define LED_PIN 13

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("Arduino Started!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(1000);

  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
`,
    isOpen: false,
    isPinned: false,
    isDirty: false,
  },
];

export const useIDEStore = create<IDEState & IDEActions>((set, get) => ({
  // Initial State
  files: defaultFiles,
  activeFileId: null,
  tabs: [],
  activeTabId: null,
  executionStatus: 'idle',
  executionResult: null,
  isCommandPaletteOpen: false,
  isShareDialogOpen: false,
  isTemplateGalleryOpen: false,
  leftSidebarWidth: 280,
  bottomDockHeight: 280,
  problems: [],

  // File operations
  addFile: (file) => set((state) => ({
    files: [...state.files, file],
  })),

  deleteFile: (fileId) => set((state) => ({
    files: state.files.filter(f => f.id !== fileId),
    tabs: state.tabs.filter(t => t.fileId !== fileId),
  })),

  updateFileContent: (fileId, content) => set((state) => ({
    files: state.files.map(f =>
      f.id === fileId ? { ...f, content } : f
    ),
  })),

  setActiveFile: (fileId) => set({ activeFileId: fileId }),

  // Tab operations
  openTab: (file) => set((state) => {
    // Check if tab already exists
    const existingTab = state.tabs.find(t => t.fileId === file.id);
    if (existingTab) {
      return { activeTabId: existingTab.id };
    }

    // Create new tab
    const newTab: EditorTab = {
      id: `tab-${file.id}-${Date.now()}`,
      fileId: file.id,
      name: file.name,
      language: file.language || 'python',
      content: file.content || '',
      isDirty: false,
      isPinned: false,
    };

    return {
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
      activeFileId: file.id,
    };
  }),

  closeTab: (tabId) => set((state) => {
    const newTabs = state.tabs.filter(t => t.id !== tabId);
    let newActiveTabId = state.activeTabId;

    // If closing active tab, switch to another tab
    if (state.activeTabId === tabId) {
      const tabIndex = state.tabs.findIndex(t => t.id === tabId);
      if (newTabs.length > 0) {
        const nextTab = newTabs[Math.min(tabIndex, newTabs.length - 1)];
        newActiveTabId = nextTab.id;
      } else {
        newActiveTabId = null;
      }
    }

    return {
      tabs: newTabs,
      activeTabId: newActiveTabId,
    };
  }),

  setActiveTab: (tabId) => set((state) => {
    const tab = state.tabs.find(t => t.id === tabId);
    return {
      activeTabId: tabId,
      activeFileId: tab?.fileId || null,
    };
  }),

  pinTab: (tabId) => set((state) => ({
    tabs: state.tabs.map(t =>
      t.id === tabId ? { ...t, isPinned: !t.isPinned } : t
    ),
  })),

  markTabDirty: (tabId, isDirty) => set((state) => ({
    tabs: state.tabs.map(t =>
      t.id === tabId ? { ...t, isDirty } : t
    ),
  })),

  // Execution
  setExecutionStatus: (status) => set({ executionStatus: status }),

  setExecutionResult: (result) => set({ executionResult: result }),

  // UI State
  toggleCommandPalette: () => set((state) => ({
    isCommandPaletteOpen: !state.isCommandPaletteOpen,
  })),

  toggleShareDialog: () => set((state) => ({
    isShareDialogOpen: !state.isShareDialogOpen,
  })),

  toggleTemplateGallery: () => set((state) => ({
    isTemplateGalleryOpen: !state.isTemplateGalleryOpen,
  })),

  setLeftSidebarWidth: (width) => set({ leftSidebarWidth: width }),

  setBottomDockHeight: (height) => set({ bottomDockHeight: height }),

  // Problems
  setProblems: (problems) => set({ problems }),

  addProblem: (problem) => set((state) => ({
    problems: [...state.problems, problem],
  })),

  clearProblems: () => set({ problems: [] }),
}));
