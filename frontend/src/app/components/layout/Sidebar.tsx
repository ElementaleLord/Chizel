import { Home, Activity, GitBranch, Star, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router';

const navigation = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Repositories', href: '/repositories', icon: GitBranch },
  { name: 'Stars', href: '/stars', icon: Star },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-card hidden lg:block">
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
