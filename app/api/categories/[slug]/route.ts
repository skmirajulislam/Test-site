import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Vercel configuration for read operations
export const runtime = 'nodejs';
export const maxDuration = 15; // 15 seconds for read operations

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        const category = await prisma.hotelCategory.findUnique({
            where: { slug },
            include: {
                prices: {
                    orderBy: {
                        hourlyHours: 'asc',
                    },
                },
                images: {
                    select: {
                        id: true,
                        url: true,
                        caption: true,
                    },
                },
            },
        })

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: category,
        })
    } catch (error) {
        console.error('Category fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        )
    }
}