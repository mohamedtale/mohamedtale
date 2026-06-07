import { cn } from '@/lib/utils';
import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, children, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <select
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm',
          'focus:ring-2 focus:ring-ministry-500 focus:border-ministry-500 outline-none',
          'bg-white text-gray-900',
          'disabled:bg-gray-50 disabled:cursor-not-allowed',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
