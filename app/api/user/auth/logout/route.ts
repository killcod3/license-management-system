import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/user/login', req.url));
  
  // Clear the auth cookie
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  
  return response;
}