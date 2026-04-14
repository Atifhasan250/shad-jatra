'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  LogOut, 
  ShieldCheck, 
  Heart, 
  Settings 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!user) return null;

  const isAdmin = user.id === "user_2pk227vCHY6Z2w0zIu9fIu2X1uG"; // Fallback or env check
  // Note: We should ideally use publicRuntimeConfig or pass it as a prop from layout
  // But for now we'll use a local check or just the fact that user metadata might have it.
  
  const handleSignOut = () => {
    signOut(() => router.push('/'));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="h-9 w-9 rounded-full border-2 border-primary/20 hover:border-primary transition-all cursor-pointer bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
          {user.firstName?.charAt(0) || user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border-primary/10">
        <DropdownMenuLabel className="p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none">{user.fullName || user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Link href="/profile">
          <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground transition-all duration-200">
            <User className="h-4 w-4" />
            <span className="font-medium">আমার প্রোফাইল</span>
          </DropdownMenuItem>
        </Link>

        {user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID && (
          <Link href="/admin">
            <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground transition-all duration-200">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-medium">অ্যাডমিন ড্যাশবোর্ড</span>
            </DropdownMenuItem>
          </Link>
        )}

        <Link href="/favourites">
          <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-rose-500 hover:text-white focus:bg-rose-500 focus:text-white transition-all duration-200">
            <Heart className="h-4 w-4" />
            <span className="font-medium">প্রিয় রেসিপি</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-rose-600 dark:text-rose-400 focus:bg-rose-600 focus:text-white dark:focus:bg-rose-500 dark:focus:text-white transition-all duration-200 group font-bold"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>লগআউট</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
