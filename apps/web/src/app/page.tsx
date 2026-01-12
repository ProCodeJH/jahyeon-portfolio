import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" />

                {/* Ambient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-8">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-white/80">Live Support Available</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                        Welcome to{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                            Jahyeon
                        </span>
                    </h1>

                    <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
                        Professional portfolio, live support, and comprehensive blog platform.
                        Get instant help with our real-time chat system.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/blog"
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                        >
                            Explore Blog
                        </Link>
                        <Link
                            href="/admin"
                            className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-bold hover:bg-white/20 transition-all"
                        >
                            Admin Dashboard
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 bg-slate-900/50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl font-bold text-white text-center mb-16">
                        Enterprise Features
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '💬',
                                title: 'Live Chat Support',
                                description: 'Real-time WebSocket-powered chat with typing indicators and read receipts.',
                            },
                            {
                                icon: '📝',
                                title: 'Blog CMS',
                                description: 'Full-featured blog with rich text editor, categories, and SEO optimization.',
                            },
                            {
                                icon: '📱',
                                title: 'Mobile Admin App',
                                description: 'Manage everything on the go with push notifications and offline support.',
                            },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all group"
                            >
                                <div className="text-5xl mb-6">{feature.icon}</div>
                                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-white/60">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
