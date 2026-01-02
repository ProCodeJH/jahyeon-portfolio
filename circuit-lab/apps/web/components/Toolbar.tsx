'use client';

import React from 'react';
import {
  Play,
  Pause,
  Square,
  Upload,
  Download,
  Save,
  FolderOpen,
  Undo,
  Redo,
  Grid3X3,
  Tag,
  Zap,
  Settings,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { useCircuitStore } from '@/store/circuitStore';
import { cn } from '@/lib/utils';

export function Toolbar() {
  const {
    simulation,
    code,
    project,
    ui,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    setShowGrid,
    setShowLabels,
    setShowFlow,
    setCompiling,
    newProject,
  } = useCircuitStore();

  const handleCompile = async () => {
    setCompiling(true);
    // Compile would go here
    setTimeout(() => {
      useCircuitStore.getState().setCompileResult({
        success: true,
        hexData: new Uint8Array([0x00, 0x01, 0x02]),
      });
    }, 2000);
  };

  const handleRun = () => {
    if (simulation.isRunning) {
      if (simulation.isPaused) {
        startSimulation();
      } else {
        pauseSimulation();
      }
    } else {
      handleCompile().then(() => {
        startSimulation();
      });
    }
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2 pr-4 border-r border-border">
        <div className="w-8 h-8 rounded bg-arduino-teal flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-lg">Circuit Lab</span>
      </div>

      {/* File Operations */}
      <div className="flex items-center gap-1 px-2">
        <ToolbarButton icon={FolderOpen} tooltip="Open Project" onClick={() => {}} />
        <ToolbarButton icon={Save} tooltip="Save Project" onClick={() => {}} />
        <ToolbarButton icon={Download} tooltip="Export" onClick={() => {}} />
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Edit Operations */}
      <div className="flex items-center gap-1 px-2">
        <ToolbarButton icon={Undo} tooltip="Undo (Ctrl+Z)" onClick={() => {}} />
        <ToolbarButton icon={Redo} tooltip="Redo (Ctrl+Y)" onClick={() => {}} />
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Simulation Controls */}
      <div className="flex items-center gap-1 px-2">
        <ToolbarButton
          icon={simulation.isRunning && !simulation.isPaused ? Pause : Play}
          tooltip={simulation.isRunning ? (simulation.isPaused ? 'Resume' : 'Pause') : 'Run'}
          onClick={handleRun}
          active={simulation.isRunning && !simulation.isPaused}
          variant="primary"
        />
        <ToolbarButton
          icon={Square}
          tooltip="Stop"
          onClick={stopSimulation}
          disabled={!simulation.isRunning}
        />
        <ToolbarButton
          icon={Upload}
          tooltip="Compile & Upload"
          onClick={handleCompile}
          loading={code.isCompiling}
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded">
        <div
          className={cn(
            'status-dot',
            simulation.isRunning
              ? simulation.isPaused
                ? 'paused'
                : 'running'
              : code.isCompiling
              ? 'compiling'
              : 'stopped'
          )}
        />
        <span className="text-sm text-muted-foreground">
          {code.isCompiling
            ? 'Compiling...'
            : simulation.isRunning
            ? simulation.isPaused
              ? 'Paused'
              : 'Running'
            : 'Ready'}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* View Options */}
      <div className="flex items-center gap-1 px-2">
        <ToolbarButton
          icon={Grid3X3}
          tooltip="Show Grid"
          onClick={() => setShowGrid(!ui.showGrid)}
          active={ui.showGrid}
        />
        <ToolbarButton
          icon={Tag}
          tooltip="Show Labels"
          onClick={() => setShowLabels(!ui.showLabels)}
          active={ui.showLabels}
        />
        <ToolbarButton
          icon={Zap}
          tooltip="Show Current Flow"
          onClick={() => setShowFlow(!ui.showFlow)}
          active={ui.showFlow}
        />
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Settings & Help */}
      <div className="flex items-center gap-1">
        <ToolbarButton icon={Settings} tooltip="Settings" onClick={() => {}} />
        <ToolbarButton icon={HelpCircle} tooltip="Help" onClick={() => {}} />
      </div>

      {/* Project Name */}
      <div className="flex items-center gap-2 pl-4 border-l border-border">
        <span className="text-sm text-muted-foreground">{project.name}</span>
        {project.isDirty && (
          <span className="w-2 h-2 rounded-full bg-primary" title="Unsaved changes" />
        )}
      </div>
    </header>
  );
}

interface ToolbarButtonProps {
  icon: React.ElementType;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'primary';
}

function ToolbarButton({
  icon: Icon,
  tooltip,
  onClick,
  active = false,
  disabled = false,
  loading = false,
  variant = 'default',
}: ToolbarButtonProps) {
  return (
    <button
      className={cn(
        'toolbar-button',
        active && 'active',
        variant === 'primary' && !active && 'hover:text-green-400',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={onClick}
      disabled={disabled || loading}
      title={tooltip}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
    </button>
  );
}
