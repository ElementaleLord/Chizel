import { Link, useParams, useNavigate } from 'react-router';
import { ChevronDown } from 'lucide-react';
import { RepositoryLayout } from '../components/repository/RepositoryLayout';

const files = [
  { name: '.github', type: 'folder', updated: '2 days ago' },
  { name: 'src', type: 'folder', updated: '3 hours ago' },
  { name: 'public', type: 'folder', updated: '1 week ago' },
  { name: '.gitignore', type: 'file', updated: '2 weeks ago' },
  { name: 'package.json', type: 'file', updated: '3 hours ago' },
  { name: 'README.md', type: 'file', updated: '1 day ago' },
  { name: 'tsconfig.json', type: 'file', updated: '1 week ago' },
];

export function Repository() {
  const { owner = 'sarahdev', repo = 'web-app' } = useParams();
  const navigate = useNavigate();

  const handleFileClick = (file: typeof files[0]) => {
    if (file.type === 'folder') {
      navigate(`/repository/${owner}/${repo}/tree/${file.name}`);
    } else {
      navigate(`/repository/${owner}/${repo}/blob/main/${file.name}`);
    }
  };

  return (
    <RepositoryLayout>
      <main>
        <div className="container max-w-6xl px-4 py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to={`/repository/${owner}/${repo}/branches`}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground bg-secondary rounded-md hover:bg-muted transition-colors"
                >
                  <span>main</span>
                  <ChevronDown className="h-4 w-4" />
                </Link>
                <Link to={`/repository/${owner}/${repo}/branches`} className="text-sm text-muted-foreground hover:text-foreground">
                  <span className="text-foreground">24</span> branches
                </Link>
                <span className="text-sm text-muted-foreground">
                  <span className="text-foreground">8</span> tags
                </span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-3 border-b border-border flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ff8c42]"></div>
                <span className="text-sm text-foreground">{owner}</span>
                <Link to={`/repository/${owner}/${repo}/commits`} className="text-sm text-muted-foreground hover:text-ring">
                  Fix authentication bug in login flow
                </Link>
                <Link to={`/repository/${owner}/${repo}/commits`} className="ml-auto text-sm text-muted-foreground hover:text-foreground">
                  2 hours ago
                </Link>
              </div>

              <div className="divide-y divide-border">
                {files.map((file) => (
                  <div
                    key={file.name}
                    onClick={() => handleFileClick(file)}
                    className="px-4 py-2 hover:bg-secondary/50 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {file.type === 'folder' ? (
                        <svg className="h-4 w-4 text-ring" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"/>
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-muted-foreground" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z"/>
                        </svg>
                      )}
                      <span className="text-sm text-ring group-hover:underline">{file.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{file.updated}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground">README.md</h3>
              </div>
              <div className="prose max-w-none text-sm space-y-3">
                <h2 className="text-xl text-foreground">Web App</h2>
                <p className="text-muted-foreground">
                  A modern web application built with React and TypeScript.
                </p>
                <h3 className="text-lg text-foreground mt-4">Features</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>User authentication with Supabase</li>
                  <li>Responsive design with Tailwind CSS</li>
                  <li>Type-safe development with TypeScript</li>
                  <li>Fast build times with Vite</li>
                </ul>
                <h3 className="text-lg text-foreground mt-4">Getting Started</h3>
                <pre className="bg-background p-3 rounded-md overflow-x-auto border border-border">
                  <code className="text-foreground">npm install{'\n'}npm run dev</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </RepositoryLayout>
  );
}
