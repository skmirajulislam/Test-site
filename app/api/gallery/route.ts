import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { GALLERY_CATEGORIES } from '@/lib/config'

// Vercel configuration for read operations
export const runtime = 'nodejs';
export const maxDuration = 15; // 15 seconds for read operations

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')

        let whereClause = {}

        if (category && GALLERY_CATEGORIES.includes(category as typeof GALLERY_CATEGORIES[number])) {
            whereClause = { category }
        }

        const images = await prisma.galleryImage.findMany({
            where: whereClause,
            select: {
                id: true,
                category: true,
                url: true,
                caption: true,
                categoryId: true,
                hotelCategory: {
                    select: {
                        title: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json({
            success: true,
            data: images,
            categories: GALLERY_CATEGORIES,
        })
    } catch (error) {
        console.error('Gallery fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch gallery images' },
            { status: 500 }
        )
    }
}