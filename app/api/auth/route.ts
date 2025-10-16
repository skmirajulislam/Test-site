import { NextRequest, NextResponse } from 'next/server'
import {
    authenticateAdmin,
    createSession,
    invalidateSession,
    createAuthCookie,
    clearAuthCookie,
    getAdminFromRequest,
    cleanExpiredSessions
} from '@/lib/auth'
import { loginSchema } from '@/lib/validators'

// Vercel configuration for auth operations
export const runtime = 'nodejs';
export const maxDuration = 20; // 20 seconds for auth operations

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = loginSchema.parse(body)

        // Authenticate admin
        const admin = await authenticateAdmin(email, password)

        if (!admin) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Create secure session
        const { accessToken } = await createSession(admin)

        // Create response
        const response = NextResponse.json({
            success: true,
            admin: {
                id: admin.id,
                email: admin.email,
            },
        })

        // Set secure auth cookies
        const cookieOptions = createAuthCookie(accessToken)
        response.cookies.set(cookieOptions)

        // Clean up expired sessions in background
        cleanExpiredSessions().catch(error =>
            console.error('Failed to clean expired sessions:', error)
        )

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Get current admin to invalidate their sessions
        const admin = await getAdminFromRequest(request)

        if (admin) {
            // Invalidate all sessions for this admin
            await invalidateSession(admin.id)
        }

        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        })

        // Clear auth cookie
        const cookieOptions = clearAuthCookie()
        response.cookies.set(cookieOptions)

        return response
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}