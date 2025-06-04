import { NextRequest, NextResponse } from 'next/server';
import { decryptData, encryptData } from '@/lib/encryption';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Get the encrypted payload from the request
    const encryptedData = await req.text();
    
    if (!encryptedData) {
      return NextResponse.json(
        { error: 'Missing encrypted data' },
        { status: 400 }
      );
    }
    
    // Decrypt the data
    let decryptedData;
    try {
      decryptedData = decryptData(encryptedData);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid encrypted data' },
        { status: 400 }
      );
    }
    
    // Validate the decrypted data
    const { licenseKey, hardwareId } = decryptedData;
    
    if (!licenseKey) {
      return encryptedResponse(
        { error: 'License key is required' },
        400
      );
    }
    
    // Find the license
    const license = await prisma.license.findUnique({
      where: {
        licenseKey,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    
    if (!license) {
      return encryptedResponse(
        { error: 'Invalid license key' },
        404
      );
    }
    
    // Check if the license is revoked
    if (license.status === "revoked") {
      return encryptedResponse(
        { error: 'License has been revoked' },
        403
      );
    }
    
    // Check if the license is expired
    if (new Date(license.expirationDate) < new Date()) {
      return encryptedResponse(
        { error: 'License has expired' },
        403
      );
    }
    
    // Check hardware binding if enabled
    if (license.hardwareBindingEnabled) {
      if (!hardwareId) {
        return encryptedResponse(
          { error: 'Hardware ID is required for this license' },
          400
        );
      }
      
      // If there's no hardware ID stored yet, update the license with this hardware ID
      if (!license.hardwareId) {
        await prisma.license.update({
          where: {
            id: license.id,
          },
          data: {
            hardwareId,
          },
        });
      } 
      // Otherwise, check if the hardware ID matches
      else if (license.hardwareId !== hardwareId) {
        return encryptedResponse(
          { error: 'License is bound to a different hardware ID' },
          403
        );
      }
    }
    
    // Return success response
    return encryptedResponse({
      valid: true,
      licenseKey: license.licenseKey,
      username: license.user.username,
      softwareName: license.softwareName,
      expirationDate: license.expirationDate,
      hardwareBindingEnabled: license.hardwareBindingEnabled,
      status: license.status,
    });
    
  } catch (error) {
    console.error('License verification error:', error);
    
    return encryptedResponse(
      { error: 'An unexpected error occurred' },
      500
    );
  }
}

// Helper function to encrypt and send the response
function encryptedResponse(data: any, status = 200) {
  const encryptedResponse = encryptData(data);
  
  return new NextResponse(encryptedResponse, {
    status,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}