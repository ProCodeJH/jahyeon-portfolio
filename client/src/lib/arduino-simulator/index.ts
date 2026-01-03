/**
 * =====================================================
 * Enterprise Arduino Simulator - Main Entry Point
 * =====================================================
 *
 * 이 파일은 전체 Arduino 시뮬레이터의 public API를 노출합니다.
 *
 * 사용법:
 * ```ts
 * import { ArduinoSimulator } from '@/lib/arduino-simulator';
 *
 * const simulator = new ArduinoSimulator('UNO');
 * simulator.loadCode(arduinoCode);
 * simulator.start();
 * ```
 */

// Core types
export * from './core/types';

// Core modules
export { ArduinoRuntime, createArduinoRuntime } from './core/ArduinoRuntime';
export { BOARD_SPECS, getBoardSpec, getPinDefinition, isPWMPin, isInterruptPin, getAnalogPinNumber } from './core/BoardSpecs';

// Compiler
export { ArduinoCompiler, createArduinoCompiler } from './compiler/ArduinoCompiler';

// GPIO Engine
export { GPIOEngine, createGPIOEngine } from './gpio/GPIOEngine';
export type {
  LEDState,
  ButtonState,
  PotentiometerState,
  ServoState,
  UltrasonicState,
  TemperatureSensorState,
  PhotoresistorState,
  BuzzerState,
  MotorState,
  ComponentState,
  GPIOBinding,
} from './gpio/GPIOEngine';

// ============================================
// MAIN SIMULATOR CLASS
// ============================================

import { ArduinoRuntime } from './core/ArduinoRuntime';
import { ArduinoCompiler } from './compiler/ArduinoCompiler';
import { GPIOEngine, ComponentState, GPIOBinding } from './gpio/GPIOEngine';
import {
  BoardType,
  SimulationState,
  SimulationStats,
  CompileResult,
  SimulationError,
  PinRuntimeState,
  SimulationSpeed,
} from './core/types';

export interface SimulatorCallbacks {
  onStateChange?: (state: SimulationState, stats: SimulationStats) => void;
  onSerialOutput?: (data: string) => void;
  onPinChange?: (pinId: number, state: PinRuntimeState) => void;
  onComponentChange?: (componentId: string, state: ComponentState) => void;
  onError?: (error: SimulationError) => void;
  onCompile?: (result: CompileResult) => void;
}

/**
 * Enterprise Arduino Simulator
 *
 * 통합 시뮬레이터 클래스로, 다음을 제공합니다:
 * - Arduino 코드 컴파일
 * - 시뮬레이션 실행
 * - GPIO 상태 관리
 * - 3D 컴포넌트 바인딩
 */
export class ArduinoSimulator {
  private runtime: ArduinoRuntime;
  private compiler: ArduinoCompiler;
  private gpioEngine: GPIOEngine;
  private callbacks: SimulatorCallbacks = {};

  constructor(boardType: BoardType = 'UNO') {
    this.runtime = new ArduinoRuntime(boardType);
    this.compiler = new ArduinoCompiler(this.runtime);
    this.gpioEngine = new GPIOEngine(this.runtime);

    this.setupInternalCallbacks();
  }

  // ============================================
  // SETUP
  // ============================================

  private setupInternalCallbacks(): void {
    this.runtime.onStateChange((state, stats) => {
      this.callbacks.onStateChange?.(state, stats);
    });

    this.runtime.onSerialOutput((data) => {
      this.callbacks.onSerialOutput?.(data);
    });

    this.runtime.onPinChange((pinId, state) => {
      this.callbacks.onPinChange?.(pinId, state);
    });

    this.runtime.onError((error) => {
      this.callbacks.onError?.(error);
    });

    this.gpioEngine.onStateChange((componentId, state) => {
      this.callbacks.onComponentChange?.(componentId, state);
    });
  }

  // ============================================
  // CODE OPERATIONS
  // ============================================

  /**
   * Arduino 코드를 컴파일합니다.
   */
  public compile(code: string): CompileResult {
    const result = this.compiler.compile(code);
    this.callbacks.onCompile?.(result);

    if (result.success && result.output) {
      this.runtime.loadProgram(result.output);
    }

    return result;
  }

  /**
   * 코드를 로드하고 컴파일합니다.
   */
  public loadCode(code: string): CompileResult {
    return this.compile(code);
  }

  // ============================================
  // SIMULATION CONTROL
  // ============================================

  /**
   * 시뮬레이션을 시작합니다.
   */
  public async start(): Promise<void> {
    this.gpioEngine.start();
    await this.runtime.start();
  }

  /**
   * 시뮬레이션을 일시 정지합니다.
   */
  public pause(): void {
    this.runtime.pause();
  }

  /**
   * 시뮬레이션을 재개합니다.
   */
  public resume(): void {
    this.runtime.resume();
  }

  /**
   * 시뮬레이션을 정지합니다.
   */
  public stop(): void {
    this.runtime.stop();
    this.gpioEngine.stop();
  }

  /**
   * 시뮬레이션을 리셋합니다.
   */
  public reset(): void {
    this.runtime.reset();
  }

  /**
   * 시뮬레이션 속도를 설정합니다.
   */
  public setSpeed(speed: SimulationSpeed): void {
    this.runtime.setSimulationSpeed(speed);
  }

  // ============================================
  // COMPONENT BINDING
  // ============================================

  /**
   * 3D 컴포넌트와 GPIO를 바인딩합니다.
   */
  public bindComponent(binding: GPIOBinding): void {
    this.gpioEngine.bindComponent(binding);
  }

  /**
   * 컴포넌트 바인딩을 해제합니다.
   */
  public unbindComponent(componentId: string): void {
    this.gpioEngine.unbindComponent(componentId);
  }

  // ============================================
  // INPUT SIMULATION
  // ============================================

  /**
   * 버튼을 누릅니다.
   */
  public pressButton(componentId: string): void {
    this.gpioEngine.pressButton(componentId);
  }

  /**
   * 버튼을 뗍니다.
   */
  public releaseButton(componentId: string): void {
    this.gpioEngine.releaseButton(componentId);
  }

  /**
   * 가변저항 값을 설정합니다.
   */
  public setPotentiometer(componentId: string, value: number): void {
    this.gpioEngine.setPotentiometerValue(componentId, value);
  }

  /**
   * 온도 센서 값을 설정합니다.
   */
  public setTemperature(componentId: string, celsius: number): void {
    this.gpioEngine.setTemperature(componentId, celsius);
  }

  /**
   * 조도 센서 값을 설정합니다.
   */
  public setLightLevel(componentId: string, value: number): void {
    this.gpioEngine.setLightLevel(componentId, value);
  }

  /**
   * 초음파 센서 거리를 설정합니다.
   */
  public setUltrasonicDistance(componentId: string, cm: number): void {
    this.gpioEngine.setUltrasonicDistance(componentId, cm);
  }

  /**
   * 시리얼 입력을 전송합니다.
   */
  public sendSerialInput(data: string): void {
    this.runtime.sendSerialInput(data);
  }

  // ============================================
  // STATE ACCESS
  // ============================================

  /**
   * 현재 시뮬레이션 상태를 반환합니다.
   */
  public getState(): SimulationState {
    return this.runtime.getSimulationState();
  }

  /**
   * 시뮬레이션 통계를 반환합니다.
   */
  public getStats(): SimulationStats {
    return this.runtime.getSimulationStats();
  }

  /**
   * 핀 상태를 반환합니다.
   */
  public getPinState(pinId: number): PinRuntimeState | undefined {
    return this.runtime.getPinState(pinId);
  }

  /**
   * 모든 핀 상태를 반환합니다.
   */
  public getAllPinStates(): Map<number, PinRuntimeState> {
    return this.runtime.getAllPinStates();
  }

  /**
   * 컴포넌트 상태를 반환합니다.
   */
  public getComponentState(componentId: string): ComponentState | undefined {
    return this.gpioEngine.getComponentState(componentId);
  }

  /**
   * 시뮬레이션 시간을 반환합니다 (마이크로초).
   */
  public getSimulationTime(): number {
    return this.runtime.getSimulationTime();
  }

  /**
   * 런타임 인스턴스를 반환합니다.
   */
  public getRuntime(): ArduinoRuntime {
    return this.runtime;
  }

  /**
   * GPIO 엔진 인스턴스를 반환합니다.
   */
  public getGPIOEngine(): GPIOEngine {
    return this.gpioEngine;
  }

  // ============================================
  // CALLBACKS
  // ============================================

  /**
   * 콜백을 설정합니다.
   */
  public setCallbacks(callbacks: SimulatorCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * 시뮬레이터를 정리합니다.
   */
  public dispose(): void {
    this.stop();
    this.gpioEngine.dispose();
  }
}

// Export factory function
export function createSimulator(boardType: BoardType = 'UNO'): ArduinoSimulator {
  return new ArduinoSimulator(boardType);
}
