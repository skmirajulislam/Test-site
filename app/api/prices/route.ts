import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Vercel configuration for read operations
export const runtime = 'nodejs';
export const maxDuration = 15; // 15 seconds for read operations

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const categoryId = searchParams.get('categoryId')

        let prices

        if (categoryId) {
            // Get prices for specific category
            prices = await prisma.price.findMany({
                where: {
                    categoryId: parseInt(categoryId),
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            specs: true,
                        },
                    },
                },
                orderBy: {
                    hourlyHours: 'asc',
                },
            })
        } else {
            // Get all prices grouped by category
            prices = await prisma.price.findMany({
                include: {
                    category: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            specs: true,
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
        }

        return NextResponse.json({
            success: true,
            data: prices,
        })
    } catch (error) {
        console.error('Prices fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch prices' },
            { status: 500 }
        )
    }
}