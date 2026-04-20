import { useParams, Link } from 'react-router';
import { ChevronRight, Copy, Download } from 'lucide-react';
import { RepositoryLayout } from '../components/repository/RepositoryLayout';

export function RepositoryFile() {
  const { owner, repo, '*': filePath } = useParams();

  const fileContent = `import { useState } from 'react';

export function ExampleComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>Counter Example</h1>
      <p>Current count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`;

  const pathParts = filePath?.split('/') || [];

  return (
    <RepositoryLayout>
      <div className="container max-w-6xl px-4 py-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to={`/repository/${owner}/${repo}`} className="text-ring hover:underline">
              {repo}
            </Link>
            {pathParts.map((part, i) => (
              <div key={i} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                <Link
                  to={`/repository/${owner}/${repo}/tree/${pathParts.slice(0, i + 1).join('/')}`}
                  className="text-ring hover:underline"
                >
                  {part}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e38c05] to-[#fda410] flex items-center justify-center text-white text-sm">
                S
              </div>
              <div>
                <div className="text-sm text-foreground">Sarah Developer</div>
                <div className="text-xs text-muted-foreground">Updated 2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground bg-secondary border border-border rounded-md hover:bg-muted transition-colors">
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground bg-secondary border border-border rounded-md hover:bg-muted transition-colors">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 overflow-x-auto">
              <code className="text-sm text-foreground font-mono">
                {fileContent.split('\n').map((line, i) => (
                  <div key={i} className="table-row">
                    <span className="table-cell pr-4 text-right select-none text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="table-cell">{line || ' '}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </RepositoryLayout>
  );
}
