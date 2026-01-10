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

    // 🚀 Simulate code execution
    const handleRun = useCallback(async () => {
        setIsRunning(true);
        setOutput("➜  Compiling...\n");

        await new Promise(resolve => setTimeout(resolve, 800));

        const simulatedOutput = SIMULATED_OUTPUTS[language] || "Execution completed";
        setOutput(simulatedOutput);
        setIsRunning(false);
        toast.success("Code executed successfully!");
    }, [language]);

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
                            <div className="flex-1 relative bg-[#0c0c0c] min-h-[500px]">
                                <Editor
                                    height="100%"
                                    language={currentLang?.monaco || "plaintext"}
                                    value={code}
                                    onChange={(value) => setCode(value || "")}
                                    theme="vs-dark"
                                    options={{
                                        fontSize,
                                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                                        fontLigatures: true,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 4,
                                        wordWrap: "on",
                                        lineNumbers: "on",
                                        padding: { top: 20, bottom: 20 },
                                        cursorBlinking: "smooth",
                                        smoothScrolling: true,
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

                        {/* Terminal/Output Panel */}
                        <div className="flex flex-col rounded-2xl md:rounded-3xl border border-white/10 bg-[#09090b] shadow-2xl overflow-hidden min-h-[400px]">
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                                    <Terminal className="w-4 h-4 text-purple-400" />
                                    Output
                                    <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-500 font-mono">console</span>
                                </div>
                                <button
                                    onClick={() => setOutput("")}
                                    className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                                    title="Clear Console"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Output Area */}
                            <div className="flex-1 relative bg-[#09090b] p-4 overflow-auto">
                                <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                                    {output || "$ Ready to run code..."}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
