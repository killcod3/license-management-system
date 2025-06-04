'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Key, LayoutDashboard, Menu, X, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  
  const navigation = [
    { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
  ];
  
  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
            onClick={() => setOpen(false)}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile nav */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <div className="flex items-center gap-2 border-b pb-4">
              <Key className="h-5 w-5" />
              <span className="text-lg font-semibold">User Portal</span>
            </div>
            <nav className="flex-1 py-4 space-y-1">
              <NavLinks />
            </nav>
            <div className="border-t pt-4">
              <Button variant="outline" size="sm" asChild className="w-full justify-start">
                <Link href="/api/user/auth/logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <span className="font-semibold">License Portal</span>
        </div>
        
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button variant="outline" size="sm" asChild className="hidden md:flex">
            <Link href="/api/user/auth/logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Link>
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:grid md:grid-cols-[220px_1fr]">
        {/* Desktop nav */}
        <aside className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1 overflow-auto py-4 px-3">
              <nav className="grid gap-1">
                <NavLinks />
              </nav>
            </div>
          </div>
        </aside>
        
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}