import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  Star,
  GitFork,
  Eye,
  Code,
  GitBranch,
  GitCommit,
  GitPullRequest,
  ChevronDown,
  FileText,
  Folder,
  Upload,
  Tag,
  Check,
} from "lucide-react";
import Header from "../components/Header";
import FileUploadDialog from "../components/FileUploadDialog";
import CodeViewerDialog from "../components/CodeViewerDialog";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { mockRepositories, mockBranches, mockCommits } from "../data/mockData";
import { useRepository } from "../context/RepositoryContext";

const mockTags = [
  { name: "v2.1.0", commit: "Released version 2.1.0" },
  { name: "v2.0.5", commit: "Patch release 2.0.5" },
  { name: "v2.0.0", commit: "Major release 2.0.0" },
  { name: "v1.9.2", commit: "Bug fixes" },
];

const mockFileContent = `import React from 'react';
import { Button } from './components/ui/button';

export default function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Chizel
        </h1>
        <p className="text-xl mb-8">
          Count: {count}
        </p>
        <Button onClick={() => setCount(count + 1)}>
          Increment
        </Button>
      </div>
    </div>
  );
}`;

export default function Repository() {
  const { owner, name } = useParams();
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [codeViewerOpen, setCodeViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState({ name: "", content: "" });

  const { toggleStar, toggleWatch, isStarred, isWatched } = useRepository();

  const repo = mockRepositories.find(
    (r) => r.owner === owner && r.name === name
  ) || mockRepositories[0];

  const starred = isStarred(repo.id);
  const watched = isWatched(repo.id);

  const fileStructure = [
    { name: "src", type: "folder" },
    { name: "public", type: "folder" },
    { name: ".gitignore", type: "file" },
    { name: "package.json", type: "file" },
    { name: "README.md", type: "file" },
    { name: "tsconfig.json", type: "file" },
    { name: "vite.config.ts", type: "file" },
  ];

  const latestCommit = mockCommits[0];

  const handleFileClick = (fileName) => {
    setSelectedFile({ name: fileName, content: mockFileContent });
    setCodeViewerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {/* Repository Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  to={`/account/${owner}`}
                  className="text-xl hover:underline"
                  style={{ color: 'var(--chizel-blue)' }}
                >
                  {owner}
                </Link>
                <span className="text-xl text-muted-foreground">/</span>
                <h1 className="text-xl font-semibold" style={{ color: 'var(--chizel-blue)' }}>
                  {repo.name}
                </h1>
                <Badge variant="outline" className="ml-2">
                  Public
                </Badge>
              </div>
              <p className="text-muted-foreground">{repo.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={watched ? "default" : "outline"}
                size="sm"
                onClick={() => toggleWatch(repo.id)}
              >
                {watched ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Watching
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Watch
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <GitFork className="w-4 h-4 mr-1" />
                Fork
              </Button>
              <Button
                variant={starred ? "default" : "outline"}
                size="sm"
                onClick={() => toggleStar(repo.id)}
              >
                <Star className={`w-4 h-4 mr-1 ${starred ? "fill-current" : ""}`} />
                {starred ? "Starred" : "Star"}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {repo.stars.toLocaleString()} stars
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-4 h-4" />
              {repo.forks.toLocaleString()} forks
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              54 watching
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="code" className="mb-6">
          <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="code"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Code className="w-4 h-4 mr-2" />
              Code
            </TabsTrigger>
            <TabsTrigger
              value="commits"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              asChild
            >
              <Link to={`/repo/${owner}/${name}/commits/${selectedBranch}`}>
                <GitCommit className="w-4 h-4 mr-2" />
                Commits
              </Link>
            </TabsTrigger>
            <TabsTrigger
              value="pulls"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              asChild
            >
              <Link to={`/repo/${owner}/${name}/pulls`}>
                <GitPullRequest className="w-4 h-4 mr-2" />
                Pull requests
              </Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="mt-0">
            {/* Branch selector and actions */}
            <div className="border rounded-t-lg p-4 flex items-center justify-between bg-card">
              <div className="flex items-center gap-2">
                {/* Branch Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <GitBranch className="w-4 h-4 mr-2" />
                      {selectedBranch}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72">
                    <div className="px-3 py-2 text-sm font-semibold border-b">
                      Switch branches
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {mockBranches.map((branch) => (
                        <DropdownMenuItem
                          key={branch.name}
                          onClick={() => setSelectedBranch(branch.name)}
                          className={
                            selectedBranch === branch.name ? "bg-accent" : ""
                          }
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium">{branch.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {branch.lastCommit}
                              </span>
                            </div>
                            {selectedBranch === branch.name && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Branches count dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <GitBranch className="w-4 h-4 mr-2" />
                      {mockBranches.length} branches
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72">
                    <div className="px-3 py-2 text-sm font-semibold border-b">
                      All branches
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {mockBranches.map((branch) => (
                        <DropdownMenuItem
                          key={branch.name}
                          onClick={() => setSelectedBranch(branch.name)}
                        >
                          <div className="flex flex-col gap-0.5 flex-1">
                            <span className="font-medium">{branch.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {branch.commitCount} commits
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Tags dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Tag className="w-4 h-4 mr-2" />
                      {mockTags.length} tags
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72">
                    <div className="px-3 py-2 text-sm font-semibold border-b">
                      All tags
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {mockTags.map((tag) => (
                        <DropdownMenuItem key={tag.name}>
                          <div className="flex flex-col gap-0.5 flex-1">
                            <span className="font-medium">{tag.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {tag.commit}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2">
                {/* Add file dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Add file
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setUploadDialogOpen(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload files
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="w-4 h-4 mr-2" />
                      Create new file
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Code dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" style={{ backgroundColor: 'var(--chizel-green)', color: 'var(--background)' }}>
                      <Code className="w-4 h-4 mr-2" />
                      Code
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-3 space-y-3">
                      <div>
                        <p className="text-sm font-semibold mb-2">Clone</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`https://github.com/${owner}/${name}.git`}
                            className="flex-1 px-3 py-2 text-sm border rounded bg-background"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `https://github.com/${owner}/${name}.git`
                              );
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Download ZIP</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFileClick("App.tsx")}>
                        Open with GitHub Desktop
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Latest commit info */}
            <div className="border-x border-b px-4 py-2 bg-accent/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={latestCommit.authorAvatar}
                  alt={latestCommit.author}
                  className="w-6 h-6 rounded-full"
                />
                <Link
                  to={`/repo/${owner}/${name}/commits/${selectedBranch}`}
                  className="text-sm hover:underline"
                >
                  <span className="font-medium">{latestCommit.author}</span>{" "}
                  {latestCommit.message}
                </Link>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Link
                  to={`/repo/${owner}/${name}/commits/${selectedBranch}`}
                  className="font-mono hover:underline"
                  style={{ color: 'var(--chizel-blue)' }}
                >
                  {latestCommit.sha}
                </Link>
                <span>{new Date(latestCommit.date).toLocaleDateString()}</span>
                <Link
                  to={`/repo/${owner}/${name}/commits/${selectedBranch}`}
                  className="hover:underline"
                  style={{ color: 'var(--chizel-blue)' }}
                >
                  {mockCommits.length} commits
                </Link>
              </div>
            </div>

            {/* File browser */}
            <div className="border-x border-b rounded-b-lg">
              {fileStructure.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 px-4 py-2 hover:bg-accent/50 cursor-pointer ${
                    index !== fileStructure.length - 1 ? "border-b" : ""
                  }`}
                  onClick={() => item.type === "file" && handleFileClick(item.name)}
                >
                  {item.type === "folder" ? (
                    <Folder className="w-4 h-4 text-blue-500" />
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm flex-1">{item.name}</span>
                </div>
              ))}
            </div>

            {/* README */}
            <div className="mt-6 border rounded-lg">
              <div className="px-4 py-3 border-b bg-card flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">README.md</span>
              </div>
              <div className="p-6">
                <h2 className="text-2xl mb-4">{repo.name}</h2>
                <p className="text-muted-foreground mb-4">{repo.description}</p>
                <h3 className="text-xl mb-3">Installation</h3>
                <div className="bg-muted p-4 rounded mb-4 font-mono text-sm">
                  npm install {repo.name}
                </div>
                <h3 className="text-xl mb-3">Usage</h3>
                <p className="text-muted-foreground mb-4">
                  Import and use the library in your project:
                </p>
                <div className="bg-muted p-4 rounded font-mono text-sm">
                  import &#123; Component &#125; from '{repo.name}';
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <FileUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        branch={selectedBranch}
      />
      <CodeViewerDialog
        open={codeViewerOpen}
        onOpenChange={setCodeViewerOpen}
        fileName={selectedFile.name}
        content={selectedFile.content}
      />
    </div>
  );
}
