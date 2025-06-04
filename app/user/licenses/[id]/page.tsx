'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserLayout from '@/components/user/user-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Key, Copy, Calendar, Server } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface LicenseDetails {
  id: string;
  licenseKey: string;
  softwareName: string;
  expirationDate: string;
  hardwareBindingEnabled: boolean;
  hardwareId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserLicenseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [license, setLicense] = useState<LicenseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLicenseDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/user/licenses/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch license details');
        }
        
        const data = await response.json();
        setLicense(data);
      } catch (err) {
        console.error('Error fetching license details:', err);
        setError('Failed to load license details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchLicenseDetails();
    }
  }, [params.id]);

  const copyToClipboard = (text: string, itemName: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${itemName} has been copied to clipboard`,
    });
  };

  const isExpired = (date: string) => {
    return new Date(date) < new Date();
  };

  // Calculate the days remaining until expiration
  const getDaysRemaining = (expirationDate: string) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  const getLicenseStatus = () => {
    if (!license) return { label: "Unknown", variant: "outline" as const };
    if (license.status === "revoked") {
      return { label: "Revoked", variant: "destructive" as const };
    } else if (isExpired(license.expirationDate)) {
      return { label: "Expired", variant: "destructive" as const };
    } else {
      return { label: "Active", variant: "default" as const };
    }
  };

  const status = getLicenseStatus();

  return (
    <UserLayout>
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Licenses
        </Button>
        
        <h1 className="text-3xl font-bold">License Details</h1>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Error Loading License</p>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.back()}>Return to Licenses List</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    <Key className="h-6 w-6 mr-2 text-muted-foreground" />
                    {license?.softwareName || 'License Details'}
                  </CardTitle>
                  <CardDescription>
                    Your license for {license?.softwareName}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">License Key</h3>
                <div className="flex items-center">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {license?.licenseKey || 'N/A'}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-8 w-8"
                    onClick={() => license?.licenseKey && copyToClipboard(license.licenseKey, 'License key')}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy license key</span>
                  </Button>
                </div>
              </div>
              
              {license?.status !== "revoked" && license?.expirationDate && !isExpired(license.expirationDate) && (
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">License Status</h3>
                        <p className="text-sm text-muted-foreground">
                          Your license is valid for {getDaysRemaining(license.expirationDate)} more days
                        </p>
                      </div>
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Software</h3>
                  <p>{license?.softwareName || 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Expiration Date
                    </div>
                  </h3>
                  <p>{license?.expirationDate ? formatDate(license.expirationDate) : 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Created Date
                    </div>
                  </h3>
                  <p>{license?.createdAt ? formatDate(license.createdAt) : 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    <div className="flex items-center">
                      <Server className="h-4 w-4 mr-1" />
                      Hardware Binding
                    </div>
                  </h3>
                  <p>
                    {license?.hardwareBindingEnabled 
                      ? "This license is bound to your hardware" 
                      : "This license is not hardware bound"}
                  </p>
                </div>
              </div>
              
              {license?.hardwareBindingEnabled && license.hardwareId && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Hardware ID</h3>
                  <div className="flex items-center">
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono break-all max-w-full">
                      {license.hardwareId}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This license is bound to the hardware above. It can only be used on this device.
                  </p>
                </div>
              )}
              
              {license?.status !== "revoked" && (
                <div className="bg-muted rounded-md p-4">
                  <h3 className="font-medium mb-2">How to use this license</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Download and install the software from the official website</li>
                    <li>Launch the application and navigate to the license activation screen</li>
                    <li>Enter the license key exactly as shown above</li>
                    <li>Follow any additional instructions provided by the software</li>
                  </ol>
                </div>
              )}
              
              {license?.status === "revoked" && (
                <div className="bg-destructive/10 rounded-md p-4 border border-destructive/20">
                  <h3 className="font-medium mb-2 text-destructive">License Revoked</h3>
                  <p className="text-sm">
                    This license has been revoked and is no longer valid. Please contact support for more information.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.back()}>
                Back to Licenses
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </UserLayout>
  );
}