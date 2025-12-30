/**
 * Logic Analyzer
 * Captures and analyzes digital/analog signals from circuit pins
 *
 * Features:
 * - Multi-channel capture (up to 16 channels)
 * - Configurable triggers (EDGE, LEVEL, PATTERN)
 * - Circular buffer with configurable size
 * - Timeline visualization data
 * - Export to VCD (Value Change Dump) and CSV formats
 * - Sample rate: Up to 1MHz virtual time
 */

import type {
  AnalogChannel,
  Trigger,
  Sample,
  LogicAnalyzer as ILogicAnalyzer,
  PinRef,
  PinState,
} from './contracts';

/**
 * Circular Buffer for samples
 */
class CircularBuffer<T> {
  private buffer: T[];
  private head: number = 0;
  private tail: number = 0;
  private size: number = 0;
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  push(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;

    if (this.size < this.capacity) {
      this.size++;
    } else {
      // Overwrite oldest
      this.head = (this.head + 1) % this.capacity;
    }
  }

  getAll(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.size; i++) {
      result.push(this.buffer[(this.head + i) % this.capacity]);
    }
    return result;
  }

  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  getSize(): number {
    return this.size;
  }

  isFull(): boolean {
    return this.size === this.capacity;
  }
}

/**
 * Logic Analyzer Implementation
 */
export class LogicAnalyzer implements ILogicAnalyzer {
  private channels: Map<string, AnalogChannel>;
  private buffer: CircularBuffer<Sample>;
  private trigger: Trigger | null;
  private isRunning: boolean;
  private isTriggered: boolean;
  private sampleRate_us: number; // Microseconds between samples
  private lastSampleTime_us: number;

  // State tracking for edge detection
  private lastValues: Map<string, number>;

  constructor(bufferSize: number = 10000, sampleRate_us: number = 10) {
    this.channels = new Map();
    this.buffer = new CircularBuffer<Sample>(bufferSize);
    this.trigger = null;
    this.isRunning = false;
    this.isTriggered = false;
    this.sampleRate_us = sampleRate_us;
    this.lastSampleTime_us = 0;
    this.lastValues = new Map();
  }

  // ==========================================================================
  // CHANNEL MANAGEMENT
  // ==========================================================================

  addChannel(channel: AnalogChannel): void {
    this.channels.set(channel.id, channel);
    this.lastValues.set(channel.id, 0);
    console.log(`[LogicAnalyzer] Added channel: ${channel.name}`);
  }

  removeChannel(channelId: string): void {
    this.channels.delete(channelId);
    this.lastValues.delete(channelId);
  }

  getChannels(): AnalogChannel[] {
    return Array.from(this.channels.values());
  }

  // ==========================================================================
  // TRIGGER CONFIGURATION
  // ==========================================================================

  setTrigger(trigger: Trigger): void {
    this.trigger = trigger;
    console.log(
      `[LogicAnalyzer] Trigger set: ${trigger.type} on channel ${trigger.channel}`
    );
  }

  clearTrigger(): void {
    this.trigger = null;
  }

  // ==========================================================================
  // CAPTURE CONTROL
  // ==========================================================================

  start(): void {
    this.isRunning = true;
    this.isTriggered = false;
    console.log('[LogicAnalyzer] Started capture');
  }

  stop(): void {
    this.isRunning = false;
    console.log('[LogicAnalyzer] Stopped capture');
  }

  clear(): void {
    this.buffer.clear();
    this.isTriggered = false;
    console.log('[LogicAnalyzer] Buffer cleared');
  }

  isCapturing(): boolean {
    return this.isRunning;
  }

  // ==========================================================================
  // SAMPLING
  // ==========================================================================

  /**
   * Sample all channels at current time
   * Called by SimEngine at regular intervals
   */
  sample(time_us: number, pinStates: Map<string, PinState>): void {
    if (!this.isRunning) return;

    // Check sample rate
    if (time_us - this.lastSampleTime_us < this.sampleRate_us) {
      return;
    }
    this.lastSampleTime_us = time_us;

    // Read values from all channels
    const values: number[] = [];
    const channelArray = Array.from(this.channels.values());

    for (const channel of channelArray) {
      const pinKey = this.pinKey(channel.pin);
      const pinState = pinStates.get(pinKey);

      if (pinState) {
        // Use digital state for logic analyzer (0 or 1)
        const value = pinState.digital === 1 ? 1 : 0;
        values.push(value);
      } else {
        values.push(0);
      }
    }

    // Check trigger
    if (!this.isTriggered && this.trigger) {
      if (this.checkTrigger(values)) {
        this.isTriggered = true;
        console.log(`[LogicAnalyzer] Triggered at ${time_us}µs`);
      } else {
        // Don't capture until triggered
        return;
      }
    }

    // Add sample to buffer
    this.buffer.push({
      time_us,
      values,
    });

    // Update last values for edge detection
    channelArray.forEach((channel, i) => {
      this.lastValues.set(channel.id, values[i]);
    });
  }

  /**
   * Check if trigger condition is met
   */
  private checkTrigger(values: number[]): boolean {
    if (!this.trigger) return true;

    const channelIndex = Array.from(this.channels.keys()).indexOf(this.trigger.channel);
    if (channelIndex === -1) return false;

    const currentValue = values[channelIndex];
    const lastValue = this.lastValues.get(this.trigger.channel) || 0;

    switch (this.trigger.type) {
      case 'EDGE':
        if (this.trigger.condition.edge === 'RISING') {
          return lastValue === 0 && currentValue === 1;
        } else if (this.trigger.condition.edge === 'FALLING') {
          return lastValue === 1 && currentValue === 0;
        } else if (this.trigger.condition.edge === 'BOTH') {
          return lastValue !== currentValue;
        }
        return false;

      case 'LEVEL':
        if (this.trigger.condition.level === 'HIGH') {
          return currentValue === 1;
        } else if (this.trigger.condition.level === 'LOW') {
          return currentValue === 0;
        }
        return false;

      case 'PATTERN':
        // Check if current values match pattern
        if (!this.trigger.condition.pattern) return false;
        return values.every((v, i) => {
          return this.trigger!.condition.pattern![i] === undefined ||
                 this.trigger!.condition.pattern![i] === v;
        });

      default:
        return false;
    }
  }

  // ==========================================================================
  // DATA ACCESS
  // ==========================================================================

  /**
   * Get samples in time range
   */
  getSamples(start_us: number, end_us: number): Sample[] {
    const allSamples = this.buffer.getAll();
    return allSamples.filter(
      s => s.time_us >= start_us && s.time_us <= end_us
    );
  }

  /**
   * Get all samples
   */
  getAllSamples(): Sample[] {
    return this.buffer.getAll();
  }

  /**
   * Get sample count
   */
  getSampleCount(): number {
    return this.buffer.getSize();
  }

  // ==========================================================================
  // EXPORT
  // ==========================================================================

  /**
   * Export to VCD (Value Change Dump) format
   * Standard format used by waveform viewers (GTKWave, etc.)
   */
  exportVCD(): string {
    const samples = this.buffer.getAll();
    if (samples.length === 0) return '';

    const channels = Array.from(this.channels.values());
    let vcd = '';

    // Header
    vcd += '$date\n';
    vcd += `  ${new Date().toISOString()}\n`;
    vcd += '$end\n';

    vcd += '$version\n';
    vcd += '  Circuit Simulator Logic Analyzer 1.0\n';
    vcd += '$end\n';

    vcd += '$timescale 1us $end\n';

    // Scope
    vcd += '$scope module logic $end\n';

    // Variable declarations (use ASCII symbols as identifiers)
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    channels.forEach((channel, i) => {
      const symbol = symbols[i % symbols.length];
      vcd += `$var wire 1 ${symbol} ${channel.name} $end\n`;
    });

    vcd += '$upscope $end\n';
    vcd += '$enddefinitions $end\n';

    // Initial values
    vcd += '$dumpvars\n';
    if (samples.length > 0) {
      samples[0].values.forEach((value, i) => {
        const symbol = symbols[i % symbols.length];
        vcd += `${value}${symbol}\n`;
      });
    }
    vcd += '$end\n';

    // Value changes
    let lastValues = samples[0]?.values || [];
    for (const sample of samples) {
      // Check for changes
      const changes = sample.values.filter((v, i) => v !== lastValues[i]);

      if (changes.length > 0) {
        vcd += `#${sample.time_us}\n`;
        sample.values.forEach((value, i) => {
          if (value !== lastValues[i]) {
            const symbol = symbols[i % symbols.length];
            vcd += `${value}${symbol}\n`;
          }
        });
        lastValues = [...sample.values];
      }
    }

    return vcd;
  }

  /**
   * Export to CSV format
   */
  exportCSV(): string {
    const samples = this.buffer.getAll();
    if (samples.length === 0) return '';

    const channels = Array.from(this.channels.values());
    let csv = '';

    // Header
    csv += 'Time (µs)';
    for (const channel of channels) {
      csv += `,${channel.name}`;
    }
    csv += '\n';

    // Data rows
    for (const sample of samples) {
      csv += sample.time_us.toString();
      for (const value of sample.values) {
        csv += `,${value}`;
      }
      csv += '\n';
    }

    return csv;
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get statistics for a channel
   */
  getChannelStats(channelId: string): {
    high: number;
    low: number;
    toggles: number;
    frequency_hz: number | null;
  } {
    const samples = this.buffer.getAll();
    const channelIndex = Array.from(this.channels.keys()).indexOf(channelId);

    if (channelIndex === -1 || samples.length === 0) {
      return { high: 0, low: 0, toggles: 0, frequency_hz: null };
    }

    let high = 0;
    let low = 0;
    let toggles = 0;
    let lastValue = samples[0].values[channelIndex];

    for (const sample of samples) {
      const value = sample.values[channelIndex];

      if (value === 1) high++;
      else low++;

      if (value !== lastValue) {
        toggles++;
        lastValue = value;
      }
    }

    // Calculate frequency (approximate from toggles)
    let frequency_hz = null;
    if (samples.length > 1 && toggles > 0) {
      const duration_s = (samples[samples.length - 1].time_us - samples[0].time_us) / 1000000;
      frequency_hz = toggles / (2 * duration_s); // Each cycle has 2 toggles
    }

    return { high, low, toggles, frequency_hz };
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  private pinKey(pin: PinRef): string {
    return `${pin.component}:${pin.pin}`;
  }

  /**
   * Get configuration
   */
  getConfig() {
    return {
      channels: this.channels.size,
      bufferSize: this.buffer.getSize(),
      sampleRate_us: this.sampleRate_us,
      isRunning: this.isRunning,
      isTriggered: this.isTriggered,
      trigger: this.trigger,
    };
  }

  /**
   * Set sample rate
   */
  setSampleRate(sampleRate_us: number): void {
    this.sampleRate_us = sampleRate_us;
  }
}
