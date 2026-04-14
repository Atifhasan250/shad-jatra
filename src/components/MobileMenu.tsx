'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User, ShieldCheck, Heart, List, PlusCircle, LogOut, Home } from "lucide-react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MobileMenu() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSignOut = () => {
    signOut(() => {
      setOpen(false);
      router.push('/');
    });
  };

  const closeMenu = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden -mr-2">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0 border-l border-primary/10 flex flex-col">
        <SheetHeader className="p-6 border-b border-primary/5 bg-primary/5">
          <SheetTitle className="text-left font-headline text-2xl text-primary font-bold">স্বাদ যাত্রা মেনু</SheetTitle>
        </SheetHeader>
        
        <div className="flex-grow py-6 px-4 space-y-2 overflow-y-auto">
          <Link href="/" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors">
            <Home className="h-5 w-5 text-primary" />
            <span className="font-bold">হোম</span>
          </Link>
          
          <Link href="/recipelist" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors">
            <List className="h-5 w-5 text-primary" />
            <span className="font-bold">রেসিপি তালিকা</span>
          </Link>

          {isSignedIn && (
            <>
              <Link href="/submit-recipe" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors">
                <PlusCircle className="h-5 w-5 text-primary" />
                <span className="font-bold">রেসিপি দিন</span>
              </Link>
              
              <div className="pt-6 pb-2">
                 <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">ব্যবহারকারী মেনু</p>
              </div>

              <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors">
                <User className="h-5 w-5 text-primary" />
                <span className="font-bold">আমার প্রোফাইল</span>
              </Link>

              <Link href="/favourites" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors">
                <Heart className="h-5 w-5 text-primary" />
                <span className="font-bold">প্রিয় রেসিপি</span>
              </Link>

              {user?.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID && (
                <Link href="/admin" onClick={closeMenu} className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-500/10 text-amber-600 transition-colors">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="font-bold">অ্যাডমিন ড্যাশবোর্ড</span>
                </Link>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-primary/10 bg-muted/10">
          {isSignedIn ? (
            <Button 
              variant="destructive" 
              className="w-full justify-start rounded-xl h-12 font-bold shadow-lg shadow-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              লগআউট
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/sign-in" onClick={closeMenu} className="w-full">
                <Button variant="outline" className="w-full rounded-xl font-bold h-11">লগইন</Button>
              </Link>
              <Link href="/sign-up" onClick={closeMenu} className="w-full">
                <Button className="w-full rounded-xl font-bold h-11">সাইন আপ</Button>
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
