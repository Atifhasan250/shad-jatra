import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function RecipeNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="bg-muted rounded-full p-6 mb-6">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold mb-4 font-headline">রেসিপিটি খুঁজে পাওয়া যায়নি</h1>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        দুঃখিত, আপনি যে রেসিপিটি খুঁজছেন তা আমাদের ডাটাবেসে নেই অথবা এটি সরানো হয়েছে। আমাদের কালেকশন থেকে অন্য রেসিপি খুঁজে দেখতে পারেন।
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/recipelist">রেসিপি তালিকা দেখুন</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">হোম পেজে ফিরে যান</Link>
        </Button>
      </div>
    </div>
  );
}
