'use client';

import type { RecipeLookupOutput } from '@/lib/bangladeshi-recipes';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SkipBack, SkipForward, Square, CheckCircle2, PauseCircle, PlayCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

const TIME_REGEX = /(\d+)\s*(?:to|-)?\s*(?:\d*\s*)?(minutes?|hours?|seconds?|মিনিট|ঘন্টা|সেকেন্ড)/i;

export function CookingView({ recipe, onFinish }: { recipe: RecipeLookupOutput; onFinish: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  
  const [timer, setTimer] = useState<{ duration: number; remaining: number; isRunning: boolean } | null>(null);

  const progress = useMemo(() => ((currentStep + 1) / recipe.instructions.length) * 100, [currentStep, recipe.instructions.length]);

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

  useEffect(() => {
    const stepText = recipe.instructions[currentStep];

    const timeMatch = stepText.match(TIME_REGEX);
    if (timeMatch) {
      let durationInSeconds = parseInt(timeMatch[1], 10);
      const unit = timeMatch[2].toLowerCase();
      if (unit.startsWith('minute') || unit.startsWith('মিনিট')) {
        durationInSeconds *= 60;
      } else if (unit.startsWith('hour') || unit.startsWith('ঘন্টা')) {
        durationInSeconds *= 3600;
      }
      setTimer({ duration: durationInSeconds, remaining: durationInSeconds, isRunning: true });
    } else {
      setTimer(null);
    }
  }, [currentStep, recipe.instructions]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer && timer.isRunning && timer.remaining > 0) {
      interval = setInterval(() => {
        setTimer((t) => (t ? { ...t, remaining: t.remaining - 1 } : null));
      }, 1000);
    } else if (timer && timer.remaining === 0) {
        setTimer(t => t ? {...t, isRunning: false} : null);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    if (seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl flex flex-col h-full animate-in fade-in-0 zoom-in-95 duration-500">
      <Card className="flex-grow flex flex-col shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center font-headline">{recipe.title}</CardTitle>
          <CardDescription className="text-center">ধাপ {currentStep + 1} এর মধ্যে {recipe.instructions.length}</CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center px-4 md:px-8">
          <p className="text-2xl md:text-4xl text-center font-medium leading-relaxed">{recipe.instructions[currentStep]}</p>
        </CardContent>
        {timer && (
          <div className="p-6 pt-0 text-center">
            <div className="inline-flex items-center justify-center gap-4 rounded-full bg-accent/20 border border-accent/50 px-8 py-4">
                <p className="text-5xl font-mono font-bold text-accent">{formatTime(timer.remaining)}</p>
                <Button variant="ghost" size="icon" className="h-14 w-14 text-accent hover:bg-accent/30" onClick={() => setTimer(t => t ? {...t, isRunning: !t.isRunning} : null)}>
                    {timer.isRunning ? <PauseCircle className="h-10 w-10"/> : <PlayCircle className="h-10 w-10"/>}
                </Button>
            </div>
          </div>
        )}
        <CardFooter className="flex-col gap-4 border-t pt-6">
          <div className="flex justify-center items-center gap-4 w-full">
            <Button onClick={handlePrev} disabled={currentStep === 0} size="lg" variant="outline" className="p-4"><SkipBack /></Button>
            <Button onClick={handleNext} size="lg" className="p-4">
              {currentStep === recipe.instructions.length - 1 ? <Square /> : <SkipForward />}
              <span className="ml-2">{currentStep === recipe.instructions.length - 1 ? 'শেষ' : 'পরবর্তী'}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentStep === recipe.instructions.length - 1 ? "অভিনন্দন!" : "আপনি কি নিশ্চিত?"}</DialogTitle>
            <DialogDescription>
                {currentStep === recipe.instructions.length - 1 ? "আপনি রেসিপিটি সম্পন্ন করেছেন। আপনার খাবার উপভোগ করুন!" : "আপনি কি আপনার রান্নার সেশন শেষ করতে চান?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">বাতিল</Button>
            </DialogClose>
            <Button onClick={onFinish}>
                {currentStep === recipe.instructions.length - 1 ? <CheckCircle2 className="mr-2 h-4 w-4"/> : null}
                শেষ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
