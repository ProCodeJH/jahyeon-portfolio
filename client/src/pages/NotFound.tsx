import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a0a1a] via-[#12121a] to-[#0a0a1a] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[150px]" />

      <div className="w-full max-w-lg mx-4 p-8 md:p-10 rounded-3xl bg-[#12121a]/80 backdrop-blur-xl border border-white/10 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-cyan-500/30 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center" style={{ boxShadow: '0 0 40px rgba(168, 85, 247, 0.5)' }}>
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-4">404</h1>

        <h2 className="text-2xl font-bold text-white mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-400 mb-8 leading-relaxed">
          Sorry, the page you are looking for doesn't exist.
          <br />
          It may have been moved or deleted.
        </p>

        <Button
          onClick={handleGoHome}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] text-white px-8 py-3 rounded-2xl transition-all duration-300 font-bold text-lg"
        >
          <Home className="w-5 h-5 mr-2" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
