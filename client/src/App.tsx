import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { lazy, Suspense } from "react";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { BackToTop } from "./components/ui/BackToTop";
import { ScrollProgressBar } from "./components/ui/ScrollProgressBar";
import { CookieConsent } from "./components/ui/CookieConsent";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { AdminChatWidget } from "./components/chat/AdminChatWidget";

// 🚀 LAZY LOADING - Reduces initial bundle size by ~40%
const Projects = lazy(() => import("./pages/Projects"));
const Resources = lazy(() => import("./pages/Resources"));
const CodeEditor = lazy(() => import("./pages/CodeEditor"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const VirtualWorld3D = lazy(() => import("./pages/VirtualWorld3D"));
const TinkercadLab = lazy(() => import("./pages/TinkercadLab"));

// Loading fallback for pages
function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#12121a] to-[#0a0a1a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 font-medium">페이지 로딩 중...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/projects" component={Projects} />
        <Route path="/resources" component={Resources} />
        <Route path="/code-editor" component={CodeEditor} />
        <Route path="/virtual-world" component={VirtualWorld3D} />
        <Route path="/arduino-lab" component={TinkercadLab} />
        <Route path="/admin" component={Admin} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/profile" component={Profile} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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

