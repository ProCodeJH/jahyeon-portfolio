import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Search,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Type definitions (Expanded for safety)
interface Certification {
  id: number;
  name: string;
  issuer: string;
  date: string; // ISO string expected
  credentialId?: string | null;
  credentialUrl?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  skills?: string[] | null; // Assuming array of strings
}

export default function Certifications() {
  const [, setLocation] = useLocation();
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: certifications, isLoading } = trpc.certifications.list.useQuery();

  const filteredCerts = certifications?.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
          <div
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5 text-slate-900" />
            <span className="font-bold text-slate-900 tracking-wide">BACK TO HOME</span>
          </div>
          <div className="font-mono font-bold text-blue-600">CREDENTIALS</div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto">

        {/* HERO SECTION */}
        <div className="mb-20 md:mb-32">
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]">
            Certified<br />
            <span className="text-blue-600">Expertise</span>
          </h1>
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl leading-relaxed">
              Professional qualifications and technical validations from industry-leading organizations.
            </p>

            {/* SEARCH BAR */}
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search certifications..."
                className="pl-12 h-14 rounded-full bg-white border-slate-200 text-lg shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* CERTIFICATIONS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] h-[400px] animate-pulse bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCerts?.map((cert, idx) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedCert(cert as any)}
                className="group cursor-pointer"
              >
                <div className="relative bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-xl hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-500 h-full min-h-[400px] flex flex-col justify-between overflow-hidden">

                  {/* Decorative Background Icon */}
                  <Award className="absolute -right-8 -bottom-8 w-48 h-48 text-slate-50 transform rotate-12 group-hover:rotate-[24deg] transition-transform duration-700 pointer-events-none" />

                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                      {cert.imageUrl ? (
                        <img src={cert.imageUrl} alt={cert.issuer} className="w-12 h-12 object-contain" />
                      ) : (
                        <ShieldCheck className="w-10 h-10 text-blue-600" />
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                      {cert.name}
                    </h3>
                    <p className="text-slate-500 font-bold uppercase tracking-wide text-xs mb-6">
                      {cert.issuer}
                    </p>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/50 text-slate-500 text-sm font-medium">
                      <Calendar className="w-3 h-3" />
                      {new Date(cert.date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="relative z-10 pt-8 mt-auto border-t border-slate-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                      View Credential <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* DETAIL DIALOG */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-2xl bg-white p-8 md:p-12 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          {selectedCert && (
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                <Award className="w-12 h-12 text-blue-600" />
              </div>

              <DialogHeader className="mb-8 w-full">
                <DialogTitle className="text-3xl md:text-4xl font-black text-slate-900 mb-2 leading-tight text-center">
                  {selectedCert.name}
                </DialogTitle>
                <p className="text-lg text-slate-500 font-medium">
                  Issued by {selectedCert.issuer}
                </p>
              </DialogHeader>

              <div className="w-full bg-slate-50 rounded-2xl p-6 md:p-8 mb-8 text-left">
                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-4">
                  <span className="text-slate-500 font-bold text-sm uppercase">Date Earned</span>
                  <span className="text-slate-900 font-bold">{new Date(selectedCert.date).toLocaleDateString()}</span>
                </div>
                {selectedCert.credentialId && (
                  <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-4">
                    <span className="text-slate-500 font-bold text-sm uppercase">Credential ID</span>
                    <span className="text-slate-900 font-mono text-sm">{selectedCert.credentialId}</span>
                  </div>
                )}
                {selectedCert.description && (
                  <div className="pt-2">
                    <span className="text-slate-500 font-bold text-sm uppercase block mb-2">Description</span>
                    <p className="text-slate-700 leading-relaxed text-sm">
                      {selectedCert.description}
                    </p>
                  </div>
                )}
              </div>

              {selectedCert.credentialUrl && (
                <a href={selectedCert.credentialUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full rounded-xl bg-blue-600 text-white h-14 text-lg font-bold hover:bg-blue-700 shadow-xl shadow-blue-600/20">
                    <ExternalLink className="mr-2 w-5 h-5" /> Verify Credential
                  </Button>
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
