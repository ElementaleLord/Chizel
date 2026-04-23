
import { Link } from 'react-router';

export function RepoSideBar({ topRepos }: { topRepos: Array<{name: string, avatar: string, color: string}> }){

    return (
        <aside className="w-64 border-r border-[#30363d] bg-[#0d1117] min-h-[calc(100vh-3.5rem)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#f0f6fc]">Top repositories</h2>
            <button className="px-2 py-1 text-xs bg-[#ff8c42] text-white rounded-md hover:bg-[#ff6b35] transition-colors">
              New
            </button>
          </div>
          <input
            type="text"
            placeholder="Find a repository..."
            className="w-full px-3 py-1.5 mb-3 text-sm bg-[#161b22] text-[#f0f6fc] placeholder:text-[#7d8590] border border-[#30363d] rounded-md focus:outline-none focus:ring-1 focus:ring-[#58a6ff]"
          />
          <div className="space-y-1">
            {topRepos.map((repo : {name : string, avatar : string, color : string}) => (
              <Link
                key={repo.avatar}
                to={`/repository/sarahdev/${repo.name}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#21262d] transition-colors group"
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${repo.color} flex items-center justify-center text-white text-xs flex-shrink-0`}>
                  {repo.avatar}
                </div>
                <span className="text-sm text-[#c9d1d9] group-hover:text-[#f0f6fc] truncate">
                  {repo.name}
                </span>
              </Link>
            ))}
          </div>
        </aside>
    )
}