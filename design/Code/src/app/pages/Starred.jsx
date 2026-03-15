import { Link } from "react-router";
import { Star, GitFork, Lock, Globe, Search } from "lucide-react";
import Header from "../components/Header";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { mockRepositories } from "../data/mockData";
import { useRepository } from "../context/RepositoryContext";

export default function Starred() {
  const { starredRepos } = useRepository();

  // Filter to only show starred repositories
  const starredRepositories = mockRepositories.filter((repo) =>
    starredRepos.has(repo.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl mb-4">Starred Repositories</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search starred repositories..."
                className="pl-10"
              />
            </div>
          </div>

          {starredRepositories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Star className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-xl mb-2">No starred repositories yet</h2>
              <p className="text-muted-foreground mb-4">
                Star repositories to keep track of projects you're interested in.
              </p>
              <Link
                to="/"
                className="text-sm hover:underline"
                style={{ color: 'var(--chizel-blue)' }}
              >
                Explore repositories
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {starredRepositories.map((repo) => (
                <Link key={repo.id} to={`/repo/${repo.owner}/${repo.name}`}>
                  <Card className="p-6 hover:border-primary transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl hover:underline" style={{ color: 'var(--chizel-blue)' }}>
                          {repo.owner}/{repo.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full border ${
                            repo.visibility === "public"
                              ? "border-border text-muted-foreground"
                              : "border-orange-300 text-orange-600 bg-orange-50"
                          }`}
                        >
                          {repo.visibility === "public" ? (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              Public
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Private
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {repo.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        {repo.language}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {repo.stars.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-4 h-4" />
                        {repo.forks.toLocaleString()}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
