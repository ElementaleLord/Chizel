import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { MapPin, Link as LinkIcon, Calendar, GitFork, Star } from 'lucide-react';

const repositories = [
  {
    name: 'web-app',
    description: 'A modern web application built with React and TypeScript',
    language: 'TypeScript',
    stars: 248,
    forks: 45,
    updated: '2 hours ago',
  },
  {
    name: 'api-server',
    description: 'RESTful API server with Node.js and Express',
    language: 'JavaScript',
    stars: 156,
    forks: 32,
    updated: '1 day ago',
  },
  {
    name: 'design-system',
    description: 'Component library for building consistent UIs',
    language: 'TypeScript',
    stars: 892,
    forks: 124,
    updated: '3 days ago',
  },
  {
    name: 'mobile-app',
    description: 'Cross-platform mobile app with React Native',
    language: 'TypeScript',
    stars: 421,
    forks: 78,
    updated: '5 days ago',
  },
];

const getLanguageColor = (language: string) => {
  switch (language) {
    case 'TypeScript':
      return 'bg-blue-500';
    case 'JavaScript':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

export function Profile() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header isLoggedIn={true} />
      <Sidebar />

      <main className="lg:pl-64 pt-14">
        <div className="container max-w-6xl px-4 py-8">
          <div className="grid md:grid-cols-[280px,1fr] gap-6">
            <aside className="space-y-6">
              <div className="flex flex-col items-center md:items-start">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] flex items-center justify-center text-white text-6xl mb-4">
                  S
                </div>
                <h1 className="text-2xl text-foreground mb-1">Sarah Developer</h1>
                <p className="text-xl text-[#c9d1d9] mb-4">sarahdev</p>
                <button className="w-full px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-md transition-colors mb-4">
                  Edit profile
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-[#c9d1d9]">
                  Full-stack developer passionate about building great user experiences
                </p>
                <div className="flex items-center gap-2 text-[#c9d1d9]">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2 text-[#c9d1d9]">
                  <LinkIcon className="h-4 w-4" />
                  <a href="#" className="text-[#ff8c42] hover:underline">
                    sarahdev.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-[#c9d1d9]">
                  <Calendar className="h-4 w-4" />
                  <span>Joined March 2022</span>
                </div>
              </div>

              <div className="flex gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">128</span>{' '}
                  <span className="text-[#c9d1d9]">followers</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">84</span>{' '}
                  <span className="text-[#c9d1d9]">following</span>
                </div>
              </div>
            </aside>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="text-2xl font-medium text-foreground mb-1">24</div>
                  <div className="text-sm text-[#c9d1d9]">Repositories</div>
                </div>
                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="text-2xl font-medium text-foreground mb-1">1.8k</div>
                  <div className="text-sm text-[#c9d1d9]">Contributions</div>
                </div>
                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="text-2xl font-medium text-foreground mb-1">342</div>
                  <div className="text-sm text-[#c9d1d9]">Stars</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-foreground">Popular repositories</h2>
                  <input
                    type="text"
                    placeholder="Find a repository..."
                    className="px-3 py-1.5 text-sm text-foreground placeholder:text-[#7d8590] bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-4">
                  {repositories.map((repo) => (
                    <div key={repo.name} className="p-4 bg-card border border-border rounded-lg hover:border-border/60 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-[#ff8c42] hover:underline cursor-pointer mb-1">
                            {repo.name}
                          </h3>
                          <p className="text-sm text-[#c9d1d9]">{repo.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#c9d1d9]">
                        <div className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
                          <span>{repo.language}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="h-4 w-4" />
                          <span>{repo.forks}</span>
                        </div>
                        <span>Updated {repo.updated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-foreground">Contribution activity</h2>
                  <div className="text-sm text-[#c9d1d9]">
                    <span className="text-foreground font-medium">1,847</span> contributions in the last year
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="mb-4">
                    <div className="grid grid-cols-[auto,1fr] gap-2">
                      <div className="flex flex-col justify-around text-xs text-[#c9d1d9] pr-2">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                      </div>
                      <div className="overflow-x-auto">
                        <div className="inline-grid grid-rows-7 grid-flow-col gap-1">
                          {Array.from({ length: 371 }).map((_, i) => {
                            const intensity = Math.random();
                            const bgClass =
                              intensity > 0.75
                                ? 'bg-[#ff8c42]'
                                : intensity > 0.5
                                ? 'bg-[#ff8c42]/70'
                                : intensity > 0.25
                                ? 'bg-[#ff8c42]/40'
                                : intensity > 0.1
                                ? 'bg-[#ff8c42]/20'
                                : 'bg-secondary';
                            return (
                              <div
                                key={i}
                                className={`w-[10px] h-[10px] rounded-sm ${bgClass} hover:ring-2 hover:ring-[#ff8c42] cursor-pointer transition-all`}
                                title={`${Math.floor(intensity * 15)} contributions`}
                              ></div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#c9d1d9]">
                    <span>Less</span>
                    <div className="flex items-center gap-1">
                      <div className="w-[10px] h-[10px] rounded-sm bg-secondary"></div>
                      <div className="w-[10px] h-[10px] rounded-sm bg-[#ff8c42]/20"></div>
                      <div className="w-[10px] h-[10px] rounded-sm bg-[#ff8c42]/40"></div>
                      <div className="w-[10px] h-[10px] rounded-sm bg-[#ff8c42]/70"></div>
                      <div className="w-[10px] h-[10px] rounded-sm bg-[#ff8c42]"></div>
                    </div>
                    <span>More</span>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-2xl font-medium text-foreground">1,847</div>
                      <div className="text-sm text-[#c9d1d9]">Total contributions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-medium text-foreground">142</div>
                      <div className="text-sm text-[#c9d1d9]">Longest streak</div>
                    </div>
                    <div>
                      <div className="text-2xl font-medium text-foreground">28</div>
                      <div className="text-sm text-[#c9d1d9]">Current streak</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
