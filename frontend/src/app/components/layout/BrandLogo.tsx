import chizelLogo from '../../../../../docs/Chizel-Logo.png';
import { cn } from '../ui/utils';

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  labelClassName?: string;
  showLabel?: boolean;
}

export function BrandLogo({
  className,
  imageClassName,
  labelClassName,
  showLabel = true,
}: BrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src={chizelLogo}
        alt="Chizel logo"
        className={cn('h-8 w-8 rounded object-contain', imageClassName)}
      />
      {showLabel && (
        <span className={cn('font-semibold text-foreground', labelClassName)}>
          Chizel
        </span>
      )}
    </div>
  );
}
