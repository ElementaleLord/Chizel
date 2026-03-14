import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  GitPullRequest,
  MessageSquare,
  Check,
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

  const formatDate = (dateString: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const getStatusBadge = (status: string) => {
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

  const renderPRList = (prs: typeof mockPullRequests) => (
    <div className="border rounded-lg">
      {prs.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <GitPullRequest className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No pull requests found</p>
        </div>
      ) : (
        prs.map((pr, index) => (
          <div
            key={pr.id}
            className={`p-4 hover:bg-gray-50 transition-colors ${
              index !== prs.length - 1 ? "border-b" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getStatusIcon(pr.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1 hover:text-[#0969da] cursor-pointer">
                      {pr.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                      <span>#{pr.number}</span>
                      <span>opened {formatDate(pr.createdAt)}</span>
                      <span>by</span>
                      <Link
                        to={`/account/${pr.author}`}
                        className="font-medium hover:text-[#0969da]"
                      >
                        {pr.author}
                      </Link>
                    </div>
                  </div>
                  {getStatusBadge(pr.status)}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    {pr.branch} → {pr.targetBranch}
                  </span>
                  <div className="flex items-center gap-1 text-gray-600">
                    <MessageSquare className="w-4 h-4" />
                    <span>{pr.comments}</span>
                  </div>
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
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            to={`/account/${owner}`}
            className="text-[#0969da] hover:underline"
          >
            {owner}
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            to={`/repo/${owner}/${name}`}
            className="text-[#0969da] hover:underline"
          >
            {repo.name}
          </Link>
          <span className="text-gray-400">/</span>
          <span>Pull requests</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl">Pull Requests</h1>
            <Button className="bg-[#238636] hover:bg-[#2ea043]">
              New pull request
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
        <Tabs defaultValue="open" className="mb-6">
          <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="open"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent"
            >
              <GitPullRequest className="w-4 h-4 mr-2" />
              Open ({openPRs.length})
            </TabsTrigger>
            <TabsTrigger
              value="merged"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent"
            >
              <Check className="w-4 h-4 mr-2" />
              Merged ({mergedPRs.length})
            </TabsTrigger>
            <TabsTrigger
              value="closed"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent"
            >
              <X className="w-4 h-4 mr-2" />
              Closed ({closedPRs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="mt-6">
            {renderPRList(openPRs)}
          </TabsContent>

          <TabsContent value="merged" className="mt-6">
            {renderPRList(mergedPRs)}
          </TabsContent>

          <TabsContent value="closed" className="mt-6">
            {renderPRList(closedPRs)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
