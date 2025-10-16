"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

interface FileUploadProps {
  onFileUpload: (fileUrl: string, publicId?: string) => void;
  currentImage?: string;
  label?: string;
  fileType?: "image" | "video" | "both";
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  currentImage,
  label,
  fileType = "image",
  onUploadStart,
  onUploadEnd,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload } = useUploadThing("mediaUploader", {
    onClientUploadComplete: (files) => {
      console.log('📤 FileUpload - Upload complete, files:', files);
      if (files && files[0]) {
        // Use file.url (stable property)
        const fileUrl = files[0].url;
        const publicId = files[0].key;

        console.log('📊 FileUpload - Extracted data:', {
          fileUrl,
          publicId,
          hasUrl: !!files[0].url,
          hasKey: !!files[0].key,
          fullFile: JSON.stringify(files[0], null, 2)
        });

        onFileUpload(fileUrl, publicId);
        setUploading(false);
        setUploadProgress(0);
        onUploadEnd?.();
      }
    },
    onUploadError: (error: Error) => {
      setError(error.message || "Upload failed. Please try again.");
      setUploading(false);
      setUploadProgress(0);
      onUploadEnd?.();
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type.startsWith('video/') && (fileType === "video" || fileType === "both")) {
      const video = document.createElement('video');
      video.preload = 'metadata';

      const checkDuration = new Promise<boolean>((resolve) => {
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          const duration = video.duration;
          resolve(duration <= 60);
        };
        video.onerror = () => {
          resolve(false);
        };
      });

      video.src = URL.createObjectURL(file);

      const isValidDuration = await checkDuration;
      if (!isValidDuration) {
        setError("Video duration must be 60 seconds or less.");
        return;
      }
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (isImage && file.size > 4 * 1024 * 1024) {
      setError("Image file too large. Maximum size is 4MB.");
      return;
    }

    if (isVideo && file.size > 64 * 1024 * 1024) {
      setError("Video file too large. Maximum size is 64MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    onUploadStart?.();

    try {
      await startUpload([file]);
    } catch (err) {
      const fileTypeText = fileType === 'video' ? 'video' : 'image';
      setError("Failed to upload " + fileTypeText + ". Please try again.");
      console.error("Upload error:", err);
      setUploading(false);
      setUploadProgress(0);
      onUploadEnd?.();
    }
  }, [fileType, onUploadStart, onUploadEnd, startUpload]);
  // Note: onFileUpload is called directly, not in dependency array

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileType === "video"
      ? { 'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'] }
      : fileType === "both"
        ? {
          'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
          'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
        }
        : { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: false,
    disabled: uploading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const clearPreview = () => {
    setPreview(null);
    setError(null);
    setUploadProgress(0);
  };

  const getFileTypeIcon = () => {
    return <ImageIcon className="h-12 w-12 text-gray-400" />;
  };

  const getDropText = () => {
    if (isDragActive || dragActive) {
      const typeText = fileType === "video" ? "video" : fileType === "both" ? "file" : "image";
      return "Drop the " + typeText + " here";
    }
    const typeText = fileType === "video" ? "video" : fileType === "both" ? "image or video" : "image";
    return "Drag & drop " + typeText + " here";
  };

  const getSelectText = () => {
    if (fileType === "video") return "a video";
    if (fileType === "both") return "a file";
    return "an image";
  };

  const getSizeText = () => {
    if (fileType === "video") return "MP4, MOV, AVI, MKV, WEBM (max 64MB)";
    if (fileType === "both") return "Images (max 4MB), Videos (max 64MB, ≤60s)";
    return "PNG, JPG, GIF, WEBP (max 4MB)";
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative w-full h-48 mb-3 group">
          <Image
            src={preview}
            alt="Preview"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover rounded-lg border border-gray-200"
            loading="lazy"
          />

          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            type="button"
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${isDragActive || dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-3"></div>
                {uploadProgress > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{uploadProgress}%</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Uploading... {uploadProgress > 0 ? uploadProgress + '%' : ''}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {isDragActive || dragActive ? (
                <Upload className="h-12 w-12 text-blue-500 mb-3" />
              ) : (
                getFileTypeIcon()
              )}

              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {getDropText()}
                </p>
                <p className="text-xs text-gray-500">
                  or click to select {getSelectText()}
                </p>

                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {getSizeText()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: uploadProgress + '%' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
