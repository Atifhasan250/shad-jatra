'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { submitRecipeAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const recipeSchema = z.object({
  title: z.string().min(3, 'শিরোনাম অন্তত ৩ অক্ষরের হতে হবে'),
  description: z.string().min(1, 'বর্ণনা দিন'),
  image_url: z.string().url('সঠিক ইমেজ লিংক দিন'),
  category: z.string().min(1, 'একটি ক্যাটাগরি বেছে নিন'),
  difficulty: z.string().min(1, 'কঠিনতা বেছে নিন'),
  servings: z.coerce.number().min(1, 'অন্তত ১ জন হতে হবে'),
  totalTimeMinutes: z.coerce.number().min(1, 'সময় অন্তত ১ মিনিট হতে হবে'),
  ingredients: z.array(z.string().min(1)).min(1, 'অন্তত একটি উপকরণ যোগ করুন'),
  instructions: z.array(z.object({
    description: z.string().min(1),
    timeSeconds: z.coerce.number().default(0),
  })).min(1, 'অন্তত একটি নির্দেশিকা যোগ করুন'),
  tags: z.string().optional(),
});

export default function SubmitRecipePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof recipeSchema>>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      description: '',
      image_url: '',
      category: 'অন্যান্য',
      difficulty: 'সহজ',
      servings: 1,
      totalTimeMinutes: 30,
      ingredients: [''],
      instructions: [{ description: '', timeSeconds: 0 }],
      tags: '',
    },
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control: form.control,
    name: "ingredients" as any,
  });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control: form.control,
    name: "instructions" as any,
  });

  // Ensure at least one field exists on mount
  useState(() => {
    if (ingredientFields.length === 0) appendIngredient('');
    if (instructionFields.length === 0) appendInstruction({ description: '', timeSeconds: 0 });
  });

  async function onSubmit(values: z.infer<typeof recipeSchema>) {
    setIsSubmitting(true);
    const formattedValues = {
      ...values,
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [],
      instructions: values.instructions.map((inst, index) => ({
        ...inst,
        step: index + 1
      }))
    };
    const { success, error } = await submitRecipeAction(formattedValues);
    setIsSubmitting(false);

    if (success) {
      setIsSuccess(true);
      toast({
        title: "সাফল্য!",
        description: "আপনার রেসিপিটি পর্যালোচনার জন্য জমা দেওয়া হয়েছে।",
      });
      setTimeout(() => router.push('/recipelist'), 3000);
    } else {
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: error || "রেসিপি জমা দিতে সমস্যা হয়েছে।",
      });
    }
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="h-20 w-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-bold font-headline">ধন্যবাদ!</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          আপনার রেসিপিটি জমা নেওয়া হয়েছে। অ্যাডমিন সেটি দেখে অনুমোদন করলে তা সবার জন্য উন্মুক্ত হবে।
        </p>
        <Button onClick={() => router.push('/recipelist')} size="lg">রেসিপি তালিকায় ফিরে যান</Button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold font-headline mb-2">নতুন রেসিপি জমা দিন</h1>
        <p className="text-muted-foreground">আপনার রান্নার অভিজ্ঞতা সবার সাথে ভাগ করে নিন।</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>মূল তথ্য</CardTitle>
              <CardDescription>রেসিপিটির নাম এবং প্রাথমিক তথ্য দিন।</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>রেসিপির নাম</FormLabel>
                    <FormControl>
                      <Input placeholder="যেমন: কাচ্চি বিরিয়ানি" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ক্যাটাগরি</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ক্যাটাগরি বেছে নিন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="বিরিয়ানি">বিরিয়ানি</SelectItem>
                          <SelectItem value="মাছ">মাছ</SelectItem>
                          <SelectItem value="মাংস">মাংস</SelectItem>
                          <SelectItem value="ভর্তা">ভর্তা</SelectItem>
                          <SelectItem value="মিষ্টি">মিষ্টি</SelectItem>
                          <SelectItem value="নাস্তা">নাস্তা</SelectItem>
                          <SelectItem value="সবজি">সবজি</SelectItem>
                          <SelectItem value="অন্যান্য">অন্যান্য</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>কঠিনতা</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="কঠিনতা বেছে নিন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="সহজ">সহজ</SelectItem>
                          <SelectItem value="মাঝারি">মাঝারি</SelectItem>
                          <SelectItem value="কঠিন">কঠিন</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>সংক্ষিপ্ত বর্ণনা</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="রেসিপিটি সম্পর্কে কিছু কথা সংক্ষেপে লিখুন..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ছবির লিংক (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/recipe.jpg" {...field} />
                    </FormControl>
                    <FormDescription>রেসিপিটির একটি সুন্দর ছবির লিংক দিন।</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>কত জনের জন্য</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalTimeMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>মোট সময় (মিনিট)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ট্যাগ সমূহ (Tags)</FormLabel>
                    <FormControl>
                      <Input placeholder="যেমন: kacchi, biriyani, কাচ্চি, বিরিয়ানি" {...field} />
                    </FormControl>
                    <FormDescription>কমা (,) দিয়ে আলাদা করে ট্যাগগুলো লিখুন। ইংরেজী এবং বাংলা উভয়ই ব্যবহার করতে পারেন।</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>উপকরণ সমূহ</CardTitle>
                <CardDescription>প্রয়োজনীয় সব উপকরণ নিচের তালিকায় দিন।</CardDescription>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => appendIngredient('')}
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" /> যোগ করুন
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredientFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input placeholder={`উপকরণ ${index + 1}`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeIngredient(index)}
                    disabled={ingredientFields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>প্রস্তুত প্রণালী</CardTitle>
                <CardDescription>ধাপে ধাপে রান্নার নির্দেশিকা দিন।</CardDescription>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => appendInstruction({ description: '', timeSeconds: 0 })}
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" /> ধাপ যোগ করুন
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {instructionFields.map((field, index) => (
                <div key={field.id} className="p-4 rounded-lg bg-muted/30 border space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">ধাপ {index + 1}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeInstruction(index)}
                      disabled={instructionFields.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`instructions.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea placeholder="কি করতে হবে তা বিস্তারিত লিখুন..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`instructions.${index}.timeSeconds`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">টাইমার (সেকেন্ড - ঐচ্ছিক)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full h-14 text-lg rounded-2xl" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> জমা দেওয়া হচ্ছে...</> : "রেসিপি সাবমিট করুন"}
          </Button>
        </form>
      </Form>
    </main>
  );
}
