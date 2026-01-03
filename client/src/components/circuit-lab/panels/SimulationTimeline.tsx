/**
 * Simulation Timeline Panel
 * Visual timeline control for circuit simulation
 * 한국어 UI
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  FastForward,
  Rewind,
  Clock,
  Zap,
} from 'lucide-react';

interface TimelineEvent {
  time: number; // microseconds
  type: 'pin_change' | 'serial' | 'interrupt' | 'function_call';
  description: string;
  componentId?: string;
  pinId?: string;
}

interface SimulationTimelineProps {
  currentTime: number;
  isRunning: boolean;
  speed: number;
  events?: TimelineEvent[];
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onSeek?: (time: number) => void;
  onSpeedChange?: (speed: number) => void;
  className?: string;
}

// 한국어 UI 텍스트
const UI_TEXT = {
  title: '시뮬레이션 타임라인',
  play: '재생',
  pause: '일시정지',
  stop: '정지',
  speed: '속도',
  realtime: '실시간',
  time: '시간',
  elapsed: '경과 시간',
  events: '이벤트',
  noEvents: '이벤트 없음',
  us: 'µs',
  ms: 'ms',
  s: '초',
  min: '분',
  speedOptions: [
    { value: 0.1, label: '0.1x (느림)' },
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x (실시간)' },
    { value: 2, label: '2x' },
    { value: 5, label: '5x (빠름)' },
    { value: 10, label: '10x (최대)' },
  ],
  eventTypes: {
    pin_change: '핀 변경',
    serial: '시리얼 출력',
    interrupt: '인터럽트',
    function_call: '함수 호출',
  },
};

export function SimulationTimeline({
  currentTime,
  isRunning,
  speed,
  events = [],
  onPlay,
  onPause,
  onStop,
  onSeek,
  onSpeedChange,
  className = '',
}: SimulationTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewRange, setViewRange] = useState({ start: 0, end: 5000000 }); // 5 second view

  // Format time for display
  const formatTime = (us: number): string => {
    if (us < 1000) return `${us}${UI_TEXT.us}`;
    if (us < 1000000) return `${(us / 1000).toFixed(1)}${UI_TEXT.ms}`;
    if (us < 60000000) return `${(us / 1000000).toFixed(2)}${UI_TEXT.s}`;
    return `${Math.floor(us / 60000000)}:${((us % 60000000) / 1000000).toFixed(0).padStart(2, '0')}`;
  };

  // Format elapsed time (clock format)
  const formatElapsed = (us: number): string => {
    const totalSeconds = Math.floor(us / 1000000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((us % 1000000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  // Update view range to follow current time
  useEffect(() => {
    if (isRunning && currentTime > viewRange.end - 500000) {
      const range = viewRange.end - viewRange.start;
      setViewRange({
        start: currentTime - range * 0.2,
        end: currentTime + range * 0.8,
      });
    }
  }, [currentTime, isRunning, viewRange]);

  // Handle timeline click
  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      const time = viewRange.start + ratio * (viewRange.end - viewRange.start);
      onSeek?.(Math.max(0, time));
    },
    [viewRange, onSeek]
  );

  // Get event color
  const getEventColor = (type: TimelineEvent['type']): string => {
    switch (type) {
      case 'pin_change':
        return '#22c55e';
      case 'serial':
        return '#3b82f6';
      case 'interrupt':
        return '#ef4444';
      case 'function_call':
        return '#a855f7';
      default:
        return '#666666';
    }
  };

  // Calculate position on timeline
  const getTimelinePosition = (time: number): number => {
    return ((time - viewRange.start) / (viewRange.end - viewRange.start)) * 100;
  };

  // Visible events in current view
  const visibleEvents = events.filter(
    (e) => e.time >= viewRange.start && e.time <= viewRange.end
  );

  return (
    <div className={`flex flex-col bg-[#1a1a2e] ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#16162a] border-b border-[#2a2a4a]">
        <div className="flex items-center gap-3">
          {/* Play/Pause/Stop */}
          <div className="flex items-center gap-1 bg-[#252540] rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onStop}
              className="h-7 w-7 p-0 text-gray-400 hover:text-red-400"
              title={UI_TEXT.stop}
            >
              <Square className="w-3.5 h-3.5" />
            </Button>
            {isRunning ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPause}
                className="h-7 w-7 p-0 text-yellow-400 hover:text-yellow-300"
                title={UI_TEXT.pause}
              >
                <Pause className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPlay}
                className="h-7 w-7 p-0 text-green-400 hover:text-green-300"
                title={UI_TEXT.play}
              >
                <Play className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSpeedChange?.(Math.max(0.1, speed / 2))}
              className="h-7 w-7 p-0 text-gray-400 hover:text-white"
            >
              <Rewind className="w-3.5 h-3.5" />
            </Button>
            <select
              value={speed}
              onChange={(e) => onSpeedChange?.(parseFloat(e.target.value))}
              className="bg-[#252540] text-gray-300 text-xs px-2 py-1 rounded border-none outline-none"
            >
              {UI_TEXT.speedOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSpeedChange?.(Math.min(10, speed * 2))}
              className="h-7 w-7 p-0 text-gray-400 hover:text-white"
            >
              <FastForward className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Time Display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#252540] px-3 py-1 rounded-lg">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-lg font-mono text-white tabular-nums">
              {formatElapsed(currentTime)}
            </span>
          </div>

          {/* Status Indicator */}
          <Badge
            variant="secondary"
            className={`${
              isRunning
                ? 'bg-green-500/20 text-green-400 animate-pulse'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            <Zap className="w-3 h-3 mr-1" />
            {isRunning ? '실행 중' : '대기'}
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="relative h-16 mx-4 my-2 bg-[#0f0f1a] rounded-lg cursor-pointer overflow-hidden"
        onClick={handleTimelineClick}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 flex justify-between px-2">
          {[...Array(11)].map((_, i) => (
            <div key={i} className="relative h-full">
              <div className="w-px h-full bg-[#2a2a4a]" />
              <span className="absolute bottom-1 text-[9px] text-gray-600 -translate-x-1/2">
                {formatTime(viewRange.start + ((viewRange.end - viewRange.start) * i) / 10)}
              </span>
            </div>
          ))}
        </div>

        {/* Events markers */}
        {visibleEvents.map((event, i) => (
          <div
            key={i}
            className="absolute top-1 w-1.5 h-1.5 rounded-full transform -translate-x-1/2 transition-transform hover:scale-150"
            style={{
              left: `${getTimelinePosition(event.time)}%`,
              backgroundColor: getEventColor(event.type),
            }}
            title={`${UI_TEXT.eventTypes[event.type]}: ${event.description}`}
          />
        ))}

        {/* Current time indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 transform -translate-x-1/2 z-10"
          style={{
            left: `${Math.max(0, Math.min(100, getTimelinePosition(currentTime)))}%`,
          }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-red-500" />
        </div>

        {/* Progress fill */}
        <div
          className="absolute top-0 bottom-0 bg-blue-500/10"
          style={{
            width: `${Math.max(0, Math.min(100, getTimelinePosition(currentTime)))}%`,
          }}
        />
      </div>

      {/* Event List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="px-4 py-1 text-xs text-gray-500 border-b border-[#2a2a4a]">
          {UI_TEXT.events} ({visibleEvents.length})
        </div>
        <div className="h-20 overflow-y-auto px-4 py-2">
          {visibleEvents.length === 0 ? (
            <div className="text-xs text-gray-600 text-center py-2">
              {UI_TEXT.noEvents}
            </div>
          ) : (
            <div className="space-y-1">
              {visibleEvents.slice(-10).reverse().map((event, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 cursor-pointer"
                  onClick={() => onSeek?.(event.time)}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getEventColor(event.type) }}
                  />
                  <span className="font-mono text-gray-500 w-20 flex-shrink-0">
                    {formatTime(event.time)}
                  </span>
                  <span className="text-gray-500">{UI_TEXT.eventTypes[event.type]}</span>
                  <span className="truncate">{event.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SimulationTimeline;
