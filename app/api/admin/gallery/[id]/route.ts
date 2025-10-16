import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { galleryImageSchema } from '@/lib/validators'
import prisma from '@/lib/prisma'
import { UTApi } from 'uploadthing/server'

// Vercel configuration for file operations
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for file operations

const utapi = new UTApi()

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin()
        const { id } = await params

        // Find the existing image
        const existingImage = await prisma.galleryImage.findUnique({
            where: { id: parseInt(id) },
        })

        if (!existingImage) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            )
        }

        const formData = await request.formData()
        const category = formData.get('category') as string
        const caption = formData.get('caption') as string
        const categoryId = formData.get('categoryId') as string
        const url = formData.get('url') as string | null
        const publicId = formData.get('publicId') as string | null

        // Validate data
        const validatedData = galleryImageSchema.parse({
            category,
            caption: caption || undefined,
            categoryId: categoryId ? parseInt(categoryId) : undefined,
        })

        let finalUpdateData: {
            category: string;
            caption?: string | null;
            categoryId?: number | null;
            url?: string;
            publicId?: string;
        } = {
            category: validatedData.category,
            caption: validatedData.caption,
            categoryId: validatedData.categoryId,
        }

        // If new file URL and publicId provided (already uploaded via FileUpload component)
        if (url && publicId) {
            // STEP 1: Delete old file from UploadThing FIRST if it exists
            if (existingImage.publicId) {
                try {
                    console.log('🗑️ Replacing gallery image, deleting old file from UploadThing:', {
                        imageId: id,
                        oldPublicId: existingImage.publicId,
                        newPublicId: publicId
                    });
                    const deleteResult = await utapi.deleteFiles(existingImage.publicId);
                    console.log('✅ UploadThing deletion result:', deleteResult);

                    if (deleteResult.success) {
                        console.log('✅ Successfully deleted old file from UploadThing');
                    } else {
                        console.warn('⚠️ Old file may not have been deleted from UploadThing:', deleteResult);
                    }
                } catch (uploadThingError) {
                    console.error('❌ UploadThing deletion error:', uploadThingError);
                    // Continue with update even if old file deletion fails
                }
            }

            finalUpdateData = {
                ...finalUpdateData,
                url: url,
                publicId: publicId,
            }
        }

        // Update in database
        const updatedImage = await prisma.galleryImage.update({
            where: { id: parseInt(id) },
            data: finalUpdateData,
            include: {
                hotelCategory: {
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
            data: updatedImage,
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Admin gallery update error:', error)
        return NextResponse.json(
            { error: 'Failed to update image' },
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

        // Find the image first
        const image = await prisma.galleryImage.findUnique({
            where: { id: parseInt(id) },
        })

        if (!image) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            )
        }

        // STEP 1: Delete file from UploadThing FIRST (before database)
        if (image.publicId) {
            try {
                console.log('🗑️ Deleting gallery image from UploadThing:', {
                    imageId: id,
                    publicId: image.publicId,
                    url: image.url
                });
                const deleteResult = await utapi.deleteFiles(image.publicId);
                console.log('✅ UploadThing deletion result:', deleteResult);

                if (deleteResult.success) {
                    console.log('✅ Successfully deleted file from UploadThing:', image.publicId);
                } else {
                    console.warn('⚠️ File may not have been deleted from UploadThing:', deleteResult);
                }
            } catch (uploadThingError) {
                console.error('❌ UploadThing deletion error:', uploadThingError);
                // Continue with database deletion - better to clean up database
            }
        }

        // STEP 2: Delete from database
        await prisma.galleryImage.delete({
            where: { id: parseInt(id) },
        });

        console.log('✅ Gallery image deleted from database:', id)

        return NextResponse.json({
            success: true,
            message: 'Image deleted successfully',
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Admin gallery delete error:', error)
        return NextResponse.json(
            { error: 'Failed to delete image' },
            { status: 500 }
        )
    }
}