import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/HomeMidnight";
import Projects from "./pages/Projects";
// Certifications page removed - merged into Home
import Resources from "./pages/Resources";
import CodeEditor from "./pages/CodeEditor";
import { lazy, Suspense } from "react";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Positivus from "./pages/Positivus";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { BackToTop } from "./components/ui/BackToTop";
import { ScrollProgressBar } from "./components/ui/ScrollProgressBar";
import { CookieConsent } from "./components/ui/CookieConsent";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { AdminChatWidget } from "./components/chat/AdminChatWidget";

// Lazy load TinkercadLab for Arduino experiments
const TinkercadLab = lazy(() => import("./pages/TinkercadLab"));

// Lazy load Community and Notes pages
const Community = lazy(() => import("./pages/Community"));
const Notes = lazy(() => import("./pages/Notes"));
const CommunityWrite = lazy(() => import("./pages/CommunityWrite"));
const ClassNotesEditor = lazy(() => import("./pages/ClassNotesEditor"));

// Notion-style Workspace (Phase 1)
const NotesPage = lazy(() => import("./pages/NotesPage"));

// Loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-electric/30 border-t-electric rounded-full animate-spin mx-auto mb-4" />
        <p className="text-frost font-medium">로딩 중...</p>
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
      <Route path="/arduino-lab">
        <Suspense fallback={<PageLoader />}>
          <TinkercadLab />
        </Suspense>
      </Route>
      <Route path="/community/write">
        <Suspense fallback={<PageLoader />}>
          <CommunityWrite />
        </Suspense>
      </Route>
      <Route path="/community">
        <Suspense fallback={<PageLoader />}>
          <Community />
        </Suspense>
      </Route>
      <Route path="/notes/new">
        <Suspense fallback={<PageLoader />}>
          <ClassNotesEditor />
        </Suspense>
      </Route>
      <Route path="/notes/:id">
        <Suspense fallback={<PageLoader />}>
          <ClassNotesEditor />
        </Suspense>
      </Route>
      <Route path="/notes">
        <Suspense fallback={<PageLoader />}>
          <Notes />
        </Suspense>
      </Route>
      {/* Notion-style Workspace */}
      <Route path="/workspace/:pageId">
        <Suspense fallback={<PageLoader />}>
          <NotesPage />
        </Suspense>
      </Route>
      <Route path="/workspace">
        <Suspense fallback={<PageLoader />}>
          <NotesPage />
        </Suspense>
      </Route>
      <Route path="/admin" component={Admin} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={Profile} />
      <Route path="/positivus" component={Positivus} />
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
      <ThemeProvider defaultTheme="dark" switchable={false}>
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
