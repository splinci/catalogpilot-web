import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'atlas_enterprise_commerce_os_secure_jwt_secret_2026_key'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Request ID propagation
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

  // 0. Immediate Passthrough for Public Routes & Health Check Endpoints
  if (
    pathname === '/activate' ||
    pathname.startsWith('/activate') ||
    pathname === '/login' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/health' ||
    pathname.startsWith('/api/health/') ||
    pathname === '/favicon.ico'
  ) {
    return applySecurityHeaders(NextResponse.next(), requestId);
  }

  // 1. Bypass Static Assets
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return applySecurityHeaders(NextResponse.next(), requestId);
  }

  // 2. Resolve Auth Token from Cookie or Bearer Header
  const token =
    request.cookies.get('atlas_session')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  // 3. Require Auth Token for Protected Routes
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: 'Unauthorized: Session missing or expired' },
          { status: 401 }
        ),
        requestId
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl), requestId);
  }

  // 4. Verify JWT Session Token
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    requestHeaders.set('x-request-id', requestId);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-role', payload.role as string);
    requestHeaders.set('x-company-id', payload.companyId as string);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return applySecurityHeaders(response, requestId);
  } catch (error) {
    if (pathname.startsWith('/api/')) {
      return applySecurityHeaders(
        NextResponse.json(
          { success: false, error: 'Unauthorized: Invalid token signature' },
          { status: 401 }
        ),
        requestId
      );
    }
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('atlas_session', '', { maxAge: 0, path: '/' });
    return applySecurityHeaders(response, requestId);
  }
}

function applySecurityHeaders(response: NextResponse, requestId: string): NextResponse {
  response.headers.set('X-Request-ID', requestId);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
