import * as React from 'react';
import { cn } from './utils';

export interface SerialMonitorProps {
  output: string[];
  className?: string;
  onClear?: () => void;
}

export function SerialMonitor({ output, className, onClear }: SerialMonitorProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <h3 className="font-semibold text-sm">Serial Monitor</h3>
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-background"
      >
        {output.length === 0 ? (
          <div className="text-muted-foreground italic">
            No output yet. Serial data will appear here.
          </div>
        ) : (
          output.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
