"use client";

import * as React from "react";

export default function HeroVideo() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked
      });
    }
  }, []);

  return (
    <div className="relative w-full">
      {/* Background Video */}
      <div className="relative w-full h-[50vh] md:h-screen sm:h-[65vh] overflow-hidden">
        <video
          ref={videoRef}
          src="/main-hero-video.mp4"
          className="absolute inset-0 w-full h-full object-cover md:object-cover"
          muted
          playsInline
          loop
          autoPlay
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 hidden md:flex items-center justify-center text-white z-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-yellow-400">Dolly Hotel</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Experience luxury, comfort, and unparalleled service in the heart of
            the city
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Book Now
            </a>
            <a
              href="/rooms"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              View Rooms
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Text (below video) */}
      <div className="block md:hidden px-6 py-8 text-center text-gray-900">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to <span className="text-yellow-500">Dolly Hotel</span>
        </h1>
        <p className="text-lg mb-6 text-gray-600">
          Experience luxury, comfort, and unparalleled service in the heart of
          the city
        </p>
        <div className="flex flex-col gap-4 items-center">
          <a
            href="/rooms"
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg text-base font-semibold transition-all duration-300 transform hover:scale-105"
          >
            View Rooms
          </a>
          <a
            href="/prices"
            className="bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-3 rounded-lg text-base font-semibold transition-all duration-300 transform hover:scale-105"
          >
            View Prices
          </a>
        </div>
      </div>
    </div>
  );
}
