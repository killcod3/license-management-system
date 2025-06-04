'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  softwareName: z.string().min(3, 'Software name must be at least 3 characters'),
  expirationDate: z.date({
    required_error: 'Expiration date is required',
  }).min(new Date(), 'Expiration date must be in the future'),
  hardwareBindingEnabled: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface User {
  id: string;
  username: string;
}

interface CreateLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLicenseCreated: (license: any) => void;
}

export default function CreateLicenseDialog({ 
  open, 
  onOpenChange,
  onLicenseCreated,
}: CreateLicenseDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      softwareName: '',
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      hardwareBindingEnabled: false,
    },
  });
  
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);
  
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoadingUsers(false);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create license');
      }
      
      toast({
        title: 'License Created',
        description: 'The license has been created successfully',
      });
      
      form.reset({
        userId: '',
        softwareName: '',
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        hardwareBindingEnabled: false,
      });
      onOpenChange(false);
      onLicenseCreated(result);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create license',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New License</DialogTitle>
          <DialogDescription>
            Create a new license key for a user. The license key will be generated automatically.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting || loadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingUsers ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading users...
                        </div>
                      ) : users.length === 0 ? (
                        <div className="p-2 text-center text-muted-foreground">
                          No users found
                        </div>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.username}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="softwareName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Software Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter software name" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The license will expire at the end of the selected date.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hardwareBindingEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Hardware Binding</FormLabel>
                    <FormDescription>
                      When enabled, the license will be bound to a specific hardware ID.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create License'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}