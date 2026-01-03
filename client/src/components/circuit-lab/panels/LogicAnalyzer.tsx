/**
 * Logic Analyzer Panel
 * Real-time signal visualization for circuit debugging
 */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Download,
  Settings,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface SignalChannel {
  id: string;
  name: string;
  type: 'digital' | 'analog' | 'pwm';
  color: string;
  visible: boolean;
  data: SignalSample[];
}

interface SignalSample {
  time: number; // microseconds
  value: number; // 0-1 for digital, 0-1023 for analog, 0-255 for PWM
  pwmDuty?: number;
}

interface LogicAnalyzerProps {
  channels?: SignalChannel[];
  isRunning?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  simulationTime?: number;
  className?: string;
}

// 한국어 UI 텍스트
const UI_TEXT = {
  title: '로직 분석기',
  start: '시작',
  stop: '정지',
  reset: '초기화',
  export: '내보내기',
  settings: '설정',
  channels: '채널',
  noChannels: '활성 채널이 없습니다',
  addChannel: '채널 추가',
  time: '시간',
  value: '값',
  zoomIn: '확대',
  zoomOut: '축소',
  timeScale: '시간 스케일',
  us: 'µs',
  ms: 'ms',
  s: '초',
  digital: '디지털',
  analog: '아날로그',
  pwm: 'PWM',
  high: 'HIGH',
  low: 'LOW',
};

// Default demo channels
const DEFAULT_CHANNELS: SignalChannel[] = [
  {
    id: 'd13',
    name: 'D13 (LED_BUILTIN)',
    type: 'digital',
    color: '#22c55e',
    visible: true,
    data: [],
  },
  {
    id: 'd12',
    name: 'D12',
    type: 'digital',
    color: '#3b82f6',
    visible: true,
    data: [],
  },
  {
    id: 'd11',
    name: 'D11 (PWM)',
    type: 'pwm',
    color: '#a855f7',
    visible: true,
    data: [],
  },
  {
    id: 'a0',
    name: 'A0',
    type: 'analog',
    color: '#f59e0b',
    visible: false,
    data: [],
  },
];

function generateDemoData(channels: SignalChannel[], duration: number): SignalChannel[] {
  return channels.map((channel) => {
    const samples: SignalSample[] = [];
    const sampleRate = 1000; // 1kHz sampling

    for (let t = 0; t < duration; t += 1000000 / sampleRate) {
      let value: number;

      if (channel.type === 'digital') {
        // Digital signal - square wave with some variation
        const period = channel.id === 'd13' ? 1000000 : 500000; // 1s or 0.5s period
        value = Math.floor(t / period) % 2;
      } else if (channel.type === 'pwm') {
        // PWM signal - varying duty cycle
        const pwmDuty = Math.floor(127.5 + 127.5 * Math.sin(t / 2000000));
        value = pwmDuty / 255;
        samples.push({ time: t, value, pwmDuty });
        continue;
      } else {
        // Analog signal - sine wave with noise
        value = 512 + 400 * Math.sin(t / 500000) + Math.random() * 50 - 25;
        value = Math.max(0, Math.min(1023, value));
      }

      samples.push({ time: t, value });
    }

    return { ...channel, data: samples };
  });
}

export function LogicAnalyzer({
  channels: initialChannels,
  isRunning = false,
  onStart,
  onStop,
  onReset,
  simulationTime = 0,
  className = '',
}: LogicAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [channels, setChannels] = useState<SignalChannel[]>(
    initialChannels || DEFAULT_CHANNELS
  );
  const [timeScale, setTimeScale] = useState(1000000); // 1 second view
  const [timeOffset, setTimeOffset] = useState(0);
  const [cursorTime, setCursorTime] = useState<number | null>(null);
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);

  // Generate demo data for visualization
  useEffect(() => {
    if (isRunning && !isPaused) {
      const interval = setInterval(() => {
        setChannels((prev) => generateDemoData(prev, simulationTime + 5000000));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRunning, isPaused, simulationTime]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 1;

    // Vertical grid lines (time)
    const timeGridStep = timeScale / 10;
    for (let t = 0; t <= timeScale; t += timeGridStep) {
      const x = (t / timeScale) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw channels
    const visibleChannels = channels.filter((c) => c.visible);
    const channelHeight = height / Math.max(1, visibleChannels.length);

    visibleChannels.forEach((channel, index) => {
      const y0 = index * channelHeight;
      const y1 = (index + 1) * channelHeight;
      const yMid = (y0 + y1) / 2;
      const yRange = channelHeight * 0.7;

      // Channel separator
      ctx.strokeStyle = '#3a3a5a';
      ctx.beginPath();
      ctx.moveTo(0, y1);
      ctx.lineTo(width, y1);
      ctx.stroke();

      // Channel label
      ctx.fillStyle = channel.color;
      ctx.font = '11px monospace';
      ctx.fillText(channel.name, 5, y0 + 15);

      // Draw signal
      if (channel.data.length > 1) {
        ctx.strokeStyle = channel.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const startTime = timeOffset;
        const endTime = timeOffset + timeScale;

        let lastX = 0;
        let lastY = yMid;

        channel.data.forEach((sample, i) => {
          if (sample.time < startTime || sample.time > endTime) return;

          const x = ((sample.time - startTime) / timeScale) * width;
          let y: number;

          if (channel.type === 'digital') {
            // Digital: step function
            y = yMid - (sample.value - 0.5) * yRange;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, lastY); // Horizontal line
              ctx.lineTo(x, y); // Vertical step
            }
          } else if (channel.type === 'analog') {
            // Analog: smooth line
            y = yMid - ((sample.value / 1023) - 0.5) * yRange;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          } else {
            // PWM: filled area representing duty cycle
            const duty = sample.pwmDuty ?? sample.value * 255;
            y = yMid - ((duty / 255) - 0.5) * yRange;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          lastX = x;
          lastY = y;
        });

        ctx.stroke();

        // Fill for PWM
        if (channel.type === 'pwm') {
          ctx.fillStyle = channel.color + '30';
          ctx.lineTo(lastX, yMid + yRange / 2);
          ctx.lineTo(0, yMid + yRange / 2);
          ctx.closePath();
          ctx.fill();
        }
      }
    });

    // Draw cursor
    if (cursorTime !== null) {
      const x = ((cursorTime - timeOffset) / timeScale) * width;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cursor time label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      const timeLabel = formatTime(cursorTime);
      ctx.fillText(timeLabel, x + 5, 12);
    }

    // Draw current simulation time marker
    if (simulationTime > 0) {
      const x = ((simulationTime - timeOffset) / timeScale) * width;
      if (x >= 0 && x <= width) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }
  }, [channels, timeScale, timeOffset, cursorTime, simulationTime]);

  // Format time for display
  const formatTime = (us: number): string => {
    if (us < 1000) return `${us}${UI_TEXT.us}`;
    if (us < 1000000) return `${(us / 1000).toFixed(1)}${UI_TEXT.ms}`;
    return `${(us / 1000000).toFixed(2)}${UI_TEXT.s}`;
  };

  // Handle mouse move for cursor
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = timeOffset + (x / rect.width) * timeScale;
      setCursorTime(time);
    },
    [timeOffset, timeScale]
  );

  const handleMouseLeave = () => setCursorTime(null);

  // Zoom controls
  const handleZoomIn = () => setTimeScale((prev) => Math.max(10000, prev / 2));
  const handleZoomOut = () => setTimeScale((prev) => Math.min(10000000, prev * 2));

  // Toggle channel visibility
  const toggleChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId ? { ...c, visible: !c.visible } : c
      )
    );
  };

  // Export data
  const handleExport = () => {
    const data = channels.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      data: c.data,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logic-analyzer-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-col h-full bg-[#1a1a2e] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#16162a] border-b border-[#2a2a4a]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-gray-200">
            {UI_TEXT.title}
          </span>
          <Badge
            variant="secondary"
            className={`h-5 text-[10px] ${
              isRunning
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {isRunning ? '녹화중' : '대기'}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {isRunning ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsPaused(!isPaused);
                if (!isPaused) onStop?.();
              }}
              className="h-7 px-2 text-yellow-400 hover:text-yellow-300"
            >
              <Pause className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStart}
              className="h-7 px-2 text-green-400 hover:text-green-300"
            >
              <Play className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-gray-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-4 bg-[#3a3a5a] mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-7 px-2 text-gray-400 hover:text-white"
            title={UI_TEXT.zoomIn}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-7 px-2 text-gray-400 hover:text-white"
            title={UI_TEXT.zoomOut}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="h-7 px-2 text-gray-400 hover:text-white"
            title={UI_TEXT.export}
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Channel list */}
      <div className="flex-shrink-0 border-b border-[#2a2a4a]">
        <ScrollArea className="max-h-24">
          <div className="flex flex-wrap gap-1 p-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => toggleChannel(channel.id)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                  channel.visible
                    ? 'bg-[#2a2a4a] text-white'
                    : 'bg-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: channel.visible ? channel.color : '#666' }}
                />
                <span>{channel.name}</span>
                {channel.visible ? (
                  <Eye className="w-3 h-3 text-gray-400" />
                ) : (
                  <EyeOff className="w-3 h-3 text-gray-600" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Waveform display */}
      <div ref={containerRef} className="flex-1 relative min-h-0">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Footer / Timeline */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16162a] border-t border-[#2a2a4a] text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>
            {UI_TEXT.timeScale}: {formatTime(timeScale)}
          </span>
          {cursorTime !== null && (
            <span className="text-blue-400">
              커서: {formatTime(cursorTime)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>현재: {formatTime(simulationTime)}</span>
          <span>
            {channels.filter((c) => c.visible).length}/{channels.length} {UI_TEXT.channels}
          </span>
        </div>
      </div>
    </div>
  );
}

export default LogicAnalyzer;
