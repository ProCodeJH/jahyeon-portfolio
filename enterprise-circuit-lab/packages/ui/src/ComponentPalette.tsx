import * as React from 'react';
import { cn } from './utils';

export interface Component {
  id: string;
  name: string;
  type: string;
  icon: string;
}

export interface ComponentPaletteProps {
  components: Component[];
  onComponentSelect?: (component: Component) => void;
  className?: string;
}

export function ComponentPalette({
  components,
  onComponentSelect,
  className,
}: ComponentPaletteProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
        Components
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {components.map((component) => (
          <button
            key={component.id}
            onClick={() => onComponentSelect?.(component)}
            className="flex flex-col items-center p-3 bg-card hover:bg-accent rounded-lg border border-border transition-colors"
          >
            <span className="text-2xl mb-1">{component.icon}</span>
            <span className="text-xs text-center">{component.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
