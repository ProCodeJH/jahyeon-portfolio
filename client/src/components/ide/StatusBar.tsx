/**
 * Professional Status Bar
 * Bottom status line like VSCode
 */

import { useIDEStore } from '@/lib/ide-store';
import { Activity, GitBranch, Clock, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatusBar() {
  const { executionStatus, executionResult, activeTabId, tabs } = useIDEStore();

  const activeTab = tabs.find(t => t.id === activeTabId);

  const getStatusColor = () => {
    switch (executionStatus) {
      case 'running':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'compiling':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (executionStatus) {
      case 'running':
        return 'Running...';
      case 'success':
        return 'Execution Complete';
      case 'error':
        return 'Execution Failed';
      case 'compiling':
        return 'Compiling...';
      default:
        return 'Ready';
    }
  };

  return (
    <div className="h-6 bg-blue-600 text-white flex items-center justify-between px-4 text-xs">
      {/* Left Side - Status */}
      <div className="flex items-center gap-4">
        <div className={cn('flex items-center gap-1.5', getStatusColor())}>
          <Activity className={cn('w-3 h-3', executionStatus === 'running' && 'animate-pulse')} />
          <span className="font-medium">{getStatusText()}</span>
        </div>

        {executionResult && (
          <>
            {executionResult.executionTime !== undefined && (
              <div className="flex items-center gap-1.5 text-white/80">
                <Clock className="w-3 h-3" />
                <span>{executionResult.executionTime.toFixed(2)}s</span>
              </div>
            )}

            {executionResult.memoryUsed !== undefined && (
              <div className="flex items-center gap-1.5 text-white/80">
                <Database className="w-3 h-3" />
                <span>{executionResult.memoryUsed}MB</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Side - File Info */}
      <div className="flex items-center gap-4">
        {activeTab && (
          <>
            <div className="text-white/80">
              {activeTab.language.toUpperCase()}
            </div>
            <div className="text-white/80">
              UTF-8
            </div>
            <div className="text-white/80">
              Ln 1, Col 1
            </div>
          </>
        )}

        <div className="flex items-center gap-1.5 text-white/80">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
      </div>
    </div>
  );
}
