import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require admin authentication
const PROTECTED_ROUTES = [
    '/admin/dashboard',
    '/api/admin'
]

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the current route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname.startsWith(route)
    )

    // Allow login page and auth API
    if (pathname === '/admin/login' || pathname === '/api/auth') {
        return NextResponse.next()
    }

    if (isProtectedRoute) {
        // Check for auth token (just presence, not verification)
        const token = request.cookies.get('auth-token')?.value

        if (!token) {
            // Redirect to login page if no token
            const loginUrl = new URL('/admin/login', request.url)
            return NextResponse.redirect(loginUrl)
        }

        // Token exists, let the request proceed
        // JWT verification will happen in the actual API routes/components
        return NextResponse.next()
    }

    return NextResponse.next()
}

// Configure which paths this middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         */
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
}