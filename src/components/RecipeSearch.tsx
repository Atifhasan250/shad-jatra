'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';

type RecipeSearchProps = {
  onSearch: (query: string) => void;
  isLoading: boolean;
};

export function RecipeSearch({ onSearch, isLoading }: RecipeSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl animate-in fade-in-0 zoom-in-95 duration-500">
      <CardHeader>
        <CardTitle className="text-3xl">একটি রেসিপি খুঁজুন</CardTitle>
        <CardDescription>আজ আপনি কি রান্না করতে চান?</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='যেমন, "কাচ্চি বিরিয়ানি"'
              className="pl-10 text-lg h-14"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" size="lg" disabled={isLoading || !query.trim()} className="h-12 text-lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                অনুসন্ধান করা হচ্ছে...
              </>
            ) : (
              'রেসিপি পান'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
