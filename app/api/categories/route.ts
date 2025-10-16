import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Vercel configuration for read operations
export const runtime = 'nodejs';
export const maxDuration = 15; // 15 seconds for read operations

export async function GET() {
    try {
        const categories = await prisma.hotelCategory.findMany({
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                specs: true,
                essentialAmenities: true,
                bedType: true,
                maxOccupancy: true,
                roomSize: true,
                videoUrl: true,
                roomCount: true,
                images: {
                    select: {
                        id: true,
                        url: true,
                        caption: true,
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                prices: {
                    select: {
                        id: true,
                        hourlyHours: true,
                        rateCents: true,
                    },
                    orderBy: {
                        hourlyHours: 'asc',
                    },
                },
                _count: {
                    select: {
                        prices: true,
                    },
                },
            },
            orderBy: {
                title: 'asc',
            },
        })

        return NextResponse.json({
            success: true,
            data: categories,
        })
    } catch (error) {
        console.error('Categories fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}