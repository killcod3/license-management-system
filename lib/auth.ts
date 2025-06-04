import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

// Types
export type JWTPayload = {
  id: string;
  role?: string;
  username: string;
  type: 'admin' | 'user';
};

// JWT Helpers
export async function signJWT(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Auth Helpers
export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) return null;
  
  return verifyJWT(token);
}

export async function validateAdminAuth(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  
  if (!token) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const payload = await verifyJWT(token);
  
  if (!payload || payload.type !== 'admin') {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return { payload };
}

export async function validateUserAuth(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  
  if (!token) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const payload = await verifyJWT(token);
  
  if (!payload || payload.type !== 'user') {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  return { payload };
}

export async function requireAdminAuth() {
  const session = await getSession();
  
  if (!session || session.type !== 'admin') {
    redirect('/admin/login');
  }
  
  return session;
}

export async function requireUserAuth() {
  const session = await getSession();
  
  if (!session || session.type !== 'user') {
    redirect('/user/login');
  }
  
  return session;
}