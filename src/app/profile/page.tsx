'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Heart, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  ChevronRight,
  LogOut,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFavouritesAction, toggleFavouriteAction } from '@/app/actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [favourites, setFavourites] = useState<any[]>([]);
  const [isLoadingFavs, setIsLoadingFavs] = useState(true);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      loadFavourites();
    }
  }, [user]);

  const loadFavourites = async () => {
    setIsLoadingFavs(true);
    const { data } = await getFavouritesAction();
    if (data) setFavourites(data);
    setIsLoadingFavs(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    try {
      await user.update({
        firstName,
        lastName,
      });
      toast({ title: "সফল!", description: "আপনার প্রোফাইল আপডেট করা হয়েছে।" });
    } catch (err) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।" });
    }
    setIsUpdating(false);
  };

  const handleRemoveFavourite = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const { success } = await toggleFavouriteAction(id);
    if (success) {
      setFavourites(prev => prev.filter(r => r._id !== id));
      toast({ title: "সরানো হয়েছে", description: "রেসিপিটি আপনার তালিকা থেকে সরানো হয়েছে।" });
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="md:w-1/3 space-y-6">
          <Card className="overflow-hidden border-primary/10 rounded-3xl shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center pt-12">
              <div className="relative inline-block mb-6">
                <div className="h-32 w-32 rounded-full border-4 border-primary/20 p-1 bg-background flex items-center justify-center">
                  <div className="h-full w-full rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold font-headline">
                    {user.firstName?.charAt(0) || user.fullName?.charAt(0) || 'U'}
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold font-headline">{user.fullName || user.username}</h2>
              <p className="text-muted-foreground mb-8">{user.primaryEmailAddress?.emailAddress}</p>
              
              <div className="space-y-3">
                <Button 
                    variant="outline" 
                    className="w-full rounded-2xl gap-3 justify-start h-12 border-primary/10 hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground group transition-all"
                    asChild
                >
                    <Link href="/favourites">
                        <Heart className="h-4 w-4 text-rose-500 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">প্রিয় রেসিপি ({favourites.length})</span>
                        <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary-foreground" />
                    </Link>
                </Button>
                {user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID && (
                    <Button 
                        variant="outline" 
                        className="w-full rounded-2xl gap-3 justify-start h-12 border-primary/10 hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground group transition-all"
                        asChild
                    >
                        <Link href="/admin">
                            <ShieldCheck className="h-4 w-4 text-primary group-hover:text-primary-foreground group-hover:scale-110 transition-transform" />
                            <span className="font-semibold">অ্যাডমিন ড্যাশবোর্ড</span>
                            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary-foreground" />
                        </Link>
                    </Button>
                )}
                <Button 
                    variant="destructive" 
                    className="w-full rounded-2xl gap-3 justify-start h-12 hover:bg-destructive shadow-lg transition-all"
                    onClick={() => signOut(() => router.push('/'))}
                >
                    <LogOut className="h-4 w-4" />
                    <span>লগআউট</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-grow space-y-10">
          {/* Profile Edit */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold font-headline">প্রোফাইল তথ্য</h2>
            </div>
            
            <Card className="rounded-3xl border-primary/10 shadow-lg overflow-hidden">
                <CardContent className="p-8">
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">নাম (প্রথম অংশ)</Label>
                                <Input 
                                    id="firstName" 
                                    value={firstName} 
                                    onChange={(e) => setFirstName(e.target.value)} 
                                    className="rounded-xl h-12 bg-muted/30 focus:bg-background transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">পদবি</Label>
                                <Input 
                                    id="lastName" 
                                    value={lastName} 
                                    onChange={(e) => setLastName(e.target.value)} 
                                    className="rounded-xl h-12 bg-muted/30 focus:bg-background transition-all"
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={isUpdating} className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            আপডেট করুন
                        </Button>
                    </form>
                </CardContent>
            </Card>
          </section>

          {/* Favourites Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center">
                  <Heart className="h-5 w-5 fill-rose-500" />
                </div>
                <h2 className="text-2xl font-bold font-headline">প্রিয় রেসিপি</h2>
              </div>
              <Button variant="link" asChild className="text-primary font-bold">
                <Link href="/favourites">সবগুলো দেখুন</Link>
              </Button>
            </div>

            {isLoadingFavs ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {[1, 2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />)}
              </div>
            ) : favourites.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {favourites.slice(0, 4).map((recipe) => (
                  <Card key={recipe._id} className="group relative overflow-hidden rounded-2xl border-primary/5 hover:border-primary/20 transition-all hover:shadow-xl cursor-pointer" onClick={() => router.push(`/recipe/${recipe._id}`)}>
                    <div className="flex gap-4 p-4">
                        <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 shadow-md">
                            <img src={recipe.image_url} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-grow min-w-0 flex flex-col justify-center">
                            <h3 className="font-bold truncate text-foreground/90">{recipe.title}</h3>
                            <p className="text-xs text-muted-foreground">{recipe.category} • {recipe.totalTimeMinutes} মিনিট</p>
                        </div>
                        <button 
                            onClick={(e) => handleRemoveFavourite(e, recipe._id)}
                            className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-all self-center"
                            title="সরান"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                <p className="text-muted-foreground">আপনার কোনো প্রিয় রেসিপি নেই।</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
