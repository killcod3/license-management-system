import { NextRequest, NextResponse } from 'next/server';
import { validateUserAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const authResult = await validateUserAuth(req);
  // If not authorized, authResult is a NextResponse, so return it directly
  if (!('payload' in authResult)) {
    return authResult;
  }
  const { payload } = authResult;
  try {
    const licenses = await prisma.license.findMany({
      where: { userId: payload.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(licenses);
  } catch (error) {
    console.error('Error fetching user licenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch licenses' },
      { status: 500 }
    );
  }
}