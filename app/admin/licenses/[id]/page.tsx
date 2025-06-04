'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Key, Copy, User, Calendar, Server, Pencil, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import EditLicenseDialog from '@/components/admin/edit-license-dialog';

interface LicenseDetails {
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

export default function LicenseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [license, setLicense] = useState<LicenseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchLicenseDetails();
  }, [params.id]);
  
  const fetchLicenseDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/licenses/${params.id}`);
      
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
  
  const revokeLicense = async () => {
    if (!license) return;
    
    setIsRevoking(true);
    try {
      const response = await fetch(`/api/admin/licenses/${license.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          revoke: true,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to revoke license');
      }
      
      toast({
        title: 'License Revoked',
        description: 'The license has been revoked successfully',
      });
      
      // Update the license in state
      setLicense(result);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to revoke license',
        variant: 'destructive',
      });
    } finally {
      setIsRevoking(false);
    }
  };
  
  const handleLicenseUpdated = (updatedLicense: LicenseDetails) => {
    setLicense(updatedLicense);
  };

  return (
    <AdminLayout>
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
                    License ID: {params.id}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {license?.status === "revoked" ? (
                    <Badge variant="destructive">Revoked</Badge>
                  ) : license?.expirationDate && isExpired(license.expirationDate) ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : (
                    <Badge variant="default">Active</Badge>
                  )}
                  <Badge 
                    variant={license?.hardwareBindingEnabled ? "default" : "outline"}
                  >
                    {license?.hardwareBindingEnabled ? "Hardware Bound" : "Not Bound"}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Software</h3>
                  <p>{license?.softwareName || 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">User</h3>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-muted-foreground" />
                    <a 
                      href={`/admin/users/${license?.userId}`} 
                      className="text-primary hover:underline"
                    >
                      {license?.username || 'N/A'}
                    </a>
                  </div>
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
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  <div className="flex items-center">
                    <Server className="h-4 w-4 mr-1" />
                    Hardware Binding
                  </div>
                </h3>
                
                {license?.hardwareBindingEnabled ? (
                  <div>
                    <p className="mb-2">This license is bound to specific hardware.</p>
                    {license.hardwareId ? (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">Hardware ID</h4>
                        <div className="flex items-center">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono break-all">
                            {license.hardwareId}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 h-8 w-8"
                            onClick={() => copyToClipboard(license.hardwareId!, 'Hardware ID')}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy hardware ID</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hardware has been registered yet.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">This license is not bound to hardware.</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.back()}>
                  Back to Licenses
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(true)}
                  disabled={license?.status === "revoked"}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit License
                </Button>
              </div>
              
              {license?.status !== "revoked" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Revoke License
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revoke License</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to revoke this license? This will make the license unusable for the user.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={revokeLicense}
                        disabled={isRevoking}
                      >
                        {isRevoking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Revoking...
                          </>
                        ) : (
                          'Revoke License'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
      
      {license && (
        <EditLicenseDialog 
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          license={license}
          onLicenseUpdated={handleLicenseUpdated}
        />
      )}
    </AdminLayout>
  );
}