// src/services/cloudinaryService.js
/**
 * Production-Ready Cloudinary Service with CORS handling, error recovery, and mobile optimization
 */

const CLOUDINARY_CONFIG = {
  cloudName: (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dwz0osyou').trim(),
  uploadPreset: (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'career_connect_upload').trim(),
  apiKey: (import.meta.env.VITE_CLOUDINARY_API_KEY || '').trim(),
  apiSecret: (import.meta.env.VITE_CLOUDINARY_API_SECRET || '').trim(),
  baseUrl: 'https://api.cloudinary.com/v1_1',
  secure: true,
};

class CloudinaryService {
  constructor() {
    this.config = CLOUDINARY_CONFIG;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.validateConfig();
    this.logConfig();
  }

  logConfig() {
    console.log('🔧 Cloudinary Config Initialized:', {
      cloudName: this.config.cloudName,
      uploadPreset: this.config.uploadPreset,
      envLoaded: !!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      isProduction: import.meta.env.MODE === 'production',
    });
  }

  validateConfig() {
    const required = ['cloudName', 'uploadPreset'];
    required.forEach((key) => {
      if (!this.config[key]) {
        console.warn(`⚠️ Cloudinary ${key} is not configured`);
      }
    });
  }

  /**
   * Generate Cloudinary upload URL with validation
   */
  getUploadUrl() {
    const cloudName = this.config.cloudName.trim();
    if (!cloudName) {
      throw new Error('Cloudinary cloud name is required');
    }
    return `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  }

  /**
   * Generate Cloudinary image URL with transformations
   */
  getImageUrl(publicId, transformations = {}) {
    if (!publicId) return null;

    const baseUrl = `https://res.cloudinary.com/${this.config.cloudName}/image/upload`;
    const transformString = this.generateTransformString(transformations);

    return `${baseUrl}/${transformString}/${publicId}`;
  }

  /**
   * Generate transformation string optimized for mobile
   */
  generateTransformString(transformations = {}) {
    const defaultTransforms = {
      quality: 'auto:best',
      format: 'auto',
      fetch_format: 'auto',
      dpr: 'auto',
      responsive: true,
    };

    const merged = { ...defaultTransforms, ...transformations };
    const parts = [];

    // Mobile-optimized transformations
    if (merged.width && merged.height) {
      parts.push(`c_${merged.crop || 'fill'}`);
      parts.push(`w_${merged.width}`);
      parts.push(`h_${merged.height}`);
      if (merged.gravity) parts.push(`g_${merged.gravity}`);
    } else if (merged.width) {
      parts.push(`w_${merged.width}`);
    } else if (merged.height) {
      parts.push(`h_${merged.height}`);
    }

    // Quality and format optimizations
    if (merged.quality) parts.push(`q_${merged.quality}`);
    if (merged.format) parts.push(`f_${merged.format}`);
    if (merged.fetch_format) parts.push(`f_${merged.fetch_format}`);

    // Mobile-specific optimizations
    if (merged.dpr) parts.push(`dpr_${merged.dpr}`);
    if (merged.responsive) parts.push('fl_progressive');

    // Additional transformations
    if (merged.radius) parts.push(`r_${merged.radius}`);
    if (merged.effect) parts.push(`e_${merged.effect}`);
    if (merged.opacity) parts.push(`o_${merged.opacity}`);
    if (merged.blur) parts.push(`e_blur:${merged.blur}`);

    return parts.join(',');
  }

  /**
   * Upload image to Cloudinary with retry logic and CORS handling
   */
  async uploadImage(file, options = {}) {
    let lastError = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        if (!file) {
          throw new Error('No file provided');
        }

        console.log(
          `☁️ Uploading to Cloudinary (Attempt ${attempt}/${this.retryAttempts}):`,
          file.name
        );

        // Validate file before upload
        const validation = this.validateFile(file, 'image');
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Optimize image for mobile
        const optimizedFile = await this.optimizeImageForMobile(file, options);

        // Create form data
        const formData = new FormData();
        formData.append('file', optimizedFile);
        formData.append('upload_preset', this.config.uploadPreset);

        // Add optional parameters
        if (options.folder) formData.append('folder', options.folder);
        if (options.tags) formData.append('tags', options.tags.join(','));
        if (options.transformation) {
          formData.append('transformation', this.generateTransformString(options.transformation));
        }
        if (options.context) formData.append('context', options.context);
        if (options.public_id) formData.append('public_id', options.public_id);

        // Get upload URL
        const uploadUrl = this.getUploadUrl();
        console.log('📤 Upload URL:', uploadUrl);

        // Upload with timeout and CORS handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            mode: 'cors',
            credentials: 'omit',
            headers: {
              Accept: 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Cloudinary response error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText,
            });

            if (response.status === 400) {
              throw new Error('Invalid upload request. Check your upload preset.');
            } else if (response.status === 401) {
              throw new Error('Upload unauthorized. Check your Cloudinary configuration.');
            } else if (response.status === 404) {
              throw new Error('Cloudinary endpoint not found. Check your cloud name.');
            } else {
              throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }
          }

          const data = await response.json();

          console.log('✅ Cloudinary upload successful:', {
            public_id: data.public_id,
            format: data.format,
            size: `${(data.bytes / 1024).toFixed(2)}KB`,
            dimensions: `${data.width}x${data.height}`,
          });

          return {
            success: true,
            url: data.secure_url,
            public_id: data.public_id,
            format: data.format,
            bytes: data.bytes,
            width: data.width,
            height: data.height,
            created_at: data.created_at,
            tags: data.tags || [],
            context: data.context || {},
            thumbnail_url: this.getThumbnailUrl(data.public_id),
          };
        } catch (fetchError) {
          clearTimeout(timeoutId);

          if (fetchError.name === 'AbortError') {
            throw new Error('Upload timeout. Please check your internet connection.');
          } else if (
            fetchError.name === 'TypeError' &&
            fetchError.message.includes('Failed to fetch')
          ) {
            throw new Error(
              'Network error. Please check your internet connection and CORS settings.'
            );
          }
          throw fetchError;
        }
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Upload attempt ${attempt} failed:`, error.message);

        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
          continue;
        }
      }
    }

    console.error('❌ All upload attempts failed:', lastError);
    return {
      success: false,
      error: lastError.message,
      code: 'UPLOAD_FAILED',
      attempts: this.retryAttempts,
    };
  }

  /**
   * Upload any file type to Cloudinary (alias for uploadImage with more options)
   * This is the function that was missing from the original service
   */
  async uploadToCloudinary(file, folderPath = '', options = {}) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('☁️ Uploading to Cloudinary:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)}KB`,
        folder: folderPath,
      });

      // Determine resource type based on file
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isPdf = file.type === 'application/pdf';

      let resourceType = 'auto';
      if (isImage) resourceType = 'image';
      if (isVideo) resourceType = 'video';
      if (isPdf) resourceType = 'raw';

      // Build upload options
      const uploadOptions = {
        folder: folderPath,
        resource_type: resourceType,
        ...options,
      };

      // Use appropriate upload method
      let result;
      if (isImage) {
        result = await this.uploadImage(file, uploadOptions);
      } else {
        result = await this.uploadFile(file, uploadOptions);
      }

      if (result.success) {
        console.log('✅ Cloudinary upload completed:', {
          public_id: result.public_id,
          url: result.url,
          size: `${(result.bytes / 1024).toFixed(2)}KB`,
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message,
        code: 'UPLOAD_FAILED',
      };
    }
  }

  /**
   * Get Cloudinary URL (alias for getImageUrl with backward compatibility)
   */
  getCloudinaryUrl(publicId, transformations = {}) {
    return this.getImageUrl(publicId, transformations);
  }

  /**
   * Upload any file type to Cloudinary
   */
  async uploadFile(file, options = {}) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('☁️ Uploading file to Cloudinary:', file.name);

      // Validate file
      const validation = this.validateFile(file, 'document');
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.config.uploadPreset);

      // Set resource type
      const resourceType = options.resource_type || 'auto';
      formData.append('resource_type', resourceType);

      // Add optional parameters
      if (options.folder) formData.append('folder', options.folder);
      if (options.tags) formData.append('tags', options.tags.join(','));
      if (options.context) formData.append('context', options.context);
      if (options.public_id) formData.append('public_id', options.public_id);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.config.cloudName}/${resourceType}/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudinary upload failed: ${errorText}`);
      }

      const data = await response.json();

      return {
        success: true,
        url: data.secure_url,
        public_id: data.public_id,
        resource_type: data.resource_type,
        bytes: data.bytes,
        format: data.format,
        created_at: data.created_at,
      };
    } catch (error) {
      console.error('❌ Cloudinary file upload error:', error);
      return {
        success: false,
        error: error.message,
        code: 'FILE_UPLOAD_FAILED',
      };
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId) {
    try {
      if (!publicId) {
        throw new Error('Public ID is required');
      }

      console.log('🗑️ Deleting from Cloudinary (attempting server-side):', publicId);

      // Prefer server-side deletion when API base is configured
      const API_BASE = import.meta.env.VITE_API_BASE_URL || null;

      if (API_BASE) {
        try {
          // Attempt to get Firebase auth token if available
          let token = null;
          try {
            // eslint-disable-next-line no-undef
            const { auth } = await import('../config/firebase');
            if (auth && auth.currentUser && typeof auth.currentUser.getIdToken === 'function') {
              token = await auth.currentUser.getIdToken();
            }
          } catch (e) {
            // ignore
          }

          const response = await fetch(`${API_BASE}/api/media/cloudinary/delete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ publicId }),
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              console.log('✅ Server-side Cloudinary delete successful');
              return { success: true, server: true, results: data.results };
            }
            return { success: false, error: data.message || 'Server delete failed' };
          }

          const errorText = await response.text();
          console.warn('Server-side Cloudinary delete returned non-OK:', errorText);
        } catch (serverError) {
          console.warn('Server-side Cloudinary delete failed, falling back to client-side:', serverError.message);
        }
      }

      // Fallback to existing client-side delete approach
      console.log('🗑️ Deleting from Cloudinary (client-side fallback):', publicId);
      const timestamp = Math.round(Date.now() / 1000);
      const signature = await this.generateSignature(publicId, timestamp);

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('signature', signature);
      formData.append('api_key', this.config.apiKey);
      formData.append('timestamp', timestamp);

      const response2 = await fetch(
        `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/destroy`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response2.ok) {
        const errorText2 = await response2.text();
        throw new Error(`Cloudinary delete failed: ${errorText2}`);
      }

      const data2 = await response2.json();

      if (data2.result === 'ok') {
        console.log('✅ Cloudinary delete successful (client-side)');
        return { success: true };
      }

      throw new Error(data2.result || 'Delete failed');
    } catch (error) {
      console.error('❌ Cloudinary delete error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file, type = 'image') {
    const validations = {
      image: {
        types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        maxSize: 5 * 1024 * 1024, // 5MB
        maxDimensions: { width: 5000, height: 5000 },
      },
      document: {
        types: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        maxSize: 10 * 1024 * 1024, // 10MB
      },
    };

    const validation = validations[type] || validations.document;

    // Check file type
    if (!validation.types.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${validation.types.map((t) => t.split('/')[1]).join(', ')}`,
      };
    }

    // Check file size
    if (file.size > validation.maxSize) {
      const maxSizeMB = validation.maxSize / (1024 * 1024);
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSizeMB}MB`,
      };
    }

    return { valid: true };
  }

  /**
   * Optimize image for mobile with responsive sizes
   */
  async optimizeImageForMobile(file, options = {}) {
    return new Promise((resolve) => {
      // Skip optimization for small files
      if (file.size <= 1024 * 512) {
        // 512KB
        resolve(file);
        return;
      }

      // Skip non-image files
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Mobile-optimized dimensions
          let width = img.width;
          let height = img.height;
          const maxDimension = options.maxDimension || 1200; // Mobile-optimized max

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // High-quality mobile rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Optimize quality based on file size
          let quality = 0.85;
          if (file.size > 3 * 1024 * 1024) quality = 0.75;
          if (file.size > 5 * 1024 * 1024) quality = 0.65;

          // Convert to WebP for better mobile performance
          const format = 'image/webp';

          canvas.toBlob(
            (blob) => {
              const optimizedFile = new File([blob], file.name.replace(/.[^/.]+$/, '') + '.webp', {
                type: format,
                lastModified: Date.now(),
              });
              console.log('📱 Image optimized for mobile:', {
                original: `${(file.size / 1024).toFixed(2)}KB`,
                optimized: `${(blob.size / 1024).toFixed(2)}KB`,
                reduction: `${((1 - blob.size / file.size) * 100).toFixed(1)}%`,
                dimensions: `${width}x${height}`,
              });
              resolve(optimizedFile);
            },
            format,
            quality
          );
        };
        img.onerror = () => {
          console.warn('⚠️ Image optimization failed, using original');
          resolve(file);
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        console.warn('⚠️ File read error, using original');
        resolve(file);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get optimized thumbnail URL for mobile
   */
  getThumbnailUrl(publicId, size = 200) {
    if (!publicId) return null;
    return this.getImageUrl(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto:good',
      dpr: 'auto',
      format: 'webp',
    });
  }

  /**
   * Get responsive image URLs for different screen sizes
   */
  getResponsiveUrls(publicId, breakpoints = [320, 480, 768, 1024, 1200]) {
    if (!publicId) return {};

    const urls = {};
    breakpoints.forEach((bp) => {
      urls[`w${bp}`] = this.getImageUrl(publicId, {
        width: bp,
        quality: 'auto:good',
        fetch_format: 'auto',
        dpr: 'auto',
        crop: 'scale',
      });
    });

    // Add srcset string for HTML
    urls.srcset = breakpoints
      .map((bp) => `${this.getImageUrl(publicId, { width: bp })} ${bp}w`)
      .join(', ');

    return urls;
  }

  /**
   * Generate signature for authenticated requests
   */
  async generateSignature(publicId, timestamp) {
    try {
      // Note: For production, signatures should be generated server-side
      const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${this.config.apiSecret}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(stringToSign);

      // Simple hash - in production use proper server-side signing
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('❌ Signature generation error:', error);
      throw new Error('Signature generation failed');
    }
  }

  /**
   * Delay helper for retries
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if URL is from Cloudinary
   */
  isCloudinaryUrl(url) {
    return url && (url.includes('res.cloudinary.com') || url.includes('cloudinary.com'));
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  extractPublicId(url) {
    if (!this.isCloudinaryUrl(url)) return null;

    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const uploadIndex = pathParts.indexOf('upload');

      if (uploadIndex !== -1 && pathParts.length > uploadIndex + 1) {
        const publicIdWithExtension = pathParts.slice(uploadIndex + 1).join('/');
        return publicIdWithExtension.replace(/.[^/.]+$/, '');
      }
    } catch (error) {
      console.warn('Could not extract public ID from URL:', url);
    }

    return null;
  }

  /**
   * Generate placeholder image for loading states
   */
  getPlaceholderUrl(width = 300, height = 300) {
    return `https://via.placeholder.com/${width}x${height}/f0f0f0/cccccc?text=Loading...`;
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();

// Export individual functions for backward compatibility
export const uploadImage = cloudinaryService.uploadImage.bind(cloudinaryService);
export const uploadFile = cloudinaryService.uploadFile.bind(cloudinaryService);
export const deleteImage = cloudinaryService.deleteImage.bind(cloudinaryService);
export const validateFile = cloudinaryService.validateFile.bind(cloudinaryService);
export const getImageUrl = cloudinaryService.getImageUrl.bind(cloudinaryService);

// Export the missing functions that were being imported
export const uploadToCloudinary = cloudinaryService.uploadToCloudinary.bind(cloudinaryService);
export const getCloudinaryUrl = cloudinaryService.getCloudinaryUrl.bind(cloudinaryService);

// Default export for backward compatibility
export default cloudinaryService;
