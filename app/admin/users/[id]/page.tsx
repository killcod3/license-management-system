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
import { ArrowLeft, User, Copy, Key, Trash2, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface License {
  id: string;
  licenseKey: string;
  softwareName: string;
  expirationDate: string;
  hardwareBindingEnabled: boolean;
  hardwareId: string | null;
  status: string;
  createdAt: string;
}

interface UserDetails {
  id: string;
  username: string;
  userHash: string;
  createdAt: string;
  licenses: License[];
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/users/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to load user details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUserDetails();
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

  const deleteUser = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'User Deleted',
          description: data.message || 'User and associated licenses have been deleted',
        });
        router.push('/admin/users');
      } else {
        throw new Error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
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
          Back to Users
        </Button>
        
        <h1 className="text-3xl font-bold">User Details</h1>
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
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Error Loading User</p>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.back()}>Return to Users List</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <User className="h-6 w-6 mr-2 text-muted-foreground" />
                {user?.username || 'User Details'}
              </CardTitle>
              <CardDescription>
                User ID: {params.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">User Hash</h3>
                <div className="flex items-center">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {user?.userHash || 'N/A'}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-8 w-8"
                    onClick={() => user?.userHash && copyToClipboard(user.userHash, 'User hash')}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy user hash</span>
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                <p>{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                Back to Users
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete <span className="font-semibold">{user?.username}</span>?
                      This will permanently delete the user and all associated licenses. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={deleteUser}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Key className="h-5 w-5 mr-2 text-muted-foreground" />
                User Licenses
              </CardTitle>
              <CardDescription>
                All licenses associated with this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.licenses && user.licenses.length > 0 ? (
                <div className="space-y-4">
                  {user.licenses.map((license) => (
                    <div key={license.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{license.softwareName}</h4>
                          <div className="flex items-center mt-1">
                            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                              {license.licenseKey}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-6 w-6"
                              onClick={() => copyToClipboard(license.licenseKey, 'License key')}
                            >
                              <Copy className="h-3 w-3" />
                              <span className="sr-only">Copy license key</span>
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {license.status === "revoked" ? (
                            <Badge variant="destructive">Revoked</Badge>
                          ) : (
                            <Badge
                              variant={isExpired(license.expirationDate) ? "destructive" : "default"}
                            >
                              {isExpired(license.expirationDate) ? "Expired" : "Active"}
                            </Badge>
                          )}
                          <Badge 
                            variant={license.hardwareBindingEnabled ? "default" : "outline"}
                          >
                            {license.hardwareBindingEnabled ? "Hardware Bound" : "Not Bound"}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>Expires: {formatDate(license.expirationDate)}</p>
                        <p>Created: {formatDate(license.createdAt)}</p>
                      </div>
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-xs"
                        >
                          <a href={`/admin/licenses/${license.id}`}>View License</a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Key className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No licenses found for this user</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild>
                <a href={`/admin/licenses`}>View All Licenses</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}