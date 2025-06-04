import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateLicenseKey } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const authResult = await validateAdminAuth(req);
  // If not authorized, authResult is a NextResponse, so return it directly
  if (!('payload' in authResult)) {
    return authResult;
  }
  try {
    const licenses = await prisma.license.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true } } },
    });
    return NextResponse.json(
      licenses.map(license => ({
        id: license.id,
        licenseKey: license.licenseKey,
        userId: license.userId,
        username: license.user.username,
        softwareName: license.softwareName,
        expirationDate: license.expirationDate,
        hardwareBindingEnabled: license.hardwareBindingEnabled,
        hardwareId: license.hardwareId,
        createdAt: license.createdAt,
      }))
    );
  } catch (error) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch licenses' },
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
    const { userId, softwareName, expirationDate, hardwareBindingEnabled } = await req.json();
    if (!userId || !softwareName || !expirationDate) {
      return NextResponse.json(
        { error: 'User, software name, and expiration date are required' },
        { status: 400 }
      );
    }
    // Verify that the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    // Generate a unique license key
    const licenseKey = generateLicenseKey();
    const license = await prisma.license.create({
      data: {
        licenseKey,
        userId,
        softwareName,
        expirationDate: new Date(expirationDate),
        hardwareBindingEnabled: !!hardwareBindingEnabled,
      },
      include: { user: { select: { username: true } } },
    });
    return NextResponse.json({
      id: license.id,
      licenseKey: license.licenseKey,
      userId: license.userId,
      username: license.user.username,
      softwareName: license.softwareName,
      expirationDate: license.expirationDate,
      hardwareBindingEnabled: license.hardwareBindingEnabled,
      hardwareId: license.hardwareId,
      createdAt: license.createdAt,
    });
  } catch (error) {
    console.error('Error creating license:', error);
    return NextResponse.json(
      { error: 'Failed to create license' },
      { status: 500 }
    );
  }
}