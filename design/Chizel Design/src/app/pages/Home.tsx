import { Link } from "react-router";
import { Star, GitFork, Lock, Globe, Code2, Users, Shield } from "lucide-react";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { mockRepositories, mockUser } from "../data/mockData";

export default function Home() {
  const featuredRepos = mockRepositories.slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="text-foreground py-20" style={{ background: 'linear-gradient(to bottom, var(--chizel-header-bg), var(--background))' }}>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl mb-6">
                Where the world builds software
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Millions of developers and companies build, ship, and maintain
                their software on Chizel—the largest and most advanced
                development platform in the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" style={{ backgroundColor: 'var(--chizel-green)', color: 'var(--background)' }} className="px-8">
                    Sign up for Chizel
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8"
                  >
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl text-center mb-16 text-[#24292f]">
              Why Chizel?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <Code2 className="w-12 h-12 text-[#238636] mb-4" />
                <h3 className="text-xl mb-3 text-[#24292f]">
                  Collaborative coding
                </h3>
                <p className="text-gray-600">
                  Work together with your team on code, track changes, and
                  manage versions seamlessly.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <Users className="w-12 h-12 text-[#238636] mb-4" />
                <h3 className="text-xl mb-3 text-[#24292f]">
                  Built for teams
                </h3>
                <p className="text-gray-600">
                  Powerful collaboration features that scale with your team's
                  needs and workflows.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <Shield className="w-12 h-12 text-[#238636] mb-4" />
                <h3 className="text-xl mb-3 text-[#24292f]">
                  Secure by default
                </h3>
                <p className="text-gray-600">
                  Industry-leading security features to protect your code and
                  keep your projects safe.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Repositories Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl text-[#24292f]">
                  Featured repositories
                </h2>
                <Link to={`/account/${mockUser.username}`}>
                  <Button variant="outline">View all</Button>
                </Link>
              </div>
              <div className="space-y-4">
                {featuredRepos.map((repo) => (
                  <Link
                    key={repo.id}
                    to={`/repo/${repo.owner}/${repo.name}`}
                  >
                    <Card className="p-6 hover:border-[#0969da] transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl text-[#0969da] hover:underline">
                            {repo.owner}/{repo.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full border ${
                              repo.visibility === "public"
                                ? "border-gray-300 text-gray-600"
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
                      <p className="text-gray-600 mb-4">{repo.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}