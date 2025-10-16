'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { HOME_SLIDER_CONTENT, SLIDER_DURATION } from '@/lib/config'

export default function Slider() {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                (prevIndex + 1) % HOME_SLIDER_CONTENT.length
            )
        }, SLIDER_DURATION)

        return () => clearInterval(interval)
    }, [])

    const currentSlide = HOME_SLIDER_CONTENT[currentIndex]

    return (
        <div className="relative w-full h-[60vh] overflow-hidden">
            {/* Content */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="text-center text-white px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Welcome to <span className="text-yellow-400">Grand Hotel</span>
                    </h1>
                    <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                        Experience luxury, comfort, and unparalleled service in the heart of the city
                    </p>
                    <div className="space-x-4">
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-semibold transition-colors">
                            Book Now
                        </button>
                        <button className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-lg font-semibold transition-colors">
                            View Rooms
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 z-5" />

            {/* Media Content */}
            <div className="absolute inset-0">
                {currentSlide.type === 'image' ? (
                    <Image
                        src={currentSlide.url}
                        alt={currentSlide.alt}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <video
                        src={currentSlide.url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        playsInline
                        loop
                    />
                )}
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                {HOME_SLIDER_CONTENT.map((_, index) => (
                    <button
                        key={index}
                        className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-yellow-400' : 'bg-white bg-opacity-50'
                            }`}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}
            </div>
        </div>
    )
}