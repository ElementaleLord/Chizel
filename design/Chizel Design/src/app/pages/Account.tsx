import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  MapPin,
  Link2,
  Users,
  Calendar,
  Star,
  GitFork,
  Settings as SettingsIcon,
  Lock,
  Globe,
} from "lucide-react";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  mockUser,
  mockRepositories,
  mockActivityData,
} from "../data/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Account() {
  const { username } = useParams();
  const isOwnProfile = username === mockUser.username;
  const [editMode, setEditMode] = useState(false);

  const totalCommits = mockActivityData.reduce(
    (sum, data) => sum + data.commits,
    0
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile */}
          <div className="md:col-span-1">
            <Card className="p-6">
              <img
                src={mockUser.avatar}
                alt={mockUser.name}
                className="w-full aspect-square rounded-full mb-4"
              />
              <h1 className="text-2xl mb-1">{mockUser.name}</h1>
              <p className="text-gray-600 mb-4">@{mockUser.username}</p>
              
              {isOwnProfile && (
                <Button variant="outline" className="w-full mb-4">
                  Edit profile
                </Button>
              )}

              <p className="text-gray-700 mb-4">{mockUser.bio}</p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{mockUser.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Link2 className="w-4 h-4" />
                  <a
                    href={mockUser.website}
                    className="text-[#0969da] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {mockUser.website}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {new Date(mockUser.joinDate).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{mockUser.followers}</span>
                  <span className="text-gray-600">followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold">{mockUser.following}</span>
                  <span className="text-gray-600">following</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent mb-6">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="repositories"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent"
                >
                  Repositories
                </TabsTrigger>
                {isOwnProfile && (
                  <TabsTrigger
                    value="settings"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent"
                  >
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Settings
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                {/* Contribution Graph */}
                <Card className="p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl">Contribution Activity</h2>
                    <span className="text-sm text-gray-600">
                      {totalCommits} commits in the last 3 months
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={mockActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                        stroke="var(--border)"
                      />
                      <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} stroke="var(--border)" />
                      <Tooltip
                        labelFormatter={(label) => formatDate(label)}
                        formatter={(value) => [`${value} commits`, "Commits"]}
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          color: 'var(--foreground)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="commits"
                        stroke="var(--chizel-green)"
                        fill="var(--chizel-green)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                {/* Pinned Repositories */}
                <div>
                  <h2 className="text-xl mb-4">Pinned Repositories</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {mockRepositories.slice(0, 4).map((repo) => (
                      <Link
                        key={repo.id}
                        to={`/repo/${repo.owner}/${repo.name}`}
                      >
                        <Card className="p-4 hover:border-[#0969da] transition-colors h-full">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-[#0969da] hover:underline">
                              {repo.name}
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
                          <p className="text-sm text-gray-600 mb-3">
                            {repo.description}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                              {repo.language}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {repo.stars}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork className="w-4 h-4" />
                              {repo.forks}
                            </span>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Repositories Tab */}
              <TabsContent value="repositories">
                <div className="space-y-4">
                  {mockRepositories.map((repo) => (
                    <Link
                      key={repo.id}
                      to={`/repo/${repo.owner}/${repo.name}`}
                    >
                      <Card className="p-4 hover:border-[#0969da] transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-xl text-[#0969da] hover:underline">
                              {repo.name}
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
                        <p className="text-gray-600 mb-3">{repo.description}</p>
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
              </TabsContent>

              {/* Settings Tab */}
              {isOwnProfile && (
                <TabsContent value="settings">
                  <Card className="p-6">
                    <h2 className="text-xl mb-6">Account Settings</h2>
                    <form className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          defaultValue={mockUser.name}
                          disabled={!editMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={mockUser.email}
                          disabled={!editMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          defaultValue={mockUser.bio}
                          disabled={!editMode}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          defaultValue={mockUser.location}
                          disabled={!editMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          defaultValue={mockUser.website}
                          disabled={!editMode}
                        />
                      </div>
                      <div className="flex gap-3">
                        {editMode ? (
                          <>
                            <Button
                              type="submit"
                              className="bg-[#238636] hover:bg-[#2ea043]"
                            >
                              Save changes
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditMode(false)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => setEditMode(true)}
                          >
                            Edit profile
                          </Button>
                        )}
                      </div>
                    </form>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}