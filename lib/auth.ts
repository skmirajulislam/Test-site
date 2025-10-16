import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

// Ensure JWT_SECRET is set in production
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production')
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only'
const TOKEN_EXPIRY = '8h'

// Types
export interface TokenPayload {
    userId: number
    email: string
    isAdmin: boolean
}

// Generate access token (fixed - removed exp from payload)
export function signToken(payload: TokenPayload): string {
    const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        isAdmin: payload.isAdmin
    }
    return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

// Verify token
export function verifyToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
        return {
            userId: decoded.userId,
            email: decoded.email,
            isAdmin: decoded.isAdmin
        }
    } catch (error) {
        console.error('Token verification failed:', error)
        return null
    }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

// Authenticate admin
export async function authenticateAdmin(email: string, password: string) {
    try {
        const admin = await prisma.admin.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                isActive: true
            }
        })

        if (!admin || !admin.isActive) {
            return null
        }

        const isPasswordValid = await verifyPassword(password, admin.password)
        if (!isPasswordValid) {
            return null
        }

        // Update last login
        await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLogin: new Date() }
        })

        return {
            id: admin.id,
            email: admin.email
        }
    } catch (error) {
        console.error('Authentication error:', error)
        return null
    }
}

// Authenticate user (keeping for potential future use)
export async function authenticateUser(email: string, password: string) {
    try {
        const admin = await prisma.admin.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                isActive: true
            }
        })

        if (!admin || !admin.isActive) {
            return { success: false, error: 'Invalid credentials' }
        }

        const isPasswordValid = await verifyPassword(password, admin.password)
        if (!isPasswordValid) {
            return { success: false, error: 'Invalid credentials' }
        }

        return {
            success: true,
            user: {
                id: admin.id,
                email: admin.email,
                isAdmin: true
            }
        }
    } catch (error) {
        console.error('Authentication error:', error)
        return { success: false, error: 'Authentication failed' }
    }
}

// Create session (updated for admin)
export async function createSession(admin: { id: number; email: string }) {
    try {
        const payload: TokenPayload = {
            userId: admin.id,
            email: admin.email,
            isAdmin: true
        }

        const accessToken = signToken(payload)

        // Store session in database
        const tokenId = `${admin.id}_${Date.now()}`
        await prisma.adminSession.create({
            data: {
                adminId: admin.id,
                tokenId,
                expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours
            }
        })

        return { accessToken, admin }
    } catch (error) {
        console.error('Session creation error:', error)
        throw new Error('Failed to create session')
    }
}

// Invalidate session
export async function invalidateSession(adminId: number) {
    try {
        await prisma.adminSession.deleteMany({
            where: { adminId }
        })
        return { success: true }
    } catch (error) {
        console.error('Session invalidation error:', error)
        return { success: false, error: 'Failed to invalidate session' }
    }
}

// Create auth cookie
export function createAuthCookie(token: string) {
    return {
        name: 'auth-token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 8 * 60 * 60, // 8 hours
        path: '/'
    }
}

// Clear auth cookie
export function clearAuthCookie() {
    return {
        name: 'auth-token',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 0,
        path: '/'
    }
}

// Get admin from request
export async function getAdminFromRequest(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
            request.cookies.get('auth-token')?.value

        if (!token) return null

        const payload = verifyToken(token)
        if (!payload || !payload.isAdmin) return null

        // Verify admin still exists and is active
        const admin = await prisma.admin.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, isActive: true }
        })

        if (!admin || !admin.isActive) return null

        return admin
    } catch (error) {
        console.error('Get admin from request error:', error)
        return null
    }
}

// Clean expired sessions
export async function cleanExpiredSessions() {
    try {
        await prisma.adminSession.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        })
    } catch (error) {
        console.error('Clean expired sessions error:', error)
    }
}// Get session
export async function getSession(request?: NextRequest) {
    try {
        let token: string | undefined

        if (request) {
            token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('auth-token')?.value
        } else {
            const cookieStore = cookies()
            token = (await cookieStore).get('auth-token')?.value
        }

        if (!token) return null

        const payload = verifyToken(token)
        if (!payload) return null

        return {
            user: {
                id: payload.userId,
                email: payload.email,
                isAdmin: payload.isAdmin
            },
            token
        }
    } catch (error) {
        console.error('Session retrieval error:', error)
        return null
    }
}

// Require admin access
export async function requireAdmin(request?: NextRequest) {
    const session = await getSession(request)

    if (!session) {
        throw new Error('Authentication required')
    }

    if (!session.user.isAdmin) {
        throw new Error('Admin access required')
    }

    return session
}

// Clear session
export async function clearSession() {
    try {
        const cookieStore = cookies()

            ; (await cookieStore).set('auth-token', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 0
            })

        return { success: true }
    } catch (error) {
        console.error('Session clear error:', error)
        return { success: false, error: 'Failed to clear session' }
    }
}
