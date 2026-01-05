import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <div className="text-center px-4">
        <h1 className="text-[12rem] font-black text-slate-900 leading-none tracking-tighter opacity-10">
          404
        </h1>
        <div className="space-y-6 -mt-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900">
            Page Not Found
          </h2>
          <p className="text-xl text-slate-500 max-w-md mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <Link href="/">
            <Button size="lg" className="rounded-full bg-blue-600 text-white px-8 py-6 text-lg font-bold hover:bg-blue-700 shadow-xl shadow-blue-600/20 mt-8">
              <ArrowLeft className="mr-2 w-5 h-5" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
