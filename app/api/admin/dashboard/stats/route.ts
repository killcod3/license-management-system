import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const authResult = await validateAdminAuth(req);

  // If not authorized, authResult is a NextResponse, so return it directly
  if (!('payload' in authResult)) {
    return authResult;
  }

  try {
    // Get total users
    const totalUsers = await prisma.user.count();
    
    // Get total licenses
    const totalLicenses = await prisma.license.count();
    
    // Get active users (users with non-expired licenses)
    const now = new Date();
    const activeUsersCount = await prisma.user.count({
      where: {
        licenses: {
          some: {
            expirationDate: {
              gt: now,
            },
          },
        },
      },
    });
    
    // Calculate active users percentage
    const activeUsersPercent = totalUsers > 0 
      ? Math.round((activeUsersCount / totalUsers) * 100) 
      : 0;
    
    // Get licenses expiring in the next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringSoonLicenses = await prisma.license.count({
      where: {
        expirationDate: {
          gt: now,
          lte: thirtyDaysFromNow,
        },
      },
    });
    
    // Get licenses created in the last 7 days grouped by date
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    // Generate an array of the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });
    
    // Get count of licenses created for each day
    const licensesByDay = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "License"
      WHERE "createdAt" >= ${sevenDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY date
    `;
    
    // Map the results to the format needed for the chart
    const recentActivity = last7Days.map(day => {
      const dateStr = formatDate(day);
      const found = licensesByDay.find(
        item => formatDate(item.date) === dateStr
      );
      return {
        date: dateStr,
        licenses: found ? Number(found.count) : 0,
      };
    });
    
    return NextResponse.json({
      totalUsers,
      totalLicenses,
      activeUsers: activeUsersCount,
      activeUsersPercent,
      expiringSoonLicenses,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}