import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { galleryImageSchema } from '@/lib/validators'
import prisma from '@/lib/prisma'

// Vercel configuration for file operations
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for file operations

export async function GET() {
    try {
        await requireAdmin()

        const images = await prisma.galleryImage.findMany({
            include: {
                hotelCategory: {
                    select: {
                        id: true,
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
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Admin gallery fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch gallery images' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('🔵 POST /api/admin/gallery called');
        await requireAdmin()

        const contentType = request.headers.get('content-type')
        console.log('📋 Content-Type:', contentType);

        if (contentType?.includes('application/json')) {
            console.log('📦 Processing JSON request');
            // Handle JSON request (file already uploaded to UploadThing)
            const body = await request.json()
            console.log('📊 Request body:', JSON.stringify(body, null, 2));

            const { category, caption, url, publicId, categoryId } = body

            console.log('🔍 Extracted fields:', {
                category,
                caption,
                url: url?.substring(0, 50) + '...',
                publicId,
                categoryId
            });

            if (!url || !publicId) {
                console.error('❌ Missing required fields:', { hasUrl: !!url, hasPublicId: !!publicId });
                return NextResponse.json(
                    { error: 'URL and public ID are required' },
                    { status: 400 }
                )
            }

            // Validate data
            console.log('✅ Validating data with schema');
            const validatedData = galleryImageSchema.parse({
                category,
                caption: caption || undefined,
                categoryId: categoryId ? parseInt(categoryId) : undefined,
            })
            console.log('✅ Validation passed:', JSON.stringify(validatedData, null, 2));

            // Save to database (file already uploaded)
            console.log('💾 Creating database record...');
            const image = await prisma.galleryImage.create({
                data: {
                    category: validatedData.category,
                    url: url,
                    publicId: publicId,
                    caption: validatedData.caption,
                    categoryId: validatedData.categoryId,
                },
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
            console.log('✅ Database record created:', JSON.stringify(image, null, 2));

            return NextResponse.json({
                success: true,
                data: image,
            })
        } else {
            // Handle FormData request (upload file here)
            const formData = await request.formData()
            const file = formData.get('file') as File
            const category = formData.get('category') as string
            const caption = formData.get('caption') as string
            const categoryId = formData.get('categoryId') as string

            if (!file) {
                return NextResponse.json(
                    { error: 'No file provided' },
                    { status: 400 }
                )
            }

            // Validate file type - only allow images
            if (!file.type.startsWith('image/')) {
                return NextResponse.json(
                    { error: 'Only image files are allowed' },
                    { status: 400 }
                )
            }

            // Validate data
            const validatedData = galleryImageSchema.parse({
                category,
                caption: caption || undefined,
                categoryId: categoryId ? parseInt(categoryId) : undefined,
            })

            // Upload to UploadThing using our upload API
            const uploadFormData = new FormData()
            uploadFormData.append('file', file)

            const uploadResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/upload`, {
                method: 'POST',
                body: uploadFormData,
            })

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json()
                throw new Error(errorData.error || 'Upload failed')
            }

            const uploadResult = await uploadResponse.json()

            // Save to database
            const image = await prisma.galleryImage.create({
                data: {
                    category: validatedData.category,
                    url: uploadResult.secure_url,
                    publicId: uploadResult.public_id,
                    caption: validatedData.caption,
                    categoryId: validatedData.categoryId,
                },
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
                data: image,
            })
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Admin gallery upload error:', error)
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        )
    }
}