'use client';

import React, { useRef, useCallback } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { useCircuitStore } from '@/store/circuitStore';
import { Play, Upload, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

// Arduino language configuration
const ARDUINO_LANGUAGE_CONFIG = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
  ],
};

// Arduino keywords and built-in functions
const ARDUINO_KEYWORDS = [
  'void',
  'boolean',
  'char',
  'unsigned',
  'byte',
  'int',
  'word',
  'long',
  'short',
  'float',
  'double',
  'String',
  'array',
  'static',
  'volatile',
  'const',
  'true',
  'false',
  'HIGH',
  'LOW',
  'INPUT',
  'OUTPUT',
  'INPUT_PULLUP',
  'LED_BUILTIN',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'default',
  'break',
  'continue',
  'return',
  'goto',
];

const ARDUINO_FUNCTIONS = [
  'setup',
  'loop',
  'pinMode',
  'digitalWrite',
  'digitalRead',
  'analogWrite',
  'analogRead',
  'delay',
  'delayMicroseconds',
  'millis',
  'micros',
  'attachInterrupt',
  'detachInterrupt',
  'interrupts',
  'noInterrupts',
  'Serial',
  'print',
  'println',
  'begin',
  'available',
  'read',
  'write',
  'tone',
  'noTone',
  'pulseIn',
  'pulseInLong',
  'shiftIn',
  'shiftOut',
  'map',
  'constrain',
  'min',
  'max',
  'abs',
  'pow',
  'sqrt',
  'sin',
  'cos',
  'tan',
  'random',
  'randomSeed',
  'sizeof',
];

export function CodeEditor() {
  const editorRef = useRef<any>(null);
  const {
    code: { code, isCompiling, compileError, compileWarnings },
    setCode,
    setCompiling,
  } = useCircuitStore();

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Register Arduino language
    monaco.languages.register({ id: 'arduino' });

    // Set language configuration
    monaco.languages.setLanguageConfiguration('arduino', ARDUINO_LANGUAGE_CONFIG);

    // Set syntax highlighting (tokens provider)
    monaco.languages.setMonarchTokensProvider('arduino', {
      keywords: ARDUINO_KEYWORDS,
      functions: ARDUINO_FUNCTIONS,

      tokenizer: {
        root: [
          // Comments
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],

          // Strings
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],

          // Characters
          [/'[^\\']'/, 'string'],
          [/'/, 'string.invalid'],

          // Numbers
          [/\d+\.\d*([eE][\-+]?\d+)?/, 'number.float'],
          [/0[xX][0-9a-fA-F]+/, 'number.hex'],
          [/0[bB][01]+/, 'number.binary'],
          [/\d+/, 'number'],

          // Preprocessor
          [/#\s*\w+/, 'keyword.preprocessor'],

          // Identifiers and keywords
          [
            /[a-zA-Z_]\w*/,
            {
              cases: {
                '@keywords': 'keyword',
                '@functions': 'function',
                '@default': 'identifier',
              },
            },
          ],

          // Delimiters
          [/[{}()\[\]]/, '@brackets'],
          [/[;,.]/, 'delimiter'],

          // Operators
          [/[+\-*/=<>!&|^~%]+/, 'operator'],
        ],

        comment: [
          [/[^/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[/*]/, 'comment'],
        ],

        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@pop'],
        ],
      },
    });

    // Set editor theme
    monaco.editor.defineTheme('arduino-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'cc7832' },
        { token: 'function', foreground: 'ffc66d' },
        { token: 'number', foreground: '6897bb' },
        { token: 'string', foreground: '6a8759' },
        { token: 'comment', foreground: '808080', fontStyle: 'italic' },
        { token: 'keyword.preprocessor', foreground: 'bbb529' },
        { token: 'operator', foreground: 'a9b7c6' },
      ],
      colors: {
        'editor.background': '#1a1a2e',
        'editor.foreground': '#a9b7c6',
        'editorLineNumber.foreground': '#606366',
        'editorLineNumber.activeForeground': '#a4a3a3',
        'editor.selectionBackground': '#214283',
        'editor.lineHighlightBackground': '#232338',
        'editorCursor.foreground': '#ffffff',
      },
    });

    monaco.editor.setTheme('arduino-dark');

    // Add autocomplete
    monaco.languages.registerCompletionItemProvider('arduino', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          ...ARDUINO_KEYWORDS.map((kw) => ({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            range,
          })),
          ...ARDUINO_FUNCTIONS.map((fn) => ({
            label: fn,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: fn,
            range,
          })),
          // Common snippets
          {
            label: 'setup',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'void setup() {\n  $0\n}',
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Setup function',
            range,
          },
          {
            label: 'loop',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'void loop() {\n  $0\n}',
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Loop function',
            range,
          },
          {
            label: 'for',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:count}; ${1:i}++) {\n  $0\n}',
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'For loop',
            range,
          },
        ];

        return { suggestions };
      },
    });
  }, []);

  const handleEditorChange: OnChange = useCallback(
    (value) => {
      if (value !== undefined) {
        setCode(value);
      }
    },
    [setCode]
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">sketch.ino</span>
          {compileError ? (
            <div className="flex items-center gap-1 text-destructive text-xs">
              <AlertCircle className="w-3 h-3" />
              Error
            </div>
          ) : compileWarnings.length > 0 ? (
            <div className="flex items-center gap-1 text-yellow-500 text-xs">
              <AlertCircle className="w-3 h-3" />
              {compileWarnings.length} warning(s)
            </div>
          ) : isCompiling ? (
            <div className="flex items-center gap-1 text-blue-500 text-xs">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Compiling
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-500 text-xs">
              <CheckCircle className="w-3 h-3" />
              Ready
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded hover:bg-secondary"
            onClick={handleCopyCode}
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language="arduino"
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            renderWhitespace: 'selection',
            tabSize: 2,
            automaticLayout: true,
            wordWrap: 'off',
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      </div>

      {/* Error Output */}
      {compileError && (
        <div className="p-3 bg-destructive/10 border-t border-destructive/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
            <div className="flex-1 text-sm font-mono text-destructive whitespace-pre-wrap">
              {compileError}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
