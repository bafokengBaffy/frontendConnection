// services/storageService.js
class StorageService {
  constructor() {
    this.cloudinaryConfig = {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY
    };
    
    this.fallbackStorage = new FallbackStorage();
    this.baseUrl = import.meta.env.VITA_API_BASE_URL || 'http://localhost:5001/api';
  }

  /**
   * Upload file with Cloudinary primary and SQLite fallback
   */
  async uploadFile(file, path, metadata = {}) {
    try {
      // Try Cloudinary first
      console.log('📤 Attempting Cloudinary upload...');
      const cloudinaryResult = await this.uploadToCloudinary(file, path, metadata);

      if (cloudinaryResult.success) {
        return cloudinaryResult;
      }

      // Fallback to SQLite
      console.log('🔄 Falling back to SQLite storage...');
      return await this.fallbackStorage.uploadFile(file, path, metadata);

    } catch (error) {
      console.error('❌ Cloudinary upload failed, using SQLite fallback:', error);
      return await this.fallbackStorage.uploadFile(file, path, metadata);
    }
  }

  /**
   * Upload to Cloudinary using backend API
   */
  async uploadToCloudinary(file, path, metadata = {}) {
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.cloudinaryConfig.uploadPreset);
      formData.append('folder', 'career_connect');
      
      // Add metadata
      if (metadata.tags) {
        formData.append('tags', metadata.tags.join(','));
      }
      if (metadata.context) {
        formData.append('context', JSON.stringify(metadata.context));
      }

      // Upload to Cloudinary via our backend
      const response = await fetch(`${this.baseUrl}/upload/cloudinary`, {
        method: 'POST',
        body: formData,
        headers: {
          // Authorization header will be added by the backend if needed
        }
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        path: result.public_id,
        storageType: 'cloudinary',
        metadata: {
          size: file.size,
          type: file.type,
          name: file.name,
          lastModified: file.lastModified,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          created_at: result.created_at
        }
      };
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      throw error;
    }
  }

  /**
   * Direct upload to Cloudinary (frontend only - limited to upload preset)
   */
  async directUploadToCloudinary(file, folder = 'career_connect') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.cloudinaryConfig.uploadPreset);
      formData.append('folder', folder);

      // Direct upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Direct upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Direct Cloudinary upload failed:', error);
      throw error;
    }
  }

  /**
   * Get file URL
   */
  async getFileUrl(path, storageType = 'auto', transformations = {}) {
    try {
      if (storageType === 'cloudinary' || storageType === 'auto') {
        try {
          // Build Cloudinary URL with transformations
          const cloudinaryUrl = this.buildCloudinaryUrl(path, transformations);
          return { 
            success: true, 
            url: cloudinaryUrl, 
            storageType: 'cloudinary' 
          };
        } catch (cloudinaryError) {
          if (storageType === 'cloudinary') throw cloudinaryError;
        }
      }

      // Fallback to SQLite
      return await this.fallbackStorage.getFileUrl(path);
    } catch (error) {
      console.error('❌ Error getting file URL:', error);
      throw error;
    }
  }

  /**
   * Build Cloudinary URL with transformations
   */
  buildCloudinaryUrl(publicId, transformations = {}) {
    const baseUrl = `https://res.cloudinary.com/${this.cloudinaryConfig.cloudName}/image/upload`;
    
    let transformationString = '';
    
    if (transformations.width || transformations.height) {
      transformationString += `w_${transformations.width || 'auto'},h_${transformations.height || 'auto'},c_${transformations.crop || 'fit'}/`;
    }
    
    if (transformations.quality) {
      transformationString += `q_${transformations.quality}/`;
    }
    
    if (transformations.format) {
      transformationString += `f_${transformations.format}/`;
    }

    return `${baseUrl}/${transformationString}${publicId}`;
  }

  /**
   * Delete file
   */
  async deleteFile(path, storageType = 'auto') {
    try {
      if (storageType === 'cloudinary' || storageType === 'auto') {
        try {
          // Delete via backend API
          const response = await fetch(`${this.baseUrl}/upload/cloudinary/${path}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error(`Delete failed: ${response.statusText}`);
          }

          return { success: true, storageType: 'cloudinary' };
        } catch (cloudinaryError) {
          if (storageType === 'cloudinary') throw cloudinaryError;
        }
      }

      // Fallback to SQLite
      return await this.fallbackStorage.deleteFile(path);
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Upload profile photo (optimized for Cloudinary)
   */
  async uploadProfilePhoto(file, userId) {
    const path = `profile_photos/${userId}`;
    const metadata = {
      tags: ['profile', 'photo', `user_${userId}`],
      context: {
        alt: `Profile photo for user ${userId}`,
        caption: 'User profile photo'
      }
    };

    return this.uploadFile(file, path, metadata);
  }

  /**
   * Upload document (PDF, DOC, etc.)
   */
  async uploadDocument(file, userId, documentType) {
    const timestamp = new Date().getTime();
    const path = `documents/${userId}/${documentType}_${timestamp}`;
    const metadata = {
      tags: ['document', documentType, `user_${userId}`],
      context: {
        type: documentType,
        userId: userId,
        uploadedAt: new Date().toISOString()
      }
    };

    return this.uploadFile(file, path, metadata);
  }

  /**
   * Get optimized image URL (for thumbnails, avatars, etc.)
   */
  async getOptimizedImageUrl(publicId, options = {}) {
    const defaultOptions = {
      width: 150,
      height: 150,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      format: 'webp'
    };

    const transformations = { ...defaultOptions, ...options };
    return this.getFileUrl(publicId, 'cloudinary', transformations);
  }
}

/**
 * SQLite Fallback Storage Implementation
 */
class FallbackStorage {
  constructor() {
    this.db = null;
    this.initDatabase();
  }

  /**
   * Initialize SQLite database
   */
  async initDatabase() {
    if (typeof window !== 'undefined' && window.SQL) {
      try {
        this.db = new window.SQL.Database();
        this.createTables();
      } catch (error) {
        console.warn('⚠️ SQL.js not available, using localStorage fallback');
      }
    }
  }

  /**
   * Create necessary tables
   */
  createTables() {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE,
        filename TEXT,
        data BLOB,
        mime_type TEXT,
        size INTEGER,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
      )
    `);
  }

  /**
   * Upload file to SQLite
   */
  async uploadFile(file, path, metadata = {}) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onload = () => {
          try {
            if (this.db) {
              // Store in SQLite
              this.storeInSQLite(path, file, reader.result, metadata, resolve, reject);
            } else {
              // Store in localStorage as fallback
              this.storeInLocalStorage(path, file, reader.result, metadata, resolve, reject);
            }
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsArrayBuffer(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Store file in SQLite
   */
  storeInSQLite(path, file, arrayBuffer, metadata, resolve, reject) {
    try {
      const uint8Array = new Uint8Array(arrayBuffer);

      this.db.run(
        `INSERT OR REPLACE INTO files (path, filename, data, mime_type, size, metadata)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          path,
          file.name,
          uint8Array,
          file.type,
          file.size,
          JSON.stringify(metadata)
        ]
      );

      const url = this.createBlobURL(arrayBuffer, file.type);

      resolve({
        success: true,
        url: url,
        path: path,
        storageType: 'sqlite',
        metadata: {
          size: file.size,
          type: file.type,
          name: file.name,
          lastModified: file.lastModified
        }
      });
    } catch (error) {
      reject(error);
    }
  }

  /**
   * Store file in localStorage (ultimate fallback)
   */
  storeInLocalStorage(path, file, arrayBuffer, metadata, resolve, reject) {
    try {
      const base64Data = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );

      const fileData = {
        filename: file.name,
        data: base64Data,
        mime_type: file.type,
        size: file.size,
        metadata: metadata,
        uploaded_at: new Date().toISOString()
      };

      localStorage.setItem(`file_${path}`, JSON.stringify(fileData));

      const url = this.createBlobURL(arrayBuffer, file.type);

      resolve({
        success: true,
        url: url,
        path: path,
        storageType: 'localStorage',
        metadata: {
          size: file.size,
          type: file.type,
          name: file.name,
          lastModified: file.lastModified
        }
      });
    } catch (error) {
      reject(new Error('All storage methods failed'));
    }
  }

  /**
   * Create blob URL for downloaded files
   */
  createBlobURL(arrayBuffer, mimeType) {
    const blob = new Blob([arrayBuffer], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  /**
   * Get file URL from SQLite
   */
  async getFileUrl(path) {
    return new Promise((resolve, reject) => {
      try {
        if (this.db) {
          const stmt = this.db.prepare('SELECT data, mime_type FROM files WHERE path = ?');
          stmt.bind([path]);

          if (stmt.step()) {
            const row = stmt.getAsObject();
            const arrayBuffer = row.data.buffer;
            const url = this.createBlobURL(arrayBuffer, row.mime_type);

            resolve({
              success: true,
              url: url,
              storageType: 'sqlite'
            });
          } else {
            reject(new Error('File not found'));
          }

          stmt.free();
        } else {
          // Try localStorage
          const fileData = localStorage.getItem(`file_${path}`);
          if (fileData) {
            const parsedData = JSON.parse(fileData);
            const binaryString = atob(parsedData.data);
            const bytes = new Uint8Array(binaryString.length);

            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            const url = this.createBlobURL(bytes.buffer, parsedData.mime_type);

            resolve({
              success: true,
              url: url,
              storageType: 'localStorage'
            });
          } else {
            reject(new Error('File not found'));
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Delete file from SQLite
   */
  async deleteFile(path) {
    return new Promise((resolve, reject) => {
      try {
        if (this.db) {
          this.db.run('DELETE FROM files WHERE path = ?', [path]);
        }

        // Also remove from localStorage if exists
        localStorage.removeItem(`file_${path}`);

        resolve({ success: true, storageType: 'sqlite' });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get all stored files (for management)
   */
  async getAllFiles() {
    return new Promise((resolve, reject) => {
      try {
        const files = [];

        if (this.db) {
          const stmt = this.db.prepare('SELECT path, filename, mime_type, size, uploaded_at FROM files');
          while (stmt.step()) {
            files.push(stmt.getAsObject());
          }
          stmt.free();
        }

        // Also get from localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('file_')) {
            const fileData = JSON.parse(localStorage.getItem(key));
            files.push({
              path: key.replace('file_', ''),
              filename: fileData.filename,
              mime_type: fileData.mime_type,
              size: fileData.size,
              uploaded_at: fileData.uploaded_at,
              storage: 'localStorage'
            });
          }
        }

        resolve(files);
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;