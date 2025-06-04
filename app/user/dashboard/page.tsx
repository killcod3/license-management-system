import UserLayout from '@/components/user/user-layout';
import UserLicenses from '@/components/user/user-licenses';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Dashboard | License Management System',
  description: 'User dashboard for license management system',
};

export default function UserDashboard() {
  return (
    <UserLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Licenses</h1>
      </div>
      
      <UserLicenses />
    </UserLayout>
  );
}