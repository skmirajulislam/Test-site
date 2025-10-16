"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Plus } from "lucide-react";
import FileUpload from "./FileUpload";
import Modal from "./Modal";

interface Room {
  id?: number; // optional, comes from DB
  slug?: string; // unique identifier
  title: string;
  description: string;
  specs?: Record<string, boolean>; // e.g. { ac: true, wifi: true, tv: true, geyser: true, cctv: true, parking: true }
  essentialAmenities?: string[]; // essential amenities list
  bedType?: string; // "Single Bed", "Double Bed", "King Bed", "Queen Bed"
  maxOccupancy?: number; // Number of guests
  roomSize?: string; // e.g. "25 sqm", "30 sqm"
  videoUrl?: string; // hardcoded video URL - not editable by admin
  roomCount: number; // Available rooms count
  images: Array<{ url: string, publicId: string }>;
  videos?: Array<{ url: string, publicId: string }>;
}

interface RoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: Room) => void;
  room?: Room;
  isEditing: boolean;
}

const RoomForm: React.FC<RoomFormProps> = ({
  isOpen,
  onClose,
  onSave,
  room,
  isEditing,
}) => {
  const [formData, setFormData] = useState<Room>({
    title: "",
    description: "",
    specs: {},
    essentialAmenities: [],
    bedType: "",
    maxOccupancy: 2,
    roomSize: "",
    roomCount: 0,
    images: [],
    videos: [],
  });
  const [newFeature, setNewFeature] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [roomFeatures, setRoomFeatures] = useState<Array<{
    key: string;
    label: string;
    category: string;
  }>>([]);

  // Fetch room features on component mount
  useEffect(() => {
    const abortController = new AbortController();

    const fetchRoomFeatures = async () => {
      try {
        const response = await fetch('/api/room-features', {
          signal: abortController.signal
        });
        if (response.ok) {
          const result = await response.json();
          setRoomFeatures(result.data || []);
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

  // Update form data when room prop changes
  useEffect(() => {
    if (room) {
      setFormData({
        ...room,
        title: room.title || "",
        description: room.description || "",
        specs: room.specs || {},
        essentialAmenities: room.essentialAmenities || [],
        bedType: room.bedType || "",
        maxOccupancy: room.maxOccupancy || 2,
        roomSize: room.roomSize || "",
        roomCount: room.roomCount || 0,
        images: (room.images || []).filter(img => img && img.url && img.url.trim() !== ''),
        videos: (room.videos || []).filter(vid => vid && vid.url && vid.url.trim() !== ''),
      });
    }
  }, [room]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "maxOccupancy" || name === "roomCount"
          ? Number(value)
          : value,
    }));
  };

  const handleSpecChange = (spec: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      specs: {
        ...prev.specs,
        [spec]: checked,
      },
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const specKey = newFeature.trim().toLowerCase();
      setFormData((prev) => ({
        ...prev,
        specs: {
          ...prev.specs,
          [specKey]: true,
        },
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (specKey: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specs };
      delete newSpecs[specKey];
      return {
        ...prev,
        specs: newSpecs,
      };
    });
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.essentialAmenities?.includes(newAmenity.trim())) {
      setFormData((prev) => ({
        ...prev,
        essentialAmenities: [...(prev.essentialAmenities || []), newAmenity.trim()],
      }));
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      essentialAmenities: prev.essentialAmenities?.filter(a => a !== amenity) || [],
    }));
  };

  // Filter valid images and videos for display
  const validImages = (formData.images || []).filter(img => img && img.url && img.url.trim() !== '');
  const validVideos = (formData.videos || []).filter(vid => vid && vid.url && vid.url.trim() !== '');

  const handleImageUpload = (fileUrl: string, publicId?: string) => {
    const imageData = { url: fileUrl, publicId: publicId || '' };

    if (activeImageIndex !== null) {
      const newImages = [...formData.images];
      newImages[activeImageIndex] = imageData;
      setFormData((prev) => ({ ...prev, images: newImages }));
      setActiveImageIndex(null);
    } else {
      setFormData((prev) => ({ ...prev, images: [...prev.images, imageData] }));
    }
    setShowImageUpload(false);
  };

  const handleVideoUpload = (fileUrl: string, publicId?: string) => {
    const videoData = { url: fileUrl, publicId: publicId || '' };

    if (activeVideoIndex !== null) {
      const newVideos = [...(formData.videos || [])];
      newVideos[activeVideoIndex] = videoData;
      setFormData((prev) => ({ ...prev, videos: newVideos }));
      setActiveVideoIndex(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        videos: [...(prev.videos || []), videoData],
      }));
    }
    setShowVideoUpload(false);
  };

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const handleUploadEnd = () => {
    setIsUploading(false);
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveVideo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videos: prev.videos?.filter((_, i) => i !== index) || [],
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const roomData = {
        ...formData,
        ...(isEditing && formData.id ? { id: formData.id } : {})
      };

      // Debug: Log what we're sending
      console.log('💾 Submitting room data:', {
        title: roomData.title,
        images: roomData.images,
        videos: roomData.videos,
        isEditing,
        hasImages: roomData.images?.length > 0,
        hasVideos: (roomData.videos?.length ?? 0) > 0
      });

      const response = await fetch('/api/admin/rooms', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Failed to save room:', errorData);
        throw new Error(errorData.error || 'Failed to save room');
      }

      const savedRoom = await response.json();
      console.log('✅ Room saved successfully:', savedRoom);

      // Notify parent component of successful save
      onSave(savedRoom);

      // Close the modal
      onClose();
    } catch (error) {
      console.error('❌ Error saving room:', error);
      // You might want to show an error message to the user here
      alert('Failed to save room. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Room" : "Add New Room"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Room Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title || ""}
            onChange={handleChange}
            placeholder="e.g., Deluxe Room with Garden View"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-500 placeholder:text-sm"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the room features and amenities..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none placeholder-gray-500 placeholder:text-sm"
            required
          />
        </div>

        {/* Room Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Bed Type
            </label>
            <select
              name="bedType"
              value={formData.bedType || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white placeholder-gray-500 placeholder:text-sm"
            >
              <option value="">Select Bed Type</option>
              <option value="Single Bed">Single Bed</option>
              <option value="Double Bed">Double Bed</option>
              <option value="King Bed">King Bed</option>
              <option value="Queen Bed">Queen Bed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Max Occupancy
            </label>
            <input
              type="number"
              name="maxOccupancy"
              value={formData.maxOccupancy || 2}
              onChange={handleChange}
              min="1"
              max="8"
              placeholder="2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-500 placeholder:text-sm"
            />
          </div>
        </div>

        {/* Room Size and Room Count */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Room Size
            </label>
            <input
              type="text"
              name="roomSize"
              value={formData.roomSize || ""}
              onChange={handleChange}
              placeholder="e.g., 25 sqm"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-500 placeholder:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Available Rooms
            </label>
            <input
              type="number"
              name="roomCount"
              value={formData.roomCount || 0}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-500 placeholder:text-sm"
              required
            />
          </div>
        </div>

        {/* Essential Amenities Section */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Essential Amenities
          </label>

          {/* Current essential amenities */}
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.essentialAmenities?.map((amenity, index) => (
              <div
                key={index}
                className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
              >
                <span>{amenity}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAmenity(amenity)}
                  className="text-orange-600 hover:text-red-500 transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add an essential amenity (e.g., Free Wi-Fi, Air Conditioning)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 placeholder-gray-500 placeholder:text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddAmenity();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddAmenity}
              className="px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Room Specs Section */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Room Features
          </label>

          {/* Dynamic features from database */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {roomFeatures.map((feature) => (
              <label key={feature.key} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.specs?.[feature.key] || false}
                  onChange={(e) => handleSpecChange(feature.key, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {feature.label}
                </span>
              </label>
            ))}
          </div>          {/* Custom features */}
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.specs && Object.entries(formData.specs)
              .filter(([key]) => !roomFeatures.map(f => f.key).includes(key))
              .map(([key, value]) => value && (
                <div
                  key={key}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                >
                  <span className="capitalize">{key}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(key)}
                    className="text-blue-600 hover:text-red-500 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a custom feature (e.g., Balcony, Mini Bar)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-500 placeholder:text-sm placeholder-gray-500 placeholder:text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Room Images <span className="text-gray-500 text-xs">(Max 4)</span>
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {validImages.map((image, index) => (
              <div key={index} className="relative group h-24 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={image.url}
                  alt={`Room ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  className="object-cover rounded-md"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      const originalIndex = formData.images.findIndex(img => img === image);
                      setActiveImageIndex(originalIndex);
                      setShowImageUpload(true);
                    }}
                    className="p-1 bg-blue-500 text-white rounded-full mr-1"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            {validImages.length < 4 && (
              <button
                type="button"
                onClick={() => {
                  setActiveImageIndex(null);
                  setShowImageUpload(true);
                }}
                className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-yellow-500 transition-colors"
              >
                <Plus className="h-6 w-6 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {showImageUpload && (
          <div className="mt-4 p-4 border border-gray-200 rounded-md">
            <h4 className="text-sm font-medium mb-2">
              {activeImageIndex !== null ? "Replace Image" : "Add New Image"}
            </h4>
            {isUploading && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-blue-800">Uploading image... Please wait before saving.</span>
                </div>
              </div>
            )}
            <FileUpload
              onFileUpload={handleImageUpload}
              currentImage={
                activeImageIndex !== null
                  ? formData.images[activeImageIndex]?.url
                  : undefined
              }
              fileType="image"
              onUploadStart={handleUploadStart}
              onUploadEnd={handleUploadEnd}
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowImageUpload(false);
                  setActiveImageIndex(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Videos <span className="text-gray-500 text-xs">(Max 1, ≤60s)</span>
          </label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {validVideos.map((video, index) => (
              <div key={index} className="relative group">
                <video
                  src={video.url}
                  className="w-full h-20 object-cover rounded-md"
                  controls
                  muted
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      const originalIndex = formData.videos?.findIndex(vid => vid === video) ?? -1;
                      setActiveVideoIndex(originalIndex >= 0 ? originalIndex : index);
                      setShowVideoUpload(true);
                    }}
                    className="p-1 bg-blue-500 text-white rounded-full mr-1"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(index)}
                    className="p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}

            {validVideos.length < 1 && (
              <button
                type="button"
                onClick={() => {
                  setActiveVideoIndex(null);
                  setShowVideoUpload(true);
                }}
                className="w-full h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center hover:border-yellow-500 transition-colors"
              >
                <Plus className="h-6 w-6 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {showVideoUpload && (
          <div className="mt-4 p-4 border border-gray-200 rounded-md">
            <h4 className="text-sm font-medium mb-2">
              {activeVideoIndex !== null ? "Replace Video" : "Add New Video"}
            </h4>
            {isUploading && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-blue-800">Uploading video... Please wait before saving.</span>
                </div>
              </div>
            )}
            <FileUpload
              onFileUpload={handleVideoUpload}
              currentImage={
                activeVideoIndex !== null && formData.videos
                  ? formData.videos[activeVideoIndex]?.url
                  : undefined
              }
              fileType="video"
              onUploadStart={handleUploadStart}
              onUploadEnd={handleUploadEnd}
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowVideoUpload(false);
                  setActiveVideoIndex(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${isUploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
          >
            {isUploading ? 'Uploading...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoomForm;
