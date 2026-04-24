import { ChzHeader } from '../components/chz-comp/ChzHeader';
import { useParams, Link } from 'react-router';
import { ChevronRight, AlertTriangle, Trash2 } from 'lucide-react';
import { RepositoryLayout } from '../components/repository/RepositoryLayout';

export function RepositorySettings() {
  const { owner, repo } = useParams();

  return (
    <>
    <ChzHeader pageTitle= {`${owner} / ${repo}`} /*isLoggedIn={true}*/ />
    <RepositoryLayout>
      <div className="container max-w-4xl px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to={`/repository/${owner}/${repo}`} className="text-ring hover:underline">
              {owner}/{repo}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Settings</span>
          </div>
          <h1 className="text-foreground">Repository Settings</h1>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">General</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-foreground">Repository name</label>
                <input
                  type="text"
                  defaultValue={repo}
                  className="w-full px-3 py-2 bg-input text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-foreground">Description</label>
                <textarea
                  rows={3}
                  defaultValue="A modern web application built with React and TypeScript"
                  className="w-full px-3 py-2 bg-input text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-foreground">Website</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Features</h2>
            <div className="space-y-3">
              {[
                { label: 'Issues', desc: 'Track bugs and feature requests' },
                { label: 'Projects', desc: 'Organize and track work' },
                { label: 'Wiki', desc: 'Document your repository' },
                { label: 'Discussions', desc: 'Engage with the community' },
              ].map((feature) => (
                <div key={feature.label} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-foreground">{feature.label}</div>
                    <div className="text-xs text-muted-foreground">{feature.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#238636]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Access</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Visibility</div>
                  <div className="text-xs text-muted-foreground">Control who can see this repository</div>
                </div>
                <select className="px-3 py-2 bg-input text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <button className="w-full px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] transition-colors">
              Save changes
            </button>
          </div>

          <div className="bg-card border border-destructive/50 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-destructive mb-1">Danger Zone</h2>
                <p className="text-sm text-muted-foreground">
                  Once you delete a repository, there is no going back. Please be certain.
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/50 rounded-md hover:bg-destructive/20 transition-colors">
              <Trash2 className="h-4 w-4" />
              Delete this repository
            </button>
          </div>
        </div>
      </div>
    </RepositoryLayout>
    </>
  );
}
