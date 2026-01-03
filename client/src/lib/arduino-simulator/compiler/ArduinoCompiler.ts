/**
 * =====================================================
 * Enterprise Arduino Compiler (Transpiler)
 * =====================================================
 *
 * Arduino C++ 코드를 JavaScript로 변환하여
 * ArduinoRuntime에서 실행할 수 있게 합니다.
 *
 * 이 컴파일러는:
 * - Arduino 문법을 파싱
 * - JavaScript로 트랜스파일
 * - setup()과 loop() 함수를 추출
 * - 에러를 한국어로 보고
 */

import { CompileResult, CompiledProgram, SimulationError } from '../core/types';
import { ArduinoRuntime } from '../core/ArduinoRuntime';

// ============================================
// TOKENIZER
// ============================================

type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'CHAR'
  | 'OPERATOR'
  | 'PUNCTUATION'
  | 'COMMENT'
  | 'PREPROCESSOR'
  | 'WHITESPACE'
  | 'NEWLINE'
  | 'EOF';

interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS = new Set([
  // Data types
  'void', 'int', 'long', 'short', 'char', 'float', 'double', 'boolean', 'bool',
  'byte', 'word', 'unsigned', 'signed', 'const', 'static', 'volatile',
  'String', 'array',

  // Control flow
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break',
  'continue', 'return', 'goto',

  // Boolean
  'true', 'false', 'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP',

  // Arduino specific
  'setup', 'loop', 'Serial', 'pinMode', 'digitalWrite', 'digitalRead',
  'analogWrite', 'analogRead', 'delay', 'delayMicroseconds', 'millis', 'micros',
  'attachInterrupt', 'detachInterrupt', 'interrupts', 'noInterrupts',
  'tone', 'noTone', 'pulseIn', 'pulseInLong', 'shiftIn', 'shiftOut',
  'LED_BUILTIN', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5',

  // Math
  'abs', 'constrain', 'map', 'max', 'min', 'pow', 'sq', 'sqrt',
  'cos', 'sin', 'tan', 'random', 'randomSeed',

  // Bits
  'bit', 'bitClear', 'bitRead', 'bitSet', 'bitWrite', 'highByte', 'lowByte',

  // Classes
  'class', 'struct', 'public', 'private', 'protected', 'new', 'delete', 'this',
]);

const OPERATORS = new Set([
  '+', '-', '*', '/', '%', '=', '==', '!=', '<', '>', '<=', '>=',
  '&&', '||', '!', '&', '|', '^', '~', '<<', '>>', '++', '--',
  '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=',
  '?', ':',
]);

const PUNCTUATION = new Set([
  '(', ')', '{', '}', '[', ']', ';', ',', '.', '->', '::',
]);

class Tokenizer {
  private source: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;
  private tokens: Token[] = [];

  constructor(source: string) {
    this.source = source;
  }

  tokenize(): Token[] {
    while (this.pos < this.source.length) {
      const token = this.nextToken();
      if (token.type !== 'WHITESPACE' && token.type !== 'COMMENT') {
        this.tokens.push(token);
      }
    }
    this.tokens.push({ type: 'EOF', value: '', line: this.line, column: this.column });
    return this.tokens;
  }

  private nextToken(): Token {
    const startLine = this.line;
    const startColumn = this.column;

    const char = this.source[this.pos];

    // Whitespace
    if (/\s/.test(char)) {
      return this.readWhitespace(startLine, startColumn);
    }

    // Comments
    if (char === '/' && (this.peek(1) === '/' || this.peek(1) === '*')) {
      return this.readComment(startLine, startColumn);
    }

    // Preprocessor
    if (char === '#') {
      return this.readPreprocessor(startLine, startColumn);
    }

    // String
    if (char === '"') {
      return this.readString(startLine, startColumn);
    }

    // Character
    if (char === "'") {
      return this.readChar(startLine, startColumn);
    }

    // Number
    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(this.peek(1) || ''))) {
      return this.readNumber(startLine, startColumn);
    }

    // Identifier or keyword
    if (/[a-zA-Z_]/.test(char)) {
      return this.readIdentifier(startLine, startColumn);
    }

    // Multi-character operators
    const twoChar = char + (this.peek(1) || '');
    const threeChar = twoChar + (this.peek(2) || '');

    if (OPERATORS.has(threeChar)) {
      this.advance(3);
      return { type: 'OPERATOR', value: threeChar, line: startLine, column: startColumn };
    }

    if (OPERATORS.has(twoChar)) {
      this.advance(2);
      return { type: 'OPERATOR', value: twoChar, line: startLine, column: startColumn };
    }

    if (OPERATORS.has(char)) {
      this.advance(1);
      return { type: 'OPERATOR', value: char, line: startLine, column: startColumn };
    }

    // Punctuation
    if (PUNCTUATION.has(twoChar)) {
      this.advance(2);
      return { type: 'PUNCTUATION', value: twoChar, line: startLine, column: startColumn };
    }

    if (PUNCTUATION.has(char)) {
      this.advance(1);
      return { type: 'PUNCTUATION', value: char, line: startLine, column: startColumn };
    }

    // Unknown character
    this.advance(1);
    return { type: 'PUNCTUATION', value: char, line: startLine, column: startColumn };
  }

  private readWhitespace(line: number, column: number): Token {
    let value = '';
    while (this.pos < this.source.length && /\s/.test(this.source[this.pos])) {
      if (this.source[this.pos] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      value += this.source[this.pos];
      this.pos++;
    }
    return { type: 'WHITESPACE', value, line, column };
  }

  private readComment(line: number, column: number): Token {
    let value = '';
    if (this.peek(1) === '/') {
      // Single-line comment
      while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
        value += this.source[this.pos];
        this.pos++;
        this.column++;
      }
    } else {
      // Multi-line comment
      value = '/*';
      this.pos += 2;
      this.column += 2;
      while (this.pos < this.source.length) {
        if (this.source[this.pos] === '*' && this.peek(1) === '/') {
          value += '*/';
          this.pos += 2;
          this.column += 2;
          break;
        }
        if (this.source[this.pos] === '\n') {
          this.line++;
          this.column = 1;
        } else {
          this.column++;
        }
        value += this.source[this.pos];
        this.pos++;
      }
    }
    return { type: 'COMMENT', value, line, column };
  }

  private readPreprocessor(line: number, column: number): Token {
    let value = '';
    while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
      value += this.source[this.pos];
      this.pos++;
      this.column++;
    }
    return { type: 'PREPROCESSOR', value, line, column };
  }

  private readString(line: number, column: number): Token {
    let value = '"';
    this.pos++;
    this.column++;
    while (this.pos < this.source.length && this.source[this.pos] !== '"') {
      if (this.source[this.pos] === '\\') {
        value += this.source[this.pos];
        this.pos++;
        this.column++;
      }
      value += this.source[this.pos];
      this.pos++;
      this.column++;
    }
    value += '"';
    this.pos++;
    this.column++;
    return { type: 'STRING', value, line, column };
  }

  private readChar(line: number, column: number): Token {
    let value = "'";
    this.pos++;
    this.column++;
    while (this.pos < this.source.length && this.source[this.pos] !== "'") {
      if (this.source[this.pos] === '\\') {
        value += this.source[this.pos];
        this.pos++;
        this.column++;
      }
      value += this.source[this.pos];
      this.pos++;
      this.column++;
    }
    value += "'";
    this.pos++;
    this.column++;
    return { type: 'CHAR', value, line, column };
  }

  private readNumber(line: number, column: number): Token {
    let value = '';

    // Hexadecimal
    if (this.source[this.pos] === '0' && (this.peek(1) === 'x' || this.peek(1) === 'X')) {
      value = '0x';
      this.pos += 2;
      this.column += 2;
      while (this.pos < this.source.length && /[0-9a-fA-F]/.test(this.source[this.pos])) {
        value += this.source[this.pos];
        this.pos++;
        this.column++;
      }
      return { type: 'NUMBER', value, line, column };
    }

    // Binary
    if (this.source[this.pos] === '0' && (this.peek(1) === 'b' || this.peek(1) === 'B')) {
      value = '0b';
      this.pos += 2;
      this.column += 2;
      while (this.pos < this.source.length && /[01]/.test(this.source[this.pos])) {
        value += this.source[this.pos];
        this.pos++;
        this.column++;
      }
      return { type: 'NUMBER', value, line, column };
    }

    // Decimal or float
    while (this.pos < this.source.length && /[0-9]/.test(this.source[this.pos])) {
      value += this.source[this.pos];
      this.pos++;
      this.column++;
    }

    // Decimal point
    if (this.source[this.pos] === '.' && /[0-9]/.test(this.peek(1) || '')) {
      value += '.';
      this.pos++;
      this.column++;
      while (this.pos < this.source.length && /[0-9]/.test(this.source[this.pos])) {
        value += this.source[this.pos];
        this.pos++;
        this.column++;
      }
    }

    // Exponent
    if (this.source[this.pos] === 'e' || this.source[this.pos] === 'E') {
      value += this.source[this.pos];
      this.pos++;
      this.column++;
      if (this.source[this.pos] === '+' || this.source[this.pos] === '-') {
        value += this.source[this.pos];
        this.pos++;
        this.column++;
      }
      while (this.pos < this.source.length && /[0-9]/.test(this.source[this.pos])) {
        value += this.source[this.pos];
        this.pos++;
        this.column++;
      }
    }

    // Type suffixes (L, UL, F, etc.)
    while (this.pos < this.source.length && /[lLuUfF]/.test(this.source[this.pos])) {
      value += this.source[this.pos];
      this.pos++;
      this.column++;
    }

    return { type: 'NUMBER', value, line, column };
  }

  private readIdentifier(line: number, column: number): Token {
    let value = '';
    while (this.pos < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.pos])) {
      value += this.source[this.pos];
      this.pos++;
      this.column++;
    }
    const type: TokenType = KEYWORDS.has(value) ? 'KEYWORD' : 'IDENTIFIER';
    return { type, value, line, column };
  }

  private peek(offset: number): string | undefined {
    return this.source[this.pos + offset];
  }

  private advance(count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.source[this.pos] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.pos++;
    }
  }
}

// ============================================
// TRANSPILER
// ============================================

class ArduinoTranspiler {
  private tokens: Token[];
  private pos: number = 0;
  private output: string[] = [];
  private errors: SimulationError[] = [];
  private warnings: SimulationError[] = [];
  private variables: Map<string, { type: string; value: any }> = new Map();
  private functions: Map<string, { returnType: string; params: string[] }> = new Map();
  private currentLine: number = 1;
  private idCounter: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  transpile(): { code: string; errors: SimulationError[]; warnings: SimulationError[] } {
    this.output = [];
    this.errors = [];
    this.warnings = [];

    // Add runtime preamble
    this.output.push('// Transpiled Arduino Code\n');
    this.output.push('const HIGH = 1;\n');
    this.output.push('const LOW = 0;\n');
    this.output.push('const INPUT = "INPUT";\n');
    this.output.push('const OUTPUT = "OUTPUT";\n');
    this.output.push('const INPUT_PULLUP = "INPUT_PULLUP";\n');
    this.output.push('const LED_BUILTIN = 13;\n');
    this.output.push('const A0 = 14, A1 = 15, A2 = 16, A3 = 17, A4 = 18, A5 = 19;\n');
    this.output.push('\n');

    try {
      while (!this.isAtEnd()) {
        this.transpileStatement();
      }
    } catch (error: any) {
      this.addError(error.message || 'Unknown compilation error', this.currentLine);
    }

    return {
      code: this.output.join(''),
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  private transpileStatement(): void {
    const token = this.current();
    this.currentLine = token.line;

    // Skip preprocessor directives
    if (token.type === 'PREPROCESSOR') {
      this.handlePreprocessor();
      return;
    }

    // Function definition
    if (this.isDataType(token)) {
      this.transpileFunctionOrVariable();
      return;
    }

    // Expression statement
    this.transpileExpression();
    this.consume('PUNCTUATION', ';');
    this.output.push(';\n');
  }

  private handlePreprocessor(): void {
    const token = this.advance();
    const directive = token.value;

    if (directive.startsWith('#include')) {
      // Handle #include (ignore for now, or add library support)
      this.output.push(`// ${directive}\n`);
    } else if (directive.startsWith('#define')) {
      // Handle #define
      const match = directive.match(/#define\s+(\w+)\s+(.*)/);
      if (match) {
        const [, name, value] = match;
        this.output.push(`const ${name} = ${value || 'true'};\n`);
      }
    } else {
      this.output.push(`// ${directive}\n`);
    }
  }

  private transpileFunctionOrVariable(): void {
    const returnType = this.transpileType();
    const name = this.consume('IDENTIFIER').value;

    if (this.check('PUNCTUATION', '(')) {
      // Function definition
      this.transpileFunction(returnType, name);
    } else {
      // Variable declaration
      this.transpileVariableDeclaration(returnType, name);
    }
  }

  private transpileFunction(returnType: string, name: string): void {
    this.consume('PUNCTUATION', '(');

    // Parameters
    const params: string[] = [];
    while (!this.check('PUNCTUATION', ')')) {
      if (params.length > 0) {
        this.consume('PUNCTUATION', ',');
      }
      this.transpileType(); // Skip type
      const paramName = this.consume('IDENTIFIER').value;
      params.push(paramName);
    }
    this.consume('PUNCTUATION', ')');

    // Function body
    if (name === 'setup' || name === 'loop') {
      this.output.push(`async function ${name}(runtime) {\n`);
      this.output.push(`  const { pinMode, digitalWrite, digitalRead, analogWrite, analogRead, delay, millis, micros, Serial, map, constrain, min, max, abs, pow, sqrt, sq, random, randomSeed, HIGH, LOW, LED_BUILTIN } = runtime;\n`);
    } else {
      this.output.push(`function ${name}(${params.join(', ')}) {\n`);
    }

    this.transpileBlock();
    this.output.push('}\n\n');

    this.functions.set(name, { returnType, params });
  }

  private transpileVariableDeclaration(type: string, name: string): void {
    const jsType = this.convertType(type);

    if (this.check('PUNCTUATION', '[')) {
      // Array declaration
      this.consume('PUNCTUATION', '[');
      let size = '';
      if (!this.check('PUNCTUATION', ']')) {
        size = this.current().value;
        this.advance();
      }
      this.consume('PUNCTUATION', ']');

      if (this.check('OPERATOR', '=')) {
        this.consume('OPERATOR', '=');
        this.output.push(`let ${name} = `);
        this.transpileExpression();
      } else {
        this.output.push(`let ${name} = new Array(${size || 0}).fill(0)`);
      }
    } else if (this.check('OPERATOR', '=')) {
      this.consume('OPERATOR', '=');
      this.output.push(`let ${name} = `);
      this.transpileExpression();
    } else {
      const defaultValue = this.getDefaultValue(type);
      this.output.push(`let ${name} = ${defaultValue}`);
    }

    this.consume('PUNCTUATION', ';');
    this.output.push(';\n');

    this.variables.set(name, { type, value: null });
  }

  private transpileBlock(): void {
    this.consume('PUNCTUATION', '{');

    while (!this.check('PUNCTUATION', '}') && !this.isAtEnd()) {
      this.transpileBlockStatement();
    }

    this.consume('PUNCTUATION', '}');
  }

  private transpileBlockStatement(): void {
    const token = this.current();
    this.currentLine = token.line;

    // Control flow
    if (token.type === 'KEYWORD') {
      switch (token.value) {
        case 'if':
          this.transpileIf();
          return;
        case 'for':
          this.transpileFor();
          return;
        case 'while':
          this.transpileWhile();
          return;
        case 'do':
          this.transpileDoWhile();
          return;
        case 'switch':
          this.transpileSwitch();
          return;
        case 'return':
          this.transpileReturn();
          return;
        case 'break':
          this.advance();
          this.consume('PUNCTUATION', ';');
          this.output.push('  break;\n');
          return;
        case 'continue':
          this.advance();
          this.consume('PUNCTUATION', ';');
          this.output.push('  continue;\n');
          return;
      }
    }

    // Variable declaration
    if (this.isDataType(token)) {
      this.output.push('  ');
      this.transpileFunctionOrVariable();
      return;
    }

    // Expression statement
    this.output.push('  ');
    this.transpileExpression();
    this.consume('PUNCTUATION', ';');
    this.output.push(';\n');
  }

  private transpileIf(): void {
    this.consume('KEYWORD', 'if');
    this.consume('PUNCTUATION', '(');
    this.output.push('  if (');
    this.transpileExpression();
    this.output.push(') ');
    this.consume('PUNCTUATION', ')');

    if (this.check('PUNCTUATION', '{')) {
      this.output.push('{\n');
      this.transpileBlock();
      this.output.push('  }\n');
    } else {
      this.output.push('\n  ');
      this.transpileBlockStatement();
    }

    if (this.check('KEYWORD', 'else')) {
      this.consume('KEYWORD', 'else');
      this.output.push('  else ');

      if (this.check('KEYWORD', 'if')) {
        this.output.push('\n');
        this.transpileIf();
      } else if (this.check('PUNCTUATION', '{')) {
        this.output.push('{\n');
        this.transpileBlock();
        this.output.push('  }\n');
      } else {
        this.output.push('\n  ');
        this.transpileBlockStatement();
      }
    }
  }

  private transpileFor(): void {
    this.consume('KEYWORD', 'for');
    this.consume('PUNCTUATION', '(');
    this.output.push('  for (');

    // Init
    if (this.isDataType(this.current())) {
      const type = this.transpileType();
      const name = this.consume('IDENTIFIER').value;
      this.output.push(`let ${name}`);
      if (this.check('OPERATOR', '=')) {
        this.consume('OPERATOR', '=');
        this.output.push(' = ');
        this.transpileExpression();
      }
    } else if (!this.check('PUNCTUATION', ';')) {
      this.transpileExpression();
    }
    this.consume('PUNCTUATION', ';');
    this.output.push('; ');

    // Condition
    if (!this.check('PUNCTUATION', ';')) {
      this.transpileExpression();
    }
    this.consume('PUNCTUATION', ';');
    this.output.push('; ');

    // Update
    if (!this.check('PUNCTUATION', ')')) {
      this.transpileExpression();
    }
    this.consume('PUNCTUATION', ')');
    this.output.push(') ');

    if (this.check('PUNCTUATION', '{')) {
      this.output.push('{\n');
      this.transpileBlock();
      this.output.push('  }\n');
    } else {
      this.output.push('\n  ');
      this.transpileBlockStatement();
    }
  }

  private transpileWhile(): void {
    this.consume('KEYWORD', 'while');
    this.consume('PUNCTUATION', '(');
    this.output.push('  while (');
    this.transpileExpression();
    this.output.push(') ');
    this.consume('PUNCTUATION', ')');

    if (this.check('PUNCTUATION', '{')) {
      this.output.push('{\n');
      this.transpileBlock();
      this.output.push('  }\n');
    } else {
      this.output.push('\n  ');
      this.transpileBlockStatement();
    }
  }

  private transpileDoWhile(): void {
    this.consume('KEYWORD', 'do');
    this.output.push('  do ');

    if (this.check('PUNCTUATION', '{')) {
      this.output.push('{\n');
      this.transpileBlock();
      this.output.push('  } ');
    } else {
      this.output.push('\n  ');
      this.transpileBlockStatement();
    }

    this.consume('KEYWORD', 'while');
    this.consume('PUNCTUATION', '(');
    this.output.push('while (');
    this.transpileExpression();
    this.output.push(')');
    this.consume('PUNCTUATION', ')');
    this.consume('PUNCTUATION', ';');
    this.output.push(';\n');
  }

  private transpileSwitch(): void {
    this.consume('KEYWORD', 'switch');
    this.consume('PUNCTUATION', '(');
    this.output.push('  switch (');
    this.transpileExpression();
    this.output.push(') {\n');
    this.consume('PUNCTUATION', ')');
    this.consume('PUNCTUATION', '{');

    while (!this.check('PUNCTUATION', '}') && !this.isAtEnd()) {
      if (this.check('KEYWORD', 'case')) {
        this.consume('KEYWORD', 'case');
        this.output.push('    case ');
        this.transpileExpression();
        this.consume('PUNCTUATION', ':');
        this.output.push(':\n');
      } else if (this.check('KEYWORD', 'default')) {
        this.consume('KEYWORD', 'default');
        this.consume('PUNCTUATION', ':');
        this.output.push('    default:\n');
      } else {
        this.output.push('    ');
        this.transpileBlockStatement();
      }
    }

    this.consume('PUNCTUATION', '}');
    this.output.push('  }\n');
  }

  private transpileReturn(): void {
    this.consume('KEYWORD', 'return');
    this.output.push('  return');

    if (!this.check('PUNCTUATION', ';')) {
      this.output.push(' ');
      this.transpileExpression();
    }

    this.consume('PUNCTUATION', ';');
    this.output.push(';\n');
  }

  private transpileExpression(): void {
    this.transpileTernary();
  }

  private transpileTernary(): void {
    this.transpileLogicalOr();

    if (this.check('OPERATOR', '?')) {
      this.consume('OPERATOR', '?');
      this.output.push(' ? ');
      this.transpileExpression();
      this.consume('PUNCTUATION', ':');
      this.output.push(' : ');
      this.transpileTernary();
    }
  }

  private transpileLogicalOr(): void {
    this.transpileLogicalAnd();

    while (this.check('OPERATOR', '||')) {
      this.consume('OPERATOR', '||');
      this.output.push(' || ');
      this.transpileLogicalAnd();
    }
  }

  private transpileLogicalAnd(): void {
    this.transpileBitwiseOr();

    while (this.check('OPERATOR', '&&')) {
      this.consume('OPERATOR', '&&');
      this.output.push(' && ');
      this.transpileBitwiseOr();
    }
  }

  private transpileBitwiseOr(): void {
    this.transpileBitwiseXor();

    while (this.check('OPERATOR', '|') && !this.check('OPERATOR', '||')) {
      this.consume('OPERATOR', '|');
      this.output.push(' | ');
      this.transpileBitwiseXor();
    }
  }

  private transpileBitwiseXor(): void {
    this.transpileBitwiseAnd();

    while (this.check('OPERATOR', '^')) {
      this.consume('OPERATOR', '^');
      this.output.push(' ^ ');
      this.transpileBitwiseAnd();
    }
  }

  private transpileBitwiseAnd(): void {
    this.transpileEquality();

    while (this.check('OPERATOR', '&') && !this.check('OPERATOR', '&&')) {
      this.consume('OPERATOR', '&');
      this.output.push(' & ');
      this.transpileEquality();
    }
  }

  private transpileEquality(): void {
    this.transpileComparison();

    while (this.check('OPERATOR', '==') || this.check('OPERATOR', '!=')) {
      const op = this.advance().value;
      this.output.push(` ${op} `);
      this.transpileComparison();
    }
  }

  private transpileComparison(): void {
    this.transpileShift();

    while (
      this.check('OPERATOR', '<') ||
      this.check('OPERATOR', '>') ||
      this.check('OPERATOR', '<=') ||
      this.check('OPERATOR', '>=')
    ) {
      const op = this.advance().value;
      this.output.push(` ${op} `);
      this.transpileShift();
    }
  }

  private transpileShift(): void {
    this.transpileAdditive();

    while (this.check('OPERATOR', '<<') || this.check('OPERATOR', '>>')) {
      const op = this.advance().value;
      this.output.push(` ${op} `);
      this.transpileAdditive();
    }
  }

  private transpileAdditive(): void {
    this.transpileMultiplicative();

    while (this.check('OPERATOR', '+') || this.check('OPERATOR', '-')) {
      const op = this.advance().value;
      this.output.push(` ${op} `);
      this.transpileMultiplicative();
    }
  }

  private transpileMultiplicative(): void {
    this.transpileUnary();

    while (
      this.check('OPERATOR', '*') ||
      this.check('OPERATOR', '/') ||
      this.check('OPERATOR', '%')
    ) {
      const op = this.advance().value;
      this.output.push(` ${op} `);
      this.transpileUnary();
    }
  }

  private transpileUnary(): void {
    if (
      this.check('OPERATOR', '!') ||
      this.check('OPERATOR', '~') ||
      this.check('OPERATOR', '-') ||
      this.check('OPERATOR', '++') ||
      this.check('OPERATOR', '--')
    ) {
      const op = this.advance().value;
      this.output.push(op);
      this.transpileUnary();
      return;
    }

    this.transpilePostfix();
  }

  private transpilePostfix(): void {
    this.transpilePrimary();

    while (true) {
      if (this.check('OPERATOR', '++') || this.check('OPERATOR', '--')) {
        const op = this.advance().value;
        this.output.push(op);
      } else if (this.check('PUNCTUATION', '[')) {
        this.consume('PUNCTUATION', '[');
        this.output.push('[');
        this.transpileExpression();
        this.consume('PUNCTUATION', ']');
        this.output.push(']');
      } else if (this.check('PUNCTUATION', '.')) {
        this.consume('PUNCTUATION', '.');
        const member = this.consume('IDENTIFIER').value;
        this.output.push(`.${member}`);
      } else if (this.check('PUNCTUATION', '->')) {
        this.consume('PUNCTUATION', '->');
        const member = this.consume('IDENTIFIER').value;
        this.output.push(`.${member}`);
      } else {
        break;
      }
    }
  }

  private transpilePrimary(): void {
    const token = this.current();

    if (token.type === 'NUMBER') {
      this.advance();
      // Convert binary/hex numbers
      let value = token.value;
      if (value.startsWith('0b') || value.startsWith('0B')) {
        value = String(parseInt(value.slice(2), 2));
      }
      // Remove type suffixes
      value = value.replace(/[lLuUfF]+$/, '');
      this.output.push(value);
      return;
    }

    if (token.type === 'STRING') {
      this.advance();
      this.output.push(token.value);
      return;
    }

    if (token.type === 'CHAR') {
      this.advance();
      // Convert char to string or char code
      this.output.push(token.value);
      return;
    }

    if (token.type === 'KEYWORD' && (token.value === 'true' || token.value === 'false')) {
      this.advance();
      this.output.push(token.value);
      return;
    }

    if (token.type === 'IDENTIFIER' || token.type === 'KEYWORD') {
      const name = this.advance().value;

      // Function call
      if (this.check('PUNCTUATION', '(')) {
        this.consume('PUNCTUATION', '(');

        // Special handling for delay (make it await)
        if (name === 'delay') {
          this.output.push('await delay(');
        } else {
          this.output.push(`${name}(`);
        }

        if (!this.check('PUNCTUATION', ')')) {
          this.transpileExpression();
          while (this.check('PUNCTUATION', ',')) {
            this.consume('PUNCTUATION', ',');
            this.output.push(', ');
            this.transpileExpression();
          }
        }

        this.consume('PUNCTUATION', ')');
        this.output.push(')');
        return;
      }

      // Assignment
      if (
        this.check('OPERATOR', '=') ||
        this.check('OPERATOR', '+=') ||
        this.check('OPERATOR', '-=') ||
        this.check('OPERATOR', '*=') ||
        this.check('OPERATOR', '/=') ||
        this.check('OPERATOR', '%=') ||
        this.check('OPERATOR', '&=') ||
        this.check('OPERATOR', '|=') ||
        this.check('OPERATOR', '^=') ||
        this.check('OPERATOR', '<<=') ||
        this.check('OPERATOR', '>>=')
      ) {
        const op = this.advance().value;
        this.output.push(`${name} ${op} `);
        this.transpileExpression();
        return;
      }

      this.output.push(name);
      return;
    }

    if (this.check('PUNCTUATION', '(')) {
      this.consume('PUNCTUATION', '(');
      this.output.push('(');
      this.transpileExpression();
      this.consume('PUNCTUATION', ')');
      this.output.push(')');
      return;
    }

    if (this.check('PUNCTUATION', '{')) {
      // Array initializer
      this.consume('PUNCTUATION', '{');
      this.output.push('[');
      if (!this.check('PUNCTUATION', '}')) {
        this.transpileExpression();
        while (this.check('PUNCTUATION', ',')) {
          this.consume('PUNCTUATION', ',');
          this.output.push(', ');
          if (!this.check('PUNCTUATION', '}')) {
            this.transpileExpression();
          }
        }
      }
      this.consume('PUNCTUATION', '}');
      this.output.push(']');
      return;
    }

    // Skip unknown token
    this.advance();
  }

  private transpileType(): string {
    let type = '';

    // Handle modifiers
    while (
      this.check('KEYWORD', 'const') ||
      this.check('KEYWORD', 'static') ||
      this.check('KEYWORD', 'volatile') ||
      this.check('KEYWORD', 'unsigned') ||
      this.check('KEYWORD', 'signed')
    ) {
      type += this.advance().value + ' ';
    }

    // Main type
    if (this.current().type === 'KEYWORD' || this.current().type === 'IDENTIFIER') {
      type += this.advance().value;
    }

    return type.trim();
  }

  private convertType(cppType: string): string {
    const typeMap: Record<string, string> = {
      int: 'number',
      long: 'number',
      short: 'number',
      float: 'number',
      double: 'number',
      char: 'string',
      byte: 'number',
      word: 'number',
      boolean: 'boolean',
      bool: 'boolean',
      String: 'string',
      void: 'void',
    };

    const baseType = cppType.replace(/unsigned|signed|const|static|volatile/g, '').trim();
    return typeMap[baseType] || 'any';
  }

  private getDefaultValue(cppType: string): string {
    const baseType = cppType.replace(/unsigned|signed|const|static|volatile/g, '').trim();

    switch (baseType) {
      case 'int':
      case 'long':
      case 'short':
      case 'float':
      case 'double':
      case 'byte':
      case 'word':
        return '0';
      case 'char':
        return "''";
      case 'boolean':
      case 'bool':
        return 'false';
      case 'String':
        return '""';
      default:
        return 'null';
    }
  }

  private isDataType(token: Token): boolean {
    const dataTypes = new Set([
      'void', 'int', 'long', 'short', 'char', 'float', 'double', 'boolean', 'bool',
      'byte', 'word', 'unsigned', 'signed', 'const', 'static', 'volatile', 'String',
    ]);
    return dataTypes.has(token.value);
  }

  // Token utilities
  private current(): Token {
    return this.tokens[this.pos] || { type: 'EOF', value: '', line: 0, column: 0 };
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.pos++;
    }
    return this.tokens[this.pos - 1];
  }

  private check(type: TokenType, value?: string): boolean {
    if (this.isAtEnd()) return false;
    const token = this.current();
    return token.type === type && (value === undefined || token.value === value);
  }

  private consume(type: TokenType, value?: string): Token {
    if (this.check(type, value)) {
      return this.advance();
    }
    const token = this.current();
    this.addError(
      `Expected ${value || type}, got '${token.value}'`,
      token.line,
      token.column
    );
    throw new Error(`Compilation error at line ${token.line}`);
  }

  private isAtEnd(): boolean {
    return this.current().type === 'EOF';
  }

  private addError(message: string, line: number, column?: number): void {
    this.errors.push({
      id: `err_${++this.idCounter}`,
      severity: 'ERROR',
      code: 'COMPILE_ERROR',
      message,
      messageKo: this.translateError(message),
      line,
      column,
      timestamp: Date.now(),
    });
  }

  private translateError(message: string): string {
    // Translate common errors to Korean
    const translations: Record<string, string> = {
      'Expected': '필요함:',
      'got': '발견:',
      'Unknown compilation error': '알 수 없는 컴파일 오류',
      'Unexpected token': '예상치 못한 토큰',
    };

    let translated = message;
    for (const [en, ko] of Object.entries(translations)) {
      translated = translated.replace(en, ko);
    }
    return translated;
  }
}

// ============================================
// MAIN COMPILER CLASS
// ============================================

export class ArduinoCompiler {
  private runtime: ArduinoRuntime;

  constructor(runtime: ArduinoRuntime) {
    this.runtime = runtime;
  }

  compile(sourceCode: string): CompileResult {
    const startTime = performance.now();

    try {
      // Tokenize
      const tokenizer = new Tokenizer(sourceCode);
      const tokens = tokenizer.tokenize();

      // Transpile
      const transpiler = new ArduinoTranspiler(tokens);
      const { code, errors, warnings } = transpiler.transpile();

      if (errors.length > 0) {
        return {
          success: false,
          errors,
          warnings,
          compilationTimeMs: performance.now() - startTime,
        };
      }

      // Create executable program
      const program = this.createProgram(code);

      return {
        success: true,
        errors: [],
        warnings,
        output: program,
        compilationTimeMs: performance.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        errors: [{
          id: 'fatal',
          severity: 'FATAL',
          code: 'FATAL_ERROR',
          message: error.message || String(error),
          messageKo: `치명적 오류: ${error.message || String(error)}`,
          timestamp: Date.now(),
        }],
        warnings: [],
        compilationTimeMs: performance.now() - startTime,
      };
    }
  }

  private createProgram(transpiledCode: string): CompiledProgram {
    const runtime = this.runtime;

    // Create a function that returns setup and loop
    const createFunctions = new Function('runtime', `
      ${transpiledCode}
      return { setup, loop };
    `);

    const { setup, loop } = createFunctions(runtime);

    return {
      setupFunction: () => setup(runtime),
      loopFunction: () => loop(runtime),
      variables: new Map(),
      functions: new Map(),
    };
  }
}

// Export factory function
export function createArduinoCompiler(runtime: ArduinoRuntime): ArduinoCompiler {
  return new ArduinoCompiler(runtime);
}
