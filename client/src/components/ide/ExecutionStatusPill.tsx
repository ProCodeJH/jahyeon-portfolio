/**
 * Professional Execution Status Pill
 * Shows Idle / Compiling / Running / Error / Success with time and memory
 */

import { useIDEStore } from '@/lib/ide-store';
import { Activity, Clock, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExecutionStatusPill() {
  const { executionStatus, executionResult } = useIDEStore();

  const getStatusConfig = () => {
    switch (executionStatus) {
      case 'idle':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: Activity,
          label: 'Idle',
          pulse: false,
        };
      case 'compiling':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          icon: Loader2,
          label: 'Compiling',
          pulse: true,
        };
      case 'running':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          icon: Loader2,
          label: 'Running',
          pulse: true,
        };
      case 'success':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          icon: CheckCircle,
          label: 'Success',
          pulse: false,
        };
      case 'error':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          icon: XCircle,
          label: 'Error',
          pulse: false,
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          icon: Activity,
          label: 'Idle',
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn('inline-flex items-center gap-3 px-4 py-2 rounded-full', config.bg, config.text)}>
      {/* Status Icon and Label */}
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4', config.pulse && 'animate-spin')} />
        <span className="font-bold text-sm">{config.label}</span>
      </div>

      {/* Execution Time */}
      {executionResult?.executionTime !== undefined && (
        <>
          <div className="w-px h-4 bg-current opacity-30" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span className="text-xs font-medium">
              {executionResult.executionTime.toFixed(2)}s
            </span>
          </div>
        </>
      )}

      {/* Memory Usage */}
      {executionResult?.memoryUsed !== undefined && (
        <>
          <div className="w-px h-4 bg-current opacity-30" />
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 opacity-70" />
            <span className="text-xs font-medium">
              {executionResult.memoryUsed}MB
            </span>
          </div>
        </>
      )}
    </div>
  );
}
