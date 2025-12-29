import { AVRIOPort, CPU, AVRTimer, AVRUSART } from 'avr8js';

export class AVRRunner {
  private cpu: CPU;
  private timer: AVRTimer;
  private usart: AVRUSART;
  private portB: AVRIOPort;
  private portD: AVRIOPort;
  private animationFrame: number | null = null;
  private lastCycleTime = 0;
  private running = false;

  public onSerial: ((data: string) => void) | null = null;
  public onPinChange: ((pin: number, value: boolean) => void) | null = null;

  constructor(hex: string) {
    // Create CPU with 32KB program memory
    const program = new Uint8Array(32 * 1024);

    // Load hex into program memory
    this.loadHex(hex, program);

    // Initialize CPU
    this.cpu = new CPU(program);

    // Initialize peripherals
    this.timer = new AVRTimer(this.cpu, 0);
    this.usart = new AVRUSART(this.cpu, 0, 0xc0);
    this.portB = new AVRIOPort(this.cpu, 0x23); // Port B (Pin 8-13)
    this.portD = new AVRIOPort(this.cpu, 0x29); // Port D (Pin 0-7)

    // Setup USART (Serial) output
    this.usart.onByteTransmit = (value: number) => {
      const char = String.fromCharCode(value);
      if (this.onSerial) {
        this.onSerial(char);
      }
    };

    // Setup Port B pin change listener (Pin 13 = PB5)
    this.portB.addListener(() => {
      if (this.onPinChange) {
        const pin13Value = !!(this.portB.portValue & (1 << 5)); // PB5 = Pin 13
        this.onPinChange(13, pin13Value);
      }
    });
  }

  private loadHex(hex: string, target: Uint8Array) {
    const lines = hex.split('\n');
    for (const line of lines) {
      if (line.startsWith(':')) {
        const bytes = parseInt(line.substr(1, 2), 16);
        const addr = parseInt(line.substr(3, 4), 16);
        const type = parseInt(line.substr(7, 2), 16);

        if (type === 0) {
          // Data record
          for (let i = 0; i < bytes; i++) {
            target[addr + i] = parseInt(line.substr(9 + i * 2, 2), 16);
          }
        }
      }
    }
  }

  public setPinValue(pin: number, value: boolean) {
    // Map Arduino pin to AVR port
    if (pin >= 8 && pin <= 13) {
      // Port B (pins 8-13)
      const bit = pin - 8;
      const currentValue = this.cpu.data[0x23 + 2]; // PINB register
      if (value) {
        this.cpu.data[0x23 + 2] = currentValue | (1 << bit);
      } else {
        this.cpu.data[0x23 + 2] = currentValue & ~(1 << bit);
      }
    } else if (pin >= 0 && pin <= 7) {
      // Port D (pins 0-7)
      const bit = pin;
      const currentValue = this.cpu.data[0x29 + 2]; // PIND register
      if (value) {
        this.cpu.data[0x29 + 2] = currentValue | (1 << bit);
      } else {
        this.cpu.data[0x29 + 2] = currentValue & ~(1 << bit);
      }
    }
  }

  public setAnalogValue(channel: number, value: number) {
    // Map 0-1023 range to ADC value
    const adcValue = Math.min(1023, Math.max(0, value));

    // Set ADC registers
    this.cpu.data[0x78] = adcValue & 0xff; // ADCL
    this.cpu.data[0x79] = (adcValue >> 8) & 0x03; // ADCH
  }

  public async execute() {
    this.running = true;
    this.lastCycleTime = performance.now();

    const cpuLoop = () => {
      if (!this.running) {
        return;
      }

      const now = performance.now();
      const delta = now - this.lastCycleTime;
      this.lastCycleTime = now;

      // Run CPU cycles (16MHz Arduino = 16000 cycles per ms)
      const cyclesToRun = Math.floor(delta * 16000);

      for (let i = 0; i < cyclesToRun; i++) {
        try {
          this.cpu.tick();
        } catch (e) {
          console.error('CPU execution error:', e);
          this.stop();
          break;
        }
      }

      this.animationFrame = requestAnimationFrame(cpuLoop);
    };

    cpuLoop();
  }

  public stop() {
    this.running = false;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}
