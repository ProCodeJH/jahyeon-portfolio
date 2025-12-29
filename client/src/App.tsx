import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Certifications from "./pages/Certifications";
import Resources from "./pages/Resources";
import Admin from "./pages/Admin";
import CircuitLab from "./pages/CircuitLab";
import CodeEditor from "./pages/CodeEditor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={Projects} />
      <Route path="/certifications" component={Certifications} />
      <Route path="/resources" component={Resources} />
      <Route path="/admin" component={Admin} />
      <Route path="/circuit-lab" component={CircuitLab} />
      <Route path="/code-editor" component={CodeEditor} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
