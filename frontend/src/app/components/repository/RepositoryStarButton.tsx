import { Star } from 'lucide-react';

interface RepositoryStarButtonProps {
  isStarred: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export function RepositoryStarButton({ isStarred, onToggle, compact = false }: RepositoryStarButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isStarred}
      aria-label={isStarred ? 'Unstar repository' : 'Star repository'}
      className={`inline-flex items-center gap-2 rounded-md border transition-colors ${
        compact
          ? 'border-border bg-secondary px-2.5 py-1.5 text-sm'
          : 'border-border bg-secondary px-3 py-1 text-sm'
      } ${
        isStarred
          ? 'text-[#fda410] hover:bg-[#fda410]/10'
          : 'text-foreground hover:bg-secondary/80'
      }`}
    >
      <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
      <span>{isStarred ? 'Starred' : 'Star'}</span>
    </button>
  );
}
