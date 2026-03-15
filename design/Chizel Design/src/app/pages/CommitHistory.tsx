import { useState } from "react";
import { Link, useParams } from "react-router";
import { GitBranch, ChevronDown, Copy, Check } from "lucide-react";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { mockRepositories, mockBranches, mockCommits } from "../data/mockData";

export default function CommitHistory() {
  const { owner, name, branch } = useParams();
  const [selectedBranch, setSelectedBranch] = useState(branch || "main");
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const repo = mockRepositories.find(
    (r) => r.owner === owner && r.name === name
  ) || mockRepositories[0];

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return "yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

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
          <span>Commits</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl mb-2">Commit History</h1>
              <p className="text-gray-600">
                {mockCommits.length} commits on {selectedBranch}
              </p>
            </div>

            {/* Branch Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <GitBranch className="w-4 h-4 mr-2" />
                  {selectedBranch}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 py-1.5 text-sm font-semibold border-b">
                  Switch branches
                </div>
                {mockBranches.map((b) => (
                  <DropdownMenuItem
                    key={b.name}
                    onClick={() => setSelectedBranch(b.name)}
                    className={
                      selectedBranch === b.name ? "bg-blue-50" : ""
                    }
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{b.name}</span>
                      <span className="text-xs text-gray-500">
                        {b.commitCount} commits
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Commits List */}
        <div className="border rounded-lg">
          {mockCommits.map((commit, index) => (
            <div
              key={commit.id}
              className={`p-4 hover:bg-gray-50 ${
                index !== mockCommits.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <img
                  src={commit.authorAvatar}
                  alt={commit.author}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="mb-1 break-words">{commit.message}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">{commit.author}</span>
                        <span>committed</span>
                        <span>{formatDate(commit.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleCopySha(commit.sha)}
                        className="flex items-center gap-2 px-3 py-1 border rounded hover:bg-gray-50 transition-colors"
                      >
                        <code className="font-mono text-sm">{commit.sha}</code>
                        {copiedSha === commit.sha ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <Button variant="outline" size="sm">
                        Browse files
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-6 text-center">
          <Button variant="outline">Load more commits</Button>
        </div>
      </main>
    </div>
  );
}
