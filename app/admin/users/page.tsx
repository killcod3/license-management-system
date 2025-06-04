import AdminLayout from '@/components/admin/admin-layout';
import UsersTable from '@/components/admin/users-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users | Admin Dashboard',
  description: 'Manage users in the license management system',
};

export default function UsersPage() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>
      
      <UsersTable />
    </AdminLayout>
  );
}