import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: {
    default: 'স্বাদ যাত্রা | আপনার রান্নার সঙ্গী',
    template: '%s | স্বাদ যাত্রা',
  },
  description: 'স্বাদ যাত্রা অ্যাপের মাধ্যমে সেরা বাংলাদেশী রেসিপি খুঁজুন এবং রান্না করুন। ধাপে ধাপে নির্দেশিকা, টাইমার এবং ভয়েস সহায়িকা আপনার রান্নাকে করবে আরও সহজ ও আনন্দময়।',
  keywords: ['বাংলাদেশী রেসিপি', 'রান্না', 'বাংলা রান্না', 'কাচ্চি বিরিয়ানি', 'ইলিশ মাছ', 'রান্নার নির্দেশিকা', 'Bangladeshi recipe', 'cooking', 'Bengali cuisine', 'Kacchi Biryani', 'Ilish fish', 'cooking guide'],
  authors: [{ name: 'Atif Hasan' }],
  openGraph: {
    title: 'স্বাদ যাত্রা | সেরা বাংলাদেশী রান্নার সহজ নির্দেশিকা',
    description: 'আপনার প্রিয় বাংলাদেশী খাবার রান্না করার জন্য ধাপে ধাপে নির্দেশিকা এবং স্মার্ট ফিচার সহ সেরা অ্যাপ।',
    url: 'https://chefcue.app', // Replace with your actual domain
    siteName: 'স্বাদ যাত্রা',
    images: [
      {
        url: '/og-image.png', // Updated OG image
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
    images: ['/twitter-image.png'], // Updated Twitter image
  },
  icons: {
    icon: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👨‍🍳</text></svg>`,
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
  // We can add more specific metadata on individual pages
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <div className="flex flex-col min-h-screen">
          <header className="p-4 border-b border-white/10 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/">
                <Logo />
              </Link>
              <nav className="flex items-center gap-2">
                <ThemeToggle />
                <Button asChild variant="ghost">
                  <Link href="/recipelist">
                    তালিকা
                  </Link>
                </Button>
              </nav>
            </div>
          </header>
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
