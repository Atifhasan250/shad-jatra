'use client';

import * as React from 'react';
import { useSignUp, useSignIn, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Lock, ChevronRight, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function SignUpForm() {
  const { signUp, fetchStatus: signUpStatus } = useSignUp();
  const { signIn } = useSignIn();
  const isLoaded = signUpStatus === 'idle';
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [verifying, setVerifying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  if (!isLoaded) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error: createError } = await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
      });
      
      if (createError) throw createError;

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) throw sendError;
      setVerifying(true);
      toast({ title: 'কোড পাঠানো হয়েছে', description: 'আপনার ইমেইল চেক করুন' });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: err.errors?.[0]?.message || 'একাউন্ট খুলতে সমস্যা হয়েছে',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code,
      });

      if (error) throw error;

      if (signUp.status === 'complete') {
        await signUp.finalize();
        router.push('/');
        toast({ title: 'সাফল্য!', description: 'আপনার একাউন্ট সফলভাবে তৈরি হয়েছে' });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: err.errors?.[0]?.message || 'কোডটি সঠিক নয়',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const signUpWithGoogle = () => {
    if (!signIn) return;
    signIn.sso({
      strategy: 'oauth_google',
      redirectUrl: window.location.origin + '/sso-callback',
      redirectCallbackUrl: window.location.origin + '/',
    });
  };

  if (verifying) {
    return (
      <Card className="w-full max-w-md border-primary/10 shadow-2xl rounded-[2rem] overflow-hidden animate-in fade-in zoom-in-95 duration-500 bg-card/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 pb-6 text-center bg-primary/5">
          <CardTitle className="text-3xl font-bold font-headline tracking-tight text-primary">ইমেইল যাচাই</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">{email} ঠিকানায় পাঠানো কোডটি দিন</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6 px-8">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold ml-1">ভেরিফিকেশন কোড</Label>
              <Input
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-16 text-center text-3xl tracking-[0.5em] font-bold rounded-2xl border-primary/10 bg-background/50 focus:border-primary/50 transition-all"
                required
                maxLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "যাচাই করুন"}
            </Button>
            <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors" onClick={() => setVerifying(false)}>ইমেইল পরিবর্তন করুন</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-primary/10 shadow-2xl rounded-[2rem] overflow-hidden animate-in fade-in zoom-in-95 duration-500 bg-card/50 backdrop-blur-xl">
      <CardHeader className="space-y-1 pb-6 text-center bg-primary/5 border-b border-primary/5">
        <CardTitle className="text-3xl font-bold font-headline tracking-tight text-primary">নতুন একাউন্ট</CardTitle>
        <CardDescription className="text-muted-foreground font-medium">স্বাদ যাত্রায় যোগ দিতে আপনার তথ্য দিন</CardDescription>
      </CardHeader>
      <CardContent className="pt-8 space-y-6 px-8">
        <Button 
          variant="outline" 
          type="button"
          className="w-full h-12 rounded-2xl flex items-center justify-center gap-3 border-primary/10 bg-background/50 hover:bg-primary/5 font-bold transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
          onClick={signUpWithGoogle}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-foreground">গুগল দিয়ে সাইন আপ</span>
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-primary/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#fdfbf7] dark:bg-[#1a1614] px-4 text-muted-foreground font-bold tracking-widest">অথবা</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold ml-1 text-foreground">পুরো নাম</Label>
            <div className="relative group">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input
                 placeholder="আপনার নাম"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="pl-12 h-14 rounded-2xl border-primary/10 bg-background/50 focus:border-primary/50 transition-all text-base"
                 required
               />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold ml-1 text-foreground">ইমেইল ঠিকানা</Label>
            <div className="relative group">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input
                 type="email"
                 placeholder="আপনার ইমেইল"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="pl-12 h-14 rounded-2xl border-primary/10 bg-background/50 focus:border-primary/50 transition-all text-base"
                 required
               />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-bold ml-1 text-foreground">পাসওয়ার্ড</Label>
            <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input
                 type="password"
                 placeholder="কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="pl-12 h-14 rounded-2xl border-primary/10 bg-background/50 focus:border-primary/50 transition-all text-base"
                 required
               />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-2 group" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="flex items-center">একাউন্ট খুলুন <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" /></div>}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="pb-10 justify-center text-sm border-t border-primary/5 mt-6 pt-6">
        <p className="text-muted-foreground font-medium">ইতিমধ্যেই একউনন্ট আছে?</p>
        <Link href="/sign-in" className="ml-2 text-primary font-extrabold hover:underline transition-all">লগইন করুন</Link>
      </CardFooter>
    </Card>
  );
}
