import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Play,
  Settings,
  Share2,
  Save,
  Terminal,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CodeEditor() {
  const [code, setCode] = useState("// Write your Arduino/C++ code here\n\nvoid setup() {\n  // Setup code\n}\n\nvoid loop() {\n  // Main loop\n}");
  const [output, setOutput] = useState("Ready to compile...");

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 flex-shrink-0 shadow-sm relative">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-2 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold text-sm">EXIT</span>
            </div>
          </Link>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 text-lg">ProIDE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-100">
            <Save className="w-4 h-4" /> Save
          </Button>
          <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20">
            <Play className="w-4 h-4 fill-current" /> Run Simulation
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* EDITOR PANE */}
        <div className="flex-1 flex flex-col border-r border-slate-200 bg-white">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="cpp"
              theme="light" // LIGHT THEME
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20 },
                backgroundColor: '#ffffff',
              }}
            />
          </div>
        </div>

        {/* SIDEBAR / TERMINAL PANE */}
        <div className="w-80 md:w-96 bg-slate-50 flex flex-col border-l border-slate-200 shadow-xl z-10">
          <div className="p-4 bg-white border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" /> Console Output
          </div>
          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto w-full text-slate-600 bg-slate-50">
            <div className="mb-2 text-green-600 font-bold">{">"} System Initialized</div>
            {output}
          </div>
        </div>
      </div>
    </div>
  );
}
