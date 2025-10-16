'use client'

import { useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { GALLERY_CATEGORIES } from '@/lib/config'
import { X } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface GalleryImage {
    id: number
    url: string
    caption?: string
    category: string
}

interface ImageModalProps {
    image: GalleryImage | null
    isOpen: boolean
    onClose: () => void
    onNext: () => void
    onPrev: () => void
}

function ImageModal({ image, isOpen, onClose, onNext, onPrev }: ImageModalProps) {
    if (!isOpen || !image) return null

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-60 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-300"
                >
                    <X className="h-6 w-6" />
                </button>

                {/* Navigation Buttons */}
                <button
                    onClick={onPrev}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-60 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={onNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-60 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Image */}
                <div className="relative max-w-4xl max-h-[80vh] w-full">
                    <Image
                        src={image.url}
                        alt={image.caption || 'Gallery image'}
                        width={1200}
                        height={800}
                        className="object-contain w-full h-full rounded-lg"
                        loading="eager"
                        priority
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-room.svg';
                        }}
                    />

                    {/* Image Info */}
                    {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-lg">
                            <h3 className="text-white text-lg font-medium mb-1">{image.caption}</h3>
                            <p className="text-gray-300 text-sm">Category: {image.category.charAt(0).toUpperCase() + image.category.slice(1)}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function GalleryFilter() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const { data, error, isLoading } = useSWR(
        selectedCategory === 'all'
            ? '/api/gallery'
            : `/api/gallery?category=${selectedCategory}`,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            shouldRetryOnError: true,
            errorRetryCount: 3,
            onError: (err) => {
                console.error('❌ Gallery fetch error:', err);
            },
            onSuccess: (data) => {
                console.log('✅ Gallery data loaded:', data?.data?.length || 0, 'images');
            }
        }
    )

    if (isLoading) {
        return (
            <div className="space-y-8">
                {/* Filter Skeleton */}
                <div className="flex flex-wrap justify-center gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
                    ))}
                </div>

                {/* Gallery Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-xl animate-pulse">
                            <div className="w-full h-64" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                    <div className="text-red-600 text-lg font-medium mb-2">⚠️ Unable to Load Gallery</div>
                    <div className="text-red-500 mb-4">{error.message || 'Error loading gallery. Please try again later.'}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    const images = data?.data || []

    const openModal = (image: GalleryImage, index: number) => {
        setSelectedImage(image)
        setCurrentImageIndex(index)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedImage(null)
    }

    const nextImage = () => {
        const nextIndex = (currentImageIndex + 1) % images.length
        setCurrentImageIndex(nextIndex)
        setSelectedImage(images[nextIndex])
    }

    const prevImage = () => {
        const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
        setCurrentImageIndex(prevIndex)
        setSelectedImage(images[prevIndex])
    }

    return (
        <>
            <div className="space-y-8">
                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-3">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${selectedCategory === 'all'
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                            }`}
                    >
                        All
                    </button>
                    {GALLERY_CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${selectedCategory === category
                                ? 'bg-orange-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                }`}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                {images.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 max-w-md mx-auto">
                            <div className="text-gray-600 text-lg font-medium mb-2">No Photos Found</div>
                            <div className="text-gray-500">No images available for this category yet.</div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((image: GalleryImage, index: number) => (
                            <div
                                key={image.id}
                                className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                                onClick={() => openModal(image, index)}
                            >
                                <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                                    <Image
                                        src={image.url}
                                        alt={image.caption || 'Gallery image'}
                                        width={400}
                                        height={300}
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                        placeholder="blur"
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/placeholder-room.svg';
                                        }}
                                    />
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <div className="text-white">
                                            <h3 className="font-medium text-sm mb-1">
                                                {image.caption || 'Hotel Gallery'}
                                            </h3>
                                            <p className="text-xs text-gray-300">
                                                {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                                        {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <ImageModal
                image={selectedImage}
                isOpen={isModalOpen}
                onClose={closeModal}
                onNext={nextImage}
                onPrev={prevImage}
            />
        </>
    )
}
