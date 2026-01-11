// AVR8js Emulator Wrapper for Arduino Simulation
// Emulates ATmega328P (Arduino Uno MCU)

import { CPU, avrInstruction, AVRIOPort, portBConfig, portCConfig, portDConfig, AVRTimer, timer0Config, timer1Config, timer2Config, AVRUSART, usart0Config } from 'avr8js';

// Intel HEX parser
function parseIntelHex(hex: string): Uint8Array {
    const program = new Uint8Array(0x8000); // 32KB flash
    const lines = hex.split('\n').filter(line => line.startsWith(':'));

    for (const line of lines) {
        const byteCount = parseInt(line.substr(1, 2), 16);
        const address = parseInt(line.substr(3, 4), 16);
        const recordType = parseInt(line.substr(7, 2), 16);

        if (recordType === 0) { // Data record
            for (let i = 0; i < byteCount; i++) {
                program[address + i] = parseInt(line.substr(9 + i * 2, 2), 16);
            }
        }
    }

    return program;
}

// Pin state interface
export interface PinState {
    pin: number;
    mode: 'input' | 'output' | 'input_pullup';
    value: boolean;
    pwm?: number; // 0-255 for PWM pins
}

// AVR Emulator class
export class AVREmulator {
    private cpu: CPU;
    private portB: AVRIOPort;
    private portC: AVRIOPort;
    private portD: AVRIOPort;
    private timer0: AVRTimer;
    private timer1: AVRTimer;
    private timer2: AVRTimer;
    private usart: AVRUSART;

    private running = false;
    private cyclesPerFrame = 16000; // ~60Hz at 16MHz
    private animationId: number | null = null;

    // Callbacks
    onSerialOutput?: (char: string) => void;
    onPinChange?: (pin: number, value: boolean) => void;

    // Pin states (Arduino numbering)
    private pinStates: Map<number, PinState> = new Map();

    constructor() {
        // Initialize CPU with 32KB program memory
        this.cpu = new CPU(new Uint16Array(0x8000));

        // Initialize I/O ports
        this.portB = new AVRIOPort(this.cpu, portBConfig);
        this.portC = new AVRIOPort(this.cpu, portCConfig);
        this.portD = new AVRIOPort(this.cpu, portDConfig);

        // Initialize timers (for delay() and PWM)
        this.timer0 = new AVRTimer(this.cpu, timer0Config);
        this.timer1 = new AVRTimer(this.cpu, timer1Config);
        this.timer2 = new AVRTimer(this.cpu, timer2Config);

        // Initialize USART (for Serial)
        this.usart = new AVRUSART(this.cpu, usart0Config, 16000000);

        // Setup USART output callback
        this.usart.onByteTransmit = (byte) => {
            const char = String.fromCharCode(byte);
            this.onSerialOutput?.(char);
        };

        // Setup port change listeners
        this.setupPortListeners();
    }

    private setupPortListeners() {
        // PORTD (D0-D7)
        this.portD.addListener(() => {
            for (let bit = 0; bit < 8; bit++) {
                const value = (this.portD.pinState(bit) & 1) === 1;
                const prevState = this.pinStates.get(bit);
                if (!prevState || prevState.value !== value) {
                    this.pinStates.set(bit, { pin: bit, mode: 'output', value });
                    this.onPinChange?.(bit, value);
                }
            }
        });

        // PORTB (D8-D13)
        this.portB.addListener(() => {
            for (let bit = 0; bit < 6; bit++) {
                const arduinoPin = 8 + bit;
                const value = (this.portB.pinState(bit) & 1) === 1;
                const prevState = this.pinStates.get(arduinoPin);
                if (!prevState || prevState.value !== value) {
                    this.pinStates.set(arduinoPin, { pin: arduinoPin, mode: 'output', value });
                    this.onPinChange?.(arduinoPin, value);
                }
            }
        });

        // PORTC (A0-A5)
        this.portC.addListener(() => {
            for (let bit = 0; bit < 6; bit++) {
                const arduinoPin = 14 + bit; // A0 = 14
                const value = (this.portC.pinState(bit) & 1) === 1;
                const prevState = this.pinStates.get(arduinoPin);
                if (!prevState || prevState.value !== value) {
                    this.pinStates.set(arduinoPin, { pin: arduinoPin, mode: 'output', value });
                    this.onPinChange?.(arduinoPin, value);
                }
            }
        });
    }

    // Load HEX firmware
    loadHex(hexContent: string): boolean {
        try {
            const program = parseIntelHex(hexContent);
            // Load into CPU program memory (as 16-bit words)
            const progMem = new Uint16Array(0x8000);
            for (let i = 0; i < program.length - 1; i += 2) {
                progMem[i / 2] = program[i] | (program[i + 1] << 8);
            }
            this.cpu.progMem = progMem;
            this.cpu.reset();
            return true;
        } catch (e) {
            console.error('Failed to load HEX:', e);
            return false;
        }
    }

    // Start simulation
    start() {
        if (this.running) return;
        this.running = true;
        this.runLoop();
    }

    // Stop simulation
    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // Reset CPU
    reset() {
        this.cpu.reset();
        this.pinStates.clear();
    }

    // Main execution loop
    private runLoop = () => {
        if (!this.running) return;

        // Execute cycles
        for (let i = 0; i < this.cyclesPerFrame; i++) {
            avrInstruction(this.cpu);
            this.timer0.tick();
            this.timer1.tick();
            this.timer2.tick();
            this.usart.tick();
        }

        this.animationId = requestAnimationFrame(this.runLoop);
    };

    // Set digital input
    setDigitalInput(arduinoPin: number, value: boolean) {
        const [port, bit] = this.pinToPortBit(arduinoPin);
        if (port === 'D') {
            // Set external pin state for PORTD
            const mask = 1 << bit;
            if (value) {
                this.portD.setPin(bit, true);
            } else {
                this.portD.setPin(bit, false);
            }
        } else if (port === 'B') {
            if (value) {
                this.portB.setPin(bit, true);
            } else {
                this.portB.setPin(bit, false);
            }
        } else if (port === 'C') {
            if (value) {
                this.portC.setPin(bit, true);
            } else {
                this.portC.setPin(bit, false);
            }
        }
    }

    // Set analog input (for ADC)
    setAnalogInput(analogPin: number, voltage: number) {
        // ADC simulation would go here
        // For now, we'll store it for future use
        const arduinoPin = 14 + analogPin; // A0-A5 = 14-19
        // TODO: Implement ADC core
    }

    // Get pin state
    getPinState(arduinoPin: number): PinState | undefined {
        return this.pinStates.get(arduinoPin);
    }

    // Get all pin states
    getAllPinStates(): Map<number, PinState> {
        return new Map(this.pinStates);
    }

    // Helper: Arduino pin to port/bit
    private pinToPortBit(arduinoPin: number): [string, number] {
        if (arduinoPin >= 0 && arduinoPin <= 7) {
            return ['D', arduinoPin];
        } else if (arduinoPin >= 8 && arduinoPin <= 13) {
            return ['B', arduinoPin - 8];
        } else if (arduinoPin >= 14 && arduinoPin <= 19) {
            return ['C', arduinoPin - 14];
        }
        return ['D', 0];
    }

    // Send serial input
    sendSerialInput(char: string) {
        this.usart.onByteTransmit?.(char.charCodeAt(0));
    }

    // Check if running
    isRunning(): boolean {
        return this.running;
    }

    // Get CPU cycles
    getCycles(): number {
        return this.cpu.cycles;
    }
}

// Singleton instance
let emulatorInstance: AVREmulator | null = null;

export function getAVREmulator(): AVREmulator {
    if (!emulatorInstance) {
        emulatorInstance = new AVREmulator();
    }
    return emulatorInstance;
}

export function resetAVREmulator(): void {
    if (emulatorInstance) {
        emulatorInstance.stop();
        emulatorInstance.reset();
    }
    emulatorInstance = null;
}
