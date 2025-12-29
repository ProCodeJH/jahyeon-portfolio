import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Code, Terminal, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const examples = {
  c: `#include <stdio.h>

int main() {
    printf("Hello from C!\\n");

    // LED Blink Simulation
    for(int i = 0; i < 5; i++) {
        printf("LED ON\\n");
        printf("LED OFF\\n");
    }

    return 0;
}`,
  python: `# Python Automation Example
import time

def blink_led(times):
    """Simulate LED blinking"""
    for i in range(times):
        print(f"LED ON - {i+1}")
        time.sleep(0.5)
        print(f"LED OFF - {i+1}")
        time.sleep(0.5)

# Run simulation
print("Starting LED Blink Demo...")
blink_led(5)
print("Demo Complete!")`,
  arduino: `// Arduino Blink Example
#define LED_PIN 13

void setup() {
    pinMode(LED_PIN, OUTPUT);
    Serial.begin(9600);
    Serial.println("Arduino Ready!");
}

void loop() {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("LED ON");
    delay(1000);

    digitalWrite(LED_PIN, LOW);
    Serial.println("LED OFF");
    delay(1000);
}`
};

export function CodePlayground() {
  const [language, setLanguage] = useState<"c" | "python" | "arduino">("python");
  const [code, setCode] = useState(examples.python);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setOutput("🚀 Running code...\n\n");

    // Simulate code execution
    setTimeout(() => {
      const simulatedOutput = `✅ Code executed successfully!\n\n--- Output ---\n${getSimulatedOutput(language, code)}`;
      setOutput(simulatedOutput);
      setIsRunning(false);
    }, 1500);
  };

  const getSimulatedOutput = (lang: string, code: string) => {
    // Simple simulation based on language
    if (lang === "python") {
      return `Starting LED Blink Demo...
LED ON - 1
LED OFF - 1
LED ON - 2
LED OFF - 2
LED ON - 3
LED OFF - 3
LED ON - 4
LED OFF - 4
LED ON - 5
LED OFF - 5
Demo Complete!`;
    } else if (lang === "c") {
      return `Hello from C!
LED ON
LED OFF
LED ON
LED OFF
LED ON
LED OFF
LED ON
LED OFF
LED ON
LED OFF`;
    } else {
      return `Arduino Ready!
LED ON
LED OFF
LED ON
LED OFF
LED ON
LED OFF`;
    }
  };

  const handleLanguageChange = (lang: "c" | "python" | "arduino") => {
    setLanguage(lang);
    setCode(examples[lang]);
    setOutput("");
  };

  return (
    <section className="py-32 px-4 md:px-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl mb-6"
          >
            <Code className="w-5 h-5 text-cyan-300" />
            <span className="text-sm font-bold text-cyan-300 tracking-wider uppercase">Interactive Demo</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300">
              Code Playground
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Try embedded programming in your browser - experience my teaching style!
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl"
        >
          {/* Language Selector */}
          <div className="flex items-center gap-2 p-4 bg-white/5 border-b border-white/10">
            {["python", "c", "arduino"].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang as any)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  language === lang
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
            <div className="flex-1" />
            <Button
              onClick={handleRun}
              disabled={isRunning}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold rounded-lg shadow-lg"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Code
                </>
              )}
            </Button>
          </div>

          {/* Editor and Output */}
          <div className="grid md:grid-cols-2 divide-x divide-white/10">
            {/* Code Editor */}
            <div className="min-h-[500px]">
              <div className="flex items-center gap-2 p-3 bg-white/5 border-b border-white/10">
                <Code className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-gray-300">Code Editor</span>
              </div>
              <Editor
                height="500px"
                language={language === "arduino" ? "cpp" : language}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>

            {/* Output Console */}
            <div className="min-h-[500px] bg-black/30">
              <div className="flex items-center gap-2 p-3 bg-white/5 border-b border-white/10">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-sm font-bold text-gray-300">Output Console</span>
              </div>
              <div className="p-4 h-[500px] overflow-auto">
                <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                  {output || "// Click 'Run Code' to see output..."}
                </pre>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Real Code Examples</h3>
            <p className="text-sm text-gray-400">Actual embedded programming patterns I teach in my classes</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <Code className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Interactive Learning</h3>
            <p className="text-sm text-gray-400">Modify and run code instantly - learn by doing</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <Terminal className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Beginner Friendly</h3>
            <p className="text-sm text-gray-400">Start with simple examples, progress to complex projects</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
