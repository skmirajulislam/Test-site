import Link from "next/link";
import { Bed, Wifi, Car, BicepsFlexed, Coffee } from "lucide-react";
import Layout from "@/components/Layout";
import HeroCarousel from "@/components/Carousal";

export default async function HomePage() {
  return (
    <Layout>
      <div>
        {/* Hero Section */}
        <HeroCarousel />

        {/* Services Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Explore Our Services
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Luxurious Rooms */}
              <div className="bg-yellow-50 p-8 rounded-xl text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Bed className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Luxurious Rooms
                </h3>
                <p className="text-gray-700 mb-6">
                  Choose from our Standard, Premium, and Luxury accommodations,
                  each designed for ultimate comfort.
                </p>
                <Link
                  href="/rooms"
                  className="text-yellow-600 font-semibold hover:underline"
                >
                  Explore Rooms →
                </Link>
              </div>

              {/* Fine Dining */}

              {/* Contact Us */}
              <div className="bg-green-50 p-8 rounded-xl text-center">
                <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Coffee className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Contact Us
                </h3>
                <p className="text-gray-700 mb-6">
                  Get in touch for reservations, inquiries, or special requests.
                  We&apos;re here to help 24/7.
                </p>
                <Link
                  href="/contact"
                  className="text-green-600 font-semibold hover:underline"
                >
                  Contact Info →
                </Link>
              </div>
            </div>
          </div>

          {/* Pujo Offer Banner */}
        </section>
        {/* <h1 className="font-bold text-4xl mb-4 text-gray-900 text-center">
          Exclusive Pujo Offer
        </h1>
        <Image
          src="/pujooffer.jpeg"
          alt="Exclusive Pujo Offer"
          width={1000}
          height={1000}
          className="w-96 md:w-full p-4 mx-auto h-64 md:h-[30rem] object-contain mt-8"
          priority
        /> */}
        <section></section>
        {/* World-Class Amenities */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                World-Class Amenities
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  icon: Wifi,
                  title: "Free Wi-Fi",
                  description: "High-speed internet throughout",
                },
                {
                  icon: Car,
                  title: "Parking",
                  description: "Complimentary parking service",
                },

                {
                  icon: Coffee,
                  title: "Room Service",
                  description: "24-hour dining service",
                },
                {
                  icon: BicepsFlexed,
                  title: "Full Safety and Security",
                  description: "24-hour security service",
                },
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Our Guests Say */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What Our Guests Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  text: "It is great and most likely it is couple friendly and it is very cheap price and very good place",
                  author: "Sourav",
                  rating: "★★★★★",
                },
                {
                  text: "Very friendly and very cooperative management. Also very clean rooms",
                  author: "Priyangsu Ghosh",
                  rating: "★★★★★",
                },
                {
                  text: "Hotel is very good and comfortable hotel staff is good ♥️♥️♥️.",
                  author: "Palash",
                  rating: "★★★★★",
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl">
                  <div className="text-yellow-500 text-lg mb-3">
                    {testimonial.rating}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <p className="text-gray-900 font-semibold">
                    - {testimonial.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
