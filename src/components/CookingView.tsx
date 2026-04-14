'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  SkipBack, 
  SkipForward, 
  Square, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle, 
  Volume2, 
  VolumeX,
  ListChecks,
  History
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CookingView({ recipe, onFinish }: { recipe: any; onFinish?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState<{ duration: number; remaining: number; isRunning: boolean } | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  
  const touchStartX = useRef<number | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  const progress = useMemo(() => 
    recipe.instructions.length > 0 ? ((currentStep + 1) / recipe.instructions.length) * 100 : 0
  , [currentStep, recipe.instructions.length]);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem(`cooking_progress_${recipe._id}`);
    if (saved) {
      setCurrentStep(parseInt(saved, 10));
    }
  }, [recipe._id]);

  // Save progress
  useEffect(() => {
    localStorage.setItem(`cooking_progress_${recipe._id}`, currentStep.toString());
  }, [currentStep, recipe._id]);

  const handleNext = () => {
    if (currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowFinishDialog(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.removeItem(`cooking_progress_${recipe._id}`);
    if (onFinish) onFinish();
    setShowFinishDialog(false);
  };

  // Timer logic
  useEffect(() => {
    const step = recipe.instructions[currentStep];
    if (step && step.timeSeconds > 0) {
      setTimer({ 
        duration: step.timeSeconds, 
        remaining: step.timeSeconds, 
        isRunning: false 
      });
    } else {
      setTimer(null);
    }
  }, [currentStep, recipe.instructions]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer && timer.isRunning && timer.remaining > 0) {
      interval = setInterval(() => {
        setTimer((t) => (t ? { ...t, remaining: Math.max(0, t.remaining - 1) } : null));
      }, 1000);
    } else if (timer && timer.remaining === 0 && timer.isRunning) {
        setTimer(t => t ? {...t, isRunning: false} : null);
        playBeep();
    }
    return () => clearInterval(interval);
  }, [timer]);

  const playBeep = () => {
    if (isMuted) return;
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContext.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 80) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div 
      className="w-full h-full flex flex-col min-h-[calc(100dvh-120px)] animate-in fade-in duration-500"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Tabs defaultValue="instructions" className="w-full flex-grow flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="instructions" className="flex items-center gap-2">
            <History className="h-4 w-4" /> নির্দেশিকা
          </TabsTrigger>
          <TabsTrigger value="ingredients" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" /> উপকরণ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="flex-grow flex flex-col">
          <Card className="flex-grow flex flex-col shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1">
              <Progress value={progress} className="rounded-none h-1" />
            </div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>
                ধাপ {currentStep + 1} / {recipe.instructions.length}
              </CardDescription>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMuted(!isMuted)}
                className="text-muted-foreground"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </CardHeader>

            <CardContent className="flex-grow flex flex-col items-center justify-center p-6 md:p-12">
              <div className="text-xl md:text-3xl lg:text-4xl text-center font-medium leading-relaxed mb-12 animate-in slide-in-from-bottom-4 duration-300">
                {recipe.instructions[currentStep]?.description}
              </div>

              {timer && (
                <div className="flex flex-col items-center gap-4">
                  <div className={`
                    relative inline-flex items-center justify-center gap-6 rounded-full px-10 py-6
                    bg-primary/10 border-2 border-primary/30 shadow-inner
                    ${timer.isRunning ? 'ring-4 ring-primary/20 animate-pulse' : ''}
                  `}>
                    <p className="text-5xl md:text-7xl font-mono font-bold text-primary tabular-nums tracking-tighter">
                      {formatTime(timer.remaining)}
                    </p>
                    <Button 
                      variant="default" 
                      size="icon" 
                      className="h-16 w-16 md:h-20 md:w-20 rounded-full shadow-lg"
                      onClick={() => setTimer(t => t ? {...t, isRunning: !t.isRunning} : null)}
                    >
                      {timer.isRunning ? <PauseCircle className="h-10 w-10 md:h-12 md:w-12"/> : <PlayCircle className="h-10 w-10 md:h-12 md:w-12 ml-1"/>}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="p-4 md:p-6 border-t bg-muted/30">
              <div className="flex justify-between items-center w-full max-w-2xl mx-auto gap-4">
                <Button 
                  onClick={handlePrev} 
                  disabled={currentStep === 0} 
                  size="lg" 
                  variant="outline" 
                  className="flex-1 min-h-[56px] text-lg rounded-xl"
                >
                  <SkipBack className="mr-2 h-5 w-5" />
                  পূর্ববর্তী
                </Button>
                <Button 
                  onClick={handleNext} 
                  size="lg" 
                  className="flex-1 min-h-[56px] text-lg rounded-xl shadow-md"
                >
                  <span className="mr-2">
                    {currentStep === recipe.instructions.length - 1 ? 'শেষ করুন' : 'পরবর্তী'}
                  </span>
                  {currentStep === recipe.instructions.length - 1 ? <Square className="h-5 w-5" /> : <SkipForward className="h-5 w-5" />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ingredients" className="flex-grow">
          <Card className="h-full border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl">উপকরণ চেকলিস্ট</CardTitle>
              <CardDescription>একটি একটি করে উপকরণ মিলিয়ে নিন।</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {recipe.ingredients.map((ing: string, i: number) => (
                    <div key={i} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        id={`ing-${i}`} 
                        checked={checkedIngredients[i]} 
                        onCheckedChange={(checked) => setCheckedIngredients(prev => ({...prev, [i]: !!checked}))}
                        className="h-6 w-6 rounded-md border-primary"
                      />
                      <label 
                        htmlFor={`ing-${i}`}
                        className={`text-lg cursor-pointer flex-grow ${checkedIngredients[i] ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {ing}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">অভিনন্দন! 🥳</DialogTitle>
            <DialogDescription className="text-lg pt-2">
              আপনি সফলভাবে রেসিপিটি সম্পন্ন করেছেন। আপনার রান্না করা খাবারটি কেমন হয়েছে আমাদের জানাতে ভুলবেন না!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
                <Button variant="outline">ফিরে যান</Button>
            </DialogClose>
            <Button onClick={handleFinish} className="px-8">
                <CheckCircle2 className="mr-2 h-5 w-5"/>
                শেষ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

