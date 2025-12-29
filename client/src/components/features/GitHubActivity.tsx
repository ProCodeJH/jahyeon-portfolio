import { useState, useEffect } from "react";
import { Code, GitCommit, GitBranch, Star } from "lucide-react";
import { AnimatedSection } from "@/components/animations/AnimatedSection";

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

interface GitHubRepo {
  name: string;
  description: string;
  stargazers_count: number;
  html_url: string;
  updated_at: string;
}

export function GitHubActivity() {
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recent activity from GitHub API
    const fetchGitHubData = async () => {
      try {
        // Replace 'ProCodeJH' with your GitHub username
        const username = 'ProCodeJH';

        // Fetch recent commits from all repos
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
        const reposData = await reposRes.json();
        setRepos(reposData);

        // Fetch commits from the first repo
        if (reposData.length > 0) {
          const commitsRes = await fetch(`https://api.github.com/repos/${username}/${reposData[0].name}/commits?per_page=5`);
          const commitsData = await commitsRes.json();
          setCommits(commitsData);
        }
      } catch (error) {
        console.error('Failed to fetch GitHub data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <section className="py-20 md:py-32 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-purple-50/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatedSection>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 backdrop-blur-xl mb-6">
              <GitBranch className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-bold text-purple-600 tracking-wider uppercase">Live Development</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
                GitHub Activity
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real-time code commits and project updates
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Commits */}
          <AnimatedSection delay={100}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-100 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <GitCommit className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Recent Commits</h3>
              </div>

              <div className="space-y-4">
                {commits.slice(0, 5).map((commit, idx) => (
                  <a
                    key={commit.sha}
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-xl bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-100/50 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <Code className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {commit.commit.message.split('\n')[0]}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(commit.commit.author.date)}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Active Repositories */}
          <AnimatedSection delay={200}>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-blue-100 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Active Projects</h3>
              </div>

              <div className="space-y-4">
                {repos.slice(0, 5).map((repo, idx) => (
                  <a
                    key={repo.name}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border border-blue-100/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {repo.name}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {repo.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold">{repo.stargazers_count}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Updated {formatDate(repo.updated_at)}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
