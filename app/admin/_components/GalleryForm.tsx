"use client";

import React, { useState } from "react";
import FileUpload from "./FileUpload";
import Modal from "./Modal";
import { GALLERY_CATEGORIES } from "@/lib/config";

interface GalleryItem {
  id: number;
  category: string;
  url: string;
  caption: string;
  publicId?: string; // UploadThing file key for deletion
}

interface GalleryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: GalleryItem) => void;
  item?: GalleryItem;
  isEditing: boolean;
}

const GalleryForm: React.FC<GalleryFormProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  isEditing,
}) => {
  const [formData, setFormData] = useState<GalleryItem>(
    item || {
      id: Date.now(),
      category: "",
      url: "",
      caption: "",
      publicId: "",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (fileUrl: string, publicId?: string) => {
    console.log('📁 GalleryForm - File uploaded:', { fileUrl, publicId });
    setFormData((prev) => {
      const updated = {
        ...prev,
        url: fileUrl,
        publicId: publicId || prev.publicId
      };
      console.log('📊 GalleryForm - Updated formData:', JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📝 GalleryForm - handleSubmit called');
    console.log('📊 GalleryForm - Current formData:', JSON.stringify(formData, null, 2));

    // Validate that a file has been uploaded for new items
    if (!isEditing && (!formData.url || formData.url.trim() === '')) {
      console.error('❌ GalleryForm - Validation failed: No file uploaded');
      alert('Please upload a file before saving.');
      return;
    }

    // Validate required fields
    if (!formData.category.trim()) {
      console.error('❌ GalleryForm - Validation failed: No category selected');
      alert('Please select a category.');
      return;
    }

    console.log('✅ GalleryForm - Validation passed, calling onSave');
    onSave(formData);
    onClose();
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    if (!isEditing && (!formData.url || formData.url.trim() === '')) {
      return false;
    }
    return formData.category.trim() !== '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Gallery Image" : "Add New Gallery Image"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Upload Image <span className="text-red-500">*</span>
          </label>
          <FileUpload
            onFileUpload={handleFileUpload}
            currentImage={formData.url}
            label="Choose Image"
            fileType="image"
          />
          {!isEditing && (!formData.url || formData.url.trim() === '') && (
            <p className="text-sm text-red-600 mt-1">
              Please upload an image file to continue.
            </p>
          )}
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Caption/Title
          </label>
          <input
            type="text"
            name="caption"
            value={formData.caption}
            onChange={handleChange}
            placeholder="Enter a descriptive caption"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
            required
          >
            <option value="">Select a category</option>
            {GALLERY_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <p className="text-xs text-blue-600 mt-1 bg-blue-50 p-2 rounded">
            💡 Images will be displayed in the gallery section and can be filtered by category.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid()}
            className={`px-6 py-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${isFormValid()
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {isEditing ? "Update Image" : "Add Image"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GalleryForm;
