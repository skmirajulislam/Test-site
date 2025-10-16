"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Users, Bed, Maximize, Eye, X } from "lucide-react";

interface RoomImage {
    id: number;
    url: string;
    caption: string | null;
}

interface Room {
    id: number;
    title: string;
    description: string;
    specs?: Record<string, boolean>; // e.g. { ac: true, wifi: true, tv: true, geyser: true, cctv: true, parking: true }
    essentialAmenities?: string[]; // essential amenities list
    bedType?: string;
    maxOccupancy?: number;
    roomSize?: string;
    images: RoomImage[];
    videoUrl?: string; // Add video support
}

interface RoomDetailsModalProps {
    room: Room;
    onClose?: () => void;
}

interface RoomFeature {
    id: number;
    key: string;
    label: string;
    description?: string;
    category: string;
    isActive: boolean;
    sortOrder: number;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ room, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [roomFeatures, setRoomFeatures] = useState<RoomFeature[]>([]);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [videoError, setVideoError] = useState(false);
    const router = useRouter();

    // Fetch room features from API
    useEffect(() => {
        const abortController = new AbortController();

        const fetchRoomFeatures = async () => {
            try {
                const response = await fetch('/api/room-features', {
                    signal: abortController.signal
                });
                if (response.ok) {
                    const data = await response.json();
                    setRoomFeatures(data.data || []);
                }
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    console.log('Room features fetch aborted');
                    return;
                }
                console.error('Failed to fetch room features:', error);
            }
        };

        fetchRoomFeatures();

        return () => {
            abortController.abort();
        };
    }, []);

    // Keyboard navigation for image modal
    useEffect(() => {
        if (!isImageModalOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'Escape':
                    setIsImageModalOpen(false);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    setSelectedImageIndex(prev =>
                        prev === 0 ? room.images.length - 1 : prev - 1
                    );
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    setSelectedImageIndex(prev =>
                        (prev + 1) % room.images.length
                    );
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isImageModalOpen, room.images.length]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isImageModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isImageModalOpen]);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % room.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? room.images.length - 1 : prev - 1
        );
    };

    const handleVideoError = () => {
        setVideoError(true);
        console.error('Video failed to load:', room.videoUrl);
    };

    const handlePricingClick = () => {
        onClose?.();
        router.push('/prices');
    };

    // Get room specifications for display
    const getRoomSpecs = () => {
        const defaultSpecs = {
            bedType: 'Double Bed',
            maxOccupancy: '2 Guests',
            roomSize: '25 sqm'
        };

        return {
            bedType: room.bedType || defaultSpecs.bedType,
            maxOccupancy: room.maxOccupancy ? `${room.maxOccupancy} Guests` : defaultSpecs.maxOccupancy,
            roomSize: room.roomSize || defaultSpecs.roomSize
        };
    };

    // Get features from specs with proper labels
    const getActiveFeatures = () => {
        if (!room.specs) return [];

        return Object.entries(room.specs)
            .filter(([, value]) => value)
            .map(([key]) => {
                const feature = roomFeatures.find(f => f.key === key);
                return {
                    key,
                    label: feature?.label || key.charAt(0).toUpperCase() + key.slice(1),
                    category: feature?.category || 'general'
                };
            });
    };

    // Group features by category
    const groupedFeatures = () => {
        const activeFeatures = getActiveFeatures();
        const grouped: Record<string, typeof activeFeatures> = {};

        activeFeatures.forEach(feature => {
            if (!grouped[feature.category]) {
                grouped[feature.category] = [];
            }
            grouped[feature.category].push(feature);
        });

        return grouped;
    };

    const roomSpecs = getRoomSpecs();
    const featuresGrouped = groupedFeatures();

    return (
        <div className="space-y-0">
            {/* Video Section */}
            {room.videoUrl && !videoError && (
                <div className="relative w-full rounded-t-2xl overflow-hidden mb-4">
                    <video
                        src={room.videoUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        className="w-full h-80 object-cover"
                        poster={room.images[0]?.url}
                        onError={handleVideoError}
                        preload="metadata"
                    >
                        Your browser does not support the video tag.
                    </video>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                            Standard Room!
                        </span>
                    </div>
                </div>
            )}

            {/* Image Gallery */}
            {room.images.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">
                        Room Images ({room.images.length} of 4 max)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {room.images.map((image, index) => (
                            <div
                                key={image.id}
                                className="relative flex-1 min-w-0 h-16 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity group"
                                style={{ maxWidth: 'calc(25% - 6px)' }}
                                onClick={() => {
                                    setSelectedImageIndex(index);
                                    setIsImageModalOpen(true);
                                }}
                            >
                                <Image
                                    src={image.url}
                                    alt={image.caption || `${room.title} - Image ${index + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 15vw"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                                {/* View indicator */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Eye className="h-5 w-5 text-white drop-shadow-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Image Display (when no video or video failed) */}
            {(!room.videoUrl || videoError) && room.images.length > 0 && (
                <div className="relative h-80 w-full rounded-t-2xl overflow-hidden mb-4 group">
                    <Image
                        src={room.images[currentImageIndex]?.url || room.images[0].url}
                        alt={room.images[currentImageIndex]?.caption || room.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority
                    />

                    {/* Image Counter */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm shadow-lg">
                        {currentImageIndex + 1} / {room.images.length}
                    </div>

                    {/* Navigation Arrows */}
                    {room.images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
                                aria-label="Next image"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                            Standard Room!
                        </span>
                    </div>

                    {/* Click to expand indicator */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => {
                                setSelectedImageIndex(currentImageIndex);
                                setIsImageModalOpen(true);
                            }}
                            className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                            aria-label="View full size image"
                        >
                            <Maximize className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Room Title and Description */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{room.title}</h2>
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                            Standard Room!
                        </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{room.description}</p>
                </div>

                {/* Room Specifications */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                                <Bed className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-gray-500">Bed Type</p>
                                <p className="font-medium text-gray-900 truncate">{roomSpecs.bedType}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                                <Users className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-gray-500">Max Occupancy</p>
                                <p className="font-medium text-gray-900 truncate">{roomSpecs.maxOccupancy}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                                <Maximize className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-gray-500">Room Size</p>
                                <p className="font-medium text-gray-900 truncate">{roomSpecs.roomSize}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Room Features */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Essential Amenities */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Essential Amenities</h4>
                            <div className="space-y-2">
                                {room.essentialAmenities && room.essentialAmenities.length > 0 ? (
                                    room.essentialAmenities.map((amenity, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                                            <span className="text-gray-700 text-sm">{amenity}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0"></div>
                                        <span className="text-gray-500 text-sm">No essential amenities specified</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Features */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Features</h4>
                            <div className="space-y-2">
                                {featuresGrouped.feature?.map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                        <span className="text-gray-700 text-sm">{feature.label}</span>
                                    </div>
                                ))}
                                {/* Show all other features if no specific 'feature' category */}
                                {(!featuresGrouped.feature || featuresGrouped.feature.length === 0) && getActiveFeatures().length > 0 && (
                                    <>
                                        {getActiveFeatures().map((feature, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                                <span className="text-gray-700 text-sm">{feature.label}</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                                {getActiveFeatures().length === 0 && (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0"></div>
                                        <span className="text-gray-500 text-sm">No additional features specified</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Pricing Button */}
                <div className="border-t border-gray-200 pt-6">
                    <button
                        onClick={handlePricingClick}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                        <Eye className="h-5 w-5" />
                        View Pricing Details
                    </button>
                </div>

                {/* Thumbnail Images */}
                {room.images.length > 1 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">More Photos</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {room.images.map((image: RoomImage, index) => (
                                <button
                                    key={image.id}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 group ${index === currentImageIndex
                                        ? 'border-orange-500 ring-2 ring-orange-200'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    aria-label={`View image ${index + 1}`}
                                >
                                    <Image
                                        src={image.url}
                                        alt={image.caption || `Room image ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 15vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    {index === currentImageIndex && (
                                        <div className="absolute inset-0 bg-orange-500/20"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {isImageModalOpen && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <div
                        className="relative max-w-4xl max-h-full"
                        onClick={e => e.stopPropagation()}
                    >
                        <Image
                            src={room.images[selectedImageIndex]?.url}
                            alt={room.images[selectedImageIndex]?.caption || `${room.title} - Image ${selectedImageIndex + 1}`}
                            width={800}
                            height={600}
                            className="object-contain max-h-[80vh] max-w-full"
                            priority
                        />

                        {/* Close button */}
                        <button
                            onClick={() => setIsImageModalOpen(false)}
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Close image viewer"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Navigation */}
                        {room.images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setSelectedImageIndex(prev =>
                                        prev === 0 ? room.images.length - 1 : prev - 1
                                    )}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={() => setSelectedImageIndex(prev =>
                                        (prev + 1) % room.images.length
                                    )}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}

                        {/* Image counter */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                            {selectedImageIndex + 1} / {room.images.length}
                        </div>

                        {/* Image caption */}

                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomDetailsModal;
