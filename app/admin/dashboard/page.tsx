import AdminLayout from '@/components/admin/admin-layout';
import DashboardStats from '@/components/admin/dashboard-stats';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | License Management System',
  description: 'Admin dashboard for license management system',
};

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <DashboardStats />
    </AdminLayout>
  );
}