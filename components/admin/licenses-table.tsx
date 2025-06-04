'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search, RefreshCcw, Copy, Key } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import CreateLicenseDialog from './create-license-dialog';

type License = {
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
};

export default function LicensesTable() {
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/licenses');
      const data = await response.json();
      
      if (response.ok) {
        setLicenses(data);
      } else {
        throw new Error(data.error || 'Failed to fetch licenses');
      }
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch licenses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'License key has been copied to clipboard',
    });
  };
  
  const filteredLicenses = licenses.filter(license => 
    license.licenseKey.toLowerCase().includes(search.toLowerCase()) ||
    license.softwareName.toLowerCase().includes(search.toLowerCase()) ||
    license.username.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleLicenseCreated = (newLicense: License) => {
    setLicenses(prev => [newLicense, ...prev]);
  };
  
  const getLicenseStatus = (license: License) => {
    if (license.status === "revoked") {
      return { label: "Revoked", variant: "destructive" as const };
    } else if (isExpired(license.expirationDate)) {
      return { label: "Expired", variant: "destructive" as const };
    } else {
      return { label: "Active", variant: "default" as const };
    }
  };
  
  const isExpired = (date: string) => {
    return new Date(date) < new Date();
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle className="text-xl">Licenses</CardTitle>
            <CardDescription>Manage software licenses</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchLicenses}
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
              Add License
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search licenses..."
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
                  <TableHead>License Key</TableHead>
                  <TableHead>Software</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hardware Binding</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Loading licenses...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredLicenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      <Key className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground mt-2">No licenses found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLicenses.map((license) => {
                    const status = getLicenseStatus(license);
                    
                    return (
                      <TableRow key={license.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs sm:text-sm font-mono truncate max-w-[100px] sm:max-w-[120px]">
                              {license.licenseKey}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(license.licenseKey)}
                            >
                              <Copy className="h-3 w-3" />
                              <span className="sr-only">Copy key</span>
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{license.softwareName}</TableCell>
                        <TableCell>{license.username}</TableCell>
                        <TableCell>{formatDate(license.expirationDate)}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={license.hardwareBindingEnabled ? "default" : "outline"}
                          >
                            {license.hardwareBindingEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={`/admin/licenses/${license.id}`}>View</a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <CreateLicenseDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onLicenseCreated={handleLicenseCreated}
      />
    </>
  );
}