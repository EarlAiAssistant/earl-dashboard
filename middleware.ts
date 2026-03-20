// Middleware — placeholder for future auth
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static files and API routes that don't need middleware
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
