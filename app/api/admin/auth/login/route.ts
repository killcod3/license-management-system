import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { isValidRecaptcha } from '@/lib/utils';
import { signJWT } from '@/lib/auth';
import prisma from '@/lib/prisma';




export async function POST(req: NextRequest) {
  try {
    const { username, password, recaptchaToken } = await req.json();

    // Validate reCAPTCHA
    const recaptchaValid = await isValidRecaptcha(
      recaptchaToken,
      process.env.RECAPTCHA_SECRET_KEY || ''
    );

    if (!recaptchaValid) {
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      // Check if there are any admins in the system
      const adminCount = await prisma.admin.count();
      
      if (adminCount === 0) {
        // First-time setup: Create the owner admin
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newAdmin = await prisma.admin.create({
          data: {
            username,
            password: hashedPassword,
            role: 'owner',
          },
        });
        
        // Create JWT
        const token = await signJWT({
          id: newAdmin.id,
          username: newAdmin.username,
          role: newAdmin.role,
          type: 'admin',
        });
        
        // Set cookie
        const response = NextResponse.json(
          { success: true, message: 'Success' },
          { status: 201 }
        );
        
        response.cookies.set({
          name: 'auth_token',
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 8 * 60 * 60, // 8 hours
        });
        
        return response;
      }
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT
    const token = await signJWT({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      type: 'admin',
    });
    
    // Set cookie
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}