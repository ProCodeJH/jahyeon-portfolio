/**
 * =====================================================
 * Enterprise GPIO / Peripheral Engine
 * =====================================================
 *
 * GPIO 상태와 3D 시뮬레이션을 연결하는 중앙 허브입니다.
 *
 * 기능:
 * - LED 밝기/색상 제어
 * - 버튼/스위치 입력 처리
 * - 센서 값 시뮬레이션
 * - PWM 신호 생성
 * - 3D 메시와 실시간 바인딩
 */

import { PinRuntimeState, ComponentType, PinState } from '../core/types';
import { ArduinoRuntime } from '../core/ArduinoRuntime';

// ============================================
// COMPONENT STATE TYPES
// ============================================

export interface LEDState {
  isOn: boolean;
  brightness: number; // 0-1
  color: string;
  pwmDuty: number; // 0-255
  blinkFrequency?: number;
}

export interface ButtonState {
  isPressed: boolean;
  lastPressTime: number;
  debounceMs: number;
}

export interface PotentiometerState {
  value: number; // 0-1023
  percentage: number; // 0-100
  rotation: number; // degrees
}

export interface ServoState {
  angle: number; // 0-180
  targetAngle: number;
  speed: number; // degrees per second
  isMoving: boolean;
}

export interface UltrasonicState {
  distance: number; // cm
  isActive: boolean;
  lastTriggerTime: number;
}

export interface TemperatureSensorState {
  temperature: number; // Celsius
  voltage: number; // 0-5V
  analogValue: number; // 0-1023
}

export interface PhotoresistorState {
  lightLevel: number; // 0-1023
  resistance: number; // Ohms
  luxApprox: number;
}

export interface BuzzerState {
  isOn: boolean;
  frequency: number; // Hz
  volume: number; // 0-1
}

export interface MotorState {
  speed: number; // -255 to 255
  direction: 'CW' | 'CCW' | 'STOPPED';
  rpm: number;
}

export type ComponentState =
  | { type: 'LED'; state: LEDState }
  | { type: 'BUTTON'; state: ButtonState }
  | { type: 'POTENTIOMETER'; state: PotentiometerState }
  | { type: 'SERVO'; state: ServoState }
  | { type: 'ULTRASONIC'; state: UltrasonicState }
  | { type: 'TEMPERATURE'; state: TemperatureSensorState }
  | { type: 'PHOTORESISTOR'; state: PhotoresistorState }
  | { type: 'BUZZER'; state: BuzzerState }
  | { type: 'MOTOR'; state: MotorState };

// ============================================
// GPIO BINDING
// ============================================

export interface GPIOBinding {
  componentId: string;
  componentType: ComponentType;
  pins: {
    pinId: number;
    role: 'ANODE' | 'CATHODE' | 'SIGNAL' | 'VCC' | 'GND' | 'DATA' | 'CLK' | 'TRIG' | 'ECHO';
  }[];
}

// ============================================
// GPIO ENGINE
// ============================================

export class GPIOEngine {
  private runtime: ArduinoRuntime;
  private bindings: Map<string, GPIOBinding> = new Map();
  private componentStates: Map<string, ComponentState> = new Map();
  private stateChangeCallbacks: Set<(componentId: string, state: ComponentState) => void> = new Set();

  // PWM simulation
  private pwmCycles: Map<number, { on: boolean; cycleStart: number }> = new Map();

  // Animation frame
  private animationFrameId: number | null = null;
  private lastUpdateTime: number = 0;

  constructor(runtime: ArduinoRuntime) {
    this.runtime = runtime;
    this.setupPinChangeListener();
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  private setupPinChangeListener(): void {
    this.runtime.onPinChange((pinId, state) => {
      this.handlePinChange(pinId, state);
    });
  }

  /**
   * 시뮬레이션 시작
   */
  public start(): void {
    this.lastUpdateTime = performance.now();
    this.update();
  }

  /**
   * 시뮬레이션 정지
   */
  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * 애니메이션 업데이트 루프
   */
  private update = (): void => {
    const now = performance.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // Update all component animations
    this.updateComponents(deltaTime);

    // PWM cycle simulation
    this.updatePWM(now);

    this.animationFrameId = requestAnimationFrame(this.update);
  };

  // ============================================
  // COMPONENT BINDING
  // ============================================

  /**
   * 컴포넌트와 GPIO 핀을 바인딩
   */
  public bindComponent(binding: GPIOBinding): void {
    this.bindings.set(binding.componentId, binding);

    // Initialize component state based on type
    const initialState = this.createInitialState(binding.componentType);
    if (initialState) {
      this.componentStates.set(binding.componentId, initialState);
    }
  }

  /**
   * 컴포넌트 바인딩 해제
   */
  public unbindComponent(componentId: string): void {
    this.bindings.delete(componentId);
    this.componentStates.delete(componentId);
  }

  /**
   * 컴포넌트 타입에 따른 초기 상태 생성
   */
  private createInitialState(type: ComponentType): ComponentState | null {
    switch (type) {
      case 'LED':
      case 'RGB_LED':
        return {
          type: 'LED',
          state: {
            isOn: false,
            brightness: 0,
            color: '#ff0000',
            pwmDuty: 0,
          },
        };

      case 'BUTTON':
      case 'SWITCH':
        return {
          type: 'BUTTON',
          state: {
            isPressed: false,
            lastPressTime: 0,
            debounceMs: 50,
          },
        };

      case 'POTENTIOMETER':
        return {
          type: 'POTENTIOMETER',
          state: {
            value: 512,
            percentage: 50,
            rotation: 135,
          },
        };

      case 'SERVO':
        return {
          type: 'SERVO',
          state: {
            angle: 90,
            targetAngle: 90,
            speed: 180,
            isMoving: false,
          },
        };

      case 'ULTRASONIC':
        return {
          type: 'ULTRASONIC',
          state: {
            distance: 100,
            isActive: false,
            lastTriggerTime: 0,
          },
        };

      case 'TEMPERATURE':
        return {
          type: 'TEMPERATURE',
          state: {
            temperature: 25,
            voltage: 0.75,
            analogValue: 153,
          },
        };

      case 'PHOTORESISTOR':
        return {
          type: 'PHOTORESISTOR',
          state: {
            lightLevel: 512,
            resistance: 10000,
            luxApprox: 500,
          },
        };

      case 'BUZZER':
      case 'PIEZO':
        return {
          type: 'BUZZER',
          state: {
            isOn: false,
            frequency: 1000,
            volume: 0,
          },
        };

      case 'DC_MOTOR':
      case 'STEPPER':
        return {
          type: 'MOTOR',
          state: {
            speed: 0,
            direction: 'STOPPED',
            rpm: 0,
          },
        };

      default:
        return null;
    }
  }

  // ============================================
  // PIN CHANGE HANDLING
  // ============================================

  /**
   * GPIO 핀 상태 변경 처리
   */
  private handlePinChange(pinId: number, state: PinRuntimeState): void {
    // Find all components bound to this pin
    for (const [componentId, binding] of this.bindings) {
      const pinBinding = binding.pins.find(p => p.pinId === pinId);
      if (pinBinding) {
        this.updateComponentFromPin(componentId, binding, pinBinding.role, state);
      }
    }
  }

  /**
   * 핀 상태에 따라 컴포넌트 업데이트
   */
  private updateComponentFromPin(
    componentId: string,
    binding: GPIOBinding,
    role: string,
    pinState: PinRuntimeState
  ): void {
    const compState = this.componentStates.get(componentId);
    if (!compState) return;

    switch (compState.type) {
      case 'LED':
        this.updateLEDFromPin(componentId, compState.state, role, pinState);
        break;
      case 'BUZZER':
        this.updateBuzzerFromPin(componentId, compState.state, pinState);
        break;
      case 'SERVO':
        this.updateServoFromPin(componentId, compState.state, pinState);
        break;
      case 'MOTOR':
        this.updateMotorFromPin(componentId, compState.state, pinState);
        break;
    }
  }

  /**
   * LED 상태 업데이트
   */
  private updateLEDFromPin(
    componentId: string,
    state: LEDState,
    role: string,
    pinState: PinRuntimeState
  ): void {
    if (role === 'ANODE' || role === 'SIGNAL') {
      if (pinState.digitalState === 'PWM') {
        // PWM brightness
        state.isOn = pinState.pwmDuty > 0;
        state.brightness = pinState.pwmDuty / 255;
        state.pwmDuty = pinState.pwmDuty;
      } else {
        // Digital on/off
        state.isOn = pinState.digitalState === 'HIGH';
        state.brightness = state.isOn ? 1 : 0;
        state.pwmDuty = state.isOn ? 255 : 0;
      }

      this.emitStateChange(componentId, { type: 'LED', state });
    }
  }

  /**
   * 버저 상태 업데이트
   */
  private updateBuzzerFromPin(
    componentId: string,
    state: BuzzerState,
    pinState: PinRuntimeState
  ): void {
    if (pinState.digitalState === 'PWM') {
      state.isOn = pinState.pwmDuty > 0;
      state.volume = pinState.pwmDuty / 255;
      // Frequency is set by tone() function
    } else {
      state.isOn = pinState.digitalState === 'HIGH';
      state.volume = state.isOn ? 1 : 0;
    }

    this.emitStateChange(componentId, { type: 'BUZZER', state });
  }

  /**
   * 서보 상태 업데이트
   */
  private updateServoFromPin(
    componentId: string,
    state: ServoState,
    pinState: PinRuntimeState
  ): void {
    if (pinState.digitalState === 'PWM') {
      // Servo uses PWM pulse width to determine angle
      // Typically 1ms pulse = 0°, 2ms pulse = 180°
      // PWM duty 0-255 maps roughly to 0-180 degrees
      state.targetAngle = Math.round((pinState.pwmDuty / 255) * 180);
      state.isMoving = state.angle !== state.targetAngle;

      this.emitStateChange(componentId, { type: 'SERVO', state });
    }
  }

  /**
   * 모터 상태 업데이트
   */
  private updateMotorFromPin(
    componentId: string,
    state: MotorState,
    pinState: PinRuntimeState
  ): void {
    if (pinState.digitalState === 'PWM') {
      state.speed = pinState.pwmDuty;
      state.direction = pinState.pwmDuty > 0 ? 'CW' : 'STOPPED';
      state.rpm = Math.round((pinState.pwmDuty / 255) * 200); // Approximate RPM
    } else {
      state.speed = pinState.digitalState === 'HIGH' ? 255 : 0;
      state.direction = pinState.digitalState === 'HIGH' ? 'CW' : 'STOPPED';
      state.rpm = pinState.digitalState === 'HIGH' ? 200 : 0;
    }

    this.emitStateChange(componentId, { type: 'MOTOR', state });
  }

  // ============================================
  // COMPONENT UPDATE (Animation)
  // ============================================

  /**
   * 애니메이션 업데이트
   */
  private updateComponents(deltaTime: number): void {
    for (const [componentId, compState] of this.componentStates) {
      switch (compState.type) {
        case 'SERVO':
          this.animateServo(componentId, compState.state, deltaTime);
          break;
      }
    }
  }

  /**
   * 서보 모터 애니메이션
   */
  private animateServo(componentId: string, state: ServoState, deltaTime: number): void {
    if (!state.isMoving) return;

    const diff = state.targetAngle - state.angle;
    const step = state.speed * deltaTime;

    if (Math.abs(diff) <= step) {
      state.angle = state.targetAngle;
      state.isMoving = false;
    } else {
      state.angle += Math.sign(diff) * step;
    }

    this.emitStateChange(componentId, { type: 'SERVO', state });
  }

  /**
   * PWM 사이클 시뮬레이션
   */
  private updatePWM(now: number): void {
    for (const [pinId, cycle] of this.pwmCycles) {
      const pinState = this.runtime.getPinState(pinId);
      if (!pinState || pinState.digitalState !== 'PWM') {
        this.pwmCycles.delete(pinId);
        continue;
      }

      // Calculate PWM cycle
      const frequency = pinState.pwmFrequency || 490; // Arduino default
      const period = 1000 / frequency;
      const elapsed = (now - cycle.cycleStart) % period;
      const duty = pinState.pwmDuty / 255;

      const shouldBeOn = elapsed < period * duty;

      if (shouldBeOn !== cycle.on) {
        cycle.on = shouldBeOn;
        // Emit PWM cycle event if needed for visualization
      }
    }
  }

  // ============================================
  // INPUT SIMULATION (From 3D)
  // ============================================

  /**
   * 버튼 누름 시뮬레이션
   */
  public pressButton(componentId: string): void {
    const compState = this.componentStates.get(componentId);
    if (!compState || compState.type !== 'BUTTON') return;

    const binding = this.bindings.get(componentId);
    if (!binding) return;

    const signalPin = binding.pins.find(p => p.role === 'SIGNAL');
    if (!signalPin) return;

    const now = performance.now();
    if (now - compState.state.lastPressTime < compState.state.debounceMs) {
      return; // Debounce
    }

    compState.state.isPressed = true;
    compState.state.lastPressTime = now;

    // Update Arduino pin
    this.runtime.setButtonState(signalPin.pinId, true);
    this.emitStateChange(componentId, compState);
  }

  /**
   * 버튼 해제 시뮬레이션
   */
  public releaseButton(componentId: string): void {
    const compState = this.componentStates.get(componentId);
    if (!compState || compState.type !== 'BUTTON') return;

    const binding = this.bindings.get(componentId);
    if (!binding) return;

    const signalPin = binding.pins.find(p => p.role === 'SIGNAL');
    if (!signalPin) return;

    compState.state.isPressed = false;

    // Update Arduino pin
    this.runtime.setButtonState(signalPin.pinId, false);
    this.emitStateChange(componentId, compState);
  }

  /**
   * 가변저항 값 설정
   */
  public setPotentiometerValue(componentId: string, value: number): void {
    const compState = this.componentStates.get(componentId);
    if (!compState || compState.type !== 'POTENTIOMETER') return;

    const binding = this.bindings.get(componentId);
    if (!binding) return;

    const signalPin = binding.pins.find(p => p.role === 'SIGNAL');
    if (!signalPin) return;

    compState.state.value = Math.max(0, Math.min(1023, Math.round(value)));
    compState.state.percentage = (compState.state.value / 1023) * 100;
    compState.state.rotation = (compState.state.percentage / 100) * 270;

    // Update Arduino analog pin
    this.runtime.setSensorValue(signalPin.pinId, compState.state.value);
    this.emitStateChange(componentId, compState);
  }

  /**
   * 온도 센서 값 설정
   */
  public setTemperature(componentId: string, celsius: number): void {
    const compState = this.componentStates.get(componentId);
    if (!compState || compState.type !== 'TEMPERATURE') return;

    const binding = this.bindings.get(componentId);
    if (!binding) return;

    const signalPin = binding.pins.find(p => p.role === 'SIGNAL');
    if (!signalPin) return;

    compState.state.temperature = celsius;
    // TMP36 formula: voltage = (temperature + 50) * 0.01
    compState.state.voltage = (celsius + 50) * 0.01;
    compState.state.analogValue = Math.round((compState.state.voltage / 5) * 1023);

    // Update Arduino analog pin
    this.runtime.setSensorValue(signalPin.pinId, compState.state.analogValue);
    this.emitStateChange(componentId, compState);
  }

  /**
   * 조도 센서 값 설정
   */
  public setLightLevel(componentId: string, value: number): void {
    const compState = this.componentStates.get(componentId);
    if (!compState || compState.type !== 'PHOTORESISTOR') return;

    const binding = this.bindings.get(componentId);
    if (!binding) return;

    const signalPin = binding.pins.find(p => p.role === 'SIGNAL');
    if (!signalPin) return;

    compState.state.lightLevel = Math.max(0, Math.min(1023, Math.round(value)));
    // Approximate: higher light = lower resistance
    compState.state.resistance = Math.round(10000 * (1 - compState.state.lightLevel / 1023) + 1000);
    compState.state.luxApprox = Math.round((compState.state.lightLevel / 1023) * 10000);

    // Update Arduino analog pin
    this.runtime.setSensorValue(signalPin.pinId, compState.state.lightLevel);
    this.emitStateChange(componentId, compState);
  }

  /**
   * 초음파 센서 거리 설정
   */
  public setUltrasonicDistance(componentId: string, cm: number): void {
    const compState = this.componentStates.get(componentId);
    if (!compState || compState.type !== 'ULTRASONIC') return;

    compState.state.distance = Math.max(2, Math.min(400, cm));
    this.emitStateChange(componentId, compState);
  }

  // ============================================
  // STATE ACCESS
  // ============================================

  /**
   * 컴포넌트 상태 가져오기
   */
  public getComponentState(componentId: string): ComponentState | undefined {
    return this.componentStates.get(componentId);
  }

  /**
   * 모든 컴포넌트 상태 가져오기
   */
  public getAllComponentStates(): Map<string, ComponentState> {
    return new Map(this.componentStates);
  }

  /**
   * LED 상태 가져오기
   */
  public getLEDState(componentId: string): LEDState | undefined {
    const state = this.componentStates.get(componentId);
    if (state?.type === 'LED') {
      return state.state;
    }
    return undefined;
  }

  /**
   * 서보 상태 가져오기
   */
  public getServoState(componentId: string): ServoState | undefined {
    const state = this.componentStates.get(componentId);
    if (state?.type === 'SERVO') {
      return state.state;
    }
    return undefined;
  }

  // ============================================
  // CALLBACKS
  // ============================================

  /**
   * 상태 변경 콜백 등록
   */
  public onStateChange(callback: (componentId: string, state: ComponentState) => void): () => void {
    this.stateChangeCallbacks.add(callback);
    return () => this.stateChangeCallbacks.delete(callback);
  }

  /**
   * 상태 변경 이벤트 발생
   */
  private emitStateChange(componentId: string, state: ComponentState): void {
    this.stateChangeCallbacks.forEach(cb => cb(componentId, state));
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * 리소스 정리
   */
  public dispose(): void {
    this.stop();
    this.bindings.clear();
    this.componentStates.clear();
    this.stateChangeCallbacks.clear();
    this.pwmCycles.clear();
  }
}

// Export factory function
export function createGPIOEngine(runtime: ArduinoRuntime): GPIOEngine {
  return new GPIOEngine(runtime);
}
