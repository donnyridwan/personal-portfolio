import React, { useState, useRef } from 'react';
import { uploadToCloudinary, getCloudinaryConfig } from '../../lib/cloudinary';

export default function MediaUploader({ value, onChange, mediaType = 'image', onMediaTypeChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const config = getCloudinaryConfig();
  const hasCloudinary = Boolean(config.cloudName && config.uploadPreset);

  const handleFile = async (file) => {
    if (!file) return;

    // Detect media type
    const isVideo = file.type.startsWith('video/');
    if (onMediaTypeChange) {
      onMediaTypeChange(isVideo ? 'video' : 'image');
    }

    if (!hasCloudinary) {
      setError('Cloudinary belum disetting. Silakan isi Cloud Name & Upload Preset di tab Cloudinary Settings.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const result = await uploadToCloudinary(file, {
        onProgress: (p) => setUploadProgress(p),
      });

      onChange(result.url);
      if (onMediaTypeChange && result.resourceType) {
        onMediaTypeChange(result.resourceType);
      }
    } catch (err) {
      setError(err.message || 'Gagal mengupload ke Cloudinary');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full font-sans">
      {/* Media Type Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-[12px] font-medium uppercase tracking-[0.5px] text-[#737373]">
          Media Asset (Image / Video)
        </label>
        <div className="flex items-center gap-1 bg-[#efeeec] p-0.5 rounded-none text-[11px]">
          <button
            type="button"
            onClick={() => onMediaTypeChange && onMediaTypeChange('image')}
            className={`px-2.5 py-1 transition-all ${
              mediaType === 'image'
                ? 'bg-black text-white font-medium'
                : 'text-[#666] hover:text-black'
            }`}
          >
            Image
          </button>
          <button
            type="button"
            onClick={() => onMediaTypeChange && onMediaTypeChange('video')}
            className={`px-2.5 py-1 transition-all ${
              mediaType === 'video'
                ? 'bg-black text-white font-medium'
                : 'text-[#666] hover:text-black'
            }`}
          >
            Video
          </button>
        </div>
      </div>

      {/* Preview Box */}
      {value ? (
        <div className="relative border border-[#e5e5e7] bg-[#f5f5f7] p-3 flex flex-col items-center justify-center group overflow-hidden">
          {mediaType === 'video' ? (
            <video
              src={value}
              controls
              playsInline
              className="max-h-[240px] w-auto max-w-full object-contain rounded-none"
            />
          ) : (
            <img
              src={value}
              alt="Media Preview"
              className="max-h-[240px] w-auto max-w-full object-contain rounded-none"
            />
          )}

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-white text-black text-[12px] font-medium rounded-none hover:bg-neutral-100"
            >
              Ganti Media
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3.5 py-1.5 bg-red-600 text-white text-[12px] font-medium rounded-none hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Box */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-black bg-[#f0f0f2]'
              : 'border-[#d8d8dc] bg-[#f8f8fa] hover:border-neutral-400 hover:bg-[#f2f2f5]'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
              <span className="text-[13px] text-[#171717] font-medium">
                Mengupload ke Cloudinary ({uploadProgress}%)...
              </span>
              <div className="w-48 h-1.5 bg-neutral-200 rounded-none overflow-hidden mt-1">
                <div
                  className="h-full bg-black transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-2">
              <svg className="w-7 h-7 text-[#737373]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-[13px] font-medium text-[#171717]">
                Klik atau drag file gambar/video ke sini
              </p>
              <p className="text-[11.5px] text-[#8a8a8a]">
                {hasCloudinary
                  ? 'Otomatis diupload ke Cloudinary'
                  : 'Atur Cloudinary di tab Settings untuk auto-upload'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />

      {/* Manual URL input fallback */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Atau masukkan URL gambar / video langsung..."
          className="flex-1 bg-white border border-[#e5e5e7] px-3 py-1.5 text-[12.5px] text-[#171717] focus:outline-none focus:border-black rounded-none"
        />
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 bg-[#f0f0f2] text-[11px] text-[#555] hover:text-black whitespace-nowrap"
          >
            Buka ↗
          </a>
        )}
      </div>

      {error && (
        <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 px-3 py-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
