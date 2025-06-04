import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Users, Key } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">License Management System</h1>
          </div>
        </header>
        
        <main>
          <section className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Comprehensive License Management Solution</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Secure, efficient, and easy-to-use license management for your software products.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/admin/login">
                  <Users className="h-5 w-5" />
                  Admin Portal
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link href="/user/login">
                  <Key className="h-5 w-5" />
                  User Portal
                </Link>
              </Button>
            </div>
          </section>
          
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="mb-4 p-3 bg-primary/10 rounded-md w-fit">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Admin Portal</h3>
              <p className="text-muted-foreground">
                Comprehensive dashboard for administrators to manage users, licenses, and monitor system activity.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="mb-4 p-3 bg-primary/10 rounded-md w-fit">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">User Portal</h3>
              <p className="text-muted-foreground">
                User-friendly interface for customers to view and manage their licenses and associated details.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-sm border">
              <div className="mb-4 p-3 bg-primary/10 rounded-md w-fit">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">License API</h3>
              <p className="text-muted-foreground">
                Secure, encrypted API for license verification with hardware ID binding capabilities.
              </p>
            </div>
          </section>
        </main>
        
<footer className="text-center text-sm text-muted-foreground">
  <p>
    © {new Date().getFullYear()} License Management System. All rights reserved.
    <br />
    Developed by <span className="font-semibold">Jawad</span> &nbsp;|&nbsp;
    <a
      href="https://github.com/killcod3"
      className="underline hover:text-blue-600"
      target="_blank"
      rel="noopener noreferrer"
    >
      View on GitHub
    </a>
  </p>
</footer>
      </div>
    </div>
  );
}