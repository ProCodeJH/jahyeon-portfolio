import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/animations/PageTransition";
import { useLocation } from "wouter";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Certifications from "./pages/Certifications";
import Resources from "./pages/Resources";
import Admin from "./pages/Admin";

function Router() {
  const [location] = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Switch key={location}>
        <Route path="/">
          <PageTransition><Home /></PageTransition>
        </Route>
        <Route path="/projects">
          <PageTransition><Projects /></PageTransition>
        </Route>
        <Route path="/certifications">
          <PageTransition><Certifications /></PageTransition>
        </Route>
        <Route path="/resources">
          <PageTransition><Resources /></PageTransition>
        </Route>
        <Route path="/admin">
          <PageTransition><Admin /></PageTransition>
        </Route>
        <Route path="/404">
          <PageTransition><NotFound /></PageTransition>
        </Route>
        <Route>
          <PageTransition><NotFound /></PageTransition>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="noise-overlay" />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
