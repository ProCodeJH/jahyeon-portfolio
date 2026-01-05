import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  FileText,
  Download,
  Share2,
  MoreVertical,
  Search,
  Filter,
  Grid,
  List as ListIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Resources() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: resources, isLoading } = trpc.resources.list.useQuery();

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
          <div className="font-mono font-bold text-blue-600">RESOURCE HUB</div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto">

        {/* TITLE SECTION */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4">
              Knowledge<span className="text-blue-600">Base</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl">
              Lectures, source code snippets, and technical documentation shared with the community.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-slate-900' : ''}
            >
              <Grid className="w-4 h-4 mr-2" /> Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-slate-900' : ''}
            >
              <ListIcon className="w-4 h-4 mr-2" /> List
            </Button>
          </div>
        </div>

        {/* CONTENT GRID/LIST */}
        {isLoading ? (
          <div>Loading resources...</div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {resources?.map((resource) => (
              <div
                key={resource.id}
                className={`group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all duration-300 ${viewMode === 'list' ? 'flex items-center p-6 gap-6' : 'flex flex-col'
                  }`}
              >
                {/* Icon/Preview Area */}
                <div className={`flex items-center justify-center bg-slate-50 ${viewMode === 'list' ? 'w-20 h-20 rounded-2xl flex-shrink-0' : 'h-48 w-full'}`}>
                  <FileText className={`text-slate-300 ${viewMode === 'list' ? 'w-8 h-8' : 'w-16 h-16'}`} />
                </div>

                {/* Info Area */}
                <div className={`flex-1 ${viewMode === 'grid' ? 'p-8' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wide">
                      {resource.category}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                      </DropdownMenuTrigger>
                    </DropdownMenuContent>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Download</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                  {resource.description || "No description provided."}
                </p>

                <Button className="w-full bg-slate-900 text-white hover:bg-blue-600 rounded-xl font-bold h-12 shadow-md hover:shadow-lg transition-all">
                  Access Resource
                </Button>
              </div>
              </div>
        ))}
    </div>
  )
}
      </main >
    </div >
  );
}
