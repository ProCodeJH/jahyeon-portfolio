/**
 * Logic Analyzer UI Component
 * Visual interface for signal capture and analysis
 *
 * Features:
 * - Channel configuration panel
 * - Trigger setup (EDGE/LEVEL/PATTERN)
 * - Timeline waveform display
 * - Measurement tools
 * - Export buttons (VCD/CSV)
 */

import { useState, useRef, useEffect } from 'react';
import type {
  AnalogChannel,
  Trigger,
  Sample,
  PinRef,
} from '@circuit-sim/kernel/contracts';

interface LogicAnalyzerUIProps {
  onAddChannel: (channel: AnalogChannel) => void;
  onRemoveChannel: (channelId: string) => void;
  onSetTrigger: (trigger: Trigger) => void;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  onExportVCD: () => string;
  onExportCSV: () => string;
  channels: AnalogChannel[];
  samples: Sample[];
  isRunning: boolean;
  sampleCount: number;
}

export function LogicAnalyzerUI({
  onAddChannel,
  onRemoveChannel,
  onSetTrigger,
  onStart,
  onStop,
  onClear,
  onExportVCD,
  onExportCSV,
  channels,
  samples,
  isRunning,
  sampleCount,
}: LogicAnalyzerUIProps) {
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showTriggerConfig, setShowTriggerConfig] = useState(false);
  const [triggerType, setTriggerType] = useState<'EDGE' | 'LEVEL' | 'PATTERN'>('EDGE');
  const [triggerChannel, setTriggerChannel] = useState<string>('');
  const [triggerEdge, setTriggerEdge] = useState<'RISING' | 'FALLING' | 'BOTH'>('RISING');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw waveforms on canvas
  useEffect(() => {
    if (!canvasRef.current || samples.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;

    // Vertical grid lines (time)
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal grid lines (channels)
    const channelHeight = canvas.height / Math.max(channels.length, 1);
    for (let i = 0; i <= channels.length; i++) {
      const y = i * channelHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw waveforms
    if (samples.length < 2) return;

    const timeRange = samples[samples.length - 1].time_us - samples[0].time_us;
    const timeScale = canvas.width / timeRange;

    channels.forEach((channel, channelIndex) => {
      const y0 = channelIndex * channelHeight + channelHeight * 0.8;
      const y1 = channelIndex * channelHeight + channelHeight * 0.2;

      ctx.strokeStyle = channel.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];
        const x = (sample.time_us - samples[0].time_us) * timeScale;
        const value = sample.values[channelIndex] || 0;
        const y = value === 1 ? y1 : y0;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Draw vertical edge
          const prevValue = samples[i - 1].values[channelIndex] || 0;
          if (value !== prevValue) {
            const prevX = (samples[i - 1].time_us - samples[0].time_us) * timeScale;
            const prevY = prevValue === 1 ? y1 : y0;
            ctx.lineTo(prevX, prevY);
            ctx.lineTo(prevX, y);
          }
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Draw channel label
      ctx.fillStyle = channel.color;
      ctx.font = '12px monospace';
      ctx.fillText(channel.name, 5, channelIndex * channelHeight + 15);
    });
  }, [samples, channels]);

  const handleAddChannel = () => {
    const newChannel: AnalogChannel = {
      id: `ch${channels.length + 1}`,
      pin: { component: 'arduino-1', pin: 'D2' }, // Default pin
      name: `Channel ${channels.length + 1}`,
      color: getChannelColor(channels.length),
    };
    onAddChannel(newChannel);
    setShowAddChannel(false);
  };

  const handleSetTrigger = () => {
    if (!triggerChannel) {
      alert('Please select a trigger channel');
      return;
    }

    const trigger: Trigger = {
      type: triggerType,
      channel: triggerChannel,
      condition: {},
    };

    if (triggerType === 'EDGE') {
      trigger.condition.edge = triggerEdge;
    } else if (triggerType === 'LEVEL') {
      trigger.condition.level = triggerEdge === 'RISING' ? 'HIGH' : 'LOW';
    }

    onSetTrigger(trigger);
    setShowTriggerConfig(false);
  };

  const handleExport = (format: 'vcd' | 'csv') => {
    const data = format === 'vcd' ? onExportVCD() : onExportCSV();
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logic_capture.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="logic-analyzer">
      {/* Control Bar */}
      <div className="analyzer-controls">
        <button
          onClick={isRunning ? onStop : onStart}
          className={isRunning ? 'btn-stop' : 'btn-start'}
        >
          {isRunning ? '⏸️ Stop' : '▶️ Start'}
        </button>
        <button onClick={onClear} className="btn-secondary">
          🗑️ Clear
        </button>
        <button onClick={() => setShowAddChannel(true)} className="btn-secondary">
          ➕ Add Channel
        </button>
        <button onClick={() => setShowTriggerConfig(true)} className="btn-secondary">
          ⚡ Trigger
        </button>
        <button onClick={() => handleExport('vcd')} className="btn-secondary">
          💾 VCD
        </button>
        <button onClick={() => handleExport('csv')} className="btn-secondary">
          📊 CSV
        </button>

        <div className="status-text">
          Samples: {sampleCount} | {isRunning ? '🟢 Capturing' : '🔴 Stopped'}
        </div>
      </div>

      {/* Channel List */}
      <div className="channel-list">
        {channels.map(channel => (
          <div key={channel.id} className="channel-item">
            <div className="channel-color" style={{ background: channel.color }} />
            <span className="channel-name">{channel.name}</span>
            <span className="channel-pin">
              {channel.pin.component}:{channel.pin.pin}
            </span>
            <button
              onClick={() => onRemoveChannel(channel.id)}
              className="btn-remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Waveform Canvas */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={400}
        className="waveform-canvas"
      />

      {/* Add Channel Modal */}
      {showAddChannel && (
        <div className="modal-overlay" onClick={() => setShowAddChannel(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Add Channel</h3>
            <p>New channel will be added with default settings</p>
            <div className="modal-buttons">
              <button onClick={handleAddChannel} className="btn-primary">
                Add
              </button>
              <button onClick={() => setShowAddChannel(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Config Modal */}
      {showTriggerConfig && (
        <div className="modal-overlay" onClick={() => setShowTriggerConfig(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Configure Trigger</h3>

            <label>
              Type:
              <select
                value={triggerType}
                onChange={e => setTriggerType(e.target.value as any)}
              >
                <option value="EDGE">Edge</option>
                <option value="LEVEL">Level</option>
                <option value="PATTERN">Pattern</option>
              </select>
            </label>

            <label>
              Channel:
              <select
                value={triggerChannel}
                onChange={e => setTriggerChannel(e.target.value)}
              >
                <option value="">Select channel...</option>
                {channels.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </label>

            {triggerType === 'EDGE' && (
              <label>
                Edge:
                <select
                  value={triggerEdge}
                  onChange={e => setTriggerEdge(e.target.value as any)}
                >
                  <option value="RISING">Rising</option>
                  <option value="FALLING">Falling</option>
                  <option value="BOTH">Both</option>
                </select>
              </label>
            )}

            <div className="modal-buttons">
              <button onClick={handleSetTrigger} className="btn-primary">
                Set Trigger
              </button>
              <button onClick={() => setShowTriggerConfig(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .logic-analyzer {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
          background: #1a1a1a;
          border-radius: 8px;
        }

        .analyzer-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          padding: 1rem;
          background: #2a2a2a;
          border-radius: 6px;
        }

        .btn-start,
        .btn-stop,
        .btn-primary,
        .btn-secondary,
        .btn-remove {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-start {
          background: #00ff00;
          color: #0a0a0a;
          font-weight: 600;
        }

        .btn-stop {
          background: #ff4444;
          color: white;
          font-weight: 600;
        }

        .btn-primary {
          background: #00ffff;
          color: #0a0a0a;
          font-weight: 600;
        }

        .btn-secondary {
          background: #3a3a3a;
          color: #e0e0e0;
          border: 1px solid #555;
        }

        .btn-secondary:hover {
          background: #4a4a4a;
        }

        .btn-remove {
          background: #ff4444;
          color: white;
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
        }

        .status-text {
          margin-left: auto;
          color: #e0e0e0;
          font-size: 0.9rem;
        }

        .channel-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .channel-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: #2a2a2a;
          border-radius: 4px;
        }

        .channel-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }

        .channel-name {
          font-weight: 600;
          color: #e0e0e0;
        }

        .channel-pin {
          color: #888;
          font-size: 0.85rem;
          font-family: monospace;
        }

        .waveform-canvas {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid #333;
          border-radius: 4px;
          cursor: crosshair;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #2a2a2a;
          padding: 2rem;
          border-radius: 8px;
          min-width: 400px;
          max-width: 600px;
        }

        .modal-content h3 {
          margin: 0 0 1.5rem;
          color: #00ffff;
        }

        .modal-content label {
          display: block;
          margin-bottom: 1rem;
          color: #e0e0e0;
        }

        .modal-content select {
          width: 100%;
          padding: 0.5rem;
          margin-top: 0.5rem;
          background: #1a1a1a;
          color: #e0e0e0;
          border: 1px solid #444;
          border-radius: 4px;
        }

        .modal-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
}

// Utility: Get channel color by index
function getChannelColor(index: number): string {
  const colors = [
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#ff8800', // Orange
    '#8800ff', // Purple
  ];
  return colors[index % colors.length];
}
