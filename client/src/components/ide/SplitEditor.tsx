/**
 * Enterprise Split Editor
 * VSCode-style split editing with resizable panels
 */

import { useIDEStore } from '@/lib/ide-store';
import Editor from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SplitEditor() {
  const { editorGroups, activeGroupId, settings, updateTabContent } = useIDEStore();

  const getMonacoTheme = () => {
    if (!settings) return 'vs-dark';

    switch (settings?.theme) {
      case 'dark':
        return 'vs-dark';
      case 'high-contrast':
        return 'hc-black';
      default:
        return 'light';
    }
  };

  const getEditorOptions = () => ({
    minimap: { enabled: settings.minimap },
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    tabSize: settings.tabSize,
    wordWrap: settings.wordWrap ? 'on' as const : 'off' as const,
    lineNumbers: settings.lineNumbers ? 'on' as const : 'off' as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    smoothScrolling: true,
    cursorBlinking: 'smooth' as const,
    cursorSmoothCaretAnimation: 'on' as const,
    renderLineHighlight: 'all' as const,
    padding: { top: 16, bottom: 16 },
    bracketPairColorization: { enabled: true },
    guides: {
      indentation: true,
      bracketPairs: true,
    },
    suggest: {
      showKeywords: true,
      showSnippets: true,
    },
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },
  });

  if (editorGroups.length === 0) {
    return (
      <div className={cn(
        'flex-1 flex items-center justify-center',
        settings?.theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-white'
      )}>
        <div className="text-center space-y-4">
          <div className={cn(
            'text-6xl mb-4',
            settings?.theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
          )}>
            📝
          </div>
          <div className="space-y-2">
            <h3 className={cn(
              'text-xl font-bold',
              settings?.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            )}>
              No Editor Open
            </h3>
            <p className={cn(
              'text-sm',
              settings?.theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            )}>
              Select a file from Explorer or open a Template
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Single editor group
  if (editorGroups.length === 1) {
    const group = editorGroups[0];
    const activeTab = group.tabs.find(t => t.id === group.activeTabId);

    if (!activeTab) return null;

    return (
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={
            activeTab.language === 'cpp' ? 'cpp' :
            activeTab.language === 'arduino' ? 'cpp' :
            activeTab.language
          }
          value={activeTab.content}
          onChange={(value) => {
            if (value !== undefined) {
              updateTabContent(group.id, activeTab.id, value);
            }
          }}
          theme={getMonacoTheme()}
          options={getEditorOptions()}
        />
      </div>
    );
  }

  // Multiple editor groups (split view)
  return (
    <PanelGroup direction="horizontal" className="flex-1">
      {editorGroups.map((group, index) => {
        const activeTab = group.tabs.find(t => t.id === group.activeTabId);
        const isActive = group.id === activeGroupId;

        return (
          <>
            <Panel
              key={group.id}
              defaultSize={100 / editorGroups.length}
              minSize={20}
              className={cn(
                'relative',
                isActive && 'ring-2 ring-blue-500 ring-inset'
              )}
            >
              {activeTab ? (
                <Editor
                  height="100%"
                  language={
                    activeTab.language === 'cpp' ? 'cpp' :
                    activeTab.language === 'arduino' ? 'cpp' :
                    activeTab.language
                  }
                  value={activeTab.content}
                  onChange={(value) => {
                    if (value !== undefined) {
                      updateTabContent(group.id, activeTab.id, value);
                    }
                  }}
                  theme={getMonacoTheme()}
                  options={getEditorOptions()}
                />
              ) : (
                <div className={cn(
                  'flex items-center justify-center h-full',
                  settings?.theme === 'dark' ? 'bg-[#1E1E1E] text-gray-500' : 'bg-white text-gray-400'
                )}>
                  <p className="text-sm">No file open in this editor group</p>
                </div>
              )}
            </Panel>

            {/* Resize Handle */}
            {index < editorGroups.length - 1 && (
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
            )}
          </>
        );
      })}
    </PanelGroup>
  );
}
