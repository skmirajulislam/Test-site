"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import CategoryCard from "@/components/CategoryCard";

interface Category {
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
}

export default function RoomsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('🔍 Fetching categories from API...');
        const response = await fetch('/api/categories', {
          cache: 'no-store', // Disable caching for real-time updates
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error('❌ Categories fetch failed:', response.status, response.statusText);
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        const data = await response.json();

        // Validate response structure
        if (!data || typeof data !== 'object') {
          console.error('❌ Invalid response format:', data);
          throw new Error('Invalid response format');
        }

        const categoriesData = data.data || [];
        console.log('✅ Categories loaded:', categoriesData.length);

        setCategories(categoriesData);
      } catch (err) {
        console.error("❌ Error fetching categories:", err);
        setError(err instanceof Error ? err.message : 'Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array - fetch once on mount

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 mt-10">
              Our Rooms
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience luxury and comfort in our carefully designed rooms
            </p>
          </div>
        </section>

        {/* Room Categories */}
        <section className="pb-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading rooms...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-12 max-w-md mx-auto">
                  <h3 className="text-2xl font-semibold text-red-900 mb-4">
                    Error Loading Rooms
                  </h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
                  {categories.map((category: Category, index: number) => (
                    <div
                      key={category.id}
                      className="animate-fade-in-up w-full max-w-md mx-auto"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <CategoryCard category={category} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 max-w-md mx-auto">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    No Rooms Available
                  </h3>
                  <p className="text-gray-600">
                    Please check back later for available rooms.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
