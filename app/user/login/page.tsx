'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Key, Loader2 } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  userHash: z.string().min(1, 'User hash is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function UserLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userHash: '',
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    if (!recaptchaToken) {
      toast({
        title: 'reCAPTCHA Required',
        description: 'Please complete the reCAPTCHA verification',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/user/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }
      
      toast({
        title: 'Login Successful',
        description: 'Redirecting to dashboard...',
      });
      
      router.push('/user/dashboard');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Key className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">User Login</CardTitle>
          <CardDescription className="text-center">
            Enter your user hash to access your licenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userHash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Hash</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your user hash" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2 pb-4 flex justify-center">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                  onChange={setRecaptchaToken}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground text-center">
            Your user hash was provided to you by your administrator.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}