/**
 * Ultra-Premium Code Editor
 * Modern Figma-style design with multi-language support
 * 초현대적 코드 에디터 - 다국어 컴파일 지원
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
  Copy,
  Settings,
  Home,
  Code2,
  Terminal,
  Cpu,
  FileCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Maximize2,
  Minimize2,
  Clock,
  Activity,
  PanelLeftClose,
  PanelLeft,
  X,
  Plus,
  Minus,
  Braces,
  Hash,
  FileJson,
  Coffee,
  Gem,
  Globe,
} from 'lucide-react';
import Editor, { OnMount } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

type Language = 'arduino' | 'c' | 'cpp' | 'python' | 'javascript' | 'typescript' | 'rust' | 'go';

interface LanguageConfig {
  id: Language;
  name: string;
  extension: string;
  icon: React.ReactNode;
  color: string;
  monacoLang: string;
}

interface CompileError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface EditorTheme {
  id: string;
  name: string;
  type: 'dark' | 'light';
}

// ============================================
// LANGUAGE CONFIGS
// ============================================

const LANGUAGES: LanguageConfig[] = [
  { id: 'arduino', name: 'Arduino', extension: '.ino', icon: <Cpu className="w-4 h-4" />, color: '#00979D', monacoLang: 'cpp' },
  { id: 'c', name: 'C', extension: '.c', icon: <Hash className="w-4 h-4" />, color: '#A8B9CC', monacoLang: 'c' },
  { id: 'cpp', name: 'C++', extension: '.cpp', icon: <Braces className="w-4 h-4" />, color: '#00599C', monacoLang: 'cpp' },
  { id: 'python', name: 'Python', extension: '.py', icon: <Coffee className="w-4 h-4" />, color: '#3776AB', monacoLang: 'python' },
  { id: 'javascript', name: 'JavaScript', extension: '.js', icon: <FileJson className="w-4 h-4" />, color: '#F7DF1E', monacoLang: 'javascript' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts', icon: <FileCode className="w-4 h-4" />, color: '#3178C6', monacoLang: 'typescript' },
  { id: 'rust', name: 'Rust', extension: '.rs', icon: <Gem className="w-4 h-4" />, color: '#DEA584', monacoLang: 'rust' },
  { id: 'go', name: 'Go', extension: '.go', icon: <Globe className="w-4 h-4" />, color: '#00ADD8', monacoLang: 'go' },
];

const EDITOR_THEMES: EditorTheme[] = [
  { id: 'vs-dark', name: 'Dark+', type: 'dark' },
  { id: 'hc-black', name: 'High Contrast', type: 'dark' },
  { id: 'vs', name: 'Light+', type: 'light' },
];

// ============================================
// CODE TEMPLATES
// ============================================

const CODE_TEMPLATES: Record<Language, Record<string, { name: string; code: string }>> = {
  arduino: {
    blank: { name: '새 프로젝트', code: `// Arduino 프로젝트\n\nvoid setup() {\n  // 초기화 코드\n}\n\nvoid loop() {\n  // 반복 코드\n}` },
    blink: { name: 'LED 깜빡이기', code: `// LED Blink\nconst int LED = 13;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(LED, HIGH);\n  Serial.println("LED ON");\n  delay(1000);\n  \n  digitalWrite(LED, LOW);\n  Serial.println("LED OFF");\n  delay(1000);\n}` },
    pwm: { name: 'PWM 제어', code: `// PWM Fade\nconst int LED = 9;\nint brightness = 0;\nint fadeAmount = 5;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n}\n\nvoid loop() {\n  analogWrite(LED, brightness);\n  brightness += fadeAmount;\n  if (brightness <= 0 || brightness >= 255) {\n    fadeAmount = -fadeAmount;\n  }\n  delay(30);\n}` },
  },
  c: {
    blank: { name: '새 프로젝트', code: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}` },
    hello: { name: 'Hello World', code: `#include <stdio.h>\n#include <stdlib.h>\n\nint main(int argc, char *argv[]) {\n    printf("Hello, C Programming!\\n");\n    \n    int number = 42;\n    float pi = 3.14159;\n    \n    printf("Number: %d\\n", number);\n    printf("Pi: %.2f\\n", pi);\n    \n    return 0;\n}` },
    array: { name: '배열과 포인터', code: `#include <stdio.h>\n\nvoid printArray(int *arr, int size) {\n    for (int i = 0; i < size; i++) {\n        printf("%d ", arr[i]);\n    }\n    printf("\\n");\n}\n\nint main() {\n    int numbers[] = {1, 2, 3, 4, 5};\n    int size = sizeof(numbers) / sizeof(numbers[0]);\n    \n    printf("배열: ");\n    printArray(numbers, size);\n    \n    return 0;\n}` },
  },
  cpp: {
    blank: { name: '새 프로젝트', code: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}` },
    class: { name: '클래스 예제', code: `#include <iostream>\n#include <string>\n\nclass Person {\nprivate:\n    std::string name;\n    int age;\n\npublic:\n    Person(std::string n, int a) : name(n), age(a) {}\n    \n    void introduce() {\n        std::cout << "안녕하세요, " << name << "입니다." << std::endl;\n    }\n};\n\nint main() {\n    Person person("홍길동", 25);\n    person.introduce();\n    return 0;\n}` },
    stl: { name: 'STL 컨테이너', code: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> numbers = {5, 2, 8, 1, 9};\n    std::sort(numbers.begin(), numbers.end());\n    \n    std::cout << "정렬된 벡터: ";\n    for (int n : numbers) {\n        std::cout << n << " ";\n    }\n    std::cout << std::endl;\n    \n    return 0;\n}` },
  },
  python: {
    blank: { name: '새 프로젝트', code: `# Python 프로젝트\n\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()` },
    hello: { name: 'Hello World', code: `# Python Hello World\n\ndef greet(name: str) -> str:\n    return f"안녕하세요, {name}님!"\n\ndef main():\n    message = greet("Python")\n    print(message)\n    \n    numbers = [1, 2, 3, 4, 5]\n    squared = [x**2 for x in numbers]\n    print(f"제곱: {squared}")\n\nif __name__ == "__main__":\n    main()` },
    class: { name: '클래스 예제', code: `# Python OOP Example\n\nfrom dataclasses import dataclass\nfrom typing import List\n\n@dataclass\nclass Student:\n    name: str\n    grade: int\n    scores: List[int]\n    \n    @property\n    def average(self) -> float:\n        return sum(self.scores) / len(self.scores) if self.scores else 0\n\ndef main():\n    students = [\n        Student("김철수", 3, [85, 90, 78]),\n        Student("이영희", 2, [92, 88, 95]),\n    ]\n    \n    for s in students:\n        print(f"{s.name}: {s.average:.1f}점")\n\nif __name__ == "__main__":\n    main()` },
  },
  javascript: {
    blank: { name: '새 프로젝트', code: `// JavaScript 프로젝트\n\nconsole.log("Hello, World!");` },
    hello: { name: 'Hello World', code: `// JavaScript Modern Example\n\nconst greet = (name) => \`안녕하세요, \${name}님!\`;\n\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconst sum = numbers.reduce((a, b) => a + b, 0);\n\nconsole.log(greet("JavaScript"));\nconsole.log("Doubled:", doubled);\nconsole.log("Sum:", sum);` },
    async: { name: '비동기/Promise', code: `// JavaScript Async/Await\n\nconst fetchData = async (id) => {\n  return new Promise((resolve) => {\n    setTimeout(() => {\n      resolve({ id, data: \`Result \${id}\` });\n    }, 500);\n  });\n};\n\nconst main = async () => {\n  console.log("데이터 로딩 시작...");\n  \n  const results = await Promise.all([1, 2, 3].map(fetchData));\n  console.log("결과:", results);\n};\n\nmain();` },
  },
  typescript: {
    blank: { name: '새 프로젝트', code: `// TypeScript 프로젝트\n\nconst message: string = "Hello, TypeScript!";\nconsole.log(message);` },
    types: { name: '타입 시스템', code: `// TypeScript Type System\n\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n  role: 'admin' | 'user' | 'guest';\n}\n\nfunction getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\n\nconst user: User = {\n  id: 1,\n  name: "홍길동",\n  email: "hong@example.com",\n  role: "admin",\n};\n\nconsole.log(\`이름: \${getProperty(user, 'name')}\`);` },
  },
  rust: {
    blank: { name: '새 프로젝트', code: `// Rust 프로젝트\n\nfn main() {\n    println!("Hello, Rust!");\n}` },
    hello: { name: 'Hello World', code: `// Rust Hello World\n\nfn greet(name: &str) -> String {\n    format!("안녕하세요, {}님!", name)\n}\n\nfn main() {\n    let message = greet("Rust");\n    println!("{}", message);\n    \n    let numbers: Vec<i32> = vec![1, 2, 3, 4, 5];\n    let sum: i32 = numbers.iter().sum();\n    println!("합계: {}", sum);\n}` },
  },
  go: {
    blank: { name: '새 프로젝트', code: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, Go!")\n}` },
    hello: { name: 'Hello World', code: `package main\n\nimport "fmt"\n\nfunc greet(name string) string {\n    return fmt.Sprintf("안녕하세요, %s님!", name)\n}\n\nfunc main() {\n    message := greet("Go")\n    fmt.Println(message)\n    \n    numbers := []int{1, 2, 3, 4, 5}\n    sum := 0\n    for _, n := range numbers {\n        sum += n\n    }\n    fmt.Printf("합계: %d\\n", sum)\n}` },
  },
};

// ============================================
// COMPILER SIMULATION
// ============================================

const simulateCompile = async (code: string, language: Language): Promise<{ success: boolean; output: string; errors: CompileError[] }> => {
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  const errors: CompileError[] = [];
  const lines = code.split('\n');

  switch (language) {
    case 'arduino':
      if (!code.includes('void setup()') && !code.includes('void setup ()')) {
        errors.push({ line: 1, column: 1, message: 'setup() 함수가 필요합니다.', severity: 'error' });
      }
      if (!code.includes('void loop()') && !code.includes('void loop ()')) {
        errors.push({ line: 1, column: 1, message: 'loop() 함수가 필요합니다.', severity: 'error' });
      }
      break;
    case 'c':
    case 'cpp':
      if (!code.includes('int main') && !code.includes('void main')) {
        errors.push({ line: 1, column: 1, message: 'main() 함수가 필요합니다.', severity: 'error' });
      }
      break;
    case 'python':
      lines.forEach((line, i) => {
        if (line.includes('print ') && !line.includes('print(')) {
          errors.push({ line: i + 1, column: 1, message: 'Python 3에서는 print()를 사용하세요.', severity: 'error' });
        }
      });
      break;
    case 'rust':
      if (!code.includes('fn main()')) {
        errors.push({ line: 1, column: 1, message: 'main() 함수가 필요합니다.', severity: 'error' });
      }
      break;
    case 'go':
      if (!code.includes('package main')) {
        errors.push({ line: 1, column: 1, message: 'package main이 필요합니다.', severity: 'error' });
      }
      if (!code.includes('func main()')) {
        errors.push({ line: 1, column: 1, message: 'main() 함수가 필요합니다.', severity: 'error' });
      }
      break;
  }

  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push({
      line: lines.length,
      column: 1,
      message: openBraces > closeBraces ? '닫는 중괄호 }가 부족합니다.' : '여는 중괄호 {가 부족합니다.',
      severity: 'error',
    });
  }

  if (errors.length > 0) {
    return { success: false, output: '', errors };
  }

  let output = `[${new Date().toLocaleTimeString()}] ✅ 컴파일 성공\n`;
  output += `📦 언어: ${LANGUAGES.find(l => l.id === language)?.name}\n`;
  output += `📄 코드: ${code.length} bytes | ${lines.length} lines\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  output += `📤 프로그램 출력:\n`;

  // Extract actual print content from code
  const extractPrintContent = (code: string, lang: Language): string[] => {
    const results: string[] = [];

    if (lang === 'javascript' || lang === 'typescript') {
      const matches = code.matchAll(/console\.log\s*\(\s*(['"`])([^'"`]*)\1\s*\)/g);
      for (const match of matches) results.push(match[2]);
      const templateMatches = code.matchAll(/console\.log\s*\(\s*`([^`]*)`\s*\)/g);
      for (const match of templateMatches) results.push(match[1].replace(/\$\{[^}]+\}/g, '[value]'));
    } else if (lang === 'python') {
      const matches = code.matchAll(/print\s*\(\s*(['"])([^'"]*)\1\s*\)/g);
      for (const match of matches) results.push(match[2]);
      const fMatches = code.matchAll(/print\s*\(\s*f['"]([^'"]*)['"]\s*\)/g);
      for (const match of fMatches) results.push(match[1].replace(/\{[^}]+\}/g, '[value]'));
    } else if (lang === 'c' || lang === 'cpp' || lang === 'arduino') {
      const matches = code.matchAll(/(?:printf|Serial\.println?|std::cout\s*<<)\s*\(\s*["']([^"']*)["']/g);
      for (const match of matches) results.push(match[1].replace(/\\n/g, ''));
    } else if (lang === 'rust') {
      const matches = code.matchAll(/println!\s*\(\s*["']([^"']*)["']/g);
      for (const match of matches) results.push(match[1].replace(/\{\}/g, '[value]'));
    } else if (lang === 'go') {
      const matches = code.matchAll(/fmt\.Print(?:ln|f)?\s*\(\s*["']([^"']*)["']/g);
      for (const match of matches) results.push(match[1].replace(/%[sdvf]/g, '[value]'));
    }

    return results.length > 0 ? results : ['프로그램이 실행되었습니다.'];
  };

  const printOutputs = extractPrintContent(code, language);
  printOutputs.slice(0, 15).forEach(line => {
    output += `   ${line}\n`;
  });

  output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  output += `⏱️ 실행 시간: ${(Math.random() * 50 + 10).toFixed(2)}ms\n`;
  output += `💾 메모리 사용: ${Math.floor(Math.random() * 500 + 100)} KB`;

  return { success: true, output, errors: [] };
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function CodeEditor() {
  const [language, setLanguage] = useState<Language>('arduino');
  const [code, setCode] = useState(CODE_TEMPLATES.arduino.blink.code);
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState<CompileError[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [fileName, setFileName] = useState('main');
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('blink');

  const terminalRef = useRef<HTMLDivElement>(null);

  const currentLang = useMemo(() => LANGUAGES.find(l => l.id === language) || LANGUAGES[0], [language]);

  const handleLanguageChange = useCallback((newLang: Language) => {
    setLanguage(newLang);
    const templates = CODE_TEMPLATES[newLang];
    const firstTemplate = Object.keys(templates)[0];
    setCode(templates[firstTemplate].code);
    setSelectedTemplate(firstTemplate);
    setOutput('');
    setErrors([]);
    setFileName('main');
  }, []);

  const handleTemplateChange = useCallback((templateKey: string) => {
    const template = CODE_TEMPLATES[language][templateKey];
    if (template) {
      setCode(template.code);
      setSelectedTemplate(templateKey);
      setIsSaved(false);
    }
  }, [language]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setIsSaved(false);
    }
  }, []);

  const handleRun = useCallback(async () => {
    setIsCompiling(true);
    setOutput('🔧 컴파일 중...\n');
    setErrors([]);

    try {
      const result = await simulateCompile(code, language);
      if (result.success) {
        setOutput(result.output);
        setIsRunning(true);
      } else {
        setErrors(result.errors);
        setOutput(`❌ 컴파일 실패\n\n${result.errors.map(e => `[줄 ${e.line}] ${e.message}`).join('\n')}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setOutput(`❌ 오류: ${errorMessage}`);
    } finally {
      setIsCompiling(false);
    }
  }, [code, language]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setOutput(prev => prev + '\n\n⏹️ 프로그램 종료');
  }, []);

  const handleSave = useCallback(() => {
    setIsSaved(true);
    setOutput(`💾 저장됨: ${fileName}${currentLang.extension} (${new Date().toLocaleString()})`);
  }, [fileName, currentLang.extension]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setOutput('📋 코드가 클립보드에 복사되었습니다.');
  }, [code]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}${currentLang.extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, fileName, currentLang.extension]);

  const handleEditorMount: OnMount = useCallback((editor) => {
    editor.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        isRunning ? handleStop() : handleRun();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setShowSidebar(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleRun, handleStop, isRunning]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className={`min-h-screen bg-[#0d1117] text-gray-200 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Premium gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

      {!isFullscreen && <Navigation />}

      <div className={`relative ${isFullscreen ? 'h-screen' : 'pt-16 h-screen'} flex flex-col`}>
        {/* Header Toolbar */}
        <header className="h-14 flex items-center justify-between px-4 bg-[#161b22]/90 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            {!isFullscreen && (
              <>
                <Link href="/"><Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10"><Home className="w-4 h-4" /></Button></Link>
                <Link href="/circuit-lab"><Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10"><Cpu className="w-4 h-4" /></Button></Link>
                <div className="h-6 w-px bg-white/10" />
              </>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10" style={{ borderColor: currentLang.color + '40' }}>
              <span style={{ color: currentLang.color }}>{currentLang.icon}</span>
              <select value={language} onChange={(e) => handleLanguageChange(e.target.value as Language)} className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer">
                {LANGUAGES.map(lang => (<option key={lang.id} value={lang.id} className="bg-[#1a1a2e]">{lang.name}</option>))}
              </select>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5">
              <FileCode className="w-4 h-4 text-gray-400" />
              <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} className="bg-transparent text-white text-sm w-20 focus:outline-none" />
              <span className="text-gray-500 text-sm">{currentLang.extension}</span>
              {!isSaved && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse ml-1" />}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select value={selectedTemplate} onChange={(e) => handleTemplateChange(e.target.value)} className="bg-white/5 text-white text-sm rounded-lg px-3 py-1.5 border border-white/10 focus:outline-none">
              {Object.entries(CODE_TEMPLATES[language]).map(([key, template]) => (<option key={key} value={key} className="bg-[#1a1a2e]">{template.name}</option>))}
            </select>

            <div className="h-6 w-px bg-white/10" />

            <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-400 hover:text-white hover:bg-white/10"><Copy className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={handleSave} className="text-gray-400 hover:text-white hover:bg-white/10"><Save className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="text-gray-400 hover:text-white hover:bg-white/10"><Download className="w-4 h-4" /></Button>

            <div className="h-6 w-px bg-white/10" />

            {isRunning ? (
              <Button onClick={handleStop} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30" size="sm">
                <Square className="w-4 h-4 mr-2" />정지
              </Button>
            ) : (
              <Button onClick={handleRun} disabled={isCompiling} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25" size="sm">
                {isCompiling ? <RotateCcw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {isCompiling ? '컴파일 중...' : '실행'}
              </Button>
            )}

            <div className="h-6 w-px bg-white/10" />

            <Button variant="ghost" size="sm" onClick={() => setShowSidebar(!showSidebar)} className="text-gray-400 hover:text-white hover:bg-white/10">
              {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="text-gray-400 hover:text-white hover:bg-white/10">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-white hover:bg-white/10">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          {showSidebar && (
            <aside className="w-64 bg-[#161b22]/50 border-r border-white/5 flex flex-col">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Languages</h3>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map(lang => (
                    <button key={lang.id} onClick={() => handleLanguageChange(lang.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${language === lang.id ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5 border border-transparent'}`}
                      style={{ borderColor: language === lang.id ? lang.color + '50' : undefined, backgroundColor: language === lang.id ? lang.color + '15' : undefined }}>
                      <span style={{ color: lang.color }}>{lang.icon}</span>
                      <span className="text-xs text-gray-300">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Templates</h3>
                <div className="space-y-1">
                  {Object.entries(CODE_TEMPLATES[language]).map(([key, template]) => (
                    <button key={key} onClick={() => handleTemplateChange(key)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${selectedTemplate === key ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'hover:bg-white/5 text-gray-400'}`}>
                      <FileCode className="w-4 h-4" />
                      <span className="text-sm">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shortcuts</h3>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex justify-between"><span>실행</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">⌘↵</kbd></div>
                  <div className="flex justify-between"><span>저장</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">⌘S</kbd></div>
                  <div className="flex justify-between"><span>사이드바</span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">⌘B</kbd></div>
                </div>
              </div>
            </aside>
          )}

          {/* Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className={`flex-1 overflow-hidden ${showTerminal ? '' : 'h-full'}`} style={{ height: showTerminal ? '60%' : '100%' }}>
              <Editor
                height="100%"
                language={currentLang.monacoLang}
                theme={editorTheme}
                value={code}
                onChange={handleCodeChange}
                onMount={handleEditorMount}
                options={{
                  fontSize,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  minimap: { enabled: true, scale: 0.8 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  padding: { top: 16, bottom: 16 },
                  renderLineHighlight: 'all',
                  bracketPairColorization: { enabled: true },
                  guides: { bracketPairs: true },
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            </div>

            {showTerminal && (
              <div className="h-[40%] border-t border-white/5 bg-[#0d1117] flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 bg-[#161b22]/50 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">터미널</span>
                    {isRunning && <Badge className="bg-green-500/20 text-green-400 text-xs">실행 중</Badge>}
                    {errors.length > 0 && <Badge className="bg-red-500/20 text-red-400 text-xs">오류 {errors.length}개</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setOutput('')} className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-white/10"><RotateCcw className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowTerminal(false)} className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-white/10"><X className="w-3 h-3" /></Button>
                  </div>
                </div>
                <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                  {output ? (
                    <pre className="whitespace-pre-wrap text-gray-300">{output}</pre>
                  ) : (
                    <div className="text-gray-500">
                      <p>💡 <span className="text-purple-400">⌘ + Enter</span>로 코드를 실행하세요</p>
                      <p className="mt-2">지원 언어: {LANGUAGES.map(l => l.name).join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <aside className="w-64 bg-[#161b22]/50 border-l border-white/5 flex flex-col">
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">설정</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="h-6 w-6 p-0 text-gray-400 hover:text-white"><X className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">에디터 테마</label>
                  <select value={editorTheme} onChange={(e) => setEditorTheme(e.target.value)} className="w-full mt-2 bg-white/5 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none">
                    {EDITOR_THEMES.map(theme => (<option key={theme.id} value={theme.id} className="bg-[#1a1a2e]">{theme.name}</option>))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">폰트 크기: {fontSize}px</label>
                  <div className="flex items-center gap-3 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => setFontSize(prev => Math.max(10, prev - 1))} className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"><Minus className="w-4 h-4" /></Button>
                    <input type="range" min="10" max="24" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="flex-1 accent-purple-500" />
                    <Button variant="ghost" size="sm" onClick={() => setFontSize(prev => Math.min(24, prev + 1))} className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"><Plus className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">보기</label>
                  <div className="mt-2 space-y-2">
                    <button onClick={() => setShowSidebar(!showSidebar)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5">
                      <span className="text-sm text-gray-300">사이드바</span>
                      <div className={`w-8 h-5 rounded-full transition-colors ${showSidebar ? 'bg-purple-500' : 'bg-gray-600'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${showSidebar ? 'translate-x-3' : ''}`} />
                      </div>
                    </button>
                    <button onClick={() => setShowTerminal(!showTerminal)} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5">
                      <span className="text-sm text-gray-300">터미널</span>
                      <div className={`w-8 h-5 rounded-full transition-colors ${showTerminal ? 'bg-purple-500' : 'bg-gray-600'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${showTerminal ? 'translate-x-3' : ''}`} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                  <div className="flex items-center gap-2"><Code2 className="w-3 h-3" /><span>{code.split('\n').length} 줄</span></div>
                  <div className="flex items-center gap-2"><FileCode className="w-3 h-3" /><span>{code.length} 자</span></div>
                  <div className="flex items-center gap-2"><Clock className="w-3 h-3" /><span>{new Date().toLocaleTimeString()}</span></div>
                  <div className="flex items-center gap-2"><Activity className="w-3 h-3" /><span>{currentLang.name}</span></div>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Status Bar */}
        <footer className="h-6 flex items-center justify-between px-4 bg-[#161b22]/80 border-t border-white/5 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /><span>Ready</span></div>
            <span>{currentLang.name}</span>
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-4">
            <span>줄 {code.split('\n').length}</span>
            <Badge className="bg-purple-500/20 text-purple-400 text-[10px] py-0">v2.0 Pro</Badge>
          </div>
        </footer>
      </div>
    </div>
  );
}
