/**
 * Professional Editor Tabs
 * VSCode-style with close, dirty indicator, and pinning
 */

import { useIDEStore } from '@/lib/ide-store';
import { X, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EditorTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab, pinTab } = useIDEStore();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5 bg-gray-50 border-b border-gray-200 px-2 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;

        return (
          <div
            key={tab.id}
            className={cn(
              'group flex items-center gap-2 px-3 py-2.5 min-w-[120px] max-w-[200px] cursor-pointer',
              'border-b-2 transition-all duration-150',
              isActive
                ? 'bg-white border-blue-500 text-blue-700'
                : 'border-transparent hover:bg-gray-100 text-gray-600'
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {/* Pin indicator */}
            {tab.isPinned && (
              <Pin className="w-3 h-3 text-gray-400" />
            )}

            {/* File name */}
            <span className="flex-1 text-sm truncate font-medium">
              {tab.name}
            </span>

            {/* Dirty indicator */}
            {tab.isDirty && !tab.isPinned && (
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            )}

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className={cn(
                'shrink-0 hover:bg-gray-200 rounded p-0.5 transition-opacity',
                'opacity-0 group-hover:opacity-100',
                isActive && 'opacity-100'
              )}
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
