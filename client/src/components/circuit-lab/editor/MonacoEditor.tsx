/**
 * Monaco Code Editor Component
 * Professional-grade code editor with multi-language support
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Square,
  Save,
  Settings,
  FileCode,
  Maximize2,
  Minimize2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export type SupportedLanguage = 'arduino' | 'javascript' | 'python' | 'html' | 'css' | 'cpp';

interface EditorTab {
  id: string;
  name: string;
  language: SupportedLanguage;
  content: string;
  isDirty: boolean;
}

interface MonacoEditorProps {
  initialCode?: string;
  language?: SupportedLanguage;
  onCodeChange?: (code: string) => void;
  onRun?: (code: string, language: SupportedLanguage) => void;
  onStop?: () => void;
  isRunning?: boolean;
  errors?: { line: number; message: string }[];
  theme?: 'dark' | 'light';
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const LANGUAGE_CONFIG: Record<SupportedLanguage, { monacoLang: string; extension: string }> = {
  arduino: { monacoLang: 'cpp', extension: '.ino' },
  javascript: { monacoLang: 'javascript', extension: '.js' },
  python: { monacoLang: 'python', extension: '.py' },
  html: { monacoLang: 'html', extension: '.html' },
  css: { monacoLang: 'css', extension: '.css' },
  cpp: { monacoLang: 'cpp', extension: '.cpp' },
};

const DEFAULT_ARDUINO_CODE = `// Arduino Blink Example
// LED connected to pin 13

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  Serial.println("Arduino started!");

  // Set LED pin as output
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  // Turn LED on
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("LED ON");
  delay(1000);

  // Turn LED off
  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
`;

export function MonacoEditor({
  initialCode = DEFAULT_ARDUINO_CODE,
  language = 'arduino',
  onCodeChange,
  onRun,
  onStop,
  isRunning = false,
  errors = [],
  theme = 'dark',
  isFullscreen = false,
  onToggleFullscreen,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState('main');
  const [tabs, setTabs] = useState<EditorTab[]>([
    {
      id: 'main',
      name: `sketch${LANGUAGE_CONFIG[language].extension}`,
      language,
      content: initialCode,
      isDirty: false,
    },
  ]);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(language);
  const [status, setStatus] = useState<'idle' | 'running' | 'error' | 'success'>('idle');

  // Handle editor mount
  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontLigatures: true,
      minimap: { enabled: true, scale: 1 },
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      bracketPairColorization: { enabled: true },
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      padding: { top: 16, bottom: 16 },
    });

    // Register Arduino language configuration
    monaco.languages.register({ id: 'arduino' });
    monaco.languages.setMonarchTokensProvider('arduino', {
      keywords: [
        'void', 'int', 'long', 'float', 'double', 'bool', 'boolean', 'byte',
        'char', 'String', 'unsigned', 'const', 'static', 'volatile',
        'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
        'break', 'continue', 'return', 'true', 'false', 'null',
      ],
      arduinoKeywords: [
        'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP', 'LED_BUILTIN',
        'pinMode', 'digitalWrite', 'digitalRead', 'analogRead', 'analogWrite',
        'delay', 'delayMicroseconds', 'millis', 'micros',
        'Serial', 'begin', 'print', 'println', 'available', 'read', 'write',
        'setup', 'loop', 'map', 'constrain', 'min', 'max', 'abs',
      ],
      tokenizer: {
        root: [
          [/[a-zA-Z_]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@arduinoKeywords': 'keyword.arduino',
              '@default': 'identifier',
            },
          }],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
          [/"([^"\\]|\\.)*"/, 'string'],
          [/'([^'\\]|\\.)*'/, 'string'],
          [/\d+/, 'number'],
          [/[{}()\[\]]/, '@brackets'],
          [/[;,.]/, 'delimiter'],
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment'],
        ],
      },
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      onStop?.();
    });

    // Focus the editor
    editor.focus();
  };

  // Handle code change
  const handleCodeChange: OnChange = (value) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange?.(newCode);

    // Mark tab as dirty
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === activeTab ? { ...tab, content: newCode, isDirty: true } : tab
      )
    );
  };

  // Update error markers
  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const markers = errors.map(error => ({
      severity: monacoRef.current!.MarkerSeverity.Error,
      startLineNumber: error.line,
      startColumn: 1,
      endLineNumber: error.line,
      endColumn: 1000,
      message: error.message,
    }));

    monacoRef.current.editor.setModelMarkers(model, 'errors', markers);
    setStatus(errors.length > 0 ? 'error' : 'idle');
  }, [errors]);

  // Update status based on running state
  useEffect(() => {
    setStatus(isRunning ? 'running' : errors.length > 0 ? 'error' : 'idle');
  }, [isRunning, errors]);

  const handleRun = useCallback(() => {
    if (onRun) {
      setStatus('running');
      onRun(code, currentLanguage);
    }
  }, [code, currentLanguage, onRun]);

  const handleSave = useCallback(() => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === activeTab ? { ...tab, isDirty: false } : tab
      )
    );
  }, [activeTab]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === activeTab
          ? {
              ...tab,
              language: lang,
              name: `sketch${LANGUAGE_CONFIG[lang].extension}`,
            }
          : tab
      )
    );
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#1e1e1e] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300 font-medium">
            {tabs.find(t => t.id === activeTab)?.name}
          </span>
          {tabs.find(t => t.id === activeTab)?.isDirty && (
            <span className="w-2 h-2 rounded-full bg-white/60" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            value={currentLanguage}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            className="bg-[#3c3c3c] text-gray-300 text-xs px-2 py-1 rounded border-none outline-none"
          >
            <option value="arduino">Arduino</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>

          {/* Status indicator */}
          <div className="flex items-center gap-1 px-2">
            {getStatusIcon()}
            <span className="text-xs text-gray-400 capitalize">{status}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 border-l border-[#3c3c3c] pl-2 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="h-7 px-2 text-gray-300 hover:text-white hover:bg-[#3c3c3c]"
              title="Save (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
            </Button>

            {isRunning ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onStop}
                className="h-7 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                title="Stop (Ctrl+Shift+Enter)"
              >
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRun}
                className="h-7 px-3 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                title="Run (Ctrl+Enter)"
              >
                <Play className="w-4 h-4 mr-1" />
                Run
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullscreen}
              className="h-7 px-2 text-gray-300 hover:text-white hover:bg-[#3c3c3c]"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center bg-[#2d2d2d] border-b border-[#3c3c3c] overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-[#3c3c3c] transition-colors ${
              activeTab === tab.id
                ? 'bg-[#1e1e1e] text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{tab.name}</span>
            {tab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-white/60" />}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={LANGUAGE_CONFIG[currentLanguage].monacoLang}
          value={code}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onMount={handleEditorMount}
          onChange={handleCodeChange}
          options={{
            readOnly: isRunning,
          }}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#007acc] text-white text-xs">
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="uppercase">{currentLanguage}</span>
          <Badge variant="secondary" className="h-4 text-[10px] bg-white/20 text-white">
            Circuit Lab
          </Badge>
        </div>
      </div>
    </div>
  );
}
