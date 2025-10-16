"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ROOM_SPECS } from "@/lib/config";
import {
  Wifi,
  Snowflake,
  Tv,
  Droplets,
  Video,
  Car,
  ShowerHead,
} from "lucide-react";
import Image from "next/image";
import Modal from "./Modal";
import RoomDetailsModal from "./RoomDetailsModal";

interface CategoryCardProps {
  category: {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    specs: Record<string, boolean>;
    essentialAmenities?: string[];
    bedType?: string | null;
    maxOccupancy?: number | null;
    roomSize?: string | null;
    roomCount: number;
    videoUrl?: string | null;
    images: Array<{
      id: number;
      url: string;
      caption: string | null;
    }>;
    prices?: Array<{
      id: number;
      hourlyHours: number;
      rateCents: number;
    }>;
  };
}

const SPEC_ICONS = {
  wifi: Wifi,
  ac: Snowflake,
  tv: Tv,
  geyser: Droplets,
  cctv: Video,
  parking: Car,
  attached: ShowerHead,
} as const;

const getSpecIcon = (spec: string) => {
  const IconComponent = SPEC_ICONS[spec as keyof typeof SPEC_ICONS];
  return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const mainImage = category.images[0]?.url || "/placeholder-room.svg";
  const hasVideo = Boolean(category.videoUrl?.trim());

  // Memoized room data to prevent unnecessary re-renders
  const roomData = useCallback(
    () => ({
      id: category.id,
      title: category.title,
      description: category.description || "",
      specs: category.specs,
      essentialAmenities: category.essentialAmenities || [],
      bedType: category.bedType || undefined,
      maxOccupancy: category.maxOccupancy || undefined,
      roomSize: category.roomSize || undefined,
      images: category.images,
      videoUrl: category.videoUrl || undefined,
    }),
    [category]
  );

  // Optimized video loading - only load when card is hovered
  useEffect(() => {
    if (hasVideo && isCardHovered && !videoError && !showVideo) {
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 200); // Small delay for smooth transition

      return () => clearTimeout(timer);
    }
  }, [hasVideo, isCardHovered, videoError, showVideo]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleVideoError = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      console.error("❌ Video failed to load:", category.videoUrl, e);
      setVideoError(true);
      setShowVideo(false);

      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Retry loading after delay (helps with network issues)
      retryTimeoutRef.current = setTimeout(() => {
        if (videoRef.current && hasVideo) {
          setVideoError(false);
          videoRef.current.load();
        }
      }, 3000);
    },
    [category.videoUrl, hasVideo]
  );

  const handleVideoLoad = useCallback(() => {
    console.log("✅ Video loaded successfully:", category.videoUrl);
    setVideoLoaded(true);
    setVideoError(false);
  }, [category.videoUrl]);

  const handleVideoCanPlay = useCallback(() => {
    setVideoLoaded(true);
    if (videoRef.current) {
      // Use requestAnimationFrame for smooth playback start
      requestAnimationFrame(() => {
        videoRef.current?.play().catch((error) => {
          console.warn("Video autoplay failed:", error);
          // Autoplay failed, but video is still loaded
        });
      });
    }
  }, []);

  const handleVideoLoadStart = useCallback(() => {
    console.log("🔄 Video loading started:", category.videoUrl);
    setVideoLoaded(false);
  }, [category.videoUrl]);

  const handleMouseEnter = useCallback(() => {
    setIsCardHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsCardHovered(false);
  }, []);

  const handleModalOpen = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Memoize filtered specs to prevent recalculation
  const activeSpecs = useCallback(() => {
    if (!category.specs) return [];

    return Object.entries(category.specs)
      .filter(([, value]) => value)
      .map(([spec]) => ({
        key: spec,
        label: ROOM_SPECS[spec as keyof typeof ROOM_SPECS] || spec,
        icon: getSpecIcon(spec),
      }));
  }, [category.specs]);

  const specs = activeSpecs();

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-[32rem] cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleModalOpen}
      >
        {/* Image or Video Container */}
        <div className="relative h-48 overflow-hidden group">
          {/* Base Image - Always present for fast loading */}
          <Image
            src={mainImage}
            alt={category.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-room.svg';
            }}
          />

          {/* Video Overlay - Only render when needed */}
          {hasVideo && showVideo && !videoError && (
            <div className="absolute inset-0">
              <video
                ref={videoRef}
                src={category.videoUrl!}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: videoLoaded ? 1 : 0 }}
                poster={mainImage}
                onError={handleVideoError}
                onLoadedData={handleVideoLoad}
                onCanPlay={handleVideoCanPlay}
                onLoadStart={handleVideoLoadStart}
              />
            </div>
          )}

          {/* Loading indicator for video */}
          {hasVideo && showVideo && !videoLoaded && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
            {/* Video Badge */}
            {hasVideo && (
              <div className="bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                <Video className="w-3 h-3" />
                Video
              </div>
            )}

            {/* Availability Badge */}
            <div className="bg-yellow-400/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              {category.roomCount} Available
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 line-clamp-1">
            {category.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
            {category.description}
          </p>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 h-25">
              {specs.map(({ key, label, icon }) => (
                <div
                  key={key}
                  className="flex items-center gap-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors duration-200"
                >
                  <span className="text-gray-500">{icon}</span>
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleModalOpen}
              className="bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Only render when needed */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          title={category.title}
          maxWidth="max-w-4xl"
        >
          <RoomDetailsModal room={roomData()} onClose={handleModalClose} />
        </Modal>
      )}
    </>
  );
}
