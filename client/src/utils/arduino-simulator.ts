/**
 * Arduino Code Simulator
 * Simulates Arduino code execution without requiring compilation
 * Similar to how Tinkercad Circuit Simulator works
 */

interface PinState {
  mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';
  value: boolean;
  analogValue: number;
}

export class ArduinoSimulator {
  private pins: Map<number, PinState> = new Map();
  private serialBuffer: string = '';
  private variables: Map<string, any> = new Map();
  private running = false;
  private loopInterval: number | null = null;

  public onSerialOutput: ((data: string) => void) | null = null;
  public onPinChange: ((pin: number, value: boolean) => void) | null = null;
  public onAnalogRead: ((pin: number) => number) | null = null;

  constructor() {
    // Initialize all pins
    for (let i = 0; i < 20; i++) {
      this.pins.set(i, {
        mode: 'INPUT',
        value: false,
        analogValue: 0
      });
    }
  }

  public setPinValue(pin: number, value: boolean) {
    const pinState = this.pins.get(pin);
    if (pinState) {
      pinState.value = value;
      pinState.analogValue = value ? 1023 : 0;
    }
  }

  public setAnalogValue(pin: number, value: number) {
    const pinState = this.pins.get(pin);
    if (pinState) {
      pinState.analogValue = value;
      pinState.value = value > 512;
    }
  }

  private pinMode(pin: number, mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP') {
    const pinState = this.pins.get(pin);
    if (pinState) {
      pinState.mode = mode;
    }
  }

  private digitalWrite(pin: number, value: boolean | number) {
    const pinState = this.pins.get(pin);
    if (pinState && pinState.mode === 'OUTPUT') {
      const boolValue = typeof value === 'number' ? value !== 0 : value;
      pinState.value = boolValue;
      if (this.onPinChange) {
        this.onPinChange(pin, boolValue);
      }
    }
  }

  private digitalRead(pin: number): number {
    const pinState = this.pins.get(pin);
    return pinState?.value ? 1 : 0;
  }

  private analogRead(pin: number): number {
    // Check if there's a callback to get real sensor values
    if (this.onAnalogRead) {
      return this.onAnalogRead(pin);
    }

    const pinState = this.pins.get(pin);
    return pinState?.analogValue ?? 0;
  }

  private analogWrite(pin: number, value: number) {
    const pinState = this.pins.get(pin);
    if (pinState) {
      pinState.analogValue = value;
      pinState.value = value > 127;
      if (this.onPinChange) {
        this.onPinChange(pin, pinState.value);
      }
    }
  }

  private serialPrint(text: string) {
    this.serialBuffer += text;
    if (this.onSerialOutput) {
      this.onSerialOutput(text);
    }
  }

  private serialPrintln(text: string) {
    this.serialPrint(text + '\n');
  }

  private delay(ms: number) {
    // In simulation, we don't actually delay
    // The loop timing handles this
  }

  public async execute(code: string) {
    this.running = true;
    this.serialBuffer = '';

    try {
      // Extract setup and loop functions
      const setupMatch = code.match(/void\s+setup\s*\(\s*\)\s*{([^]*?)}/);
      const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*{([^]*?)}/);

      if (!setupMatch || !loopMatch) {
        throw new Error('setup() and loop() functions are required');
      }

      const setupCode = setupMatch[1];
      const loopCode = loopMatch[1];

      // Parse defines
      const defineMatches = code.matchAll(/#define\s+(\w+)\s+(.+)/g);
      for (const match of defineMatches) {
        this.variables.set(match[1], this.evaluateValue(match[2].trim()));
      }

      // Execute setup
      this.executeBlock(setupCode);
      this.serialPrintln('🚀 Arduino Simulator Started');

      // Execute loop repeatedly
      let loopCount = 0;
      const maxLoops = 1000; // Safety limit

      const runLoop = () => {
        if (!this.running || loopCount >= maxLoops) {
          return;
        }

        try {
          this.executeBlock(loopCode);
          loopCount++;

          // Continue loop with delay
          this.loopInterval = window.setTimeout(runLoop, 100);
        } catch (error) {
          console.error('Loop execution error:', error);
          this.stop();
        }
      };

      runLoop();

    } catch (error) {
      this.serialPrintln(`❌ Error: ${error}`);
      throw error;
    }
  }

  private executeBlock(code: string) {
    // Split into statements
    const statements = this.splitStatements(code);

    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed || trimmed.startsWith('//')) continue;

      this.executeStatement(trimmed);
    }
  }

  private splitStatements(code: string): string[] {
    const statements: string[] = [];
    let current = '';
    let braceDepth = 0;
    let parenDepth = 0;
    let inString = false;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];

      if (char === '"' && code[i - 1] !== '\\') {
        inString = !inString;
      }

      if (!inString) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;
        if (char === '(') parenDepth++;
        if (char === ')') parenDepth--;
      }

      current += char;

      if (!inString && braceDepth === 0 && parenDepth === 0 && (char === ';' || char === '}')) {
        statements.push(current.trim());
        current = '';
      }
    }

    if (current.trim()) {
      statements.push(current.trim());
    }

    return statements;
  }

  private executeStatement(statement: string) {
    // pinMode
    if (statement.includes('pinMode')) {
      const match = statement.match(/pinMode\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/);
      if (match) {
        const pin = this.evaluateValue(match[1]);
        const mode = match[2].trim();
        this.pinMode(pin, mode as any);
      }
      return;
    }

    // digitalWrite
    if (statement.includes('digitalWrite')) {
      const match = statement.match(/digitalWrite\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/);
      if (match) {
        const pin = this.evaluateValue(match[1]);
        const value = match[2].trim() === 'HIGH' || this.evaluateValue(match[2]) !== 0;
        this.digitalWrite(pin, value);
      }
      return;
    }

    // Serial.begin
    if (statement.includes('Serial.begin')) {
      // Just acknowledge it
      return;
    }

    // Serial.print
    if (statement.includes('Serial.print(') && !statement.includes('Serial.println')) {
      const match = statement.match(/Serial\.print\s*\((.+)\)/);
      if (match) {
        const value = this.evaluateExpression(match[1].trim());
        this.serialPrint(String(value));
      }
      return;
    }

    // Serial.println
    if (statement.includes('Serial.println')) {
      const match = statement.match(/Serial\.println\s*\((.+)\)/);
      if (match) {
        const value = this.evaluateExpression(match[1].trim());
        this.serialPrintln(String(value));
      }
      return;
    }

    // delay
    if (statement.includes('delay')) {
      const match = statement.match(/delay\s*\(\s*(\d+)\s*\)/);
      if (match) {
        this.delay(parseInt(match[1]));
      }
      return;
    }

    // Variable assignment
    if (statement.includes('=') && !statement.includes('==')) {
      const match = statement.match(/(?:int|long|float|bool)?\s*(\w+)\s*=\s*(.+?);/);
      if (match) {
        const varName = match[1];
        const value = this.evaluateExpression(match[2]);
        this.variables.set(varName, value);
      }
      return;
    }

    // If statement
    if (statement.trim().startsWith('if')) {
      const match = statement.match(/if\s*\((.+?)\)\s*{([^]*?)}/);
      if (match) {
        const condition = this.evaluateExpression(match[1]);
        if (condition) {
          this.executeBlock(match[2]);
        }
      }
      return;
    }
  }

  private evaluateExpression(expr: string): any {
    expr = expr.trim();

    // String literal
    if (expr.startsWith('"') && expr.endsWith('"')) {
      return expr.slice(1, -1);
    }

    // digitalRead
    if (expr.includes('digitalRead')) {
      const match = expr.match(/digitalRead\s*\(\s*(.+?)\s*\)/);
      if (match) {
        const pin = this.evaluateValue(match[1]);
        return this.digitalRead(pin);
      }
    }

    // analogRead
    if (expr.includes('analogRead')) {
      const match = expr.match(/analogRead\s*\(\s*(.+?)\s*\)/);
      if (match) {
        const pin = this.evaluateValue(match[1]);
        return this.analogRead(pin);
      }
    }

    // Comparison operators
    if (expr.includes('==')) {
      const [left, right] = expr.split('==').map(s => this.evaluateExpression(s.trim()));
      return left == right;
    }
    if (expr.includes('!=')) {
      const [left, right] = expr.split('!=').map(s => this.evaluateExpression(s.trim()));
      return left != right;
    }
    if (expr.includes('>')) {
      const [left, right] = expr.split('>').map(s => this.evaluateExpression(s.trim()));
      return left > right;
    }
    if (expr.includes('<')) {
      const [left, right] = expr.split('<').map(s => this.evaluateExpression(s.trim()));
      return left < right;
    }

    // Logical operators
    if (expr.includes('&&')) {
      const parts = expr.split('&&').map(s => this.evaluateExpression(s.trim()));
      return parts.every(p => p);
    }
    if (expr.includes('||')) {
      const parts = expr.split('||').map(s => this.evaluateExpression(s.trim()));
      return parts.some(p => p);
    }

    // Ternary operator
    if (expr.includes('?')) {
      const match = expr.match(/(.+?)\?(.+?):(.+)/);
      if (match) {
        const condition = this.evaluateExpression(match[1].trim());
        return condition ? this.evaluateExpression(match[2].trim()) : this.evaluateExpression(match[3].trim());
      }
    }

    // Simple value
    return this.evaluateValue(expr);
  }

  private evaluateValue(value: string): any {
    value = value.trim();

    // Check if it's a defined constant
    if (this.variables.has(value)) {
      return this.variables.get(value);
    }

    // HIGH/LOW
    if (value === 'HIGH') return 1;
    if (value === 'LOW') return 0;

    // Analog pins (A0-A5)
    if (value.match(/^A\d+$/)) {
      return 14 + parseInt(value.substring(1)); // A0 = 14, A1 = 15, etc.
    }

    // Number
    if (!isNaN(Number(value))) {
      return Number(value);
    }

    // Variable
    if (this.variables.has(value)) {
      return this.variables.get(value);
    }

    return value;
  }

  public stop() {
    this.running = false;
    if (this.loopInterval !== null) {
      clearTimeout(this.loopInterval);
      this.loopInterval = null;
    }
  }
}
