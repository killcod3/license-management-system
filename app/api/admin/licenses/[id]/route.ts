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
    const license = await prisma.license.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true } },
      },
    });
    if (!license) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      id: license.id,
      licenseKey: license.licenseKey,
      userId: license.userId,
      username: license.user.username,
      softwareName: license.softwareName,
      expirationDate: license.expirationDate,
      hardwareBindingEnabled: license.hardwareBindingEnabled,
      hardwareId: license.hardwareId,
      status: license.status,
      createdAt: license.createdAt,
      updatedAt: license.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching license details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch license details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const updateData = await req.json();
    // Check if license exists
    const license = await prisma.license.findUnique({ where: { id } });
    if (!license) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }
    // Prepare the update data
    const dataToUpdate: any = {};
    // Handle revocation
    if (updateData.revoke === true) {
      dataToUpdate.status = "revoked";
    }
    // Handle other editable fields
    if (updateData.softwareName !== undefined) {
      dataToUpdate.softwareName = updateData.softwareName;
    }
    if (updateData.expirationDate !== undefined) {
      dataToUpdate.expirationDate = new Date(updateData.expirationDate);
    }
    if (updateData.hardwareBindingEnabled !== undefined) {
      dataToUpdate.hardwareBindingEnabled = updateData.hardwareBindingEnabled;
    }
    // Handle hardware ID reset
    if (updateData.resetHardwareId === true) {
      dataToUpdate.hardwareId = null;
    }
    // Update the license
    const updatedLicense = await prisma.license.update({
      where: { id },
      data: dataToUpdate,
      include: {
        user: { select: { username: true } },
      },
    });
    return NextResponse.json({
      id: updatedLicense.id,
      licenseKey: updatedLicense.licenseKey,
      userId: updatedLicense.userId,
      username: updatedLicense.user.username,
      softwareName: updatedLicense.softwareName,
      expirationDate: updatedLicense.expirationDate,
      hardwareBindingEnabled: updatedLicense.hardwareBindingEnabled,
      hardwareId: updatedLicense.hardwareId,
      status: updatedLicense.status,
      createdAt: updatedLicense.createdAt,
      updatedAt: updatedLicense.updatedAt,
    });
  } catch (error) {
    console.error('Error updating license:', error);
    return NextResponse.json(
      { error: 'Failed to update license' },
      { status: 500 }
    );
  }
}