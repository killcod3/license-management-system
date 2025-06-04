import AdminLayout from '@/components/admin/admin-layout';
import LicensesTable from '@/components/admin/licenses-table';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Licenses | Admin Dashboard',
  description: 'Manage licenses in the license management system',
};

export default function LicensesPage() {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Licenses</h1>
      </div>
      
      <LicensesTable />
    </AdminLayout>
  );
}