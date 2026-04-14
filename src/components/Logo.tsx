import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-2xl font-bold text-primary group transition-all', className)}>
      <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-200">🍲</span>
      <span className="font-headline tracking-wide">স্বাদ যাত্রা</span>
    </div>
  );
}
