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
import VirtualWorld3D from "./pages/VirtualWorld3D";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { useSmoothScroll } from "./hooks/useSmoothScroll";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={Projects} />
      {/* Certifications route removed - content merged into Home */}
      <Route path="/resources" component={Resources} />
      <Route path="/code-editor" component={CodeEditor} />
      <Route path="/virtual-world" component={VirtualWorld3D} />
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

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

