import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-[#0a0a0a]">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 bg-white/[0.02] border border-white/10 rounded-2xl">
            <AlertTriangle
              size={48}
              className="text-red-400 mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-2 text-white font-light">문제가 발생했습니다</h2>
            <p className="text-white/50 text-sm mb-6">예상치 못한 오류가 발생했습니다. 페이지를 새로고침해 주세요.</p>

            <div className="p-4 w-full rounded-lg bg-white/5 overflow-auto mb-6 border border-white/10">
              <pre className="text-xs text-red-300/70 whitespace-break-spaces font-mono">
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl",
                  "bg-emerald-500 text-black font-medium",
                  "hover:bg-emerald-400 transition-colors cursor-pointer"
                )}
              >
                <RotateCcw size={16} />
                다시 시도
              </button>
              <button
                onClick={() => window.history.back()}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl",
                  "bg-white/10 text-white",
                  "hover:bg-white/20 transition-colors cursor-pointer"
                )}
              >
                뒤로 가기
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
