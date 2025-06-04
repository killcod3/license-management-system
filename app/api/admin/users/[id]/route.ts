import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await validateAdminAuth(req);
  // If not authorized, authResult is a NextResponse, so return it directly
  if (!('payload' in authResult)) {
    return authResult;
  }
  try {
    const { id } = params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, userHash: true, createdAt: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    // Get all licenses for this user
    const licenses = await prisma.license.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({
      ...user,
      licenses,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await validateAdminAuth(req);
  // If not authorized, authResult is a NextResponse, so return it directly
  if (!('payload' in authResult)) {
    return authResult;
  }
  try {
    const { id } = params;
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    // Delete user (will cascade delete all licenses due to the onDelete: Cascade relationship)
    await prisma.user.delete({ where: { id } });
    return NextResponse.json(
      { success: true, message: 'User and associated licenses deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}