/**
 * Professional Command Palette
 * Ctrl+K / Cmd+K to open - like VSCode
 */

import { useState, useEffect } from 'react';
import { useIDEStore } from '@/lib/ide-store';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Search, Play, Square, RotateCcw, Share2, FileCode, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Command {
  id: string;
  name: string;
  description: string;
  icon: any;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    toggleCommandPalette,
    toggleShareDialog,
    toggleTemplateGallery,
    setExecutionStatus,
  } = useIDEStore();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    {
      id: 'run',
      name: 'Run Code',
      description: 'Execute current file',
      icon: Play,
      action: () => {
        setExecutionStatus('running');
        toggleCommandPalette();
      },
      shortcut: 'Ctrl+Enter',
    },
    {
      id: 'stop',
      name: 'Stop Execution',
      description: 'Stop running code',
      icon: Square,
      action: () => {
        setExecutionStatus('idle');
        toggleCommandPalette();
      },
    },
    {
      id: 'share',
      name: 'Share Code',
      description: 'Get shareable link',
      icon: Share2,
      action: () => {
        toggleCommandPalette();
        toggleShareDialog();
      },
      shortcut: 'Ctrl+S',
    },
    {
      id: 'templates',
      name: 'Browse Templates',
      description: 'Open template gallery',
      icon: FileCode,
      action: () => {
        toggleCommandPalette();
        toggleTemplateGallery();
      },
      shortcut: 'Ctrl+T',
    },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filteredCommands, selectedIndex]);

  // Global keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        setSearch('');
        setSelectedIndex(0);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggleCommandPalette]);

  return (
    <Dialog open={isCommandPaletteOpen} onOpenChange={toggleCommandPalette}>
      <DialogContent className="p-0 max-w-2xl top-[20%] translate-y-0">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
            autoFocus
          />
          <kbd className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-300">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No commands found
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => {
                const Icon = command.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={command.id}
                    onClick={command.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-4 px-4 py-3 text-left transition-colors',
                      isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {command.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {command.description}
                      </div>
                    </div>

                    {command.shortcut && (
                      <kbd className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-300 font-mono">
                        {command.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Tip */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Execute</span>
          </div>
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[10px]">Ctrl+K</kbd> to toggle</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
