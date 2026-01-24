import { useState, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import {
    Play,
    RefreshCw,
    Copy,
    Check,
    Terminal,
    FileCode,
    ChevronDown,
    Loader2,
    Trash2,
    Maximize2,
    Minimize2,
    Box
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { toast } from "sonner";

// 🚀 LANGUAGE CONFIGURATIONS
const LANGUAGES = [
    { id: "javascript", name: "JavaScript", extension: ".js", monaco: "javascript" },
    { id: "typescript", name: "TypeScript", extension: ".ts", monaco: "typescript" },
    { id: "python", name: "Python", extension: ".py", monaco: "python" },
    { id: "c", name: "C", extension: ".c", monaco: "c" },
    { id: "cpp", name: "C++", extension: ".cpp", monaco: "cpp" },
    { id: "java", name: "Java", extension: ".java", monaco: "java" },
    { id: "rust", name: "Rust", extension: ".rs", monaco: "rust" },
    { id: "go", name: "Go", extension: ".go", monaco: "go" },
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
    python: `# 🐍 Python Code Editor
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
    javascript: `// ⚡ JavaScript Code Editor
const greet = (name) => \`Hello, \${name}!\`;

// Async/Await Pattern
const fetchData = async () => {
    console.log("Fetching data...");
    await new Promise(r => setTimeout(r, 500));
    return { status: 200, data: "Fetched!" };
};

// Array Methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);

console.log(greet("World"));
console.log("Doubled numbers:", doubled);

fetchData().then(res => console.log(res));`,
    typescript: `// 💙 TypeScript Code Editor
interface User {
    id: number;
    name: string;
    email: string;
}

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
    rust: `// 🦀 Rust Code Editor
fn main() {
    println!("Hello, World!");
    
    let s1 = String::from("hello");
    let len = calculate_length(&s1);
    println!("The length of '{}' is {}.", s1, len);
    
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
    
    languages := []string{"Go", "Rust", "Python"}
    for i, lang := range languages {
        fmt.Printf("%d: %s\\n", i, lang)
    }
    
    message := greet("Gopher")
    fmt.Println(message)
}

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", strings.Title(name))
}`,
};

// Simulated outputs
const SIMULATED_OUTPUTS: Record<string, string> = {
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
    javascript: `Hello, World!
Doubled numbers: [2, 4, 6, 8, 10]
Fetching data...
{ status: 200, data: 'Fetched!' }

✅ Execution completed successfully
⏱️ Execution time: 0.015s`,
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

export default function CodeEditor() {
    const [code, setCode] = useState(CODE_TEMPLATES.javascript);
    const [language, setLanguage] = useState("javascript");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [fontSize] = useState(14);

    // Update code when language changes
    useEffect(() => {
        if (CODE_TEMPLATES[language]) {
            setCode(CODE_TEMPLATES[language]);
        }
        setOutput("");
    }, [language]);

    const currentLang = LANGUAGES.find(l => l.id === language);

    // 🚀 REAL Code execution using Piston API
    const handleRun = useCallback(async () => {
        setIsRunning(true);
        const startTime = Date.now();
        setOutput("➜  Compiling...\n");

        // Piston API language mapping
        const pistonLanguages: Record<string, { language: string; version: string }> = {
            c: { language: "c", version: "10.2.0" },
            cpp: { language: "c++", version: "10.2.0" },
            python: { language: "python", version: "3.10.0" },
            javascript: { language: "javascript", version: "18.15.0" },
            typescript: { language: "typescript", version: "5.0.3" },
            java: { language: "java", version: "15.0.2" },
            rust: { language: "rust", version: "1.68.2" },
            go: { language: "go", version: "1.16.2" },
        };

        const langConfig = pistonLanguages[language];
        if (!langConfig) {
            setOutput("❌ Unsupported language for execution");
            setIsRunning(false);
            return;
        }

        try {
            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: langConfig.language,
                    version: langConfig.version,
                    files: [{ name: `main${currentLang?.extension || ".txt"}`, content: code }],
                }),
            });

            const result = await response.json();
            const execTime = ((Date.now() - startTime) / 1000).toFixed(3);

            if (result.run) {
                const stdout = result.run.stdout || "";
                const stderr = result.run.stderr || "";
                const exitCode = result.run.code;

                let outputText = "";

                if (stdout) {
                    outputText += stdout;
                }

                if (stderr) {
                    outputText += `\n❌ Error:\n${stderr}`;
                }

                outputText += `\n\n✅ Program exited with code ${exitCode}`;
                outputText += `\n⏱ Execution time: ${execTime}s`;

                setOutput(outputText);

                if (exitCode === 0 && !stderr) {
                    toast.success("Code executed successfully!");
                } else if (stderr) {
                    toast.error("Code execution had errors");
                }
            } else if (result.message) {
                setOutput(`❌ API Error: ${result.message}`);
                toast.error("Execution failed");
            } else {
                setOutput("❌ Unknown error occurred");
                toast.error("Execution failed");
            }
        } catch (error: any) {
            const execTime = ((Date.now() - startTime) / 1000).toFixed(3);
            setOutput(`❌ Network Error: ${error.message || "Failed to connect to execution server"}\n\n⏱ Time: ${execTime}s`);
            toast.error("Failed to execute code");
        }

        setIsRunning(false);
    }, [language, code, currentLang]);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    }, [code]);

    const handleReset = useCallback(() => {
        setCode(CODE_TEMPLATES[language] || "");
        setOutput("");
        toast.info("Code reset to template");
    }, [language]);

    return (
        <div className={`min-h-screen bg-[#000000] text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
            </div>

            {!isFullscreen && <Navigation />}

            <main className={`${isFullscreen ? 'p-0 h-screen' : 'pt-24 md:pt-32 pb-12 px-4 md:px-8'} relative z-10`}>
                <div className={`${isFullscreen ? 'h-full' : 'max-w-[1600px] mx-auto'}`}>
                    {!isFullscreen && (
                        <AnimatedSection>
                            <div className="mb-8 md:mb-12">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-mono font-medium text-gray-400">IDE v2.0 • Online</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">Dev</span>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Environment</span>
                                </h1>
                                <p className="text-gray-500 mt-2 text-lg font-light max-w-xl">
                                    Enterprise-grade code editor with syntax highlighting and simulation.
                                </p>
                            </div>
                        </AnimatedSection>
                    )}

                    <div className={`${isFullscreen ? 'h-full' : 'h-[800px]'} grid ${isFullscreen ? 'grid-cols-[1fr_450px]' : 'lg:grid-cols-[1.5fr_1fr]'} gap-4 md:gap-6`}>
                        {/* Code Editor Panel */}
                        <div className="relative flex flex-col rounded-2xl md:rounded-3xl border border-white/10 bg-[#0c0c0c]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                            {/* Editor Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                    </div>
                                    <div className="h-6 w-px bg-white/10 mx-2" />
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 text-xs font-medium text-white">
                                        <FileCode className="w-3.5 h-3.5 text-blue-400" />
                                        main{currentLang?.extension}
                                    </div>
                                </div>

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
                                            <div className="absolute top-full mt-2 right-0 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 min-w-[200px] py-1.5">
                                                {LANGUAGES.map(lang => (
                                                    <button
                                                        key={lang.id}
                                                        onClick={() => {
                                                            setLanguage(lang.id);
                                                            setShowLanguageMenu(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-xs ${language === lang.id ? 'text-purple-400 bg-purple-500/10' : 'text-gray-400'}`}
                                                    >
                                                        <FileCode className="w-3.5 h-3.5" />
                                                        <span className="font-medium">{lang.name}</span>
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

                            {/* Monaco Editor */}
                            <div className="flex-1 relative bg-[#0a0a0a] min-h-[500px]">
                                <Editor
                                    height="100%"
                                    language={currentLang?.monaco || "plaintext"}
                                    value={code}
                                    onChange={(value) => setCode(value || "")}
                                    theme="vs-dark"
                                    options={{
                                        fontSize,
                                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Consolas, monospace",
                                        fontLigatures: true,
                                        minimap: {
                                            enabled: true,
                                            maxColumn: 80,
                                            renderCharacters: false,
                                            showSlider: "mouseover"
                                        },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 4,
                                        wordWrap: "on",
                                        lineNumbers: "on",
                                        padding: { top: 24, bottom: 24 },
                                        cursorBlinking: "phase",
                                        cursorSmoothCaretAnimation: "on",
                                        smoothScrolling: true,
                                        renderLineHighlight: "all",
                                        bracketPairColorization: { enabled: true },
                                        guides: {
                                            bracketPairs: true,
                                            indentation: true,
                                            highlightActiveIndentation: true
                                        },
                                        formatOnPaste: true,
                                        formatOnType: true,
                                        autoClosingBrackets: "always",
                                        autoClosingQuotes: "always",
                                        autoSurround: "languageDefined",
                                        suggest: {
                                            showMethods: true,
                                            showFunctions: true,
                                            showVariables: true,
                                            showSnippets: true,
                                            preview: true
                                        },
                                        quickSuggestions: true,
                                        parameterHints: { enabled: true },
                                        folding: true,
                                        foldingHighlight: true,
                                        showFoldingControls: "mouseover",
                                        renderWhitespace: "selection",
                                        colorDecorators: true,
                                        links: true,
                                        occurrencesHighlight: "singleFile",
                                        selectionHighlight: true,
                                        stickyScroll: { enabled: true },
                                        inlineSuggest: { enabled: true },
                                    }}
                                    beforeMount={(monaco) => {
                                        // Custom premium dark theme
                                        monaco.editor.defineTheme('premium-dark', {
                                            base: 'vs-dark',
                                            inherit: true,
                                            rules: [
                                                { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
                                                { token: 'keyword', foreground: 'C586C0' },
                                                { token: 'string', foreground: 'CE9178' },
                                                { token: 'number', foreground: 'B5CEA8' },
                                                { token: 'function', foreground: 'DCDCAA' },
                                                { token: 'variable', foreground: '9CDCFE' },
                                                { token: 'type', foreground: '4EC9B0' },
                                            ],
                                            colors: {
                                                'editor.background': '#0a0a0a',
                                                'editor.foreground': '#d4d4d4',
                                                'editorLineNumber.foreground': '#4a4a4a',
                                                'editorLineNumber.activeForeground': '#a855f7',
                                                'editor.lineHighlightBackground': '#1a1a2e',
                                                'editor.selectionBackground': '#264f7844',
                                                'editorCursor.foreground': '#a855f7',
                                                'editor.findMatchBackground': '#515c6a',
                                                'editor.findMatchHighlightBackground': '#ea5c0055',
                                                'editorBracketMatch.background': '#0d3a58',
                                                'editorBracketMatch.border': '#888888',
                                                'editorIndentGuide.activeBackground': '#3a3a5a',
                                                'scrollbar.shadow': '#00000000',
                                                'scrollbarSlider.background': '#ffffff15',
                                                'scrollbarSlider.hoverBackground': '#ffffff25',
                                                'scrollbarSlider.activeBackground': '#ffffff30',
                                            }
                                        });
                                    }}
                                    onMount={(editor, monaco) => {
                                        monaco.editor.setTheme('premium-dark');
                                        // Add custom keybindings
                                        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                                            handleRun();
                                        });
                                    }}
                                />
                            </div>

                            {/* Footer */}
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
                                    disabled={isRunning || !code.trim()}
                                    className={`px-6 py-5 rounded-xl font-bold transition-all duration-300 shadow-lg ${isRunning
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

                        {/* Terminal/Output Panel - Ultra Premium */}
                        <div className="flex flex-col rounded-2xl md:rounded-3xl border border-white/10 bg-[#050508] shadow-2xl overflow-hidden min-h-[400px] relative group/output">
                            {/* Animated Border Glow */}
                            <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 opacity-0 group-hover/output:opacity-100 transition-opacity duration-500 blur-xl -z-10" />

                            {/* Terminal Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-white/[0.04]">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                    </div>
                                    <div className="h-4 w-px bg-white/10" />
                                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                        <Terminal className="w-4 h-4 text-emerald-400" />
                                        Output
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] text-emerald-400 font-mono border border-emerald-500/30">
                                        console
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {output && !output.includes("Compiling") && (
                                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] text-emerald-400 font-mono">Program exited with code 0</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setOutput("")}
                                        className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all duration-200 hover:scale-110"
                                        title="Clear Console"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Output Area - Premium Styling */}
                            <div className="flex-1 relative bg-[#050508] overflow-auto custom-scrollbar">
                                <div className="p-5 min-h-full">
                                    {output ? (
                                        <div className="space-y-3">
                                            {output.split('\n').map((line, i) => (
                                                <div key={i} className="flex items-start gap-3 group/line">
                                                    {line.includes("✅") ? (
                                                        <div className="flex-shrink-0 w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center mt-0.5">
                                                            <Check className="w-3 h-3 text-emerald-400" />
                                                        </div>
                                                    ) : line.includes("⏱") ? (
                                                        <div className="flex-shrink-0 w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center mt-0.5">
                                                            <RefreshCw className="w-3 h-3 text-blue-400" />
                                                        </div>
                                                    ) : line.startsWith("➜") ? (
                                                        <div className="flex-shrink-0 w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center mt-0.5">
                                                            <Terminal className="w-3 h-3 text-purple-400" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex-shrink-0 w-5 h-5 rounded bg-white/5 flex items-center justify-center mt-0.5 opacity-0 group-hover/line:opacity-100 transition-opacity">
                                                            <span className="text-[9px] text-gray-600 font-mono">{i + 1}</span>
                                                        </div>
                                                    )}
                                                    <pre className={`text-sm font-mono leading-relaxed ${line.includes("✅") ? "text-emerald-400" :
                                                        line.includes("⏱") ? "text-blue-400" :
                                                            line.startsWith("➜") ? "text-purple-400 font-semibold" :
                                                                line.includes("Error") || line.includes("error") ? "text-red-400" :
                                                                    "text-gray-300"
                                                        }`}>
                                                        {line || " "}
                                                    </pre>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                                                <Terminal className="w-8 h-8 text-purple-400" />
                                            </div>
                                            <p className="text-gray-400 font-medium mb-1">Ready to execute</p>
                                            <p className="text-gray-600 text-sm">Press <kbd className="px-2 py-0.5 rounded bg-white/10 text-purple-400 font-mono text-xs">Ctrl</kbd> + <kbd className="px-2 py-0.5 rounded bg-white/10 text-purple-400 font-mono text-xs">Enter</kbd> to run</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Bar */}
                            <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${output ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                                        {output ? 'Completed' : 'Idle'}
                                    </div>
                                </div>
                                {output && !output.includes("Compiling") && (
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                                        <span className="flex items-center gap-1">
                                            <RefreshCw className="w-3 h-3" />
                                            0.003s
                                        </span>
                                        <span className="text-emerald-400 flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            Success
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
