'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Loader2, Plus, Search, RefreshCcw, Copy, User, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import CreateUserDialog from './create-user-dialog';

type User = {
  id: string;
  username: string;
  userHash: string;
  createdAt: string;
  licenseCount: number;
};

export default function UsersTable() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'User hash has been copied to clipboard',
    });
  };
  
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.userHash.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleUserCreated = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
  };
  
  const deleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
        toast({
          title: 'User Deleted',
          description: data.message || 'User and associated licenses have been deleted',
        });
        setUserToDelete(null);
      } else {
        throw new Error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle className="text-xl">Users</CardTitle>
            <CardDescription>Manage user accounts</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchUsers}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              <span className="sr-only">Refresh</span>
            </Button>
            <Button 
              size="sm" 
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>User Hash</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Licenses</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      <User className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground mt-2">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs sm:text-sm font-mono truncate max-w-[100px] sm:max-w-[200px]">
                            {user.userHash}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(user.userHash)}
                          >
                            <Copy className="h-3 w-3" />
                            <span className="sr-only">Copy hash</span>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>{user.licenseCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={`/admin/users/${user.id}`}>View</a>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => setUserToDelete(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <span className="font-semibold">{user.username}</span>?
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <CreateUserDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onUserCreated={handleUserCreated}
      />
    </>
  );
}