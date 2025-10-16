"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hotel, Menu, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/rooms", label: "Rooms" },
    { path: "/gallery", label: "Gallery" },
    { path: "/prices", label: "Prices" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => pathname === path;

  // ✅ Scroll listener
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-lg">
      {/* ✅ Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${pathname === "/" && !isScrolled
            ? "bg-transparent"
            : "bg-white shadow-sm border-b border-gray-100"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-yellow-600 p-1 rounded">
                <Hotel className="h-6 w-6 text-white" />
              </div>
              <span
                className={`text-xl font-bold transition-colors ${pathname === "/" && !isScrolled
                    ? "text-white"
                    : "text-gray-900"
                  }`}
              >
                Dolly Hotel
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive(item.path)
                      ? "text-yellow-600 border-b-2 border-yellow-600"
                      : pathname === "/" && !isScrolled
                        ? "text-white hover:text-yellow-400"
                        : "text-gray-600 hover:text-yellow-600"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin/login"
                className={`text-sm font-medium transition-colors duration-200 ml-4 ${pathname === "/" && !isScrolled
                    ? "text-white hover:text-yellow-400"
                    : "text-gray-600 hover:text-yellow-600"
                  }`}
              >
                Admin
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`transition-colors duration-200 ${pathname === "/" && !isScrolled
                    ? "text-white hover:text-yellow-400"
                    : "text-gray-700 hover:text-yellow-600"
                  }`}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${isActive(item.path)
                        ? "text-yellow-600 bg-yellow-50"
                        : "text-gray-700 hover:text-yellow-600 hover:bg-yellow-50"
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-4">
                  <Link
                    href="/admin/login"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main>{children}</main>

      {/* ✅ Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* About */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Dolly Hotel</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Discover unparalleled luxury and comfort in the heart of the
                city. Dolly Hotel is your perfect destination for a relaxing
                stay, fine dining, and unforgettable experiences.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/rooms"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Rooms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gallery"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link
                    href="/prices"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Prices
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Contact Us
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span>
                    1no. Netaji Park , G.t.ROad (Dolly Pharmacy) Bandel Hooghly
                    712123
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  📞{" "}
                  <a href="tel:+918777659544" className="hover:text-yellow-400">
                    +91 8777659544
                  </a>
                  <a href="tel:+918777651011" className="hover:text-yellow-400">
                    +91 8777651011
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  ✉️{" "}
                  <a
                    href="mailto:dollyhotelbandel@gmail.com"
                    className="hover:text-yellow-400"
                  >
                    dollyhotelbandel@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/share/14LjfcKCHms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-yellow-500 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.04c-5.5 0-10 4.47-10 9.96 0 4.41 3.61 8.1 8.26 8.82v-6.24H8.07V12h2.19v-1.79c0-2.16 1.28-3.35 3.24-3.35.94 0 1.91.17 1.91.17v2.1h-1.08c-1.07 0-1.4.66-1.4 1.34V12h2.39l-.38 2.58h-2.01v6.24C18.39 20.1 22 16.41 22 12c0-5.49-4.5-9.96-10-9.96z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            
            © {new Date().getFullYear()} Dolly Hotel. All rights reserved.
            <div className="mt-2  text-center text-sm text-gray-500">Developed and Marketed by LodgeDigital</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
