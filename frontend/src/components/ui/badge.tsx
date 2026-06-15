import { cn, STATUS_COLORS } from '@/lib/utils';

interface BadgeProps {
  variant?: string;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant, className, children }: BadgeProps) {
  const colorClass = variant ? (STATUS_COLORS[variant] || 'bg-gray-100 text-gray-800 border-gray-200') : 'bg-gray-100 text-gray-800';
  return (
    <span className={cn('status-badge', colorClass, className)}>
      {children}
    </span>
  );
}
