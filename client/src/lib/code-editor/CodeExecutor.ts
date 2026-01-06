/**
 * Multi-Language Code Executor
 * Supports JavaScript, Arduino (transpiled), and more
 */

import { ArduinoVirtualMachine } from '../mcu/ArduinoAPI';
import { SimulationEngine } from '../sim/SimulationEngine';

export type SupportedLanguage = 'javascript' | 'arduino' | 'python' | 'html' | 'css';

export interface CompileResult {
  success: boolean;
  code?: string;
  errors: CompileError[];
  warnings: string[];
}

export interface CompileError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
}

export class CodeExecutor {
  private engine: SimulationEngine;
  private arduino?: ArduinoVirtualMachine;
  private serialOutput: string = '';
  private onOutputCallback?: (output: string) => void;

  constructor(engine: SimulationEngine) {
    this.engine = engine;
  }

  setArduino(componentId: string): void {
    this.arduino = new ArduinoVirtualMachine(this.engine, componentId);
    this.arduino.onSerialOutput((data) => {
      this.serialOutput += data;
      this.onOutputCallback?.(this.serialOutput);
    });
  }

  onOutput(callback: (output: string) => void): void {
    this.onOutputCallback = callback;
  }

  compile(code: string, language: SupportedLanguage): CompileResult {
    const errors: CompileError[] = [];
    const warnings: string[] = [];

    try {
      switch (language) {
        case 'arduino':
          return this.compileArduino(code);
        case 'javascript':
          return this.compileJavaScript(code);
        case 'python':
          return this.compilePython(code);
        default:
          return { success: true, code, errors: [], warnings: [] };
      }
    } catch (error) {
      errors.push({
        line: 1,
        column: 1,
        message: String(error),
        severity: 'error',
      });
      return { success: false, errors, warnings };
    }
  }

  private compileArduino(code: string): CompileResult {
    const errors: CompileError[] = [];
    const warnings: string[] = [];

    // Transform Arduino code to JavaScript
    let jsCode = code;

    // Check for setup() and loop() functions
    if (!code.includes('void setup()') && !code.includes('void setup ()')) {
      errors.push({
        line: 1,
        column: 1,
        message: 'Missing setup() function',
        severity: 'error',
      });
    }

    if (!code.includes('void loop()') && !code.includes('void loop ()')) {
      errors.push({
        line: 1,
        column: 1,
        message: 'Missing loop() function',
        severity: 'error',
      });
    }

    if (errors.length > 0) {
      return { success: false, errors, warnings };
    }

    // Transform C++ syntax to JavaScript
    jsCode = this.transformArduinoToJS(code);

    return { success: true, code: jsCode, errors, warnings };
  }

  private transformArduinoToJS(code: string): string {
    let js = code;

    // Remove comments first
    js = js.replace(/\/\/.*$/gm, '');
    js = js.replace(/\/\*[\s\S]*?\*\//g, '');

    // Type declarations
    js = js.replace(/\bvoid\s+/g, 'function ');
    js = js.replace(/\bint\s+/g, 'let ');
    js = js.replace(/\blong\s+/g, 'let ');
    js = js.replace(/\bfloat\s+/g, 'let ');
    js = js.replace(/\bdouble\s+/g, 'let ');
    js = js.replace(/\bbool\s+/g, 'let ');
    js = js.replace(/\bboolean\s+/g, 'let ');
    js = js.replace(/\bbyte\s+/g, 'let ');
    js = js.replace(/\bchar\s+/g, 'let ');
    js = js.replace(/\bString\s+/g, 'let ');
    js = js.replace(/\bunsigned\s+/g, '');
    js = js.replace(/\bconst\s+int\s+/g, 'const ');
    js = js.replace(/\bconst\s+long\s+/g, 'const ');

    // Arduino constants
    js = js.replace(/\bHIGH\b/g, 'arduino.HIGH');
    js = js.replace(/\bLOW\b/g, 'arduino.LOW');
    js = js.replace(/\bINPUT\b/g, 'arduino.INPUT');
    js = js.replace(/\bOUTPUT\b/g, 'arduino.OUTPUT');
    js = js.replace(/\bINPUT_PULLUP\b/g, 'arduino.INPUT_PULLUP');
    js = js.replace(/\bLED_BUILTIN\b/g, 'arduino.LED_BUILTIN');

    // Arduino functions
    js = js.replace(/\bpinMode\s*\(/g, 'arduino.pinMode(');
    js = js.replace(/\bdigitalWrite\s*\(/g, 'arduino.digitalWrite(');
    js = js.replace(/\bdigitalRead\s*\(/g, 'arduino.digitalRead(');
    js = js.replace(/\banalogRead\s*\(/g, 'arduino.analogRead(');
    js = js.replace(/\banalogWrite\s*\(/g, 'arduino.analogWrite(');
    js = js.replace(/\bdelay\s*\(/g, 'await arduino.delay(');
    js = js.replace(/\bdelayMicroseconds\s*\(/g, 'arduino.delayMicroseconds(');
    js = js.replace(/\bmillis\s*\(/g, 'arduino.millis(');
    js = js.replace(/\bmicros\s*\(/g, 'arduino.micros(');
    js = js.replace(/\bmap\s*\(/g, 'arduino.map(');
    js = js.replace(/\bconstrain\s*\(/g, 'arduino.constrain(');
    js = js.replace(/\bmin\s*\(/g, 'arduino.min(');
    js = js.replace(/\bmax\s*\(/g, 'arduino.max(');
    js = js.replace(/\babs\s*\(/g, 'arduino.abs(');

    // Serial
    js = js.replace(/\bSerial\.begin\s*\(/g, 'arduino.Serial.begin(');
    js = js.replace(/\bSerial\.print\s*\(/g, 'arduino.Serial.print(');
    js = js.replace(/\bSerial\.println\s*\(/g, 'arduino.Serial.println(');
    js = js.replace(/\bSerial\.available\s*\(/g, 'arduino.Serial.available(');
    js = js.replace(/\bSerial\.read\s*\(/g, 'arduino.Serial.read(');
    js = js.replace(/\bSerial\.write\s*\(/g, 'arduino.Serial.write(');

    // Make functions async if they contain delay
    if (js.includes('await arduino.delay')) {
      js = js.replace(/function\s+setup\s*\(\)/g, 'async function setup()');
      js = js.replace(/function\s+loop\s*\(\)/g, 'async function loop()');
    }

    // Wrap in execution context
    const wrapped = `
(function(arduino) {
  ${js}

  return { setup, loop };
})(arduino);
`;

    return wrapped;
  }

  private compileJavaScript(code: string): CompileResult {
    const errors: CompileError[] = [];

    try {
      // Try to parse the code to check for syntax errors
      new Function(code);
    } catch (error) {
      const match = String(error).match(/line (\d+)/);
      errors.push({
        line: match ? parseInt(match[1]) : 1,
        column: 1,
        message: String(error),
        severity: 'error',
      });
    }

    return { success: errors.length === 0, code, errors, warnings: [] };
  }

  private compilePython(_code: string): CompileResult {
    // Python compilation would require a WASM Python interpreter
    // For now, return an error
    return {
      success: false,
      errors: [{
        line: 1,
        column: 1,
        message: 'Python execution not yet implemented',
        severity: 'error',
      }],
      warnings: [],
    };
  }

  async execute(code: string, language: SupportedLanguage): Promise<ExecutionResult> {
    const startTime = performance.now();
    this.serialOutput = '';

    const compileResult = this.compile(code, language);
    if (!compileResult.success) {
      return {
        success: false,
        output: '',
        error: compileResult.errors.map(e => `Line ${e.line}: ${e.message}`).join('\n'),
        duration: performance.now() - startTime,
      };
    }

    try {
      switch (language) {
        case 'arduino':
          return await this.executeArduino(compileResult.code!);
        case 'javascript':
          return await this.executeJavaScript(compileResult.code!);
        default:
          return {
            success: false,
            output: '',
            error: `Language ${language} not supported`,
            duration: performance.now() - startTime,
          };
      }
    } catch (error) {
      return {
        success: false,
        output: this.serialOutput,
        error: String(error),
        duration: performance.now() - startTime,
      };
    }
  }

  private async executeArduino(code: string): Promise<ExecutionResult> {
    const startTime = performance.now();

    if (!this.arduino) {
      return {
        success: false,
        output: '',
        error: 'Arduino not initialized',
        duration: performance.now() - startTime,
      };
    }

    try {
      // Create execution context
      const arduino = this.arduino;
      const result = eval(code);

      if (result && typeof result.setup === 'function' && typeof result.loop === 'function') {
        // Run the Arduino program
        await this.arduino.run(result.setup, result.loop);
      }

      return {
        success: true,
        output: this.serialOutput,
        duration: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        output: this.serialOutput,
        error: String(error),
        duration: performance.now() - startTime,
      };
    }
  }

  private async executeJavaScript(code: string): Promise<ExecutionResult> {
    const startTime = performance.now();
    let output = '';

    try {
      // Create a safe console
      const safeConsole = {
        log: (...args: unknown[]) => {
          output += args.map(String).join(' ') + '\n';
          this.onOutputCallback?.(output);
        },
        error: (...args: unknown[]) => {
          output += 'ERROR: ' + args.map(String).join(' ') + '\n';
          this.onOutputCallback?.(output);
        },
        warn: (...args: unknown[]) => {
          output += 'WARN: ' + args.map(String).join(' ') + '\n';
          this.onOutputCallback?.(output);
        },
      };

      // Execute in a function context
      const fn = new Function('console', code);
      fn(safeConsole);

      return {
        success: true,
        output,
        duration: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        output,
        error: String(error),
        duration: performance.now() - startTime,
      };
    }
  }

  stop(): void {
    this.arduino?.stop();
  }

  reset(): void {
    this.arduino?.reset();
    this.serialOutput = '';
  }

  getArduino(): ArduinoVirtualMachine | undefined {
    return this.arduino;
  }
}
