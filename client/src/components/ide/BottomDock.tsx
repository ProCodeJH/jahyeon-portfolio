/**
 * Professional Bottom Dock
 * Terminal / Output / Problems - The core of IDE feeling
 */

import { useState } from 'react';
import { Terminal as TerminalIcon, FileText, AlertCircle, X, Maximize2, Minimize2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIDEStore } from '@/lib/ide-store';
import { cn } from '@/lib/utils';

interface BottomDockProps {
  output: string;
}

export function BottomDock({ output }: BottomDockProps) {
  const { problems = [] } = useIDEStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
        >
          <TerminalIcon className="w-4 h-4" />
          Show Terminal
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white border-t border-gray-200 flex flex-col',
        isMaximized ? 'h-[calc(100vh-48px)]' : 'h-[280px]'
      )}
    >
      <Tabs defaultValue="terminal" className="flex-1 flex flex-col">
        {/* Dock Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <TabsList className="h-8 bg-transparent p-0 gap-1">
            <TabsTrigger
              value="terminal"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs px-3"
            >
              <TerminalIcon className="w-3.5 h-3.5 mr-1.5" />
              Terminal
            </TabsTrigger>
            <TabsTrigger
              value="output"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs px-3"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Output
            </TabsTrigger>
            <TabsTrigger
              value="problems"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs px-3"
            >
              <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
              Problems
              {problems.length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {problems.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="hover:bg-gray-200 p-1.5 rounded transition-colors"
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5 text-gray-600" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="hover:bg-gray-200 p-1.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Terminal Content */}
        <TabsContent value="terminal" className="flex-1 m-0 p-0">
          <div className="h-full bg-gray-900 p-4 overflow-auto font-mono text-sm">
            <div className="text-green-400">
              <span className="text-blue-400">$</span> Ready for commands...
            </div>
            <div className="text-gray-500 text-xs mt-2">
              Interactive terminal coming soon
            </div>
          </div>
        </TabsContent>

        {/* Output Content */}
        <TabsContent value="output" className="flex-1 m-0 p-0">
          <div className="h-full bg-gray-900 p-4 overflow-auto font-mono text-sm">
            <pre className="text-green-400 whitespace-pre-wrap">
              {output || '// Waiting for code execution...'}
            </pre>
          </div>
        </TabsContent>

        {/* Problems Content */}
        <TabsContent value="problems" className="flex-1 m-0 p-0">
          <div className="h-full overflow-auto">
            {problems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-sm">No problems detected</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {problems.map((problem, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className={cn(
                          'w-4 h-4 shrink-0 mt-0.5',
                          problem.severity === 'error' && 'text-red-500',
                          problem.severity === 'warning' && 'text-yellow-500',
                          problem.severity === 'info' && 'text-blue-500'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">
                          {problem.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {problem.file}:{problem.line}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
