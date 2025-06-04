import { NextRequest, NextResponse } from 'next/server';
import { validateUserAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await validateUserAuth(req);
  // If not authorized, authResult is a NextResponse, so return it directly
  if (!('payload' in authResult)) {
    return authResult;
  }
  const { payload } = authResult;
  try {
    const { id } = params;
    const license = await prisma.license.findUnique({
      where: {
        id,
        userId: payload.id, // Ensure the license belongs to the authenticated user
      },
    });
    if (!license) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(license);
  } catch (error) {
    console.error('Error fetching license details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch license details' },
      { status: 500 }
    );
  }
}