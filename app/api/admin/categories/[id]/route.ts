import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { categoryUpdateSchema } from '@/lib/validators'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { UTApi } from 'uploadthing/server'

// Vercel configuration for file operations
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for file operations

const utapi = new UTApi()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params

        const category = await prisma.hotelCategory.findUnique({
            where: { id: parseInt(id) },
            include: {
                prices: {
                    orderBy: {
                        hourlyHours: 'asc',
                    },
                },
                images: true,
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
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Admin category fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params

        const body = await request.json()
        console.log('Received body:', JSON.stringify(body, null, 2))

        const { prices, ...categoryData } = body
        console.log('Category data:', JSON.stringify(categoryData, null, 2))

        // Remove empty objects from categoryData
        const cleanCategoryData = Object.fromEntries(
            Object.entries(categoryData).filter(([, value]) => {
                // Remove empty objects and undefined/null values
                if (value === null || value === undefined) return false
                if (typeof value === 'object' && Object.keys(value).length === 0) return false
                if (typeof value === 'string' && value.trim() === '') return false
                return true
            })
        )
        console.log('Clean category data:', JSON.stringify(cleanCategoryData, null, 2))

        // If only prices are being updated, skip category validation
        let validatedCategoryData = null
        if (Object.keys(cleanCategoryData).length > 0) {
            // Only validate category data if it's being updated
            validatedCategoryData = categoryUpdateSchema.parse(cleanCategoryData)
        }

        // Use a transaction to update both category and prices
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Update the category only if category data is provided
            if (validatedCategoryData) {
                await tx.hotelCategory.update({
                    where: { id: parseInt(id) },
                    data: validatedCategoryData,
                })
            }

            // If prices are provided, update them
            if (prices && Array.isArray(prices)) {
                // Delete existing prices for this category
                await tx.price.deleteMany({
                    where: { categoryId: parseInt(id) },
                })

                // Create new prices (limit to 4)
                const limitedPrices = prices.slice(0, 4)
                if (limitedPrices.length > 0) {
                    await tx.price.createMany({
                        data: limitedPrices.map((price: {
                            hourlyHours: number;
                            rateCents: number;
                            label?: string;
                        }) => ({
                            categoryId: parseInt(id),
                            hourlyHours: price.hourlyHours,
                            rateCents: price.rateCents,
                            label: price.label || null,
                        })),
                    })
                }
            }

            // Return updated category with prices and images
            return await tx.hotelCategory.findUnique({
                where: { id: parseInt(id) },
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

        console.error('Admin category update error:', error)
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params

        // Get existing category with images and videos before deletion
        const existingCategory = await prisma.hotelCategory.findUnique({
            where: { id: parseInt(id) },
            include: {
                images: true
            }
        })

        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        // Collect file keys to delete from UploadThing
        const fileKeysToDelete: string[] = []

        // Add image public IDs
        existingCategory.images.forEach(image => {
            if (image.publicId) {
                fileKeysToDelete.push(image.publicId)
            }
        })

        // Add video URL if exists (extract key from videoUrl)
        if (existingCategory.videoUrl) {
            // Extract file key from UploadThing URL
            // Format: https://utfs.io/f/FILE_KEY
            const videoUrlMatch = existingCategory.videoUrl.match(/\/f\/([^/?]+)/)
            if (videoUrlMatch && videoUrlMatch[1]) {
                fileKeysToDelete.push(videoUrlMatch[1])
            }
        }

        console.log('🗑️ Deleting category with files:', {
            categoryId: id,
            title: existingCategory.title,
            filesToDelete: fileKeysToDelete.length
        })

        // Delete category from database (cascade will handle images and prices)
        await prisma.hotelCategory.delete({
            where: { id: parseInt(id) },
        })

        // Delete files from UploadThing (after database deletion)
        if (fileKeysToDelete.length > 0) {
            utapi.deleteFiles(fileKeysToDelete).catch(error => {
                console.error('❌ Failed to delete files from UploadThing:', error)
                // Continue even if file deletion fails (files already deleted from DB)
            })
            console.log('✅ Scheduled deletion of', fileKeysToDelete.length, 'files from UploadThing')
        }

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully',
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Admin category delete error:', error)
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        )
    }
}
