'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Dice1 as License, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatDate } from '@/lib/utils';

type StatsData = {
  totalUsers: number;
  totalLicenses: number;
  activeUsers: number;
  activeUsersPercent: number;
  expiringSoonLicenses: number;
  recentActivity: {
    date: string;
    licenses: number;
  }[];
};

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats');
        const data = await response.json();
        
        if (response.ok) {
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Placeholder data for initial load
  const placeholderStats: StatsData = stats || {
    totalUsers: 0,
    totalLicenses: 0,
    activeUsers: 0,
    activeUsersPercent: 0,
    expiringSoonLicenses: 0,
    recentActivity: [
      { date: formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)), licenses: 0 },
      { date: formatDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), licenses: 0 },
      { date: formatDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)), licenses: 0 },
      { date: formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), licenses: 0 },
      { date: formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), licenses: 0 },
      { date: formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), licenses: 0 },
      { date: formatDate(new Date()), licenses: 0 },
    ],
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              Total Users
            </CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placeholderStats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <License className="h-4 w-4 mr-2 text-muted-foreground" />
              Total Licenses
            </CardTitle>
            <CardDescription>All issued licenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placeholderStats.totalLicenses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-muted-foreground" />
              Active Users
            </CardTitle>
            <CardDescription>Users with active licenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {placeholderStats.activeUsers} 
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({placeholderStats.activeUsersPercent}%)
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
              Expiring Soon
            </CardTitle>
            <CardDescription>Licenses expiring in 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placeholderStats.expiringSoonLicenses}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
            Recent License Activity
          </CardTitle>
          <CardDescription>
            New licenses issued in the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={placeholderStats.recentActivity}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  formatter={(value) => [`${value} licenses`, 'New Licenses']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar 
                  dataKey="licenses" 
                  name="New Licenses" 
                  fill="hsl(var(--chart-1))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}