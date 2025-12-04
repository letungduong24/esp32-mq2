import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';
import { NextAuthOptions } from 'next-auth';

// Simple auth config (same as route handler)
const authOptions: NextAuthOptions = {
  providers: [],
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
};

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth(request?: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    return {
      error: 'Unauthorized',
      status: 401,
    };
  }

  return { session };
}

