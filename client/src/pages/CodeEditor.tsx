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
    Settings,
    Maximize2,
    Minimize2,
    Cpu
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { toast } from "sonner";

// 🚀 ENTERPRISE-GRADE LANGUAGE CONFIGURATIONS
const LANGUAGES = [
    { id: "javascript", name: "JavaScript (Node.js)", extension: ".js", monaco: "javascript", type: "webcontainer" },
    { id: "c", name: "C", extension: ".c", monaco: "c", type: "simulation" },
    { id: "cpp", name: "C++", extension: ".cpp", monaco: "cpp", type: "simulation" },
    { id: "python", name: "Python", extension: ".py", monaco: "python", type: "simulation" },
    { id: "typescript", name: "TypeScript", extension: ".ts", monaco: "typescript", type: "simulation" },
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
                    background: '#1e1e1e',
                    foreground: '#4ade80', // Green-400
                    cursor: '#ffffff',
                    selectionBackground: 'rgba(255, 255, 255, 0.3)',
                },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: 14,
                rows: 24,
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

            term.write('\x1b[2mInitialized terminal...\r\n\x1b[0m');

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
                terminalRef.current?.write(`\x1b[34m> Running ${langConfig.name} in WebContainer...\x1b[0m\r\n`);

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
                    terminalRef.current?.write(`\r\n\x1b[32m✅ Execution completed (Exit Code: ${exitCode})\x1b[0m\r\n`);
                } else {
                    terminalRef.current?.write(`\r\n\x1b[31m❌ Execution failed (Exit Code: ${exitCode})\x1b[0m\r\n`);
                }

            } catch (error) {
                console.error("WebContainer Error:", error);
                terminalRef.current?.write(`\r\n\x1b[31mError: ${error}\x1b[0m\r\n`);
                toast.error("Execution failed");
            } finally {
                setIsRunning(false);
            }
            return;
        }

        // ==========================================
        // 🎮 Legacy Simulation (Other Languages)
        // ==========================================
        terminalRef.current?.write(`\x1b[33m> Running ${langConfig?.name} (Simulation Mode)...\x1b[0m\r\n\r\n`);

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
        terminalRef.current?.write('\x1b[2mConsole cleared & reset\r\n\x1b[0m');
        toast.info("Code reset to template");
    }, [language]);

    return (
        <div className={`min-h-screen bg-[#0d1117] text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Navigation - hidden in fullscreen */}
            {!isFullscreen && <Navigation />}

            {/* Main Content */}
            <main className={`${isFullscreen ? 'p-4' : 'pt-20 md:pt-24 pb-12 px-4 md:px-8'}`}>
                <div className={`${isFullscreen ? '' : 'max-w-7xl mx-auto'}`}>
                    {/* Header - hidden in fullscreen */}
                    {!isFullscreen && (
                        <AnimatedSection>
                            <div className="text-center mb-8 md:mb-12">
                                <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 backdrop-blur-xl mb-4 md:mb-6">
                                    <Code2 className="w-4 md:w-5 h-4 md:h-5 text-purple-400" />
                                    <span className="text-xs md:text-sm font-bold text-purple-400 tracking-wider uppercase">
                                        Enterprise Web IDE • Monaco Editor
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4 tracking-tight">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-x">
                                        Code Editor
                                    </span>
                                </h1>
                                <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
                                    Professional VS Code-powered editor with <span className="text-purple-400 font-bold">WebContainer™</span> Runtime
                                </p>
                            </div>
                        </AnimatedSection>
                    )}

                    {/* Editor Container */}
                    <div className={`grid ${isFullscreen ? 'lg:grid-cols-[1fr_400px] h-[calc(100vh-2rem)]' : 'lg:grid-cols-2'} gap-4 md:gap-6`}>
                        {/* Monaco Code Editor Panel */}
                        <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl flex flex-col">
                            {/* Editor Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-gray-800">
                                <div className="flex items-center gap-3">
                                    {/* Language Selector */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#3c3c3c] border border-gray-600 hover:border-purple-500 transition-colors text-sm font-medium"
                                        >
                                            <FileCode className="w-4 h-4 text-purple-400" />
                                            <span>{currentLang?.name}</span>
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        </button>

                                        {showLanguageMenu && (
                                            <div className="absolute top-full mt-2 left-0 bg-[#252526] border border-gray-700 rounded-xl shadow-2xl z-50 min-w-[180px] py-2 overflow-hidden">
                                                {LANGUAGES.map(lang => (
                                                    <button
                                                        key={lang.id}
                                                        onClick={() => {
                                                            setLanguage(lang.id);
                                                            setShowLanguageMenu(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-purple-500/20 transition-colors ${language === lang.id ? 'bg-purple-500/10 text-purple-400' : 'text-gray-300'
                                                            }`}
                                                    >
                                                        <FileCode className="w-4 h-4" />
                                                        <span className="font-medium">{lang.name}</span>
                                                        {lang.type === 'webcontainer' && <span className="ml-auto text-[10px] bg-purple-500/20 text-purple-400 px-1 rounded">WEB</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <span>main{currentLang?.extension}</span>
                                        {currentLang?.type === 'webcontainer' ? (
                                            <span className={`flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full ${isWebContainerReady ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${isWebContainerReady ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                                                {isWebContainerReady ? 'Runtime Ready' : 'Booting...'}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">Simulation</span>
                                        )}
                                    </div>
                                </div>

                                {/* Editor Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-xs"
                                        title="Increase font size"
                                    >
                                        A+
                                    </button>
                                    <button
                                        onClick={() => setFontSize(prev => Math.max(10, prev - 2))}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-xs"
                                        title="Decrease font size"
                                    >
                                        A-
                                    </button>
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                        title="Copy code"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                        title="Reset code"
                                    >
                                        <RefreshCw className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                                    >
                                        {isFullscreen ? <Minimize2 className="w-4 h-4 text-gray-400" /> : <Maximize2 className="w-4 h-4 text-gray-400" />}
                                    </button>
                                </div>
                            </div>

                            {/* 🎯 MONACO EDITOR - VS Code Engine */}
                            <div className={`flex-1 ${isFullscreen ? '' : 'h-[400px] md:h-[500px]'}`}>
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
                                        minimap: { enabled: !isFullscreen ? false : true },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 4,
                                        insertSpaces: true,
                                        wordWrap: "on",
                                        lineNumbers: "on",
                                        renderLineHighlight: "all",
                                        padding: { top: 16, bottom: 16 },
                                        cursorBlinking: "smooth",
                                        cursorSmoothCaretAnimation: "on",
                                        smoothScrolling: true,
                                        bracketPairColorization: { enabled: true },
                                    }}
                                />
                            </div>

                            {/* Run Button */}
                            <div className="px-4 py-3 bg-[#252526] border-t border-gray-800">
                                <Button
                                    onClick={handleRun}
                                    disabled={isRunning || !code.trim() || (currentLang?.type === 'webcontainer' && !isWebContainerReady)}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRunning ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Executing...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5 mr-2" />
                                            {currentLang?.type === 'webcontainer' ? 'Run in WebContainer' : 'Run Simulation'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Output Panel - now with XTerm */}
                        <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl flex flex-col">
                            {/* Output Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-gray-800">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-green-400" />
                                    <span className="text-sm font-medium text-gray-300">Terminal</span>
                                    <span className="text-xs text-gray-500">• bash</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            terminalRef.current?.clear();
                                            setOutput("");
                                        }}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                        title="Clear output"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Terminal Container */}
                            <div className={`flex-1 ${isFullscreen ? '' : 'h-[400px] md:h-[500px]'} bg-[#1e1e1e] relative group`}>
                                <div ref={terminalContainerRef} className="absolute inset-0 p-4" />
                            </div>

                            {/* Status Bar */}
                            <div className="px-4 py-2 bg-[#007acc] flex items-center justify-between text-xs text-white">
                                <div className="flex items-center gap-4">
                                    <span>{currentLang?.name}</span>
                                    <span>UTF-8</span>
                                    <span>LF</span>
                                    <span className="flex items-center gap-1">
                                        <Cpu className="w-3 h-3" />
                                        {currentLang?.type === 'webcontainer' ? 'WebAssembly Runtime' : 'Simulation Engine'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span>{code.split('\n').length} lines</span>
                                    <span>Ln 1, Col 1</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Section - hidden in fullscreen */}
                    {!isFullscreen && (
                        <AnimatedSection delay={200}>
                            <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {[
                                    { icon: "⚡", title: "WebContainer™", desc: "In-browser Node.js runtime" },
                                    { icon: "🎨", title: "Monaco Editor", desc: "VS Code experience" },
                                    { icon: "🛡️", title: "Secure Sandbox", desc: "Isolated execution env" },
                                    { icon: "🚀", title: "Instant Run", desc: "Zero server latency" },
                                ].map((feature, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 md:p-6 rounded-2xl bg-[#161b22] border border-gray-800 hover:border-purple-500/50 transition-colors group"
                                    >
                                        <span className="text-2xl md:text-3xl mb-3 block">{feature.icon}</span>
                                        <h3 className="font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </AnimatedSection>
                    )}
                </div>
            </main>
        </div>
    );
}
