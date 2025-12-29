/**
 * Professional Template Gallery
 * Beautiful cards for code templates
 */

import { Template } from '@/lib/ide-types';
import { useIDEStore } from '@/lib/ide-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Code, Cpu, Zap, Database, Brain, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

const templates: Template[] = [
  {
    id: 'python-hello',
    name: 'Python Hello World',
    description: 'Basic Python program with print statements',
    language: 'python',
    icon: '🐍',
    tags: ['beginner', 'python'],
    code: `# Python Hello World
print("Hello, World!")

# Example with variables
name = "Developer"
print(f"Welcome, {name}!")

# Example with loop
for i in range(5):
    print(f"Count: {i}")
`,
  },
  {
    id: 'python-algorithms',
    name: 'Python Algorithms',
    description: 'Classic algorithms: sorting, searching, and more',
    language: 'python',
    icon: '🧮',
    tags: ['algorithms', 'python'],
    code: `# Binary Search Algorithm
def binary_search(arr, target):
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1

# Example usage
numbers = [1, 3, 5, 7, 9, 11, 13, 15]
result = binary_search(numbers, 7)
print(f"Found at index: {result}")
`,
  },
  {
    id: 'cpp-hello',
    name: 'C++ Hello World',
    description: 'Basic C++ program with iostream',
    language: 'cpp',
    icon: '⚡',
    tags: ['beginner', 'cpp'],
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;

    // Example with variables
    string name = "Developer";
    cout << "Welcome, " << name << "!" << endl;

    // Example with loop
    for (int i = 0; i < 5; i++) {
        cout << "Count: " << i << endl;
    }

    return 0;
}
`,
  },
  {
    id: 'cpp-data-structures',
    name: 'C++ Data Structures',
    description: 'Vectors, maps, and modern C++ features',
    language: 'cpp',
    icon: '📊',
    tags: ['data-structures', 'cpp'],
    code: `#include <iostream>
#include <vector>
#include <map>
using namespace std;

int main() {
    // Vector example
    vector<int> numbers = {1, 2, 3, 4, 5};

    cout << "Vector elements: ";
    for (int num : numbers) {
        cout << num << " ";
    }
    cout << endl;

    // Map example
    map<string, int> ages;
    ages["Alice"] = 25;
    ages["Bob"] = 30;

    cout << "Alice's age: " << ages["Alice"] << endl;

    return 0;
}
`,
  },
  {
    id: 'arduino-blink',
    name: 'Arduino LED Blink',
    description: 'Classic Arduino LED blinking example',
    language: 'arduino',
    icon: '💡',
    tags: ['arduino', 'beginner'],
    code: `// Arduino LED Blink
#define LED_PIN 13

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("Arduino Started!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(1000);

  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
`,
  },
  {
    id: 'arduino-sensors',
    name: 'Arduino Sensors',
    description: 'Read from multiple sensors and display values',
    language: 'arduino',
    icon: '🔬',
    tags: ['arduino', 'sensors'],
    code: `// Arduino Multi-Sensor Reading
#define PIR_PIN 7
#define PHOTO_PIN A0
#define LED_PIN 13

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  Serial.begin(115200);
  Serial.println("Sensor System Ready!");
}

void loop() {
  // Read PIR motion sensor
  int motion = digitalRead(PIR_PIN);

  // Read light sensor
  int lightLevel = analogRead(PHOTO_PIN);

  // Print values
  Serial.print("Motion: ");
  Serial.print(motion ? "DETECTED" : "None");
  Serial.print(" | Light: ");
  Serial.println(lightLevel);

  // Control LED based on motion
  digitalWrite(LED_PIN, motion);

  delay(500);
}
`,
  },
];

export function TemplateGallery() {
  const { isTemplateGalleryOpen, toggleTemplateGallery, openTab } = useIDEStore();

  const handleUseTemplate = (template: Template) => {
    const newFile = {
      id: `template-${template.id}-${Date.now()}`,
      name: `${template.name.toLowerCase().replace(/\s+/g, '-')}.${
        template.language === 'cpp' ? 'cpp' : template.language === 'arduino' ? 'ino' : 'py'
      }`,
      type: 'file' as const,
      path: `/template-${template.id}`,
      language: template.language,
      content: template.code,
      isOpen: false,
      isPinned: false,
      isDirty: false,
    };

    openTab(newFile);
    toggleTemplateGallery();
  };

  return (
    <Dialog open={isTemplateGalleryOpen} onOpenChange={toggleTemplateGallery}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Template Gallery</DialogTitle>
          <p className="text-sm text-gray-500">
            Start with a professional code template
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group relative border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => handleUseTemplate(template)}
              >
                {/* Icon */}
                <div className="absolute -top-3 -right-3 text-4xl">{template.icon}</div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 pr-8">
                    {template.name}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Language Badge */}
                  <div className="pt-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {template.language.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
