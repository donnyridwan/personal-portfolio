/**
 * Cloudinary Media Service for Donny Ridwan Portfolio CMS
 * Supports image and video uploads directly to Cloudinary.
 */

const STORAGE_KEY = 'donny_portfolio_cloudinary_config';

export function getCloudinaryConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to read Cloudinary config from storage:', e);
  }

  return {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
    folder: 'portfolio',
  };
}

export function saveCloudinaryConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save Cloudinary config to storage:', e);
  }
}

/**
 * Uploads an image or video directly to Cloudinary
 * @param {File} file - Browser File object
 * @param {Object} options - { cloudName, uploadPreset, folder, onProgress }
 * @returns {Promise<Object>} Cloudinary asset details
 */
export async function uploadToCloudinary(file, options = {}) {
  const config = { ...getCloudinaryConfig(), ...options };

  if (!config.cloudName) {
    throw new Error('Cloudinary Cloud Name belum diisi. Silakan atur di tab Cloudinary Settings.');
  }

  if (!config.uploadPreset) {
    throw new Error('Cloudinary Upload Preset belum diisi. Buat unsigned upload preset di dashboard Cloudinary.');
  }

  const url = `https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  if (config.folder) {
    formData.append('folder', config.folder);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    if (options.onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({
            url: res.secure_url || res.url,
            publicId: res.public_id,
            resourceType: res.resource_type || (file.type.startsWith('video/') ? 'video' : 'image'),
            format: res.format,
            bytes: res.bytes,
            width: res.width,
            height: res.height,
            duration: res.duration,
          });
        } catch (e) {
          reject(new Error('Invalid JSON response from Cloudinary'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || `Cloudinary upload failed (status ${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload to Cloudinary. Check internet connection and CORS settings.'));
    };

    xhr.send(formData);
  });
}
