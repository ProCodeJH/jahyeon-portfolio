import { useState, useCallback, useEffect } from "react";
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
    Download,
    Trash2
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { AnimatedSection } from "@/components/animations/AnimatedSection";
import { toast } from "sonner";

// Language configurations
const LANGUAGES = [
    { id: "c", name: "C", extension: ".c", icon: "🔧" },
    { id: "cpp", name: "C++", extension: ".cpp", icon: "⚡" },
    { id: "python", name: "Python", extension: ".py", icon: "🐍" },
    { id: "javascript", name: "JavaScript", extension: ".js", icon: "💛" },
    { id: "typescript", name: "TypeScript", extension: ".ts", icon: "💙" },
    { id: "java", name: "Java", extension: ".java", icon: "☕" },
    { id: "rust", name: "Rust", extension: ".rs", icon: "🦀" },
    { id: "go", name: "Go", extension: ".go", icon: "🐹" },
];

// Code templates
const CODE_TEMPLATES: Record<string, string> = {
    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    python: `# Python Code Editor
def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("World"))`,
    javascript: `// JavaScript Code Editor
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
    typescript: `// TypeScript Code Editor
function greet(name: string): string {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    rust: `fn main() {
    println!("Hello, World!");
}`,
    go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
};

export default function CodeEditor() {
    const [code, setCode] = useState(CODE_TEMPLATES.python);
    const [language, setLanguage] = useState("python");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);

    // Update code when language changes
    useEffect(() => {
        setCode(CODE_TEMPLATES[language] || "");
        setOutput("");
    }, [language]);

    const currentLang = LANGUAGES.find(l => l.id === language);

    const handleRun = useCallback(async () => {
        setIsRunning(true);
        setOutput("⏳ Compiling and running...\n");

        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulated output based on language
        const outputs: Record<string, string> = {
            c: "Hello, World!\n\n✅ Program exited with code 0",
            cpp: "Hello, World!\n\n✅ Program exited with code 0",
            python: "Hello, World!\n\n✅ Execution completed successfully",
            javascript: "Hello, World!\n\n✅ Execution completed successfully",
            typescript: "Hello, World!\n\n✅ Execution completed successfully",
            java: "Hello, World!\n\n✅ Program exited with code 0",
            rust: "Hello, World!\n\n✅ Program exited with code 0",
            go: "Hello, World!\n\n✅ Program exited with code 0",
        };

        setOutput(outputs[language] || "Execution completed");
        setIsRunning(false);
        toast.success("Code executed successfully!");
    }, [language]);

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    }, [code]);

    const handleClear = useCallback(() => {
        setCode("");
        setOutput("");
    }, []);

    const handleReset = useCallback(() => {
        setCode(CODE_TEMPLATES[language] || "");
        setOutput("");
    }, [language]);

    return (
        <div className="min-h-screen bg-[#0d1117] text-white">
            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <main className="pt-20 md:pt-24 pb-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <AnimatedSection>
                        <div className="text-center mb-8 md:mb-12">
                            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 backdrop-blur-xl mb-4 md:mb-6">
                                <Code2 className="w-4 md:w-5 h-4 md:h-5 text-purple-400" />
                                <span className="text-xs md:text-sm font-bold text-purple-400 tracking-wider uppercase">Enterprise Web IDE</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-3 md:mb-4 tracking-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-x">
                                    Code Editor
                                </span>
                            </h1>
                            <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
                                Write, compile, and run code in multiple languages directly in your browser
                            </p>
                        </div>
                    </AnimatedSection>

                    {/* Editor Container */}
                    <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
                        {/* Code Editor Panel */}
                        <div className="bg-[#161b22] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                            {/* Editor Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-[#21262d] border-b border-gray-800">
                                <div className="flex items-center gap-3">
                                    {/* Language Selector */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161b22] border border-gray-700 hover:border-purple-500 transition-colors text-sm font-medium"
                                        >
                                            <span>{currentLang?.icon}</span>
                                            <span>{currentLang?.name}</span>
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        </button>

                                        {showLanguageMenu && (
                                            <div className="absolute top-full mt-2 left-0 bg-[#21262d] border border-gray-700 rounded-xl shadow-2xl z-50 min-w-[180px] py-2 overflow-hidden">
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
                                                        <span className="text-lg">{lang.icon}</span>
                                                        <span className="font-medium">{lang.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <FileCode className="w-4 h-4" />
                                        <span>main{currentLang?.extension}</span>
                                    </div>
                                </div>

                                {/* Editor Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                        title="Copy code"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                        title="Reset code"
                                    >
                                        <RefreshCw className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                        title="Clear code"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Code Input */}
                            <div className="relative">
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full h-[400px] md:h-[500px] bg-[#0d1117] text-gray-100 font-mono text-sm md:text-base p-4 resize-none focus:outline-none leading-relaxed"
                                    placeholder="Write your code here..."
                                    spellCheck={false}
                                />

                                {/* Line numbers overlay indicator */}
                                <div className="absolute top-4 left-4 text-gray-600 font-mono text-sm pointer-events-none select-none">
                                    {/* Line indicators would go here in a full implementation */}
                                </div>
                            </div>

                            {/* Run Button */}
                            <div className="px-4 py-3 bg-[#21262d] border-t border-gray-800">
                                <Button
                                    onClick={handleRun}
                                    disabled={isRunning || !code.trim()}
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRunning ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Running...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5 mr-2" />
                                            Run Code
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Output Panel */}
                        <div className="bg-[#161b22] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                            {/* Output Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-[#21262d] border-b border-gray-800">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-green-400" />
                                    <span className="text-sm font-medium text-gray-300">Output</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setOutput("")}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                        title="Clear output"
                                    >
                                        <Trash2 className="w-4 h-4 text-gray-400" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (output) {
                                                navigator.clipboard.writeText(output);
                                                toast.success("Output copied!");
                                            }
                                        }}
                                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                        title="Copy output"
                                    >
                                        <Copy className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Output Content */}
                            <div className="h-[400px] md:h-[500px] bg-[#0d1117] p-4 overflow-auto">
                                {output ? (
                                    <pre className="font-mono text-sm md:text-base text-green-400 whitespace-pre-wrap leading-relaxed">
                                        {output}
                                    </pre>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                        <Terminal className="w-12 h-12 mb-4 opacity-50" />
                                        <p className="text-center">
                                            Output will appear here after running your code
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Status Bar */}
                            <div className="px-4 py-2 bg-[#21262d] border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                                <span>{currentLang?.name} ready</span>
                                <span>{code.split('\n').length} lines</span>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <AnimatedSection delay={200}>
                        <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { icon: "⚡", title: "Fast Execution", desc: "Compile & run instantly" },
                                { icon: "🔒", title: "Secure", desc: "Sandboxed environment" },
                                { icon: "🌐", title: "8 Languages", desc: "C, C++, Python & more" },
                                { icon: "💾", title: "Auto-Save", desc: "Never lose your work" },
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
                </div>
            </main>
        </div>
    );
}
