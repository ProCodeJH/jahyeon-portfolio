/**
 * Professional Share Dialog
 * Beautiful UI for sharing code
 */

import { useState } from 'react';
import { useIDEStore } from '@/lib/ide-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Share2, Lock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ShareDialog() {
  const { isShareDialogOpen, toggleShareDialog } = useIDEStore();
  const [copied, setCopied] = useState(false);
  const [shareMode, setShareMode] = useState<'public' | 'private'>('public');

  // Generate a mock share link
  const shareLink = `https://code-editor.dev/share/${Math.random().toString(36).substring(7)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isShareDialogOpen} onOpenChange={toggleShareDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            Share Your Code
          </DialogTitle>
          <DialogDescription>
            Anyone with the link can view and run your code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Share Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShareMode('public')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                shareMode === 'public'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium text-sm">Public</span>
            </button>

            <button
              onClick={() => setShareMode('private')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                shareMode === 'private'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Lock className="w-4 h-4" />
              <span className="font-medium text-sm">Private</span>
            </button>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Share Link
            </label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                onClick={handleCopy}
                variant={copied ? 'default' : 'outline'}
                className={cn(
                  'transition-all',
                  copied && 'bg-green-600 hover:bg-green-700'
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <h4 className="text-sm font-bold text-gray-900 mb-3">
              What's included:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span>All your code files and folders</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Read-only access for viewers</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <span>Viewers can run and test your code</span>
              </li>
              {shareMode === 'private' && (
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span className="text-purple-700 font-medium">Password protected access</span>
                </li>
              )}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={toggleShareDialog}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCopy}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
