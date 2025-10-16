import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { priceSchema } from '@/lib/validators'
import prisma from '@/lib/prisma'

// Vercel configuration for database operations
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds for database operations

export async function GET() {
    try {
        await requireAdmin()

        const prices = await prisma.price.findMany({
            include: {
                category: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
            orderBy: [
                {
                    category: {
                        title: 'asc',
                    },
                },
                {
                    hourlyHours: 'asc',
                },
            ],
        })

        return NextResponse.json({
            success: true,
            data: prices,
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Admin prices fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch prices' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdmin()

        const body = await request.json()
        const validatedData = priceSchema.parse(body)

        const price = await prisma.price.create({
            data: validatedData,
            include: {
                category: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
        })

        return NextResponse.json({
            success: true,
            data: price,
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Admin price create error:', error)
        return NextResponse.json(
            { error: 'Failed to create price' },
            { status: 500 }
        )
    }
}