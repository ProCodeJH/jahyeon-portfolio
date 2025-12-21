import { Link } from "wouter";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-200/50 shadow-lg shadow-purple-500/5">
      <div className="max-w-7xl mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="group cursor-pointer">
              <span className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 group-hover:scale-110 transition-all duration-300 inline-block">
                JH
              </span>
              <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500 rounded-full" />
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[
              { name: "Work", path: "/projects" },
              { name: "About", path: "/about" },
              { name: "Certifications", path: "/certifications" },
              { name: "Resources", path: "/resources" }
            ].map(item => (
              <Link key={item.name} href={item.path}>
                <span className="group text-base font-bold text-gray-700 hover:text-purple-600 transition-all cursor-pointer relative px-3 py-2">
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300 rounded-full" />
                  <span className="absolute inset-0 bg-purple-100 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
