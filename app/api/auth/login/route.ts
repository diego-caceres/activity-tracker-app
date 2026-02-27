import { NextResponse } from 'next/server';
import { createToken, AUTH_COOKIE, COOKIE_MAX_AGE } from '@/lib/auth';

export async function POST(request: Request) {
    const { password } = await request.json();

    const sitePassword = process.env.SITE_PASSWORD;

    if (!sitePassword) {
        return NextResponse.json({ error: 'Auth not configured on the server.' }, { status: 500 });
    }

    if (password !== sitePassword) {
        return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    const token = await createToken(sitePassword);

    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
    });

    return response;
}
