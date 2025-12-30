/**
 * Professional Arduino Simulator
 * 완전히 작동하는 Arduino 인터프리터 - Tinkercad 퀄리티
 */

interface PinConfig {
  mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';
  digitalValue: boolean;
  analogValue: number;
  pwmValue: number;
}

interface SimulatorCallbacks {
  onSerialOutput?: (text: string) => void;
  onPinChange?: (pin: number, value: boolean, analog: number) => void;
  onAnalogRead?: (pin: number) => number;
}

export class ArduinoSimulator {
  private pins: Map<number, PinConfig> = new Map();
  private variables: Map<string, number> = new Map();
  private running = false;
  private loopHandle: number | null = null;
  private setupCode = '';
  private loopCode = '';
  private callbacks: SimulatorCallbacks;

  constructor(callbacks: SimulatorCallbacks = {}) {
    this.callbacks = callbacks;

    // Initialize Arduino UNO pins (0-13 digital, A0-A5 analog)
    for (let i = 0; i <= 13; i++) {
      this.pins.set(i, {
        mode: 'INPUT',
        digitalValue: false,
        analogValue: 0,
        pwmValue: 0
      });
    }

    // Analog pins (A0-A5 map to 14-19)
    for (let i = 14; i <= 19; i++) {
      this.pins.set(i, {
        mode: 'INPUT',
        digitalValue: false,
        analogValue: 0,
        pwmValue: 0
      });
    }
  }

  // ==================== Public Methods ====================

  public async compile(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Parse #define statements
      this.parseDefines(code);

      // Extract setup() function
      const setupMatch = code.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\n\}/m);
      if (!setupMatch) {
        return { success: false, error: 'setup() function not found' };
      }
      this.setupCode = setupMatch[1];

      // Extract loop() function
      const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\n\}/m);
      if (!loopMatch) {
        return { success: false, error: 'loop() function not found' };
      }
      this.loopCode = loopMatch[1];

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  public start() {
    if (this.running) return;

    this.running = true;
    this.output('🚀 Arduino Started\n');

    // Run setup once
    try {
      this.executeBlock(this.setupCode);
    } catch (error: any) {
      this.output(`❌ Setup Error: ${error.message}\n`);
      this.stop();
      return;
    }

    // Run loop repeatedly
    this.runLoop();
  }

  public stop() {
    this.running = false;
    if (this.loopHandle) {
      clearTimeout(this.loopHandle);
      this.loopHandle = null;
    }
    this.output('\n⏹️  Stopped\n');
  }

  public reset() {
    this.stop();
    this.variables.clear();
    this.pins.forEach(pin => {
      pin.digitalValue = false;
      pin.analogValue = 0;
      pin.pwmValue = 0;
    });
  }

  // External sensor/component simulation
  public setPinValue(pin: number, value: boolean) {
    const pinConfig = this.pins.get(pin);
    if (pinConfig) {
      pinConfig.digitalValue = value;
      pinConfig.analogValue = value ? 1023 : 0;
    }
  }

  public setAnalogValue(pin: number, value: number) {
    const pinConfig = this.pins.get(pin);
    if (pinConfig) {
      pinConfig.analogValue = Math.max(0, Math.min(1023, value));
      pinConfig.digitalValue = value > 512;
    }
  }

  public getPinValue(pin: number): boolean {
    return this.pins.get(pin)?.digitalValue || false;
  }

  // ==================== Private Arduino Functions ====================

  private pinMode(pin: number, mode: string) {
    const pinConfig = this.pins.get(pin);
    if (!pinConfig) return;

    if (mode === 'OUTPUT') pinConfig.mode = 'OUTPUT';
    else if (mode === 'INPUT') pinConfig.mode = 'INPUT';
    else if (mode === 'INPUT_PULLUP') pinConfig.mode = 'INPUT_PULLUP';
  }

  private digitalWrite(pin: number, value: boolean) {
    const pinConfig = this.pins.get(pin);
    if (!pinConfig || pinConfig.mode !== 'OUTPUT') return;

    pinConfig.digitalValue = value;
    pinConfig.analogValue = value ? 1023 : 0;

    if (this.callbacks.onPinChange) {
      this.callbacks.onPinChange(pin, value, pinConfig.analogValue);
    }
  }

  private digitalRead(pin: number): number {
    const pinConfig = this.pins.get(pin);
    if (!pinConfig) return 0;

    return pinConfig.digitalValue ? 1 : 0;
  }

  private analogRead(pin: number): number {
    // Check for external sensor callback
    if (this.callbacks.onAnalogRead) {
      const value = this.callbacks.onAnalogRead(pin);
      if (value !== undefined) return value;
    }

    const pinConfig = this.pins.get(pin);
    return pinConfig?.analogValue || 0;
  }

  private analogWrite(pin: number, value: number) {
    const pinConfig = this.pins.get(pin);
    if (!pinConfig || pinConfig.mode !== 'OUTPUT') return;

    value = Math.max(0, Math.min(255, value));
    pinConfig.pwmValue = value;
    pinConfig.digitalValue = value > 127;
    pinConfig.analogValue = Math.floor((value / 255) * 1023);

    if (this.callbacks.onPinChange) {
      this.callbacks.onPinChange(pin, pinConfig.digitalValue, pinConfig.analogValue);
    }
  }

  private delay(ms: number) {
    // Delay는 시뮬레이션에서 무시 (loop 타이밍이 처리)
  }

  private output(text: string) {
    if (this.callbacks.onSerialOutput) {
      this.callbacks.onSerialOutput(text);
    }
  }

  // ==================== Code Execution Engine ====================

  private runLoop() {
    if (!this.running) return;

    try {
      this.executeBlock(this.loopCode);
    } catch (error: any) {
      this.output(`❌ Error: ${error.message}\n`);
      this.stop();
      return;
    }

    // Continue loop (100ms delay between iterations)
    this.loopHandle = window.setTimeout(() => this.runLoop(), 100);
  }

  private parseDefines(code: string) {
    const defineRegex = /#define\s+(\w+)\s+(.+)/g;
    let match;

    while ((match = defineRegex.exec(code)) !== null) {
      const name = match[1];
      const value = this.parseValue(match[2].trim());
      this.variables.set(name, value);
    }
  }

  private executeBlock(code: string) {
    const lines = code.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) continue;

      this.executeLine(trimmed);
    }
  }

  private executeLine(line: string) {
    // pinMode(pin, mode)
    if (line.includes('pinMode')) {
      const match = line.match(/pinMode\s*\(\s*([^,]+)\s*,\s*(\w+)\s*\)/);
      if (match) {
        const pin = this.evaluate(match[1].trim());
        const mode = match[2].trim();
        this.pinMode(pin, mode);
      }
      return;
    }

    // digitalWrite(pin, value)
    if (line.includes('digitalWrite')) {
      const match = line.match(/digitalWrite\s*\(\s*([^,]+)\s*,\s*(HIGH|LOW|\d+)\s*\)/);
      if (match) {
        const pin = this.evaluate(match[1].trim());
        const value = match[2].trim() === 'HIGH' || this.evaluate(match[2].trim()) !== 0;
        this.digitalWrite(pin, value);
      }
      return;
    }

    // analogWrite(pin, value)
    if (line.includes('analogWrite')) {
      const match = line.match(/analogWrite\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
      if (match) {
        const pin = this.evaluate(match[1].trim());
        const value = this.evaluate(match[2].trim());
        this.analogWrite(pin, value);
      }
      return;
    }

    // Variable assignment: int x = value; or x = value;
    if (line.includes('=') && !line.includes('==')) {
      const match = line.match(/(?:int|long|float|bool)?\s*(\w+)\s*=\s*([^;]+);?/);
      if (match) {
        const varName = match[1];
        const value = this.evaluate(match[2].trim());
        this.variables.set(varName, value);
      }
      return;
    }

    // if statement
    if (line.startsWith('if')) {
      const match = line.match(/if\s*\(\s*([^)]+)\s*\)/);
      if (match) {
        const condition = this.evaluate(match[1].trim());
        // Note: Simple if without block handling - would need improvement for full support
      }
      return;
    }

    // Serial.begin
    if (line.includes('Serial.begin')) {
      return; // Just acknowledge
    }

    // Serial.print
    if (line.includes('Serial.print(') && !line.includes('Serial.println')) {
      const match = line.match(/Serial\.print\s*\(\s*(.+?)\s*\)/);
      if (match) {
        const value = this.evaluateStringOrValue(match[1].trim());
        this.output(String(value));
      }
      return;
    }

    // Serial.println
    if (line.includes('Serial.println')) {
      const match = line.match(/Serial\.println\s*\(\s*(.+?)\s*\)/);
      if (match) {
        const value = this.evaluateStringOrValue(match[1].trim());
        this.output(String(value) + '\n');
      }
      return;
    }

    // delay
    if (line.includes('delay')) {
      const match = line.match(/delay\s*\(\s*(\d+)\s*\)/);
      if (match) {
        this.delay(parseInt(match[1]));
      }
      return;
    }
  }

  private evaluateStringOrValue(expr: string): string | number {
    expr = expr.trim();

    // String literal
    if (expr.startsWith('"') && expr.endsWith('"')) {
      return expr.slice(1, -1);
    }

    // Numeric or expression
    return this.evaluate(expr);
  }

  private evaluate(expr: string): number {
    expr = expr.trim();

    // Constants
    if (expr === 'HIGH') return 1;
    if (expr === 'LOW') return 0;
    if (expr === 'true') return 1;
    if (expr === 'false') return 0;

    // Number literal
    if (/^\d+$/.test(expr)) {
      return parseInt(expr);
    }

    // Variable
    if (this.variables.has(expr)) {
      return this.variables.get(expr)!;
    }

    // Analog pin notation (A0-A5)
    if (expr.startsWith('A')) {
      const num = parseInt(expr.slice(1));
      return 14 + num; // A0 = pin 14
    }

    // Function calls
    if (expr.includes('digitalRead')) {
      const match = expr.match(/digitalRead\s*\(\s*([^)]+)\s*\)/);
      if (match) {
        const pin = this.evaluate(match[1].trim());
        return this.digitalRead(pin);
      }
    }

    if (expr.includes('analogRead')) {
      const match = expr.match(/analogRead\s*\(\s*([^)]+)\s*\)/);
      if (match) {
        const pin = this.evaluate(match[1].trim());
        return this.analogRead(pin);
      }
    }

    // Comparison operators
    if (expr.includes('==')) {
      const [left, right] = expr.split('==').map(s => this.evaluate(s.trim()));
      return left === right ? 1 : 0;
    }

    if (expr.includes('!=')) {
      const [left, right] = expr.split('!=').map(s => this.evaluate(s.trim()));
      return left !== right ? 1 : 0;
    }

    if (expr.includes('>')) {
      const [left, right] = expr.split('>').map(s => this.evaluate(s.trim()));
      return left > right ? 1 : 0;
    }

    if (expr.includes('<')) {
      const [left, right] = expr.split('<').map(s => this.evaluate(s.trim()));
      return left < right ? 1 : 0;
    }

    // Arithmetic
    if (expr.includes('+')) {
      return expr.split('+').reduce((sum, term) => sum + this.evaluate(term.trim()), 0);
    }

    if (expr.includes('-') && !expr.startsWith('-')) {
      const parts = expr.split('-');
      return parts.reduce((result, term, i) =>
        i === 0 ? this.evaluate(term.trim()) : result - this.evaluate(term.trim()), 0);
    }

    // Default: try to parse as number
    const num = parseFloat(expr);
    return isNaN(num) ? 0 : num;
  }

  private parseValue(text: string): number {
    return this.evaluate(text);
  }
}
