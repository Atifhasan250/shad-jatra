import { ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-2xl font-bold text-primary', className)}>
      <ChefHat className="h-8 w-8" />
      <span className="font-headline">স্বাদ যাত্রা</span>
    </div>
  );
}
