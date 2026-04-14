'use client';
import { useState, useEffect, useCallback } from 'react';
import { getPendingRecipesAction, approveRecipeAction, deleteRecipeAction, importRecipesAction, isAdminAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Trash2, ExternalLink, ShieldCheck, FileUp, Info, Code, ShieldAlert, Copy, ClipboardPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Link from 'next/link';

export default function AdminPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [jsonPaste, setJsonPaste] = useState('');
  const { toast } = useToast();

  const loadPending = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await getPendingRecipesAction();
    if (data) setRecipes(data);
    setIsLoading(false);
  }, []);

  const handlePasteImport = async () => {
    if (!jsonPaste.trim()) return;
    
    setIsImporting(true);
    try {
      const data = JSON.parse(jsonPaste);
      const { success, error, count } = await importRecipesAction(data);
      
      if (success) {
        toast({ title: "সফল!", description: `${count} টি রেসিপি ইমপোর্ট করা হয়েছে।` });
        setJsonPaste('');
        setIsPasteOpen(false);
        loadPending();
      } else {
        toast({ variant: "destructive", title: "ত্রুটি", description: error });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "ভুল JSON ফরম্যাট", description: "অনুগ্রহ করে সঠিক JSON ফরম্যাট ব্যবহার করুন।" });
    }
    setIsImporting(false);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const result = await isAdminAction();
      setIsAdmin(result);
      if (result) {
        loadPending();
      }
    };
    checkAdmin();
  }, [loadPending]);

  if (isAdmin === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4">যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <main className="container mx-auto px-4 flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-8 animate-in fade-in duration-500 max-w-md">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
            <ShieldAlert className="h-12 w-12" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground">অনুমতি নেই</h1>
            <p className="text-xl text-muted-foreground">
              দুঃখিত, এই পেজটি শুধুমাত্র অ্যাডমিনদের জন্য। আপনি যদি অ্যাডমিন হয়ে থাকেন তবে সঠিক আইডি দিয়ে লগইন করুন।
            </p>
          </div>
          <Button asChild size="lg" className="rounded-2xl px-8 text-lg font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
            <Link href="/">হোমপেজে ফিরে যান</Link>
          </Button>
        </div>
      </main>
    );
  }

  const handleApprove = async (id: string) => {
    setActionId(id);
    const { success, error } = await approveRecipeAction(id);
    if (success) {
      toast({ title: "অনুমোদিত!", description: "রেসিপিটি প্রকাশ করা হয়েছে।" });
      setRecipes(prev => prev.filter(r => r._id !== id));
    } else {
      toast({ variant: "destructive", title: "ত্রুটি", description: error });
    }
    setActionId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে আপনি এই রেসিপিটি মুছে ফেলতে চান?')) return;
    setActionId(id);
    const { success, error } = await deleteRecipeAction(id);
    if (success) {
      toast({ title: "মুছে ফেলা হয়েছে", description: "রেসিপিটি ডিলিট করা হয়েছে।" });
      setRecipes(prev => prev.filter(r => r._id !== id));
    } else {
      toast({ variant: "destructive", title: "ত্রুটি", description: error });
    }
    setActionId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast({ variant: "destructive", title: "ভুল ফাইল ফরম্যাট", description: "দয়া করে একটি JSON ফাইল আপলোড করুন।" });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const data = Array.isArray(json) ? json : [json];
        
        setIsImporting(true);
        const { success, count, error } = await importRecipesAction(data);
        setIsImporting(false);

        if (success) {
          toast({ title: "ইমপোর্ট সফল!", description: `${count}টি রেসিপি যোগ করা হয়েছে।` });
          loadPending();
        } else {
          toast({ variant: "destructive", title: "ত্রুটি", description: error });
        }
      } catch (err) {
        toast({ variant: "destructive", title: "ত্রুটি", description: "ফাইলটি পার্স করতে সমস্যা হয়েছে।" });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const jsonExample = `[
  {
    "title": "চিকেন কারি",
    "description": "সহজ এবং সুস্বাদু মুরগির মাংসের তরকারি।",
    "image_url": "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg",
    "category": "মাংস",
    "difficulty": "মাঝারি",
    "prepTimeMinutes": 15,
    "cookTimeMinutes": 45,
    "servings": 4,
    "tags": ["কাচ্চি", "বিরিয়ানি", "kacchi", "biriyani", "kacchi biriyani"],
    "ingredients": ["মুরগির মাসং", "পিঁয়াজ", "আদা-রগুন বাটা", "জিরা", "গরম মসলা"],
    "instructions": [
      { "step": 1, "description": "পিঁয়াজ কুচি করে লাল করে ভাজুন।" },
      { "step": 2, "description": "সব মসলা দিয়ে কষিয়ে মাসং দিয়ে দিন।" }
    ]
  }
]`;

  return (
    <main className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-headline">অ্যাডমিন প্যানেল</h1>
            <p className="text-muted-foreground">অপেক্ষা করা রেসিপি এবং ডাটাবেস পরিচালনা করুন।</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Dialog open={isPasteOpen} onOpenChange={setIsPasteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-xl h-10 px-6 gap-2 border-primary/20 hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground transition-all duration-200 text-primary">
                <ClipboardPlus className="h-4 w-4" />
                পেস্ট করুন (JSON)
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">JSON পেস্ট করুন</DialogTitle>
                <DialogDescription>
                  নিচে আপনার রেসিপিগুলোর JSON ফরম্যাটটি পেস্ট করুন। ইমপোর্ট করার আগে ফরম্যাটটি ঠিক আছে কিনা নিশ্চিত হয়ে নিন।
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea 
                  placeholder='[ { "title": "...", ... } ]' 
                  className="min-h-[300px] font-mono text-sm rounded-2xl bg-muted/30 focus:bg-background transition-all"
                  value={jsonPaste}
                  onChange={(e) => setJsonPaste(e.target.value)}
                />
              </div>
              <DialogFooter className="gap-3 sm:gap-0">
                <Button variant="outline" onClick={() => setIsPasteOpen(false)} className="rounded-xl">বাতিল</Button>
                <Button 
                  onClick={handlePasteImport} 
                  disabled={isImporting || !jsonPaste.trim()}
                  className="rounded-xl shadow-lg shadow-primary/20"
                >
                  {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                  এখনই যোগ করুন
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="relative">
            <input
              type="file"
              id="json-upload"
              className="hidden"
              accept=".json"
              onChange={handleFileUpload}
              disabled={isImporting}
            />
            <Label htmlFor="json-upload">
              <div className="inline-flex items-center justify-center rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 h-10 px-6 cursor-pointer shadow-lg shadow-primary/20">
                {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileUp className="h-4 w-4 mr-2" />}
                ফাইল আপলোড
              </div>
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold font-headline">অনুমোদনের অপেক্ষায়</h2>
            <Badge variant="outline" className="rounded-full bg-orange-500/10 text-orange-600 border-none px-3 font-bold">
              {recipes.length} টি
            </Badge>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p>পেন্ডিং রেসিপি লোড হচ্ছে...</p>
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid gap-6">
              {recipes.map((recipe) => (
                <Card key={recipe._id} className="overflow-hidden border-primary/10 hover:shadow-md transition-shadow">
                  <div className="md:flex">
                    <div className="md:w-56 h-40 md:h-auto relative">
                      <img src={recipe.image_url} alt="" className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-grow p-6">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold font-headline mb-1">{recipe.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{recipe.description}</p>
                        </div>
                        <Badge variant="secondary">{recipe.category}</Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                        <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> {recipe.ingredients?.length || 0} উপকরণ</span>
                        <span className="flex items-center gap-1.5 font-mono">ID: {recipe._id.substring(0, 8)}...</span>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(recipe._id)} 
                          disabled={actionId === recipe._id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionId === recipe._id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                          অনুমোদন দিন
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(recipe._id)}
                          disabled={actionId === recipe._id}
                        >
                           <Trash2 className="h-4 w-4 mr-2" /> ডিলিট করুন
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/recipe/${recipe._id}`} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" /> প্রিভিউ দেখুন
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium">কোন পেন্ডিং রেসিপি নেই</h3>
              <p className="text-muted-foreground mt-2">সব রেসিপি বর্তমানে অনুমোদিত অবস্থায় আছে।</p>
            </div>
          )}
        </section>

        <section className="bg-card border rounded-3xl overflow-hidden">
          <div className="p-8 border-b bg-muted/30">
            <div className="flex items-center gap-3 mb-2">
              <Code className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold font-headline">JSON ইমপোর্ট গাইড</h2>
            </div>
            <p className="text-muted-foreground">বড় আকারে রেসিপি যোগ করার সময় এই ফরম্যাট অনুসরণ করুন।</p>
          </div>
          <div className="p-8">
            <div className="bg-slate-950 rounded-2xl p-6 relative group border border-slate-800">
              <div className="absolute top-4 right-4 flex items-center gap-3">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden group-hover:block transition-all">
                  JSON Structure Example
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  onClick={() => {
                    navigator.clipboard.writeText(jsonExample);
                    toast({ title: "কপি করা হয়েছে!", description: "JSON ফরম্যাটটি ক্লিপবোর্ডে কপি করা হয়েছে।" });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <pre className="text-orange-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {jsonExample}
              </pre>
            </div>
          </div>
          <div className="px-8 pb-8">
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <div className="flex items-center gap-2 mb-3 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="font-bold">AI জেনারেটর প্রম্পট (AI Prompt)</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                যেকোনো AI (যেমন ChatGPT) ব্যবহার করে এই ফরম্যাটে রেসিপি জেনারেট করতে নিচের ইন্সট্রাকশনটি ব্যবহার করুন:
              </p>
              <div className="bg-background border rounded-xl p-4 relative group">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 rounded-lg"
                  onClick={() => {
                    const aiPrompt = `Generate a JSON array of recipes for a website. 
Structure: title, description, image_url, category, difficulty (সহজ/মাঝারি/কঠিন), servings, prepTimeMinutes, cookTimeMinutes, ingredients[], tags[], instructions[{step, description}].
Categories must be one of: বিরিয়ানি, মাছ, মাংস, ভর্তা, মিষ্টি, নাস্তা, সবজি, ডাল, অন্যান্য.
Tags must include the item name in Bengali, English, and Banglish (e.g., ["কাচ্চি", "biriyani", "kacchi"]).
Write all text content in Bengali.`;
                    navigator.clipboard.writeText(aiPrompt);
                    toast({ title: "প্রম্পট কপি করা হয়েছে!", description: "এটি আপনার AI চ্যাটবক্সে পেস্ট করুন।" });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <p className="text-xs font-mono text-foreground leading-loose">
                  "Generate recipes in a JSON array. Follow this structure exactly: title, description, image_url, category (বিরিয়ানি/মাছ/মাংস/ভর্তা/মিষ্টি/নাস্তা/সবজি/ডাল/অন্যান্য), difficulty (সহজ/মাঝারি/কঠিন), prepTimeMinutes, cookTimeMinutes, servings, ingredients[], tags[], and instructions[]. <br/>
                  <span className="text-primary font-bold">CRITICAL:</span> Tags must include names in Bengali, English, and Banglish. All actual text (title, desc, instructions) must be in Bengali scripts."
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="cursor-pointer">
      {children}
    </label>
  );
}
