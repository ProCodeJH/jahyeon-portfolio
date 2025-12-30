/**
 * Enterprise-Grade Activity Bar
 * VSCode-style left icon bar
 */

import { useIDEStore } from '@/lib/ide-store';
import { ActivityBarItem } from '@/lib/ide-types';
import {
  FileCode,
  Search,
  GitBranch,
  Package,
  Settings as SettingsIcon,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActivityBarItemConfig {
  id: ActivityBarItem;
  icon: any;
  label: string;
  shortcut: string;
}

const ACTIVITY_ITEMS: ActivityBarItemConfig[] = [
  {
    id: 'explorer',
    icon: FileCode,
    label: 'Explorer',
    shortcut: 'Ctrl+Shift+E',
  },
  {
    id: 'search',
    icon: Search,
    label: 'Search',
    shortcut: 'Ctrl+Shift+F',
  },
  {
    id: 'git',
    icon: GitBranch,
    label: 'Source Control',
    shortcut: 'Ctrl+Shift+G',
  },
  {
    id: 'extensions',
    icon: Package,
    label: 'Extensions',
    shortcut: 'Ctrl+Shift+X',
  },
  {
    id: 'settings',
    icon: SettingsIcon,
    label: 'Settings',
    shortcut: 'Ctrl+,',
  },
];

export function ActivityBar() {
  const { activeActivityBarItem, setActiveActivityBarItem, settings, updateSettings } = useIDEStore();

  const handleItemClick = (itemId: ActivityBarItem) => {
    if (activeActivityBarItem === itemId) {
      // Toggle off if clicking the same item
      setActiveActivityBarItem('explorer');
    } else {
      setActiveActivityBarItem(itemId);
    }
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  return (
    <div className={cn(
      'w-12 flex flex-col items-center border-r transition-colors',
      settings.theme === 'dark'
        ? 'bg-[#1E1E1E] border-[#2D2D2D]'
        : 'bg-[#F3F3F3] border-gray-200'
    )}>
      {/* Activity Items */}
      <TooltipProvider delayDuration={300}>
        <div className="flex-1 flex flex-col items-center py-2 gap-1">
          {ACTIVITY_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeActivityBarItem === item.id;

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      'w-10 h-10 flex items-center justify-center rounded-lg transition-all relative group',
                      settings.theme === 'dark'
                        ? isActive
                          ? 'bg-[#37373D] text-white'
                          : 'text-[#CCCCCC] hover:bg-[#2A2D2E]'
                        : isActive
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-white/60'
                    )}
                  >
                    <Icon className="w-5 h-5" />

                    {/* Active Indicator */}
                    {isActive && (
                      <div className={cn(
                        'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r',
                        settings.theme === 'dark' ? 'bg-white' : 'bg-blue-600'
                      )} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex flex-col gap-1">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-xs text-gray-500">{item.shortcut}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col items-center pb-2 gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleTheme}
                className={cn(
                  'w-10 h-10 flex items-center justify-center rounded-lg transition-all',
                  settings.theme === 'dark'
                    ? 'text-[#CCCCCC] hover:bg-[#2A2D2E]'
                    : 'text-gray-600 hover:bg-white/60'
                )}
              >
                {settings.theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>Toggle Theme</span>
            </TooltipContent>
          </Tooltip>

          {/* User Profile */}
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
            settings.theme === 'dark'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-500 text-white'
          )}>
            U
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
