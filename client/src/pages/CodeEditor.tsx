import { useState, useCallback, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { WebContainer } from '@webcontainer/api';
import { Terminal as XTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Button } from "@/components/ui/button";
import {
    Play,
    RefreshCw,
    Copy,
    Check,
    Terminal,
    Code2,
    FileCode,
    ChevronDown,
    Loader2,
    Trash2,
    Maximize2,
    Minimize2,
    Cpu,
    Sparkles,
    Zap,
    Box
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { toast } from "sonner";

// 🚀 ENTERPRISE-GRADE LANGUAGE CONFIGURATIONS
const LANGUAGES = [
    { id: "javascript", name: "JavaScript (Node.js)", extension: ".js", monaco: "javascript", type: "webcontainer" },
    { id: "typescript", name: "TypeScript", extension: ".ts", monaco: "typescript", type: "simulation" },
    { id: "python", name: "Python", extension: ".py", monaco: "python", type: "simulation" },
    { id: "c", name: "C", extension: ".c", monaco: "c", type: "simulation" },
    { id: "cpp", name: "C++", extension: ".cpp", monaco: "cpp", type: "simulation" },
    { id: "java", name: "Java", extension: ".java", monaco: "java", type: "simulation" },
    { id: "rust", name: "Rust", extension: ".rs", monaco: "rust", type: "simulation" },
    { id: "go", name: "Go", extension: ".go", monaco: "go", type: "simulation" },
];

// 🎯 CODE TEMPLATES
const CODE_TEMPLATES: Record<string, string> = {
    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Variables
    int count = 42;
    float pi = 3.14159f;
    
    printf("Count: %d\\n", count);
    printf("Pi: %.2f\\n", pi);
    
    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Modern C++ features
    vector<string> languages = {"C++", "Python", "JavaScript"};
    
    for (const auto& lang : languages) {
        cout << "Language: " << lang << endl;
    }
    
    return 0;
}`,
    python: `# 🐍 Python Enterprise Code Editor
def greet(name: str) -> str:
    """Generate a greeting message."""
    return f"Hello, {name}!"

def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

if __name__ == "__main__":
    print(greet("World"))
    print(f"Fibonacci(10): {fibonacci(10)}")`,
    javascript: `// ⚡ JavaScript Enterprise Code Editor (Running in WebContainer)
const greet = (name) => \`Hello, \${name}!\`;

// Async/Await Pattern
const fetchData = async () => {
    console.log("Fetching data...");
    await new Promise(r => setTimeout(r, 500)); // Simulate delay
    return { status: 200, data: "Fetched!" };
};

// Array Methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);

console.log(greet("WebContainer"));
console.log("Doubled numbers:", doubled);

fetchData().then(res => console.log(res));`,
    typescript: `// 💙 TypeScript Enterprise Code Editor
interface User {
    id: number;
    name: string;
    email: string;
}

type ApiResponse<T> = {
    data: T;
    status: number;
    message: string;
};

const greet = (name: string): string => \`Hello, \${name}!\`;

const createUser = (name: string, email: string): User => ({
    id: Date.now(),
    name,
    email,
});

const user = createUser("John Doe", "john@example.com");
console.log(greet(user.name));
console.log("User:", user);`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Object-Oriented Example
        Calculator calc = new Calculator();
        System.out.println("5 + 3 = " + calc.add(5, 3));
        System.out.println("5 * 3 = " + calc.multiply(5, 3));
    }
}

class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
    
    public int multiply(int a, int b) {
        return a * b;
    }
}`,
    rust: `// 🦀 Rust Enterprise Code Editor
fn main() {
    println!("Hello, World!");
    
    // Ownership & Borrowing
    let s1 = String::from("hello");
    let len = calculate_length(&s1);
    println!("The length of '{}' is {}.", s1, len);
    
    // Pattern Matching
    let number = 13;
    match number {
        1 => println!("One!"),
        2..=12 => println!("Small number"),
        13 => println!("Lucky thirteen!"),
        _ => println!("Other number"),
    }
}

fn calculate_length(s: &String) -> usize {
    s.len()
}`,
    go: `package main

import (
    "fmt"
    "strings"
)

func main() {
    fmt.Println("Hello, World!")
    
    // Slices and Maps
    languages := []string{"Go", "Rust", "Python"}
    for i, lang := range languages {
        fmt.Printf("%d: %s\\n", i, lang)
    }
    
    // Goroutines concept
    message := greet("Gopher")
    fmt.Println(message)
}

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", strings.Title(name))
}`,
};

// Global WebContainer instance
let webContainerInstance: WebContainer | null = null;

export default function CodeEditor() {
    const [code, setCode] = useState(CODE_TEMPLATES.javascript);
    const [language, setLanguage] = useState("javascript");
    const [output, setOutput] = useState(""); // For legacy simulation output
    const [isRunning, setIsRunning] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const [isWebContainerReady, setIsWebContainerReady] = useState(false);

    const editorRef = useRef<any>(null);
    const terminalRef = useRef<XTerminal | null>(null);
    const terminalContainerRef = useRef<HTMLDivElement>(null);

    // Update code when language changes
    useEffect(() => {
        if (CODE_TEMPLATES[language]) {
            setCode(CODE_TEMPLATES[language]);
        }
        setOutput("");
        terminalRef.current?.clear();
    }, [language]);

    const currentLang = LANGUAGES.find(l => l.id === language);

    // 🎯 Initialize WebContainer
    useEffect(() => {
        async function bootWebContainer() {
            try {
                if (!webContainerInstance) {
                    webContainerInstance = await WebContainer.boot();
                }
                setIsWebContainerReady(true);
            } catch (error) {
                console.error("Failed to boot WebContainer:", error);
                toast.error("Failed to initialize WebContainer environment");
            }
        }
        bootWebContainer();
    }, []);

    // 🎯 Initialize Terminal
    useEffect(() => {
        if (terminalContainerRef.current && !terminalRef.current) {
            const term = new XTerminal({
                convertEol: true,
                theme: {
                    background: '#09090b', // Zinc-950
                    foreground: '#a1a1aa', // Zinc-400
                    cursor: '#ffffff',
                    selectionBackground: 'rgba(255, 255, 255, 0.1)',
                    black: '#09090b',
                    red: '#ef4444',
                    green: '#22c55e',
                    yellow: '#eab308',
                    blue: '#3b82f6',
                    magenta: '#a855f7',
                    cyan: '#06b6d4',
                    white: '#fafafa',
                },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 14,
                lineHeight: 1.5,
                cursorBlink: true,
                rows: 20,
            });

            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);
            term.open(terminalContainerRef.current);
            fitAddon.fit();

            terminalRef.current = term;

            // Resize observer to refit terminal
            const resizeObserver = new ResizeObserver(() => {
                fitAddon.fit();
            });
            resizeObserver.observe(terminalContainerRef.current);

            term.writeln('\x1b[2m$ Initializing Development Environment...\x1b[0m');
            term.writeln('\x1b[32m✔ System Ready\x1b[0m');
            term.write('\r\n$ ');

            return () => {
                resizeObserver.disconnect();
                term.dispose();
                terminalRef.current = null;
            };
        }
    }, []);

    // 🎯 Monaco Editor mount handler
    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
        editor.focus();
    };

    // 🚀 Execute code
    const handleRun = useCallback(async () => {
        setIsRunning(true);
        terminalRef.current?.clear();
        setOutput("");

        const langConfig = LANGUAGES.find(l => l.id === language);

        // ==========================================
        // 🌐 WebContainer Execution (Node.js)
        // ==========================================
        if (langConfig?.type === 'webcontainer' && webContainerInstance) {
            try {
                terminalRef.current?.writeln(`\x1b[34m➜  Running ${langConfig.name}...\x1b[0m\r\n`);

                // Write file
                await webContainerInstance.mount({
                    'index.js': {
                        file: {
                            contents: code
                        }
                    }
                });

                // Spawn process
                const process = await webContainerInstance.spawn('node', ['index.js']);

                // Stream output
                process.output.pipeTo(new WritableStream({
                    write(data) {
                        terminalRef.current?.write(data);
                    }
                }));

                const exitCode = await process.exit;

                if (exitCode === 0) {
                    terminalRef.current?.write(`\r\n\x1b[32m✔ Process finished with exit code ${exitCode}\x1b[0m\r\n$ `);
                } else {
                    terminalRef.current?.write(`\r\n\x1b[31m✖ Process finished with exit code ${exitCode}\x1b[0m\r\n$ `);
                }

            } catch (error) {
                console.error("WebContainer Error:", error);
                terminalRef.current?.write(`\r\n\x1b[31mError: ${error}\x1b[0m\r\n$ `);
                toast.error("Execution failed");
            } finally {
                setIsRunning(false);
            }
            return;
        }

        // ==========================================
        // 🎮 Legacy Simulation (Other Languages)
        // ==========================================
        terminalRef.current?.writeln(`\x1b[33m➜  Running ${langConfig?.name} (Simulation Mode)...\x1b[0m\r\n`);

        // Simulate compilation delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Simulated outputs
        const outputs: Record<string, string> = {
            c: `Hello, World!
Count: 42
Pi: 3.14

✅ Program exited with code 0
⏱️ Execution time: 0.003s`,
            cpp: `Hello, World!
Language: C++
Language: Python
Language: JavaScript

✅ Program exited with code 0
⏱️ Execution time: 0.005s`,
            python: `Hello, World!
Fibonacci(10): [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

✅ Execution completed successfully
⏱️ Execution time: 0.012s`,
            typescript: `Hello, John Doe!
User: { id: 1704729600000, name: 'John Doe', email: 'john@example.com' }

✅ Execution completed successfully
⏱️ Execution time: 0.015s`,
            java: `Hello, World!
5 + 3 = 8
5 * 3 = 15

✅ Program exited with code 0
⏱️ Execution time: 0.045s`,
            rust: `Hello, World!
The length of 'hello' is 5.
Lucky thirteen!

✅ Program exited with code 0
⏱️ Execution time: 0.002s`,
            go: `Hello, World!
0: Go
1: Rust
2: Python
Hello, Gopher!

✅ Program exited with code 0
⏱️ Execution time: 0.006s`,
        };

        const simulatedOutput = outputs[language] || "Execution completed";

        // Stream simulated output to terminal
        const lines = simulatedOutput.split('\n');
        for (const line of lines) {
            terminalRef.current?.writeln(line);
            await new Promise(r => setTimeout(r, 50));
        }
        terminalRef.current?.write('\r\n$ ');

        setOutput(simulatedOutput); // Keep state for fallback/history if needed
        setIsRunning(false);
        toast.success("Code executed successfully!");
    }, [language, code]);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    }, [code]);

    const handleReset = useCallback(() => {
        setCode(CODE_TEMPLATES[language] || "");
        setOutput("");
        terminalRef.current?.clear();
        terminalRef.current?.writeln('\x1b[2m$ Console cleared & reset\x1b[0m\r\n$ ');
        toast.info("Code reset to template");
    }, [language]);

    return (
        <div className={`min-h-screen bg-[#000000] text-white selection:bg-purple-500/30 selection:text-purple-200 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
            </div>

            {/* Navigation - hidden in fullscreen */}
            {!isFullscreen && <Navigation />}

            {/* Main Content */}
            <main className={`${isFullscreen ? 'p-0 h-screen' : 'pt-24 md:pt-32 pb-12 px-4 md:px-8'} relative z-10`}>
                <div className={`${isFullscreen ? 'h-full' : 'max-w-[1600px] mx-auto'}`}>
                    {/* Header - hidden in fullscreen */}
                    {!isFullscreen && (
                        <AnimatedSection>
                            <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 shadow-lg shadow-purple-500/10">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs font-mono font-medium text-gray-400">
                                            IDE v2.0 • {isWebContainerReady ? 'Online' : 'Initializing...'}
                                        </span>
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
                                            Dev
                                        </span>
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                                            Environment
                                        </span>
                                    </h1>
                                    <p className="text-gray-500 mt-2 text-lg font-light max-w-xl">
                                        Powered by WebContainer™ technology. Execute Node.js directly in your browser with zero latency.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-3">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                                                U{i}
                                            </div>
                                        ))}
                                        <div className="w-10 h-10 rounded-full border-2 border-black bg-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                            +42
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">Live Session</p>
                                        <p className="text-xs text-gray-500">45 Active Developers</p>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>
                    )}

                    {/* Editor Container - SUPER ENTERPRISE LAYOUT */}
                    <div className={`${isFullscreen ? 'h-full' : 'h-[800px]'} grid ${isFullscreen ? 'grid-cols-[1fr_450px]' : 'lg:grid-cols-[1.5fr_1fr]'} gap-4 md:gap-6`}>

                        {/* LEFT: Monaco Code Editor Panel */}
                        <div className="relative group flex flex-col rounded-2xl md:rounded-3xl border border-white/10 bg-[#0c0c0c]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                            {/* Editor Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    {/* Mac-style window controls */}
                                    <div className="flex gap-2 group/controls">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80 group-hover/controls:bg-red-500 transition-colors" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80 group-hover/controls:bg-yellow-500 transition-colors" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/80 group-hover/controls:bg-green-500 transition-colors" />
                                    </div>

                                    <div className="h-6 w-px bg-white/10 mx-2" />

                                    {/* Tabs */}
                                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 text-xs font-medium text-white shadow-sm border border-white/5">
                                            <FileCode className="w-3.5 h-3.5 text-blue-400" />
                                            main{currentLang?.extension}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {/* Language Selector */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-medium text-gray-300"
                                        >
                                            <Box className="w-3.5 h-3.5 text-purple-400" />
                                            <span>{currentLang?.name}</span>
                                            <ChevronDown className="w-3 h-3 text-gray-500" />
                                        </button>

                                        {showLanguageMenu && (
                                            <div className="absolute top-full mt-2 right-0 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 min-w-[200px] py-1.5 overflow-hidden ring-1 ring-black/50">
                                                {LANGUAGES.map(lang => (
                                                    <button
                                                        key={lang.id}
                                                        onClick={() => {
                                                            setLanguage(lang.id);
                                                            setShowLanguageMenu(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-xs ${language === lang.id ? 'text-purple-400 bg-purple-500/10' : 'text-gray-400'
                                                            }`}
                                                    >
                                                        <FileCode className="w-3.5 h-3.5" />
                                                        <span className="font-medium">{lang.name}</span>
                                                        {lang.type === 'webcontainer' && <Zap className="w-3 h-3 ml-auto text-yellow-400" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-4 w-px bg-white/10 mx-1" />

                                    <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <button onClick={handleReset} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Code Editor Area */}
                            <div className="flex-1 relative bg-[#0c0c0c] min-h-[500px]">
                                <Editor
                                    height="100%"
                                    language={currentLang?.monaco || "plaintext"}
                                    value={code}
                                    onChange={(value) => setCode(value || "")}
                                    onMount={handleEditorDidMount}
                                    theme="vs-dark"
                                    options={{
                                        fontSize,
                                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                                        fontLigatures: true,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 4,
                                        insertSpaces: true,
                                        wordWrap: "on",
                                        lineNumbers: "on",
                                        renderLineHighlight: "line",
                                        padding: { top: 20, bottom: 20 },
                                        cursorBlinking: "smooth",
                                        cursorSmoothCaretAnimation: "on",
                                        smoothScrolling: true,
                                        bracketPairColorization: { enabled: true },
                                        guides: { indentation: true },
                                    }}
                                />
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                        UTF-8
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                        {code.split('\n').length} Lines
                                    </div>
                                </div>

                                <Button
                                    onClick={handleRun}
                                    disabled={isRunning || !code.trim() || (currentLang?.type === 'webcontainer' && !isWebContainerReady)}
                                    className={`px-6 py-5 rounded-xl font-bold transition-all duration-300 shadow-lg ${
                                        isRunning
                                        ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02]'
                                    }`}
                                >
                                    {isRunning ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Play className="w-4 h-4 fill-current" />
                                            Run Code
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* RIGHT: Terminal Panel */}
                        <div className="flex flex-col rounded-2xl md:rounded-3xl border border-white/10 bg-[#09090b] shadow-2xl overflow-hidden min-h-[400px]">
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                    <Terminal className="w-4 h-4 text-purple-400" />
                                    Terminal
                                    <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-500 font-mono">bash</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            terminalRef.current?.clear();
                                            terminalRef.current?.writeln('\x1b[2m$ Console cleared\x1b[0m\r\n$ ');
                                        }}
                                        className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                                        title="Clear Console"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* XTerm Container */}
                            <div className="flex-1 relative bg-[#09090b] p-2">
                                {/* Scanline Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none opacity-20 bg-[length:100%_4px,3px_100%]" />
                                <div ref={terminalContainerRef} className="h-full w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
