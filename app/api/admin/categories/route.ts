import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { categorySchema } from '@/lib/validators'
import prisma from '@/lib/prisma'

// Vercel configuration for database operations
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds for database operations

export async function GET() {
    try {
        await requireAdmin()

        const categories = await prisma.hotelCategory.findMany({
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
                _count: {
                    select: {
                        prices: true,
                        images: true,
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
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Admin categories fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdmin()

        const body = await request.json()
        const validatedData = categorySchema.parse(body)

        // Create the category with transaction to also create default prices
        const result = await prisma.$transaction(async (tx) => {
            // Create the category first
            const category = await tx.hotelCategory.create({
                data: validatedData,
            })

            // Create default pricing tiers for the new room
            const defaultPrices = [
                { hourlyHours: 2, rateCents: 50000, label: '2 Hours' }, // $500.00
                { hourlyHours: 4, rateCents: 80000, label: '4 Hours' }, // $800.00
                { hourlyHours: 24, rateCents: 150000, label: '24 Hours' }, // $1500.00
            ]

            await tx.price.createMany({
                data: defaultPrices.map(price => ({
                    ...price,
                    categoryId: category.id,
                })),
            })

            // Return category with prices and images
            return await tx.hotelCategory.findUnique({
                where: { id: category.id },
                include: {
                    prices: {
                        orderBy: {
                            hourlyHours: 'asc',
                        },
                    },
                    images: true,
                },
            })
        })

        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Admin category create error:', error)
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        )
    }
}