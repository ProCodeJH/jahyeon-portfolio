'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useCircuitStore } from '@/store/circuitStore';
import { Trash2, Send, Download, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const BAUD_RATES = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];

export function SerialMonitor() {
  const { simulation, addSerialOutput, clearSerialOutput } = useCircuitStore();
  const [inputValue, setInputValue] = useState('');
  const [baudRate, setBaudRate] = useState(9600);
  const [autoscroll, setAutoscroll] = useState(true);
  const [timestamp, setTimestamp] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (autoscroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [simulation.serialOutput, autoscroll]);

  const handleSend = () => {
    if (inputValue.trim()) {
      addSerialOutput(`> ${inputValue}`);
      // Would send to AVR runtime here
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExport = () => {
    const content = simulation.serialOutput.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial_output_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (index: number): string => {
    // Simulated timestamp based on simulation time
    const ms = Math.floor(simulation.time * 1000) + index * 10;
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}.${(ms % 1000).toString().padStart(3, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-card border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium">Serial Monitor</h3>

          {/* Baud Rate Selector */}
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            className="px-2 py-1 text-xs bg-secondary rounded border-none outline-none"
          >
            {BAUD_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate} baud
              </option>
            ))}
          </select>

          {/* Status */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                simulation.isRunning ? 'bg-green-500' : 'bg-gray-500'
              )}
            />
            {simulation.isRunning ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className={cn(
              'p-1.5 rounded hover:bg-secondary',
              timestamp && 'text-primary'
            )}
            onClick={() => setTimestamp(!timestamp)}
            title="Toggle timestamps"
          >
            <span className="text-xs font-mono">T</span>
          </button>
          <button
            className={cn(
              'p-1.5 rounded hover:bg-secondary',
              autoscroll && 'text-primary'
            )}
            onClick={() => setAutoscroll(!autoscroll)}
            title={autoscroll ? 'Disable autoscroll' : 'Enable autoscroll'}
          >
            {autoscroll ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
          <button
            className="p-1.5 rounded hover:bg-secondary"
            onClick={handleExport}
            title="Export log"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-secondary hover:text-destructive"
            onClick={clearSerialOutput}
            title="Clear output"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-3 bg-[#0d0d14] font-mono text-sm"
      >
        {simulation.serialOutput.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            Serial output will appear here...
          </div>
        ) : (
          simulation.serialOutput.map((line, index) => (
            <div key={index} className="flex gap-3 hover:bg-white/5 px-1">
              {timestamp && (
                <span className="text-muted-foreground text-xs font-mono">
                  [{formatTimestamp(index)}]
                </span>
              )}
              <span
                className={cn(
                  'serial-output',
                  line.startsWith('>') ? 'text-blue-400' : 'text-green-400'
                )}
              >
                {line}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 p-2 border-t border-border">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send data to serial..."
          className="flex-1 px-3 py-2 bg-secondary rounded text-sm font-mono outline-none focus:ring-2 focus:ring-primary"
          disabled={!simulation.isRunning}
        />
        <select className="px-2 py-2 text-xs bg-secondary rounded border-none outline-none">
          <option value="nl">New Line</option>
          <option value="cr">Carriage Return</option>
          <option value="both">Both NL & CR</option>
          <option value="none">No line ending</option>
        </select>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          onClick={handleSend}
          disabled={!simulation.isRunning || !inputValue.trim()}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
