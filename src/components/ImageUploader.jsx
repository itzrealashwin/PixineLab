'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';

// This is a helper function to read the file and convert it to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export function ImageUploader({ onImageUpload, onImageRemove }) {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // Show a local preview immediately
      
      try {
        const base64String = await fileToBase64(file);
        // The result includes a prefix like "data:image/jpeg;base64,"
        // We need to strip that part before sending it to the API.
        const pureBase64 = base64String.split(',')[1];
        onImageUpload(pureBase64); // Pass the pure base64 string to the parent
      } catch (error) {
        console.error("Error converting file to base64:", error);
      }
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    multiple: false,
  });

  const handleRemoveImage = (e) => {
    e.stopPropagation(); // Prevent triggering the dropzone click
    setPreview(null);
    onImageRemove();
  };

  return (
    <div
      {...getRootProps()}
      className={`relative w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
    >
      <input {...getInputProps()} />
      
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Image preview" className="w-full h-auto rounded-md object-cover" />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-gray-500">
          <UploadCloud className="w-12 h-12 mb-2" />
          <p className="font-semibold">Click to upload or drag & drop</p>
          <p className="text-sm">PNG or JPG</p>
          <p className="text-xs mt-1">(Optional, for image modification)</p>
        </div>
      )}
    </div>
  );
}
