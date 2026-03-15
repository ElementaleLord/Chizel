import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  GitPullRequest,
  MessageSquare,
  X,
  GitMerge,
  Search,
} from "lucide-react";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { mockRepositories, mockPullRequests } from "../data/mockData";

export default function PullRequests() {
  const { owner, name } = useParams();
  const [searchQuery, setSearchQuery] = useState("");

  const repo = mockRepositories.find(
    (r) => r.owner === owner && r.name === name
  ) || mockRepositories[0];

  const openPRs = mockPullRequests.filter((pr) => pr.status === "open");
  const closedPRs = mockPullRequests.filter((pr) => pr.status === "closed");
  const mergedPRs = mockPullRequests.filter((pr) => pr.status === "merged");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return "yesterday";
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} days ago`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <GitPullRequest className="w-4 h-4 text-green-600" />;
      case "merged":
        return <GitMerge className="w-4 h-4 text-purple-600" />;
      case "closed":
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Open
          </Badge>
        );
      case "merged":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
            Merged
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Closed
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderPRList = (prs) => (
    <div className="border rounded-lg">
      {prs.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <GitPullRequest className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No pull requests found</p>
        </div>
      ) : (
        prs.map((pr, index) => (
          <div
            key={pr.id}
            className={`p-4 hover:bg-accent/50 transition-colors ${
              index !== prs.length - 1 ? "border-b" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              {getStatusIcon(pr.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 hover:underline" style={{ color: 'var(--chizel-blue)' }}>
                      {pr.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <span>#{pr.number}</span>
                      <span>opened {formatDate(pr.createdAt)}</span>
                      <span>by {pr.author}</span>
                    </div>
                  </div>
                  {getStatusBadge(pr.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {pr.comments}
                  </span>
                  <span>
                    {pr.branch} → {pr.targetBranch}
                  </span>
                </div>
              </div>
              <img
                src={pr.authorAvatar}
                alt={pr.author}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            to={`/account/${owner}`}
            className="hover:underline"
            style={{ color: 'var(--chizel-blue)' }}
          >
            {owner}
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link
            to={`/repo/${owner}/${name}`}
            className="hover:underline"
            style={{ color: 'var(--chizel-blue)' }}
          >
            {repo.name}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span>Pull requests</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl">Pull Requests</h1>
            <Button style={{ backgroundColor: 'var(--chizel-green)', color: 'var(--background)' }}>
              <GitPullRequest className="w-4 h-4 mr-2" />
              New pull request
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search pull requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="open" className="w-full">
          <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent mb-6">
            <TabsTrigger
              value="open"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <GitPullRequest className="w-4 h-4 mr-2" />
              Open ({openPRs.length})
            </TabsTrigger>
            <TabsTrigger
              value="closed"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              Closed ({closedPRs.length})
            </TabsTrigger>
            <TabsTrigger
              value="merged"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <GitMerge className="w-4 h-4 mr-2" />
              Merged ({mergedPRs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open">{renderPRList(openPRs)}</TabsContent>
          <TabsContent value="closed">{renderPRList(closedPRs)}</TabsContent>
          <TabsContent value="merged">{renderPRList(mergedPRs)}</TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
