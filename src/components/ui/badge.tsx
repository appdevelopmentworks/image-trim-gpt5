import { cn } from '@/lib/utils';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'outline' | 'success' | 'warning';
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants: Record<Required<BadgeProps>['variant'], string> = {
    default: 'bg-primary/20 text-primary border-transparent',
    outline: 'border border-border text-foreground',
    success: 'bg-emerald-500/15 text-emerald-400 border-transparent',
    warning: 'bg-amber-500/15 text-amber-400 border-transparent'
  } as const;

  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}
      {...props}
    />
  );
}
