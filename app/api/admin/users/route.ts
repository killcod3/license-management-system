import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateUserHash } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const authResult = await validateAdminAuth(req);
  // If not authorized, authResult is a NextResponse, so return it directly
  if (!('payload' in authResult)) {
    return authResult;
  }
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        userHash: true,
        createdAt: true,
        _count: { select: { licenses: true } },
      },
    });
    return NextResponse.json(
      users.map(user => ({
        id: user.id,
        username: user.username,
        userHash: user.userHash,
        createdAt: user.createdAt,
        licenseCount: user._count.licenses,
      }))
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authResult = await validateAdminAuth(req);
  // If not authorized, authResult is a NextResponse, so return it directly
  if (!('payload' in authResult)) {
    return authResult;
  }
  try {
    const { username } = await req.json();
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }
    // Check if user already exists with this username
    const existingUser = await prisma.user.findFirst({
      where: { username: username.trim() }
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this username already exists' },
        { status: 409 }
      );
    }
    // Generate a unique user hash
    const userHash = generateUserHash();
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        userHash,
      },
      select: {
        id: true,
        username: true,
        userHash: true,
        createdAt: true,
      },
    });
    return NextResponse.json({
      ...user,
      licenseCount: 0,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}