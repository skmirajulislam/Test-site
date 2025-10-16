import Layout from "@/components/Layout";
import GalleryFilter from "@/components/GalleryFilter";

export default function GalleryPage() {
  return (
    <Layout>
      <div className="bg-white mt-10">
        {/* Hero Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Photo Gallery
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the beauty and elegance of Grand Hotel through our
              collection of stunning photographs showcasing our facilities,
              rooms, and amenities.
            </p>
          </div>
        </section>

        {/* Gallery Filter Section */}
        <section className="pb-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <GalleryFilter />
          </div>
        </section>
      </div>
    </Layout>
  );
}
