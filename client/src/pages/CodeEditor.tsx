/**
 * Code Editor Page
 * Standalone code editor for Arduino development
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Square,
  RotateCcw,
  Save,
  Download,
  Upload,
  Copy,
  Settings,
  Home,
  Code2,
  Terminal,
  Cpu,
  FileCode,
  FolderOpen,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import Editor from '@monaco-editor/react';

// Arduino code templates
const CODE_TEMPLATES = {
  blank: `// 새 아두이노 프로젝트
// New Arduino Project

void setup() {
  // 초기 설정 코드
}

void loop() {
  // 반복 실행 코드
}`,
  blink: `// LED 깜빡이기 (Blink)
// 아두이노 기본 예제

const int LED_PIN = 13;  // 내장 LED 핀

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("LED Blink 시작!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);   // LED 켜기
  Serial.println("LED ON");
  delay(1000);                    // 1초 대기

  digitalWrite(LED_PIN, LOW);    // LED 끄기
  Serial.println("LED OFF");
  delay(1000);                    // 1초 대기
}`,
  pwm: `// PWM LED 밝기 제어
// PWM LED Brightness Control

const int LED_PIN = 9;  // PWM 지원 핀
int brightness = 0;
int fadeAmount = 5;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  analogWrite(LED_PIN, brightness);
  Serial.print("밝기: ");
  Serial.println(brightness);

  brightness = brightness + fadeAmount;

  if (brightness <= 0 || brightness >= 255) {
    fadeAmount = -fadeAmount;
  }

  delay(30);
}`,
  button: `// 버튼으로 LED 제어
// Button LED Control

const int BUTTON_PIN = 2;
const int LED_PIN = 13;
int buttonState = 0;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  buttonState = digitalRead(BUTTON_PIN);

  if (buttonState == LOW) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("버튼 눌림 - LED ON");
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.println("버튼 해제 - LED OFF");
  }

  delay(50);
}`,
  sensor: `// 온도 센서 읽기 (TMP36)
// Temperature Sensor Reading

const int TEMP_PIN = A0;

void setup() {
  Serial.begin(9600);
  Serial.println("온도 센서 시작!");
}

void loop() {
  int reading = analogRead(TEMP_PIN);

  // 전압 계산 (5V 기준)
  float voltage = reading * 5.0 / 1024.0;

  // TMP36 온도 계산
  float temperatureC = (voltage - 0.5) * 100;
  float temperatureF = (temperatureC * 9.0 / 5.0) + 32.0;

  Serial.print("온도: ");
  Serial.print(temperatureC);
  Serial.print("°C / ");
  Serial.print(temperatureF);
  Serial.println("°F");

  delay(1000);
}`,
  servo: `// 서보 모터 제어
// Servo Motor Control

#include <Servo.h>

Servo myServo;
const int SERVO_PIN = 9;

void setup() {
  myServo.attach(SERVO_PIN);
  Serial.begin(9600);
  Serial.println("서보 모터 테스트");
}

void loop() {
  // 0도에서 180도까지 회전
  for (int pos = 0; pos <= 180; pos++) {
    myServo.write(pos);
    Serial.print("각도: ");
    Serial.println(pos);
    delay(15);
  }

  // 180도에서 0도까지 회전
  for (int pos = 180; pos >= 0; pos--) {
    myServo.write(pos);
    Serial.print("각도: ");
    Serial.println(pos);
    delay(15);
  }
}`,
};

interface CompileError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export default function CodeEditor() {
  const [code, setCode] = useState(CODE_TEMPLATES.blink);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [errors, setErrors] = useState<CompileError[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('blink');
  const [fileName, setFileName] = useState('sketch.ino');
  const [isSaved, setIsSaved] = useState(true);
  const editorRef = useRef<any>(null);

  // Handle code change
  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setIsSaved(false);
    }
  }, []);

  // Handle editor mount
  const handleEditorMount = useCallback((editor: any) => {
    editorRef.current = editor;
  }, []);

  // Simple Arduino syntax validation
  const validateCode = useCallback((code: string): CompileError[] => {
    const errors: CompileError[] = [];
    const lines = code.split('\n');

    let hasSetup = false;
    let hasLoop = false;
    let braceCount = 0;

    lines.forEach((line, index) => {
      // Check for setup() and loop()
      if (line.includes('void setup()') || line.includes('void setup ()')) {
        hasSetup = true;
      }
      if (line.includes('void loop()') || line.includes('void loop ()')) {
        hasLoop = true;
      }

      // Count braces
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      // Check for common errors
      if (line.includes('digitalwrite') || line.includes('DigitalWrite')) {
        errors.push({
          line: index + 1,
          column: line.indexOf('digitalwrite') + 1 || line.indexOf('DigitalWrite') + 1,
          message: 'digitalWrite는 대소문자를 구분합니다. "digitalWrite"로 수정하세요.',
          severity: 'error',
        });
      }

      if (line.includes('analogwrite') || line.includes('AnalogWrite')) {
        errors.push({
          line: index + 1,
          column: 1,
          message: 'analogWrite는 대소문자를 구분합니다. "analogWrite"로 수정하세요.',
          severity: 'error',
        });
      }

      // Check for missing semicolon (simple check)
      const trimmed = line.trim();
      if (
        trimmed.length > 0 &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith(',') &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('/*') &&
        !trimmed.startsWith('*') &&
        !trimmed.endsWith('*/') &&
        !trimmed.includes('void ') &&
        !trimmed.includes('if ') &&
        !trimmed.includes('else') &&
        !trimmed.includes('for ') &&
        !trimmed.includes('while ') &&
        !trimmed.includes('switch ')
      ) {
        // This is a rough check - real compilers are more sophisticated
      }
    });

    if (!hasSetup) {
      errors.push({
        line: 1,
        column: 1,
        message: 'setup() 함수가 필요합니다.',
        severity: 'error',
      });
    }

    if (!hasLoop) {
      errors.push({
        line: 1,
        column: 1,
        message: 'loop() 함수가 필요합니다.',
        severity: 'error',
      });
    }

    if (braceCount !== 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: braceCount > 0 ? '닫는 중괄호 }가 부족합니다.' : '여는 중괄호 {가 부족합니다.',
        severity: 'error',
      });
    }

    return errors;
  }, []);

  // Run code
  const handleRun = useCallback(() => {
    const validationErrors = validateCode(code);
    setErrors(validationErrors);

    if (validationErrors.filter(e => e.severity === 'error').length > 0) {
      setOutput('컴파일 오류:\n' + validationErrors.map(e => `Line ${e.line}: ${e.message}`).join('\n'));
      return;
    }

    setIsRunning(true);
    setOutput('컴파일 중...\n');

    setTimeout(() => {
      setOutput(prev => prev + '컴파일 완료!\n업로드 중...\n');

      setTimeout(() => {
        setOutput(prev => prev + '업로드 완료!\n\n--- Serial Monitor ---\n');

        // Simulate serial output
        const interval = setInterval(() => {
          if (!isRunning) {
            clearInterval(interval);
            return;
          }
          setOutput(prev => prev + `[${new Date().toLocaleTimeString()}] 시뮬레이션 실행 중...\n`);
        }, 1000);

        return () => clearInterval(interval);
      }, 500);
    }, 800);
  }, [code, validateCode, isRunning]);

  // Stop code
  const handleStop = useCallback(() => {
    setIsRunning(false);
    setOutput(prev => prev + '\n--- 실행 중지 ---\n');
  }, []);

  // Save code
  const handleSave = useCallback(() => {
    setIsSaved(true);
    // In a real app, this would save to server/localStorage
    localStorage.setItem('arduino_code', code);
    setOutput(prev => prev + `[${new Date().toLocaleTimeString()}] 저장 완료: ${fileName}\n`);
  }, [code, fileName]);

  // Download code
  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, fileName]);

  // Copy code
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setOutput(prev => prev + `[${new Date().toLocaleTimeString()}] 코드가 클립보드에 복사되었습니다.\n`);
  }, [code]);

  // Load template
  const handleTemplateChange = useCallback((template: string) => {
    setSelectedTemplate(template);
    setCode(CODE_TEMPLATES[template as keyof typeof CODE_TEMPLATES] || CODE_TEMPLATES.blank);
    setFileName(`${template}.ino`);
    setIsSaved(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isRunning) {
          handleStop();
        } else {
          handleRun();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleRun, handleStop, isRunning]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Navigation />

      {/* Main content */}
      <div className="pt-20 px-4 pb-4 h-screen flex flex-col">
        {/* Header toolbar */}
        <div className="flex items-center justify-between mb-4 bg-slate-800/50 rounded-xl p-3 backdrop-blur-sm border border-slate-700/50">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Home className="w-4 h-4 mr-2" />
                홈
              </Button>
            </Link>
            <Link href="/circuit-lab">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Cpu className="w-4 h-4 mr-2" />
                Circuit Lab
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-600" />
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Arduino Code Editor</span>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                {fileName}
              </Badge>
              {!isSaved && (
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title="저장되지 않음" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Template selector */}
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="bg-slate-700 text-white text-sm rounded-lg px-3 py-1.5 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="blank">새 프로젝트</option>
              <option value="blink">LED 깜빡이기</option>
              <option value="pwm">PWM 제어</option>
              <option value="button">버튼 입력</option>
              <option value="sensor">온도 센서</option>
              <option value="servo">서보 모터</option>
            </select>

            <div className="h-6 w-px bg-slate-600" />

            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-400 hover:text-white">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave} className="text-gray-400 hover:text-white">
              <Save className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="text-gray-400 hover:text-white">
              <Download className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-slate-600" />

            {isRunning ? (
              <Button
                onClick={handleStop}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <Square className="w-4 h-4 mr-2" />
                정지
              </Button>
            ) : (
              <Button
                onClick={handleRun}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                실행
              </Button>
            )}
          </div>
        </div>

        {/* Main editor area */}
        <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          {/* Code editor panel */}
          <div className="col-span-2 bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-700/50 border-b border-slate-600/50">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">{fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                {errors.length === 0 ? (
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    문법 정상
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400">
                    <XCircle className="w-3 h-3 mr-1" />
                    오류 {errors.length}개
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="cpp"
                value={code}
                onChange={handleCodeChange}
                onMount={handleEditorMount}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: true, scale: 0.8 },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  glyphMargin: true,
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 4,
                  renderLineHighlight: 'all',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  tabSize: 2,
                  automaticLayout: true,
                  wordWrap: 'on',
                  bracketPairColorization: { enabled: true },
                }}
              />
            </div>
          </div>

          {/* Right panel - Output & Errors */}
          <div className="flex flex-col gap-4">
            {/* Serial Monitor */}
            <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-700/50 border-b border-slate-600/50">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Serial Monitor</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOutput('')}
                  className="text-gray-400 hover:text-white h-6 px-2"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex-1 p-3 font-mono text-xs text-green-400 bg-slate-900/50 overflow-auto whitespace-pre-wrap">
                {output || '시리얼 모니터 출력이 여기에 표시됩니다...'}
              </div>
            </div>

            {/* Error panel */}
            <div className="h-48 bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-700/50 border-b border-slate-600/50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">문제</span>
                  {errors.length > 0 && (
                    <Badge className="bg-red-500/20 text-red-400 text-xs">
                      {errors.length}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex-1 p-2 overflow-auto">
                {errors.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    문제가 없습니다
                  </div>
                ) : (
                  <div className="space-y-1">
                    {errors.map((error, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                          error.severity === 'error'
                            ? 'bg-red-500/10 text-red-400'
                            : error.severity === 'warning'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}
                      >
                        {error.severity === 'error' ? (
                          <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="font-medium">Line {error.line}:</span>{' '}
                          {error.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-4 flex items-center justify-between px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Arduino UNO • ATmega328P</span>
            <span>•</span>
            <span>16 MHz</span>
            <span>•</span>
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Ctrl+S: 저장</span>
            <span>•</span>
            <span>Ctrl+Enter: 실행/정지</span>
          </div>
        </div>
      </div>
    </div>
  );
}
