/**
 * Enterprise-Grade Code Editor
 * $2000+ Quality Professional IDE
 * VSCode-style with split editing, themes, and zen mode
 */

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Enterprise IDE Components
import { ActivityBar } from '@/components/ide/ActivityBar';
import { FileTree } from '@/components/ide/FileTree';
import { EditorTabs } from '@/components/ide/EditorTabs';
import { BottomDock } from '@/components/ide/BottomDock';
import { StatusBar } from '@/components/ide/StatusBar';
import { TemplateGallery } from '@/components/ide/TemplateGallery';
import { CommandPalette } from '@/components/ide/CommandPalette';
import { ShareDialog } from '@/components/ide/ShareDialog';
import { SettingsPanel } from '@/components/ide/SettingsPanel';
import { SplitEditor } from '@/components/ide/SplitEditor';
import Editor from '@monaco-editor/react';

// Zustand Store
import { create } from 'zustand';
import { IDEState, IDESettings, EditorGroup, EditorTab, FileNode, ActivityBarItem, Theme } from '@/lib/ide-types';

// Enterprise IDE Store with all features
interface EnterpriseIDEStore extends IDEState {
  // Settings
  updateSettings: (updates: Partial<IDESettings>) => void;
  toggleSettings: () => void;

  // Activity Bar
  setActiveActivityBarItem: (item: ActivityBarItem) => void;

  // Editor Groups (Split Editor)
  createEditorGroup: () => void;
  closeEditorGroup: (groupId: string) => void;
  setActiveEditorGroup: (groupId: string) => void;
  openTabInGroup: (groupId: string, file: FileNode) => void;
  updateTabContent: (groupId: string, tabId: string, content: string) => void;

  // Zen Mode
  toggleZenMode: () => void;

  // Legacy support
  openTab: (file: FileNode) => void;
  toggleCommandPalette: () => void;
  toggleShareDialog: () => void;
  toggleTemplateGallery: () => void;
  setExecutionStatus: (status: any) => void;
  setExecutionResult: (result: any) => void;
}

// Default files
const defaultFiles: FileNode[] = [
  {
    id: 'main-py',
    name: 'main.py',
    type: 'file',
    path: '/main.py',
    language: 'python',
    content: `# Enterprise Python IDE
# Professional-grade code editing

def fibonacci(n):
    """Calculate Fibonacci number"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test the function
for i in range(15):
    print(f"F({i}) = {fibonacci(i)}")
`,
  },
  {
    id: 'main-cpp',
    name: 'main.cpp',
    type: 'file',
    path: '/main.cpp',
    language: 'cpp',
    content: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::cout << "Enterprise C++ IDE" << std::endl;

    // Modern C++ features
    std::vector<int> numbers = {5, 2, 8, 1, 9};

    std::sort(numbers.begin(), numbers.end());

    for (const auto& num : numbers) {
        std::cout << num << " ";
    }

    return 0;
}
`,
  },
];

const useEnterpriseIDE = create<EnterpriseIDEStore>((set, get) => ({
  // Initial State
  files: defaultFiles,
  activeFileId: null,
  editorGroups: [
    {
      id: 'group-1',
      tabs: [],
      activeTabId: null,
    },
  ],
  activeGroupId: 'group-1',
  tabs: [],
  activeTabId: null,
  executionStatus: 'idle',
  executionResult: null,
  isCommandPaletteOpen: false,
  isShareDialogOpen: false,
  isTemplateGalleryOpen: false,
  isSettingsOpen: false,
  isSearchOpen: false,
  activeActivityBarItem: 'explorer',
  isZenMode: false,
  leftSidebarWidth: 280,
  bottomDockHeight: 280,
  problems: [],
  settings: {
    theme: 'dark',
    fontSize: 14,
    fontFamily: 'JetBrains Mono, monospace',
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    lineNumbers: true,
    autoSave: true,
    formatOnSave: false,
  },

  // Settings
  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates },
  })),

  toggleSettings: () => set((state) => ({
    isSettingsOpen: !state.isSettingsOpen,
  })),

  // Activity Bar
  setActiveActivityBarItem: (item) => set({ activeActivityBarItem: item }),

  // Editor Groups
  createEditorGroup: () => set((state) => {
    const newGroup: EditorGroup = {
      id: `group-${Date.now()}`,
      tabs: [],
      activeTabId: null,
    };
    return {
      editorGroups: [...state.editorGroups, newGroup],
      activeGroupId: newGroup.id,
    };
  }),

  closeEditorGroup: (groupId) => set((state) => ({
    editorGroups: state.editorGroups.filter(g => g.id !== groupId),
  })),

  setActiveEditorGroup: (groupId) => set({ activeGroupId: groupId }),

  openTabInGroup: (groupId, file) => set((state) => {
    const group = state.editorGroups.find(g => g.id === groupId);
    if (!group) return state;

    const existingTab = group.tabs.find(t => t.fileId === file.id);
    if (existingTab) {
      return {
        editorGroups: state.editorGroups.map(g =>
          g.id === groupId ? { ...g, activeTabId: existingTab.id } : g
        ),
      };
    }

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
      editorGroups: state.editorGroups.map(g =>
        g.id === groupId
          ? { ...g, tabs: [...g.tabs, newTab], activeTabId: newTab.id }
          : g
      ),
    };
  }),

  updateTabContent: (groupId, tabId, content) => set((state) => ({
    editorGroups: state.editorGroups.map(g =>
      g.id === groupId
        ? {
            ...g,
            tabs: g.tabs.map(t =>
              t.id === tabId ? { ...t, content, isDirty: true } : t
            ),
          }
        : g
    ),
  })),

  // Zen Mode
  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),

  // Legacy support
  openTab: (file) => {
    const { activeGroupId, openTabInGroup } = get();
    if (activeGroupId) {
      openTabInGroup(activeGroupId, file);
    }
  },

  toggleCommandPalette: () => set((state) => ({
    isCommandPaletteOpen: !state.isCommandPaletteOpen,
  })),

  toggleShareDialog: () => set((state) => ({
    isShareDialogOpen: !state.isShareDialogOpen,
  })),

  toggleTemplateGallery: () => set((state) => ({
    isTemplateGalleryOpen: !state.isTemplateGalleryOpen,
  })),

  setExecutionStatus: (status) => set({ executionStatus: status }),
  setExecutionResult: (result) => set({ executionResult: result }),
}));

export default function CodeEditor() {
  const {
    settings,
    isZenMode,
    activeActivityBarItem,
    editorGroups,
  } = useEnterpriseIDE();

  const [output, setOutput] = useState('');

  // Theme application with safeguard for SSR
  useEffect(() => {
    if (settings?.theme) {
      document.documentElement.setAttribute('data-theme', settings?.theme);
    }
  }, [settings?.theme]);

  const getThemeClasses = () => {
    if (!settings) return 'bg-[#1E1E1E] text-white'; // Default to dark theme

    switch (settings?.theme) {
      case 'dark':
        return 'bg-[#1E1E1E] text-white';
      case 'high-contrast':
        return 'bg-black text-white';
      default:
        return 'bg-white text-gray-900';
    }
  };

  return (
    <div className={cn('h-screen flex flex-col', getThemeClasses())}>
      {/* Top Navigation (hidden in Zen Mode) */}
      {!isZenMode && <Navigation />}

      {/* IDE Container */}
      <div className={cn(
        'flex-1 flex flex-col',
        isZenMode ? '' : 'pt-[73px]'
      )}>
        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Activity Bar (hidden in Zen Mode) */}
          {!isZenMode && <ActivityBar />}

          {/* Resizable Panels */}
          <PanelGroup direction="horizontal" className="flex-1">
            {/* Left Sidebar (hidden in Zen Mode) */}
            {!isZenMode && activeActivityBarItem && (
              <>
                <Panel
                  defaultSize={20}
                  minSize={15}
                  maxSize={40}
                  className={cn(
                    'border-r',
                    settings?.theme === 'dark' ? 'border-[#2D2D2D]' : 'border-gray-200'
                  )}
                >
                  {activeActivityBarItem === 'explorer' && <FileTree />}
                  {activeActivityBarItem === 'search' && (
                    <div className={cn(
                      'h-full flex items-center justify-center',
                      settings?.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    )}>
                      <p className="text-sm">Search panel coming soon</p>
                    </div>
                  )}
                  {activeActivityBarItem === 'git' && (
                    <div className={cn(
                      'h-full flex items-center justify-center',
                      settings?.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    )}>
                      <p className="text-sm">Git integration coming soon</p>
                    </div>
                  )}
                  {activeActivityBarItem === 'extensions' && (
                    <div className={cn(
                      'h-full flex items-center justify-center',
                      settings?.theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    )}>
                      <p className="text-sm">Extensions coming soon</p>
                    </div>
                  )}
                </Panel>

                <PanelResizeHandle className={cn(
                  'w-1 relative group',
                  settings?.theme === 'dark' ? 'bg-[#2D2D2D]' : 'bg-gray-200'
                )}>
                  <div className={cn(
                    'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity',
                    'w-6 h-12 flex items-center justify-center rounded',
                    settings?.theme === 'dark' ? 'bg-[#37373D]' : 'bg-gray-300'
                  )}>
                    <GripVertical className="w-4 h-4" />
                  </div>
                </PanelResizeHandle>
              </>
            )}

            {/* Editor Area */}
            <Panel defaultSize={isZenMode ? 100 : 80} className="flex flex-col">
              <PanelGroup direction="vertical">
                {/* Editor */}
                <Panel defaultSize={70} minSize={30}>
                  <div className="h-full flex flex-col">
                    {/* Editor Tabs (hidden in Zen Mode) */}
                    {!isZenMode && <EditorTabs />}

                    {/* Split Editor */}
                    <SplitEditor />
                  </div>
                </Panel>

                {/* Bottom Dock (hidden in Zen Mode) */}
                {!isZenMode && (
                  <>
                    <PanelResizeHandle className={cn(
                      'h-1 relative group',
                      settings?.theme === 'dark' ? 'bg-[#2D2D2D]' : 'bg-gray-200'
                    )}>
                      <div className={cn(
                        'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity',
                        'w-12 h-6 flex items-center justify-center rounded',
                        settings?.theme === 'dark' ? 'bg-[#37373D]' : 'bg-gray-300'
                      )}>
                        <GripVertical className="w-4 h-4 rotate-90" />
                      </div>
                    </PanelResizeHandle>

                    <Panel defaultSize={30} minSize={20} maxSize={50}>
                      <BottomDock output={output} />
                    </Panel>
                  </>
                )}
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </div>

        {/* Status Bar (hidden in Zen Mode) */}
        {!isZenMode && <StatusBar />}
      </div>

      {/* Dialogs */}
      <CommandPalette />
      <TemplateGallery />
      <ShareDialog />
      <SettingsPanel />

      {/* Zen Mode Toggle (floating button) */}
      {isZenMode && (
        <button
          onClick={() => useEnterpriseIDE.getState().toggleZenMode()}
          className={cn(
            'fixed top-4 right-4 p-2 rounded-lg shadow-lg transition-colors z-50',
            settings?.theme === 'dark'
              ? 'bg-[#37373D] text-white hover:bg-[#3E3E42]'
              : 'bg-white text-gray-900 hover:bg-gray-100'
          )}
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
