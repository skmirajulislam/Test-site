"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  DollarSign,
  ImageIcon,
  LogOut,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import RoomForm from "@/app/admin/_components/RoomForm";
import GalleryForm from "../_components/GalleryForm";
import PriceForm from "../_components/PriceForm";

interface Room {
  id?: number;
  slug?: string;
  title: string;
  name?: string; // For compatibility with dashboard display
  description: string;
  specs?: Record<string, boolean>; // e.g. { ac: true, wifi: true, tv: true, geyser: true, cctv: true, parking: true }
  essentialAmenities?: string[]; // Essential amenities for the room
  bedType?: string;
  maxOccupancy?: number;
  roomSize?: string;
  videoUrl?: string;
  roomCount: number; // Available rooms count
  images: Array<{ url: string, publicId: string }>;
  videos?: Array<{ url: string, publicId: string }>;
  prices?: Array<{
    id: number;
    hourlyHours: number;
    rateCents: number;
  }>; // Pricing information
  specifications?: string[]; // Room specifications
}

interface GalleryItem {
  id: number;
  category: string;
  url: string;
  caption: string;
  publicId?: string; // UploadThing file key for deletion
}

interface GalleryApiResponse {
  id: number;
  category: string;
  url: string;
  caption: string | null;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("rooms");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);
  const [editingPriceRoom, setEditingPriceRoom] = useState<Room | null>(null);

  const onLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const [editingGalleryItem, setEditingGalleryItem] = useState<
    GalleryItem | undefined
  >(undefined);
  const [deleteConfirmRoom, setDeleteConfirmRoom] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadRooms = async () => {
    try {
      console.log('🔍 Loading rooms...');
      const response = await fetch('/api/admin/rooms', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to load rooms:', response.status, errorData);
        throw new Error(errorData.error || `Failed to fetch rooms: ${response.status}`);
      }

      const categories = await response.json();

      // Ensure categories is an array
      if (!Array.isArray(categories)) {
        console.error('❌ Categories is not an array:', categories);
        setRooms([]);
        return;
      }

      console.log('✅ Rooms loaded:', categories.length);

      // Convert categories to room format for dashboard
      const roomsData = categories.map((category: {
        id: number;
        slug: string;
        title: string;
        description: string;
        specs: Record<string, boolean>;
        essentialAmenities: string[];
        bedType: string | null;
        maxOccupancy: number | null;
        roomSize: string | null;
        videoUrl: string | null;
        images: Array<{ url: string }>;
        roomCount: number;
        prices: Array<{ id: number; hourlyHours: number; rateCents: number }>;
      }) => ({
        id: category.id,
        slug: category.slug,
        title: category.title,
        name: category.title, // Use title as name for compatibility
        description: category.description || '',
        specs: category.specs || {},
        essentialAmenities: category.essentialAmenities || [],
        bedType: category.bedType || undefined,
        maxOccupancy: category.maxOccupancy || undefined,
        roomSize: category.roomSize || undefined,
        videoUrl: category.videoUrl || undefined,
        roomCount: category.roomCount,
        prices: category.prices || [], // Include prices from the API
        images: category.images?.filter((img: { url: string, publicId?: string }) => img.url && img.url.trim() !== '').map((img: { url: string, publicId?: string }) => ({
          url: img.url,
          publicId: img.publicId || ''
        })) || [],
        videos: category.videoUrl && category.videoUrl.trim() !== '' ? [{
          url: category.videoUrl,
          publicId: '' // Will be extracted from URL if needed
        }] : []
      }));

      setRooms(roomsData);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setError('Failed to load rooms');
    }
  };

  const loadGallery = async () => {
    try {
      console.log('🔍 Loading gallery...');
      const response = await fetch('/api/admin/gallery', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to load gallery:', response.status, errorData);
        throw new Error(errorData.error || `Failed to fetch gallery images: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        console.log('✅ Gallery loaded:', result.data.length, 'images');

        // Convert the API response to match our GalleryItem interface
        const galleryData = result.data.map((item: GalleryApiResponse) => ({
          id: item.id,
          category: item.category,
          url: item.url,
          caption: item.caption || '',
        }));

        setGallery(galleryData);
      } else {
        console.error('Unexpected gallery API response:', result);
        setGallery([]);
      }
    } catch (error) {
      console.error("Failed to load gallery:", error);
      setError("Failed to load gallery");
      setGallery([]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        if (activeTab === "rooms") {
          await loadRooms();
        } else if (activeTab === "gallery") {
          await loadGallery();
        }
      } catch (error) {
        if (isMounted && !(error instanceof Error && error.name === 'AbortError')) {
          console.error("Failed to load data:", error);
          setError("Failed to load data. Please refresh the page.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [activeTab]);

  // const handleUpdateAvailability = async (roomId: number, count: number) => {

  //   const updateGallery = async (newGallery: GalleryItem[]) => {
  //     const fixedGallery = newGallery.map((item) => ({
  //       ...item,
  //       type: item.type as "image" | "video",
  //     }));
  //     // Update local state first for better UX
  //     setGallery(fixedGallery);
  //     console.log("Updating gallery:", fixedGallery);

  //     try {
  //       await api.updateGallery({ gallery: fixedGallery });
  //       console.log("Gallery updated successfully");
  //     } catch (error) {
  //       console.error("Failed to update gallery:", error);
  //     }
  //   };

  //   const updateRoomAvailability = async (
  //     roomId: number,
  //     newAvailable: number
  //   ) => {
  //     console.log("Updating room availability:", roomId, newAvailable);

  //     const updatedRooms = rooms.map((room) =>
  //       room.id === roomId ? { ...room, available: newAvailable } : room
  //     );

  //     // Update local state first for better UX
  //     setRooms(updatedRooms);

  //     try {
  //       await updateRooms({ rooms: updatedRooms });
  //       console.log("Room availability updated successfully");
  //     } catch (error) {
  //       console.error("Failed to update room availability:", error);
  //       // Revert local state if API call fails
  //       setRooms(rooms);
  //       setError("Failed to update room availability");
  //     }
  //   };

  const handleSaveRoom = async (room: Room) => {
    console.log("Room saved:", room);

    try {
      // Room save is now handled by RoomForm component
      // Just refresh the rooms data to show the updated list
      await loadRooms();

      setShowRoomForm(false);
      setEditingRoom(undefined);
    } catch (error) {
      console.error("Failed to refresh room list:", error);
      setError("Failed to refresh room list");
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setShowRoomForm(true);
  };

  const handleDeleteRoom = async (room: Room) => {
    setDeleteConfirmRoom(room);
  };

  const confirmDeleteRoom = async () => {
    if (!deleteConfirmRoom || !deleteConfirmRoom.id) {
      console.error('No room selected for deletion');
      return;
    }

    setIsDeleting(true);

    try {
      console.log('🗑️ Deleting room:', {
        id: deleteConfirmRoom.id,
        title: deleteConfirmRoom.title,
        name: deleteConfirmRoom.name
      });

      const response = await fetch(`/api/admin/rooms?id=${deleteConfirmRoom.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to delete room:', response.status, errorData);
        throw new Error(errorData.error || `Failed to delete room: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Room deleted successfully:', result);

      // Refresh rooms list
      await loadRooms();

      // Close confirmation dialog
      setDeleteConfirmRoom(null);

      // Show success message (optional - you can add a toast notification here)
      alert('Room deleted successfully!');
    } catch (error) {
      console.error('Error deleting room:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete room. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteRoom = () => {
    setDeleteConfirmRoom(null);
  };

  const handleSaveGalleryItem = async (item: GalleryItem) => {
    try {
      console.log('🎯 handleSaveGalleryItem called with item:', JSON.stringify(item, null, 2));

      // Check if we're editing an existing item
      const isEditing = item.id && gallery.some((g) => g.id === item.id);
      console.log('🔍 isEditing:', isEditing);

      let apiResponse;

      if (isEditing) {
        console.log('✏️ Editing existing gallery item');
        // For editing, we'll use a PUT request
        const formData = new FormData();
        formData.append('category', item.category);
        formData.append('caption', item.caption || '');

        apiResponse = await fetch(`/api/admin/gallery/${item.id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        console.log('➕ Adding new gallery item');
        console.log('📊 Item validation:', {
          hasUrl: !!item.url,
          urlStartsWithHttp: item.url?.startsWith('http'),
          hasPublicId: !!item.publicId,
          url: item.url,
          publicId: item.publicId
        });

        // For new items, the file should already be uploaded by FileUpload component
        if (!item.url || !item.url.startsWith('http') || !item.publicId) {
          console.error('❌ Validation failed - missing url or publicId');
          throw new Error('Please upload a file first');
        }

        const payload = {
          category: item.category,
          url: item.url,
          publicId: item.publicId,
          caption: item.caption || '',
        };

        console.log('📤 Sending POST request to /api/admin/gallery with payload:', JSON.stringify(payload, null, 2));

        // Send metadata only (file already uploaded to UploadThing)
        apiResponse = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      console.log('📡 API Response status:', apiResponse.status);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error('❌ API Error response:', errorData);
        throw new Error(errorData.error || 'Failed to save gallery item');
      }

      const responseData = await apiResponse.json();
      console.log('✅ API Success response:', JSON.stringify(responseData, null, 2));

      // Refresh gallery data
      await loadGallery();

      setShowGalleryForm(false);
      setEditingGalleryItem(undefined);
      console.log('🎉 Gallery item saved successfully');
    } catch (error) {
      console.error("❌ Failed to save gallery item:", error);
      setError(error instanceof Error ? error.message : "Failed to save gallery item");
    }
  };

  const handleEditGalleryItem = (item: GalleryItem) => {
    setEditingGalleryItem(item);
    setShowGalleryForm(true);
  };

  const handleDeleteGalleryItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/admin/gallery/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete gallery item');
      }

      // Refresh gallery data after successful deletion
      await loadGallery();
    } catch (error) {
      console.error("Failed to delete gallery item:", error);
      setError("Failed to delete gallery item");
    }
  };

  const tabs = [
    { id: "rooms", name: "Rooms", icon: Users },
    { id: "prices", name: "Prices", icon: DollarSign },
    { id: "gallery", name: "Gallery", icon: ImageIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                Hotel Admin Dashboard
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">Manage your hotel operations</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-base font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex-shrink-0"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm sm:text-base break-words flex-1">{error}</span>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700 font-bold text-lg ml-2 flex-shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-4 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-1 sm:p-2">
            <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 sm:gap-3 py-2 sm:py-3 px-3 sm:px-6 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105"
                      : "bg-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      }`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "rooms" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Room Management
              </h2>
              <button
                className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2.5 sm:py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
                onClick={() => {
                  setEditingRoom(undefined);
                  setShowRoomForm(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add New Room
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-lg shadow-lg p-4 sm:p-6"
                >
                  {room.videos && room.videos.length > 0 ? (
                    <video
                      src={room.videos[0].url}
                      className="w-full h-40 sm:h-48 object-cover rounded-lg mb-3 sm:mb-4"
                      controls
                      muted
                    />
                  ) : room.images && room.images.length > 0 && room.images[0] ? (
                    <Image
                      src={room.images[0].url}
                      alt={room.name || 'Room image'}
                      width={400}
                      height={192}
                      className="w-full h-40 sm:h-48 object-cover rounded-lg mb-3 sm:mb-4"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-room.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-40 sm:h-48 bg-gray-200 rounded-lg mb-3 sm:mb-4 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                  )}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {room.name}
                  </h3>
                  <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm line-clamp-2">
                    {room.description.substring(0, 100)}...
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Available Rooms:</span>
                      <span className="text-gray-900 font-medium">{room.roomCount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-semibold text-gray-900">Features:</span>
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          onClick={() => handleEditRoom(room)}
                          title="Edit room"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 transition-colors"
                          onClick={() => handleDeleteRoom(room)}
                          title="Delete room"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {room.specs && Object.entries(room.specs)
                        .filter(([, value]) => value)
                        .slice(0, 3)
                        .map(([spec], index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full font-medium"
                          >
                            {spec === 'ac' ? 'AC' :
                              spec === 'wifi' ? 'WiFi' :
                                spec === 'tv' ? 'TV' :
                                  spec === 'geyser' ? 'Hot Water' :
                                    spec === 'cctv' ? 'CCTV' :
                                      spec === 'parking' ? 'Parking' :
                                        spec.charAt(0).toUpperCase() + spec.slice(1)}
                          </span>
                        ))}
                      {room.specs && Object.entries(room.specs).filter(([, value]) => value).length > 3 && (
                        <span className="text-xs text-gray-700 font-medium">
                          +{Object.entries(room.specs).filter(([, value]) => value).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showRoomForm && (
              <RoomForm
                isOpen={showRoomForm}
                onClose={() => {
                  setShowRoomForm(false);
                  setEditingRoom(undefined);
                }}
                onSave={handleSaveRoom}
                room={editingRoom}
                isEditing={!!editingRoom}
              />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmRoom && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Delete Room</h3>
                  </div>

                  <p className="text-gray-600 mb-2">
                    Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteConfirmRoom.title || deleteConfirmRoom.name}</span>?
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800 font-medium mb-2">⚠️ This action cannot be undone!</p>
                    <p className="text-sm text-red-700">
                      This will permanently delete:
                    </p>
                    <ul className="text-sm text-red-700 list-disc list-inside mt-2 space-y-1">
                      <li>Room information and details</li>
                      <li>All room images ({deleteConfirmRoom.images?.length || 0} images)</li>
                      <li>All pricing tiers</li>
                      <li>Files from cloud storage</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={cancelDeleteRoom}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteRoom}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Delete Room
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "prices" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Price Management
                </h2>
                <p className="text-gray-600 mt-1 text-xs sm:text-base">
                  Manage pricing tiers for each room category (up to 4 tiers per room)
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 sm:p-4">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                      {room.name}
                    </h3>
                    <p className="text-yellow-100 text-xs sm:text-sm">
                      {room.prices?.length || 0}/4 pricing tiers configured
                    </p>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700 flex items-center justify-between text-sm sm:text-base">
                        Current Prices:
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {room.prices?.length || 0} tiers
                        </span>
                      </h4>
                      {room.prices && room.prices.length > 0 ? (
                        <div className="space-y-2">
                          {room.prices
                            .sort((a, b) => a.hourlyHours - b.hourlyHours)
                            .map((price, index) => (
                              <div key={price.id} className="flex justify-between items-center bg-gray-50 p-2 sm:p-3 rounded-lg border">
                                <div className="flex items-center">
                                  <span className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                                    {index + 1}
                                  </span>
                                  <span className="text-gray-700 font-medium text-xs sm:text-base">
                                    {`${price.hourlyHours} ${price.hourlyHours === 1 ? 'Hour' : 'Hours'}`}
                                  </span>
                                </div>
                                <span className="font-bold text-green-600 text-base sm:text-lg">
                                  ₹{(price.rateCents / 100).toFixed(2)}
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 sm:py-6">
                          <div className="text-gray-400 mb-2">
                            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <p className="text-gray-500 text-xs sm:text-sm">No prices configured</p>
                          <p className="text-gray-400 text-xs">Click &quot;Edit Prices&quot; to add pricing tiers</p>
                        </div>
                      )}
                      <button
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
                        onClick={() => {
                          setEditingPriceRoom(room);
                          setShowPriceForm(true);
                        }}
                      >
                        Edit Prices
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Gallery Management
              </h2>
              <button
                className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2.5 sm:py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
                onClick={() => {
                  setEditingGalleryItem(undefined);
                  setShowGalleryForm(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add New Item
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  {item.url ? (
                    <Image
                      src={item.url}
                      alt={item.caption || 'Gallery image'}
                      width={400}
                      height={192}
                      className="w-full h-40 sm:h-48 object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-room.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="p-3 sm:p-4">
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base line-clamp-1">
                      {item.caption}
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 capitalize">
                      {item.category}
                    </p>
                    <div className="flex justify-between">
                      <button
                        className="text-blue-600 hover:bg-blue-50 p-1.5 sm:p-1 rounded"
                        onClick={() => handleEditGalleryItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:bg-red-50 p-1.5 sm:p-1 rounded"
                        onClick={() => handleDeleteGalleryItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {showGalleryForm && (
              <GalleryForm
                isOpen={showGalleryForm}
                onClose={() => {
                  setShowGalleryForm(false);
                  setEditingGalleryItem(undefined);
                }}
                onSave={handleSaveGalleryItem}
                item={editingGalleryItem}
                isEditing={!!editingGalleryItem}
              />
            )}
          </div>
        )}

        {/* Price Form Modal */}
        {showPriceForm && (
          <PriceForm
            isOpen={showPriceForm}
            onClose={() => {
              setShowPriceForm(false);
              setEditingPriceRoom(null);
            }}
            onSave={async () => {
              await loadRooms();
              setShowPriceForm(false);
              setEditingPriceRoom(null);
            }}
            room={editingPriceRoom}
          />
        )}
      </div>
    </div>
  );
}
