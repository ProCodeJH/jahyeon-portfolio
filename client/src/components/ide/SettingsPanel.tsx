/**
 * Enterprise Settings Panel
 * Comprehensive IDE configuration
 */

import { useIDEStore } from '@/lib/ide-store';
import { Theme } from '@/lib/ide-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Palette, Type, Code, Eye } from 'lucide-react';

export function SettingsPanel() {
  const { isSettingsOpen, toggleSettings, settings, updateSettings } = useIDEStore();

  return (
    <Dialog open={isSettingsOpen} onOpenChange={toggleSettings}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            Editor Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-8">
            {/* Appearance */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold">Appearance</h3>
              </div>

              <div className="space-y-4 pl-7">
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme" className="text-sm font-medium">
                    Color Theme
                  </Label>
                  <Select
                    value={settings?.theme}
                    onValueChange={(value: Theme) => updateSettings({ theme: value })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="high-contrast">High Contrast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Text Editor */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold">Text Editor</h3>
              </div>

              <div className="space-y-6 pl-7">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">
                      Font Size: {settings?.fontSize}px
                    </Label>
                  </div>
                  <Slider
                    value={[settings?.fontSize]}
                    onValueChange={([value]) => updateSettings({ fontSize: value })}
                    min={10}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10px</span>
                    <span>24px</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="fontFamily" className="text-sm font-medium">
                    Font Family
                  </Label>
                  <Select
                    value={settings?.fontFamily}
                    onValueChange={(value) => updateSettings({ fontFamily: value })}
                  >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JetBrains Mono, monospace">JetBrains Mono</SelectItem>
                      <SelectItem value="Fira Code, monospace">Fira Code</SelectItem>
                      <SelectItem value="Source Code Pro, monospace">Source Code Pro</SelectItem>
                      <SelectItem value="Consolas, monospace">Consolas</SelectItem>
                      <SelectItem value="Monaco, monospace">Monaco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">
                      Tab Size: {settings?.tabSize} spaces
                    </Label>
                  </div>
                  <Slider
                    value={[settings?.tabSize]}
                    onValueChange={([value]) => updateSettings({ tabSize: value })}
                    min={2}
                    max={8}
                    step={2}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>2</span>
                    <span>4</span>
                    <span>6</span>
                    <span>8</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="wordWrap" className="text-sm font-medium">
                      Word Wrap
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Controls whether lines should wrap
                    </p>
                  </div>
                  <Switch
                    id="wordWrap"
                    checked={settings?.wordWrap}
                    onCheckedChange={(checked) => updateSettings({ wordWrap: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lineNumbers" className="text-sm font-medium">
                      Line Numbers
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Show line numbers in editor
                    </p>
                  </div>
                  <Switch
                    id="lineNumbers"
                    checked={settings?.lineNumbers}
                    onCheckedChange={(checked) => updateSettings({ lineNumbers: checked })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold">Features</h3>
              </div>

              <div className="space-y-4 pl-7">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="minimap" className="text-sm font-medium">
                      Minimap
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Show code minimap overview
                    </p>
                  </div>
                  <Switch
                    id="minimap"
                    checked={settings?.minimap}
                    onCheckedChange={(checked) => updateSettings({ minimap: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoSave" className="text-sm font-medium">
                      Auto Save
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically save files after typing
                    </p>
                  </div>
                  <Switch
                    id="autoSave"
                    checked={settings?.autoSave}
                    onCheckedChange={(checked) => updateSettings({ autoSave: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="formatOnSave" className="text-sm font-medium">
                      Format On Save
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically format code on save
                    </p>
                  </div>
                  <Switch
                    id="formatOnSave"
                    checked={settings?.formatOnSave}
                    onCheckedChange={(checked) => updateSettings({ formatOnSave: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <h4 className="text-sm font-bold text-gray-900 mb-2">
                💡 Pro Tip
              </h4>
              <p className="text-sm text-gray-700">
                Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Ctrl+K</kbd> to open the Command Palette for quick access to all commands.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
