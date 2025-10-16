import { NextRequest, NextResponse } from 'next/server'
import { UTApi } from "uploadthing/server";

// Force Node.js runtime and allow longer processing time
export const runtime = 'nodejs'
export const maxDuration = 60

const utapi = new UTApi();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate type
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Only image and video files are allowed' },
        { status: 400 }
      )
    }

    // Check video size limit (64MB for UploadThing free tier)
    if (isVideo && file.size > 64 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Video file too large. Maximum size is 64MB.' },
        { status: 400 }
      )
    }

    // Check image size limit (4MB)
    if (isImage && file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image file too large. Maximum size is 4MB.' },
        { status: 400 }
      )
    }

    // Upload to UploadThing
    const response = await utapi.uploadFiles(file);

    if (response.error) {
      console.error('UploadThing upload error:', response.error);
      return NextResponse.json(
        { error: 'Upload failed', details: response.error.message },
        { status: 500 }
      )
    }

    const uploadedFile = response.data;

    return NextResponse.json({
      success: true,
      secure_url: uploadedFile.url,
      public_id: uploadedFile.key, // UploadThing uses 'key' instead of 'public_id'
      url: uploadedFile.url,
      key: uploadedFile.key,
      name: uploadedFile.name,
      size: uploadedFile.size,
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Upload error details:', error.message)
      return NextResponse.json(
        { error: 'Upload failed', details: error.message },
        { status: 500 }
      )
    }

    console.error('Upload error details (non-Error):', error)
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')
    const fileKey = searchParams.get('key') || publicId // Support both 'key' and 'publicId'

    if (!fileKey) {
      return NextResponse.json({ error: 'File key or public ID is required' }, { status: 400 })
    }

    // Delete from UploadThing
    await utapi.deleteFiles(fileKey);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      key: fileKey,
    })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Delete error:', error.message)
      return NextResponse.json(
        { error: 'Delete failed', details: error.message },
        { status: 500 }
      )
    }

    console.error('Delete error (non-Error):', error)
    return NextResponse.json(
      { error: 'Delete failed', details: String(error) },
      { status: 500 }
    )
  }
}

