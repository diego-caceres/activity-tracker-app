import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AUTH_COOKIE } from './lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths through
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    const secret = process.env.SITE_PASSWORD;

    // If no password configured, allow through (local dev without auth)
    if (!secret) {
        return NextResponse.next();
    }

    const token = request.cookies.get(AUTH_COOKIE)?.value;

    if (!token || !(await verifyToken(token, secret))) {
        const loginUrl = new URL('/login', request.url);
        if (pathname !== '/') {
            loginUrl.searchParams.set('from', pathname);
        }
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.svg|favicon\\.ico|apple-touch-icon\\.png|manifest\\.json).*)',
    ],
};
