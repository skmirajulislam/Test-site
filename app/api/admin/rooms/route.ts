import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UTApi } from 'uploadthing/server';

// Vercel configuration for file operations
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for file operations

const utapi = new UTApi();

// GET - Fetch all rooms (categories)
export async function GET() {
    try {
        const rooms = await prisma.hotelCategory.findMany({
            include: {
                images: {
                    orderBy: { createdAt: 'asc' }
                },
                prices: {
                    orderBy: { hourlyHours: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Debug: Log video URLs
        rooms.forEach(room => {
            if (room.videoUrl) {
                console.log('Room with video in DB:', room.title, 'Video URL:', room.videoUrl);
            }
        });

        return NextResponse.json(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return NextResponse.json(
            { error: "Failed to fetch rooms" },
            { status: 500 }
        );
    }
}

// POST - Create a new room
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const {
            title,
            description,
            specs,
            essentialAmenities,
            roomCount,
            images,
            videos
        } = data;

        // Debug: Log all received data
        console.log('🔵 POST /api/admin/rooms - Received data:', {
            title,
            roomCount,
            imagesCount: images?.length || 0,
            images: images,
            videosCount: videos?.length || 0,
            videos: videos
        });

        // Generate slug from title
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Create room (hotel category) with images
        const room = await prisma.hotelCategory.create({
            data: {
                slug,
                title,
                description: description || '',
                specs,
                essentialAmenities: essentialAmenities || [],
                roomCount: roomCount || 0,
                videoUrl: videos && videos.length > 0 ? videos[0].url : null,
                images: {
                    create: images?.map((imageData: { url: string, publicId: string }, index: number) => ({
                        category: 'Rooms',
                        url: imageData.url,
                        publicId: imageData.publicId,
                        caption: `${title} - Image ${index + 1}`
                    })) || []
                }
            },
            include: {
                images: true,
                prices: true
            }
        });

        console.log('✅ Room created with images:', {
            roomId: room.id,
            title: room.title,
            imagesCreated: room.images.length
        });

        return NextResponse.json(room, { status: 201 });
    } catch (error) {
        console.error("Error creating room:", error);
        return NextResponse.json(
            { error: "Failed to create room" },
            { status: 500 }
        );
    }
}

// PUT - Update a room
export async function PUT(request: NextRequest) {
    try {
        const data = await request.json();
        const {
            id,
            title,
            description,
            specs,
            essentialAmenities,
            roomCount,
            images,
            videos
        } = data;

        // Debug: Log video data being received for update
        console.log('Updating room:', title);
        console.log('Videos received for update:', videos);
        console.log('Video URL to store for update:', videos && videos.length > 0 ? videos[0].url : null);

        if (!id) {
            return NextResponse.json(
                { error: "Room ID is required" },
                { status: 400 }
            );
        }

        // Update slug if title changed
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // Get existing room data to clean up UploadThing files
        const existingRoom = await prisma.hotelCategory.findUnique({
            where: { id },
            include: {
                images: true
            }
        });

        if (!existingRoom) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        // Collect file keys to delete from UploadThing (ONLY files being replaced)
        const fileKeysToDelete: string[] = [];
        const newImageKeys = new Set((images || []).map((img: { publicId: string }) => img.publicId));
        const newVideoUrl = videos && videos.length > 0 ? videos[0].url : null;

        // Delete OLD images that are NOT in the new images array
        existingRoom.images.forEach(image => {
            if (image.publicId && !newImageKeys.has(image.publicId)) {
                fileKeysToDelete.push(image.publicId);
                console.log('🗑️ Marking old image for deletion:', image.publicId);
            }
        });

        // Delete OLD video if it's being replaced with a new one or removed
        if (existingRoom.videoUrl && existingRoom.videoUrl.trim() !== '') {
            // Check if the video is being replaced or removed
            const isSameVideo = existingRoom.videoUrl === newVideoUrl;

            if (!isSameVideo) {
                console.log('🎥 Processing old videoUrl for deletion:', existingRoom.videoUrl);

                // Extract file key from UploadThing URL
                const patterns = [
                    /\/f\/([^/?#]+)/,           // Standard: /f/FILE_KEY
                    /\/a\/[^/]+\/([^/?#]+)/,    // App URL: /a/APP_ID/FILE_KEY
                    /uploadthing.*?\/([^/?#]+)$/, // uploadthing URL with key at end
                    /utfs\.io\/[af]\/(?:[^/]+\/)?([^/?#]+)/,   // Full utfs.io URL
                ];

                let videoKey: string | null = null;
                for (const pattern of patterns) {
                    const match = existingRoom.videoUrl.match(pattern);
                    if (match && match[1]) {
                        videoKey = match[1];
                        console.log(`✅ Extracted old video key for deletion:`, videoKey);
                        break;
                    }
                }

                if (videoKey) {
                    fileKeysToDelete.push(videoKey);
                } else {
                    console.warn('⚠️ Could not extract video key from URL:', existingRoom.videoUrl);
                }
            } else {
                console.log('ℹ️ Video unchanged, keeping existing video');
            }
        }

        console.log('🔄 Updating room, deleting replaced files only:', {
            roomId: id,
            title: existingRoom.title,
            oldImagesCount: existingRoom.images.length,
            newImagesCount: images?.length || 0,
            oldVideo: existingRoom.videoUrl,
            newVideo: newVideoUrl,
            filesToDelete: fileKeysToDelete.length,
            fileKeys: fileKeysToDelete
        });

        // STEP 1: Delete files from UploadThing FIRST (wait for completion)
        if (fileKeysToDelete.length > 0) {
            try {
                console.log('🗑️ Deleting files from UploadThing:', fileKeysToDelete);
                const deleteResult = await utapi.deleteFiles(fileKeysToDelete);
                console.log('✅ UploadThing deletion result:', deleteResult);

                if (deleteResult.success) {
                    console.log('✅ Successfully deleted', fileKeysToDelete.length, 'files from UploadThing');
                } else {
                    console.warn('⚠️ Some files may not have been deleted from UploadThing:', deleteResult);
                }
            } catch (error) {
                console.error('❌ Failed to delete files from UploadThing:', error);
                // Continue with database update even if UploadThing deletion fails
                // This prevents orphaned database records
            }
        }

        // STEP 2: Delete existing images from database
        await prisma.galleryImage.deleteMany({
            where: { categoryId: id }
        });

        // Update room with new data
        const room = await prisma.hotelCategory.update({
            where: { id },
            data: {
                slug,
                title,
                description: description || '',
                specs,
                essentialAmenities: essentialAmenities || [],
                roomCount: roomCount || 0,
                videoUrl: videos && videos.length > 0 ? videos[0].url : null,
                images: {
                    create: images?.map((imageData: { url: string, publicId: string }, index: number) => ({
                        category: 'Rooms',
                        url: imageData.url,
                        publicId: imageData.publicId,
                        caption: `${title} - Image ${index + 1}`
                    })) || []
                }
            },
            include: {
                images: true,
                prices: true
            }
        });

        return NextResponse.json(room);
    } catch (error) {
        console.error("Error updating room:", error);
        return NextResponse.json(
            { error: "Failed to update room" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a room
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: "Room ID is required" },
                { status: 400 }
            );
        }

        // Get existing room data to clean up UploadThing files
        const existingRoom = await prisma.hotelCategory.findUnique({
            where: { id: parseInt(id) },
            include: {
                images: true
            }
        });

        if (!existingRoom) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        // Collect file keys to delete from UploadThing
        const fileKeysToDelete: string[] = [];

        // Add image public IDs
        existingRoom.images.forEach(image => {
            if (image.publicId) {
                fileKeysToDelete.push(image.publicId);
            }
        });

        // Add video public IDs if they exist
        const roomWithVideos = existingRoom as typeof existingRoom & {
            videos?: Array<{ publicId?: string | null }>;
        };
        if (roomWithVideos.videos && roomWithVideos.videos.length > 0) {
            roomWithVideos.videos.forEach((video) => {
                if (video.publicId) {
                    fileKeysToDelete.push(video.publicId);
                }
            });
        }

        // Also check videoUrl field for videos (extract key from URL)
        if (existingRoom.videoUrl && existingRoom.videoUrl.trim() !== '') {
            console.log('🎥 Processing videoUrl:', existingRoom.videoUrl);

            // Extract file key from UploadThing URL
            // Format: https://utfs.io/f/FILE_KEY or similar patterns
            const patterns = [
                /\/f\/([^/?#]+)/,           // Standard: /f/FILE_KEY
                /uploadthing.*?\/([^/?#]+)$/, // uploadthing URL with key at end
                /utfs\.io\/f\/([^/?#]+)/,   // Full utfs.io URL
            ];

            let videoKey: string | null = null;
            for (const pattern of patterns) {
                const match = existingRoom.videoUrl.match(pattern);
                if (match && match[1]) {
                    videoKey = match[1];
                    console.log(`✅ Extracted video key using pattern ${pattern}:`, videoKey);
                    break;
                }
            }

            if (videoKey) {
                fileKeysToDelete.push(videoKey);
            } else {
                console.warn('⚠️ Could not extract video key from URL:', existingRoom.videoUrl);
            }
        }

        console.log('🗑️ Deleting room with files:', {
            roomId: id,
            title: existingRoom.title,
            imagesCount: existingRoom.images.length,
            hasVideo: !!existingRoom.videoUrl,
            totalFilesToDelete: fileKeysToDelete.length,
            fileKeys: fileKeysToDelete
        });

        // STEP 1: Delete files from UploadThing FIRST (wait for completion)
        if (fileKeysToDelete.length > 0) {
            try {
                console.log('🗑️ Deleting files from UploadThing:', fileKeysToDelete);
                const deleteResult = await utapi.deleteFiles(fileKeysToDelete);
                console.log('✅ UploadThing deletion result:', deleteResult);

                if (deleteResult.success) {
                    console.log('✅ Successfully deleted', fileKeysToDelete.length, 'files from UploadThing');
                } else {
                    console.warn('⚠️ Some files may not have been deleted from UploadThing:', deleteResult);
                }
            } catch (error) {
                console.error('❌ Failed to delete files from UploadThing:', error);
                // Log error but continue - better to clean up database than leave orphaned records
            }
        }

        // STEP 2: Delete room and related data from database (cascade will handle images and prices)
        await prisma.hotelCategory.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        return NextResponse.json(
            { error: "Failed to delete room" },
            { status: 500 }
        );
    }
}