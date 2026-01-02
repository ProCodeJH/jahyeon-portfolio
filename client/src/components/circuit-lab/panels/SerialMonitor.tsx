/**
 * Serial Monitor Component
 * Real-time serial communication display
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Terminal,
  Trash2,
  Pause,
  Play,
  Send,
  Download,
  Clock,
  ChevronDown,
} from 'lucide-react';

interface SerialMessage {
  id: number;
  timestamp: number;
  content: string;
  type: 'input' | 'output' | 'error' | 'system';
}

interface SerialMonitorProps {
  output?: string;
  onSendInput?: (input: string) => void;
  baudRate?: number;
  onBaudRateChange?: (rate: number) => void;
  isConnected?: boolean;
}

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200];

export function SerialMonitor({
  output = '',
  onSendInput,
  baudRate = 9600,
  onBaudRateChange,
  isConnected = false,
}: SerialMonitorProps) {
  const [messages, setMessages] = useState<SerialMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);
  const lastOutputRef = useRef('');

  // Process output changes
  useEffect(() => {
    if (isPaused || output === lastOutputRef.current) return;

    // Find new content
    const newContent = output.slice(lastOutputRef.current.length);
    lastOutputRef.current = output;

    if (newContent) {
      // Split by newlines to create separate messages
      const lines = newContent.split('\n').filter(line => line.length > 0);

      const newMessages: SerialMessage[] = lines.map(line => ({
        id: messageIdRef.current++,
        timestamp: Date.now(),
        content: line,
        type: 'output' as const,
      }));

      setMessages(prev => [...prev, ...newMessages]);
    }
  }, [output, isPaused]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;

    // Add input message
    setMessages(prev => [
      ...prev,
      {
        id: messageIdRef.current++,
        timestamp: Date.now(),
        content: inputValue,
        type: 'input',
      },
    ]);

    onSendInput?.(inputValue);
    setInputValue('');
  }, [inputValue, onSendInput]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    lastOutputRef.current = '';
  };

  const handleExport = () => {
    const content = messages
      .map(m => {
        const time = new Date(m.timestamp).toISOString();
        const prefix = m.type === 'input' ? '>' : '<';
        return `[${time}] ${prefix} ${m.content}`;
      })
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial_log_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  const getMessageColor = (type: SerialMessage['type']) => {
    switch (type) {
      case 'input':
        return 'text-blue-400';
      case 'output':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'system':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">Serial Monitor</span>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
        </div>

        <div className="flex items-center gap-2">
          {/* Baud rate selector */}
          <select
            value={baudRate}
            onChange={(e) => onBaudRateChange?.(parseInt(e.target.value))}
            className="bg-[#3c3c3c] text-gray-300 text-xs px-2 py-1 rounded border-none outline-none"
          >
            {BAUD_RATES.map(rate => (
              <option key={rate} value={rate}>
                {rate} baud
              </option>
            ))}
          </select>

          <div className="w-px h-4 bg-[#3c3c3c]" />

          {/* Toolbar buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTimestamps(!showTimestamps)}
            className={`h-6 w-6 p-0 ${showTimestamps ? 'text-blue-400' : 'text-gray-400'} hover:text-white hover:bg-[#3c3c3c]`}
            title="Toggle timestamps"
          >
            <Clock className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`h-6 w-6 p-0 ${autoScroll ? 'text-blue-400' : 'text-gray-400'} hover:text-white hover:bg-[#3c3c3c]`}
            title="Auto-scroll"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className={`h-6 w-6 p-0 ${isPaused ? 'text-yellow-400' : 'text-gray-400'} hover:text-white hover:bg-[#3c3c3c]`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-[#3c3c3c]"
            title="Export log"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-[#3c3c3c]"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-auto font-mono text-xs p-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <span>Waiting for serial data...</span>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2 py-0.5 hover:bg-white/5">
              {showTimestamps && (
                <span className="text-gray-500 flex-shrink-0">
                  [{formatTimestamp(msg.timestamp)}]
                </span>
              )}
              <span className={`flex-shrink-0 ${msg.type === 'input' ? 'text-blue-500' : 'text-gray-500'}`}>
                {msg.type === 'input' ? '>' : '<'}
              </span>
              <span className={getMessageColor(msg.type)}>{msg.content}</span>
            </div>
          ))
        )}
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2 p-2 bg-[#252526] border-t border-[#3c3c3c]">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send command..."
          className="flex-1 h-8 bg-[#3c3c3c] border-none text-sm text-gray-200 placeholder:text-gray-500"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="h-8 px-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
