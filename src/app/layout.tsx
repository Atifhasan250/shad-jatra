import { ClerkProvider, SignInButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { ThemeProvider } from 'next-themes';
import { Hind_Siliguri, Baloo_Da_2 } from 'next/font/google';
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { MobileMenu } from '@/components/MobileMenu';

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
});

const balooDa2 = Baloo_Da_2({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-baloo-da-2',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://shad-jatra.vercel.app'),
  title: {
    default: 'স্বাদ যাত্রা | আপনার রান্নার সঙ্গী',
    template: '%s | স্বাদ যাত্রা',
  },
  description: 'স্বাদ যাত্রা অ্যাপের মাধ্যমে সেরা বাংলাদেশী রেসিপি খুঁজিন এবং রান্না করুন। ধাপে ধাপে নির্দেশিকা, টাইমার এবং ভয়েস সহায়িকা আপনার রান্নাকে করবে আরও সহজ ও আনন্দময়।',
  keywords: ['বাংলাদেশী রেসিপি', 'রান্না', 'বাংলা রান্না', 'কাচ্চি বিরিয়ানি', 'ইলিশ মাছ', 'রান্নার নির্দেশিকা', 'Bangladeshi recipe', 'cooking', 'Bengali cuisine', 'Kacchi Biryani', 'Ilish fish', 'cooking guide'],
  authors: [{ name: 'Atif Hasan' }],
  openGraph: {
    title: 'স্বাদ যাত্রা | সেরা বাংলাদেশী রান্নার সহজ নির্দেশিকা',
    description: 'আপনার প্রিয় বাংলাদেশী খাবার রান্না করার জন্য ধাপে ধাপে নির্দেশিকা এবং স্মার্ট ফিচার সহ সেরা অ্যাপ।',
    url: 'https://shad-jatra.vercel.app', 
    siteName: 'স্বাদ যাত্রা',
    images: [
      {
        url: '/og-image.png', 
        width: 1200,
        height: 630,
        alt: 'স্বাদ যাত্রা - বাংলাদেশী রেসিপি অ্যাপ',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'স্বাদ যাত্রা | সেরা বাংলাদেশী রান্নার সহজ নির্দেশিকা',
    description: 'আপনার প্রিয় বাংলাদেশী খাবার রান্না করার জন্য ধাপে ধাপে নির্দেশিকা এবং স্মার্ট ফিচার সহ সেরা অ্যাপ।',
    images: ['/twitter-image.png'], 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="bn" suppressHydrationWarning>
        <body className={`${hindSiliguri.variable} ${balooDa2.variable} font-body antialiased bg-background text-foreground`}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <div className="flex flex-col min-h-screen">
              <header className="p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
                <div className="container mx-auto flex justify-between items-center px-4 md:px-0">
                  <Link href="/" className="hover:opacity-90 transition-opacity">
                    <Logo />
                  </Link>
                  
                  <nav className="flex items-center gap-4">
                    <Link 
                      href="/recipelist" 
                      className="hidden md:block text-sm font-medium hover:text-primary transition-colors"
                    >
                      তালিকা
                    </Link>
                    
                    {isSignedIn && (
                      <>
                        <Link 
                          href="/favourites" 
                          className="hidden md:block text-sm font-medium hover:text-primary transition-colors"
                        >
                          প্রিয়
                        </Link>
                        <Link 
                          href="/submit-recipe" 
                          className="hidden md:block text-sm font-medium hover:text-primary transition-colors"
                        >
                          রেসিপি দিন
                        </Link>
                      </>
                    )}

                    <div className="flex items-center gap-2 border-l pl-4 ml-2 md:ml-4 border-border">
                      <ThemeToggle />
                      <div className="hidden md:block">
                        {!isSignedIn ? (
                          <div className="flex items-center gap-2">
                            <Link href="/sign-in">
                              <Button variant="ghost" size="sm" className="font-bold">লগইন</Button>
                            </Link>
                            <Link href="/sign-up">
                              <Button size="sm" className="rounded-xl font-bold">নতুন অ্যাকাউন্ট</Button>
                            </Link>
                          </div>
                        ) : (
                          <UserMenu />
                        )}
                      </div>
                      <MobileMenu />
                    </div>
                  </nav>
                </div>
              </header>
              <main className="flex-grow">
                {children}
              </main>
              <Toaster />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

