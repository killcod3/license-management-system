'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface License {
  id: string;
  licenseKey: string;
  userId: string;
  username: string;
  softwareName: string;
  expirationDate: string;
  hardwareBindingEnabled: boolean;
  hardwareId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const formSchema = z.object({
  softwareName: z.string().min(3, 'Software name must be at least 3 characters'),
  expirationDate: z.date({
    required_error: 'Expiration date is required',
  }),
  hardwareBindingEnabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license: License;
  onLicenseUpdated: (license: License) => void;
}

export default function EditLicenseDialog({
  open,
  onOpenChange,
  license,
  onLicenseUpdated,
}: EditLicenseDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingHardware, setIsResettingHardware] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      softwareName: license.softwareName,
      expirationDate: new Date(license.expirationDate),
      hardwareBindingEnabled: license.hardwareBindingEnabled,
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/licenses/${license.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update license');
      }
      
      toast({
        title: 'License Updated',
        description: 'The license has been updated successfully',
      });
      
      onOpenChange(false);
      onLicenseUpdated(result);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update license',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetHardwareId = async () => {
    if (!license.hardwareId) return;
    
    setIsResettingHardware(true);
    try {
      const response = await fetch(`/api/admin/licenses/${license.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetHardwareId: true,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to reset hardware ID');
      }
      
      toast({
        title: 'Hardware ID Reset',
        description: 'The hardware ID has been reset successfully',
      });
      
      onLicenseUpdated(result);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset hardware ID',
        variant: 'destructive',
      });
    } finally {
      setIsResettingHardware(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit License</DialogTitle>
          <DialogDescription>
            Update license details for {license.softwareName}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            
            {license.hardwareBindingEnabled && license.hardwareId && (
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium">Current Hardware ID</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      This license is currently bound to a specific hardware.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetHardwareId}
                    disabled={isResettingHardware || !license.hardwareId}
                  >
                    {isResettingHardware ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      'Reset ID'
                    )}
                  </Button>
                </div>
                <div className="mt-2">
                  <code className="text-xs bg-muted p-1 rounded break-all block">
                    {license.hardwareId}
                  </code>
                </div>
              </div>
            )}
            
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
                    Updating...
                  </>
                ) : (
                  'Update License'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}