import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
// Certifications page removed - merged into Home
import Resources from "./pages/Resources";
import CodeEditor from "./pages/CodeEditor";
import { lazy, Suspense } from "react";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { BackToTop } from "./components/ui/BackToTop";
import { ScrollProgressBar } from "./components/ui/ScrollProgressBar";
import { CookieConsent } from "./components/ui/CookieConsent";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { AdminChatWidget } from "./components/chat/AdminChatWidget";

// Lazy load VirtualWorld3D to isolate Three.js in separate bundle chunk
const VirtualWorld3D = lazy(() => import("./pages/VirtualWorld3D"));

// Lazy load TinkercadLab for Arduino experiments
const TinkercadLab = lazy(() => import("./pages/TinkercadLab"));

// Lazy load EntryLab for block coding
const EntryLab = lazy(() => import("./pages/EntryLab"));

// Loading fallback for VirtualWorld
function VirtualWorldLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-medium">로딩 중...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={Projects} />
      {/* Certifications route removed - content merged into Home */}
      <Route path="/resources" component={Resources} />
      <Route path="/code-editor" component={CodeEditor} />
      <Route path="/virtual-world">
        <Suspense fallback={<VirtualWorldLoader />}>
          <VirtualWorld3D />
        </Suspense>
      </Route>
      <Route path="/arduino-lab">
        <Suspense fallback={<VirtualWorldLoader />}>
          <TinkercadLab />
        </Suspense>
      </Route>
      <Route path="/entry-lab">
        <Suspense fallback={<VirtualWorldLoader />}>
          <EntryLab />
        </Suspense>
      </Route>
      <Route path="/admin" component={Admin} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={Profile} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // 🚀 ENTERPRISE-GRADE SMOOTH SCROLL (Lenis + GSAP)
  useSmoothScroll();

  // ⌨️ KEYBOARD SHORTCUTS
  useKeyboardShortcuts();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={true}>
        <TooltipProvider>
          <Toaster />
          <ScrollProgressBar />
          <Router />
          <BackToTop />
          <CookieConsent />
          <AdminChatWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

