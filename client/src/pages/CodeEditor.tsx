/**
 * Professional Web IDE - Code Editor
 * Figma/Notion style design with VSCode productivity
 * Top Bar + Left Sidebar + Main Editor + Bottom Dock + Status Bar
 */

import { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { useIDEStore } from '@/lib/ide-store';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import {
  Play,
  Square,
  RotateCcw,
  Share2,
  Settings,
  Search,
  FileCode,
  Command,
} from 'lucide-react';

// IDE Components
import { FileTree } from '@/components/ide/FileTree';
import { EditorTabs } from '@/components/ide/EditorTabs';
import { BottomDock } from '@/components/ide/BottomDock';
import { StatusBar } from '@/components/ide/StatusBar';
import { TemplateGallery } from '@/components/ide/TemplateGallery';
import { CommandPalette } from '@/components/ide/CommandPalette';
import { ShareDialog } from '@/components/ide/ShareDialog';
import { ExecutionStatusPill } from '@/components/ide/ExecutionStatusPill';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CodeEditor() {
  const {
    tabs,
    activeTabId,
    setExecutionStatus,
    setExecutionResult,
    toggleTemplateGallery,
    toggleShareDialog,
    markTabDirty,
    files,
    updateFileContent,
  } = useIDEStore();

  const [output, setOutput] = useState('');
  const activeTab = tabs.find(t => t.id === activeTabId);

  // Handle code change
  const handleCodeChange = (value: string | undefined) => {
    if (!activeTab || !value) return;

    markTabDirty(activeTab.id, true);
    updateFileContent(activeTab.fileId, value);
  };

  // Execute code
  const handleRun = async () => {
    if (!activeTab) return;

    setExecutionStatus('compiling');
    setOutput('🔨 Compiling...\n');

    // Simulate compilation delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setExecutionStatus('running');
    setOutput(prev => prev + '✅ Compilation successful\n🚀 Running code...\n\n');

    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 1200));

    const mockOutput = generateMockOutput(activeTab.language, activeTab.content);
    setOutput(prev => prev + mockOutput);

    setExecutionStatus('success');
    setExecutionResult({
      status: 'success',
      output: mockOutput,
      executionTime: Math.random() * 2 + 0.5,
      memoryUsed: Math.floor(Math.random() * 50 + 10),
    });
  };

  const handleStop = () => {
    setExecutionStatus('idle');
    setOutput(prev => prev + '\n⏹️ Execution stopped by user\n');
  };

  const handleReset = () => {
    setExecutionStatus('idle');
    setOutput('');
    setExecutionResult(null);
  };

  // Mock output generator
  const generateMockOutput = (language: string, code: string): string => {
    const outputs: Record<string, string> = {
      python: `Hello from Professional IDE!
F(0) = 0
F(1) = 1
F(2) = 1
F(3) = 2
F(4) = 3
F(5) = 5
F(6) = 8
F(7) = 13
F(8) = 21
F(9) = 34

✅ Program exited with code 0`,
      cpp: `Hello from C++!
Factorial of 10 is 3628800

✅ Program exited with code 0`,
      arduino: `🔨 Uploading to Arduino UNO...
✅ Upload complete

Arduino Started!
LED ON
LED OFF
LED ON
LED OFF

✅ Simulation running`,
    };

    return outputs[language] || `Code executed successfully\n\n✅ Program exited with code 0`;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <Navigation />

      {/* IDE Container */}
      <div className="flex-1 flex flex-col pt-[73px]">
        {/* App Bar - 48px */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
          {/* Left: Project Info */}
          <div className="flex items-center gap-3">
            <FileCode className="w-5 h-5 text-blue-600" />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-gray-900">Professional IDE</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{activeTab?.name || 'No file'}</span>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <ExecutionStatusPill />

            <div className="w-px h-6 bg-gray-300" />

            <Button
              onClick={handleRun}
              disabled={!activeTab}
              className="bg-green-600 hover:bg-green-700 h-8"
              size="sm"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Run
            </Button>

            <Button
              onClick={handleStop}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              <Square className="w-3.5 h-3.5 mr-1.5" />
              Stop
            </Button>

            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>

            <div className="w-px h-6 bg-gray-300" />

            <Button
              onClick={toggleShareDialog}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              Share
            </Button>

            <Button
              onClick={() => {}}
              variant="ghost"
              size="sm"
              className="h-8"
            >
              <Settings className="w-3.5 h-3.5" />
            </Button>

            <Button
              onClick={() => {}}
              variant="ghost"
              size="sm"
              className="h-8 bg-blue-50 hover:bg-blue-100 text-blue-700"
              title="Press Ctrl+K"
            >
              <Command className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - 280px */}
          <div className="w-[280px] border-r border-gray-200 bg-white shrink-0">
            <Tabs defaultValue="explorer" className="h-full flex flex-col">
              <TabsList className="shrink-0 justify-start rounded-none border-b border-gray-200 bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="explorer"
                  className="data-[state=active]:bg-gray-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-2.5 text-xs font-semibold"
                >
                  EXPLORER
                </TabsTrigger>
                <TabsTrigger
                  value="templates"
                  className="data-[state=active]:bg-gray-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 py-2.5 text-xs font-semibold"
                  onClick={toggleTemplateGallery}
                >
                  TEMPLATES
                </TabsTrigger>
              </TabsList>

              <TabsContent value="explorer" className="flex-1 m-0">
                <FileTree />
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Editor + Bottom Dock */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-white">
              {/* Editor Tabs */}
              <EditorTabs />

              {/* Monaco Editor */}
              {activeTab ? (
                <div className="flex-1 overflow-hidden">
                  <Editor
                    height="100%"
                    language={
                      activeTab.language === 'cpp' ? 'cpp' :
                      activeTab.language === 'arduino' ? 'cpp' :
                      activeTab.language
                    }
                    value={activeTab.content}
                    onChange={handleCodeChange}
                    theme="light"
                    options={{
                      minimap: { enabled: true },
                      fontSize: 14,
                      fontFamily: 'JetBrains Mono, Fira Code, monospace',
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      padding: { top: 16, bottom: 16 },
                      smoothScrolling: true,
                      cursorBlinking: 'smooth',
                      renderLineHighlight: 'all',
                      guides: {
                        indentation: true,
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                  <div className="text-center space-y-4">
                    <FileCode className="w-16 h-16 text-gray-300 mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-gray-700">
                        No file open
                      </h3>
                      <p className="text-sm text-gray-500">
                        Select a file from the explorer or create a new one
                      </p>
                    </div>
                    <Button
                      onClick={toggleTemplateGallery}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <FileCode className="w-4 h-4 mr-2" />
                      Browse Templates
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Dock */}
            <BottomDock output={output} />
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar />
      </div>

      {/* Dialogs */}
      <CommandPalette />
      <TemplateGallery />
      <ShareDialog />
    </div>
  );
}
