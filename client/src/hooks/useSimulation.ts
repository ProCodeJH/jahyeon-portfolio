/**
 * useSimulation Hook
 * React hook for Circuit Simulator interaction
 *
 * Usage:
 * ```tsx
 * const sim = useSimulation();
 *
 * useEffect(() => {
 *   sim.initCircuit(myCircuit);
 * }, []);
 *
 * <button onClick={() => sim.run()}>Run</button>
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getRenderBridge, initRenderBridge } from '../lib/RenderBridge';
import type {
  CircuitDef,
  Wire,
  PinRef,
  PinState,
  SerialOutput,
  WorkerEvent,
} from '@circuit-sim/kernel/contracts';

export interface SimulationState {
  isInitialized: boolean;
  isRunning: boolean;
  time_us: number;
  fps: number;
  error: string | null;
}

export interface SimulationHook {
  // State
  state: SimulationState;
  pinStates: Map<string, PinState>;
  serialOutput: SerialOutput[];

  // Control
  init: (circuit: CircuitDef) => Promise<void>;
  run: () => void;
  pause: () => void;
  reset: () => void;
  step: (steps?: number) => void;

  // Interaction
  setPin: (pin: PinRef, value: number) => void;
  setSpeed: (speed: number) => void;
  updateComponent: (componentId: string, properties: Record<string, any>) => void;

  // Wire state
  getWireState: (wire: Wire) => {
    flow: 'off' | 'glow' | 'pulse' | 'pwm' | 'power';
    voltage: number;
    current: number;
  };

  // Utilities
  getPinState: (pin: PinRef) => PinState | null;
  getDebugInfo: () => any;
}

/**
 * useSimulation Hook
 */
export function useSimulation(): SimulationHook {
  const [state, setState] = useState<SimulationState>({
    isInitialized: false,
    isRunning: false,
    time_us: 0,
    fps: 0,
    error: null,
  });

  const [pinStates, setPinStates] = useState<Map<string, PinState>>(new Map());
  const [serialOutput, setSerialOutput] = useState<SerialOutput[]>([]);

  const bridgeRef = useRef(getRenderBridge());
  const mountedRef = useRef(true);

  // Initialize worker on mount
  useEffect(() => {
    let initialized = false;

    async function setup() {
      try {
        await initRenderBridge();
        if (mountedRef.current) {
          initialized = true;
          setState(prev => ({ ...prev, isInitialized: true }));
        }
      } catch (error) {
        console.error('[useSimulation] Initialization failed:', error);
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            error: `Failed to initialize: ${error}`,
          }));
        }
      }
    }

    setup();

    return () => {
      mountedRef.current = false;
      if (initialized) {
        bridgeRef.current.terminate();
      }
    };
  }, []);

  // Setup event listeners
  useEffect(() => {
    const bridge = bridgeRef.current;

    // State updates
    const handleStateUpdate = (event: WorkerEvent) => {
      if (!mountedRef.current) return;

      if (event.type === 'STATE_UPDATE') {
        const newPinStates = bridge.getAllPinStates();
        setPinStates(newPinStates);
        setState(prev => ({
          ...prev,
          time_us: bridge.getSimTime(),
        }));
      }
    };

    // Started/Paused
    const handleStarted = () => {
      if (!mountedRef.current) return;
      setState(prev => ({ ...prev, isRunning: true }));
    };

    const handlePaused = () => {
      if (!mountedRef.current) return;
      setState(prev => ({ ...prev, isRunning: false }));
    };

    // Stats
    const handleStats = (event: WorkerEvent) => {
      if (!mountedRef.current) return;
      if (event.data?.fps !== undefined) {
        setState(prev => ({ ...prev, fps: event.data!.fps }));
      }
    };

    // Serial output
    const handleSerial = (event: WorkerEvent) => {
      if (!mountedRef.current) return;
      if (event.data?.text !== undefined) {
        const output: SerialOutput = {
          timestamp_us: event.data.timestamp_us || 0,
          text: event.data.text,
        };
        setSerialOutput(prev => [...prev, output]);
      }
    };

    // Error
    const handleError = (event: WorkerEvent) => {
      if (!mountedRef.current) return;
      setState(prev => ({
        ...prev,
        error: event.data?.message || 'Unknown error',
      }));
    };

    // Register listeners
    bridge.on('STATE_UPDATE', handleStateUpdate);
    bridge.on('STARTED', handleStarted);
    bridge.on('PAUSED', handlePaused);
    bridge.on('STOPPED', handlePaused);
    bridge.on('STATS', handleStats);
    bridge.on('SERIAL', handleSerial);
    bridge.on('ERROR', handleError);

    return () => {
      bridge.off('STATE_UPDATE', handleStateUpdate);
      bridge.off('STARTED', handleStarted);
      bridge.off('PAUSED', handlePaused);
      bridge.off('STOPPED', handlePaused);
      bridge.off('STATS', handleStats);
      bridge.off('SERIAL', handleSerial);
      bridge.off('ERROR', handleError);
    };
  }, []);

  // Control functions
  const init = useCallback(async (circuit: CircuitDef) => {
    const bridge = bridgeRef.current;
    bridge.initCircuit(circuit);
    setSerialOutput([]); // Clear serial on new circuit
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const run = useCallback(() => {
    bridgeRef.current.run();
  }, []);

  const pause = useCallback(() => {
    bridgeRef.current.pause();
  }, []);

  const reset = useCallback(() => {
    bridgeRef.current.reset();
    setSerialOutput([]);
    setPinStates(new Map());
    setState(prev => ({
      ...prev,
      time_us: 0,
      error: null,
    }));
  }, []);

  const step = useCallback((steps: number = 1) => {
    bridgeRef.current.step(steps);
  }, []);

  const setPin = useCallback((pin: PinRef, value: number) => {
    bridgeRef.current.setPin(pin, value);
  }, []);

  const setSpeed = useCallback((speed: number) => {
    bridgeRef.current.setSpeed(speed);
  }, []);

  const updateComponent = useCallback((componentId: string, properties: Record<string, any>) => {
    bridgeRef.current.updateComponent(componentId, properties);
  }, []);

  const getWireState = useCallback((wire: Wire) => {
    return bridgeRef.current.getWireState(wire);
  }, []);

  const getPinState = useCallback((pin: PinRef) => {
    return bridgeRef.current.getPinState(pin);
  }, []);

  const getDebugInfo = useCallback(() => {
    return bridgeRef.current.getDebugInfo();
  }, []);

  return {
    state,
    pinStates,
    serialOutput,
    init,
    run,
    pause,
    reset,
    step,
    setPin,
    setSpeed,
    updateComponent,
    getWireState,
    getPinState,
    getDebugInfo,
  };
}

/**
 * useSerialMonitor Hook
 * Dedicated hook for Serial Monitor display
 */
export function useSerialMonitor() {
  const [output, setOutput] = useState<SerialOutput[]>([]);
  const bridgeRef = useRef(getRenderBridge());
  const mountedRef = useRef(true);

  useEffect(() => {
    const bridge = bridgeRef.current;

    const handleSerial = (event: WorkerEvent) => {
      if (!mountedRef.current) return;
      if (event.data?.text !== undefined) {
        const serialOutput: SerialOutput = {
          timestamp_us: event.data.timestamp_us || 0,
          text: event.data.text,
        };
        setOutput(prev => [...prev, serialOutput]);
      }
    };

    bridge.on('SERIAL', handleSerial);

    return () => {
      mountedRef.current = false;
      bridge.off('SERIAL', handleSerial);
    };
  }, []);

  const clear = useCallback(() => {
    setOutput([]);
  }, []);

  return {
    output,
    clear,
  };
}

/**
 * usePinMonitor Hook
 * Monitor specific pin states
 */
export function usePinMonitor(pins: PinRef[]) {
  const [states, setStates] = useState<Map<string, PinState>>(new Map());
  const bridgeRef = useRef(getRenderBridge());
  const mountedRef = useRef(true);

  useEffect(() => {
    const bridge = bridgeRef.current;

    const handleStateUpdate = () => {
      if (!mountedRef.current) return;

      const newStates = new Map<string, PinState>();
      for (const pin of pins) {
        const state = bridge.getPinState(pin);
        if (state) {
          const key = `${pin.component}:${pin.pin}`;
          newStates.set(key, state);
        }
      }
      setStates(newStates);
    };

    bridge.on('STATE_UPDATE', handleStateUpdate);

    return () => {
      mountedRef.current = false;
      bridge.off('STATE_UPDATE', handleStateUpdate);
    };
  }, [pins]);

  return states;
}
