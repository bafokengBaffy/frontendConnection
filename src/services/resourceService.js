import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebase';

// Resource types
export const RESOURCE_TYPES = {
  GUIDE: 'guide',
  TEMPLATE: 'template',
  VIDEO: 'video',
  COURSE: 'course',
  TOOL: 'tool',
  EBOOK: 'ebook',
  CHECKLIST: 'checklist',
  PRESENTATION: 'presentation'
};

// Resource categories
export const RESOURCE_CATEGORIES = {
  BUSINESS: 'business',
  CAREER: 'career',
  FUNDING: 'funding',
  ENTREPRENEURSHIP: 'entrepreneurship',
  SKILLS: 'skills',
  MARKETING: 'marketing',
  FINANCE: 'finance',
  TECHNOLOGY: 'technology',
  LEGAL: 'legal',
  OTHER: 'other'
};

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// Get all resources with filters
export const getResources = async ({
  category = null,
  type = null,
  difficulty = null,
  searchQuery = '',
  page = 1,
  pageSize = 10,
  sortBy = 'downloads',
  sortOrder = 'desc'
}) => {
  try {
    let resourcesQuery = collection(db, 'resources');
    const constraints = [];
    
    // Apply filters
    if (category) constraints.push(where('category', '==', category));
    if (type) constraints.push(where('type', '==', type));
    if (difficulty) constraints.push(where('difficulty', '==', difficulty));
    
    // Only show published resources
    constraints.push(where('published', '==', true));
    
    // Apply sorting
    constraints.push(orderBy(sortBy, sortOrder));
    
    // Add pagination
    constraints.push(limit(pageSize));
    
    // Create the query
    resourcesQuery = query(resourcesQuery, ...constraints);
    
    const snapshot = await getDocs(resourcesQuery);
    const resources = [];
    
    snapshot.forEach((doc) => {
      resources.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || null
      });
    });
    
    // Apply search query filter
    let filteredResources = resources;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredResources = resources.filter(resource =>
        resource.title?.toLowerCase().includes(query) ||
        resource.description?.toLowerCase().includes(query) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        resource.author?.toLowerCase().includes(query)
      );
    }
    
    // Get total count for pagination
    const countQuery = query(collection(db, 'resources'), where('published', '==', true));
    const countSnapshot = await getDocs(countQuery);
    const total = countSnapshot.size;
    
    return {
      resources: filteredResources,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

// Get single resource by ID
export const getResourceById = async (id) => {
  try {
    const resourceRef = doc(db, 'resources', id);
    const resourceSnap = await getDoc(resourceRef);
    
    if (resourceSnap.exists()) {
      const data = resourceSnap.data();
      return {
        id: resourceSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || null
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching resource:', error);
    throw error;
  }
};

// Get featured resources
export const getFeaturedResources = async (limit = 6) => {
  try {
    const resourcesQuery = query(
      collection(db, 'resources'),
      where('published', '==', true),
      where('featured', '==', true),
      orderBy('downloads', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(resourcesQuery);
    const resources = [];
    
    snapshot.forEach((doc) => {
      resources.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      });
    });
    
    return resources;
  } catch (error) {
    console.error('Error fetching featured resources:', error);
    throw error;
  }
};

// Get resources by author
export const getResourcesByAuthor = async (authorId) => {
  try {
    const resourcesQuery = query(
      collection(db, 'resources'),
      where('authorId', '==', authorId),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(resourcesQuery);
    const resources = [];
    
    snapshot.forEach((doc) => {
      resources.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      });
    });
    
    return resources;
  } catch (error) {
    console.error('Error fetching author resources:', error);
    throw error;
  }
};

// Get bookmarked resources for user
export const getBookmarkedResources = async (userId) => {
  try {
    const bookmarksQuery = query(
      collection(db, 'resource_bookmarks'),
      where('userId', '==', userId),
      orderBy('bookmarkedAt', 'desc')
    );
    
    const snapshot = await getDocs(bookmarksQuery);
    const resourceIds = snapshot.docs.map(doc => doc.data().resourceId);
    
    if (resourceIds.length === 0) return [];
    
    // Fetch the actual resources
    const resources = [];
    for (const resourceId of resourceIds) {
      try {
        const resource = await getResourceById(resourceId);
        if (resource && resource.published) {
          resources.push(resource);
        }
      } catch (error) {
        console.error(`Error fetching resource ${resourceId}:`, error);
      }
    }
    
    return resources;
  } catch (error) {
    console.error('Error fetching bookmarked resources:', error);
    throw error;
  }
};

// Toggle bookmark for resource
export const toggleResourceBookmark = async (userId, resourceId) => {
  try {
    const bookmarkQuery = query(
      collection(db, 'resource_bookmarks'),
      where('userId', '==', userId),
      where('resourceId', '==', resourceId)
    );
    
    const snapshot = await getDocs(bookmarkQuery);
    
    if (snapshot.empty) {
      // Add bookmark
      await addDoc(collection(db, 'resource_bookmarks'), {
        userId,
        resourceId,
        bookmarkedAt: Timestamp.now()
      });
      
      // Increment bookmark count
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, {
        bookmarkCount: (await getDoc(resourceRef)).data().bookmarkCount + 1
      });
      
      return { bookmarked: true };
    } else {
      // Remove bookmark
      const bookmarkDoc = snapshot.docs[0];
      await deleteDoc(doc(db, 'resource_bookmarks', bookmarkDoc.id));
      
      // Decrement bookmark count
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, {
        bookmarkCount: Math.max(0, (await getDoc(resourceRef)).data().bookmarkCount - 1)
      });
      
      return { bookmarked: false };
    }
  } catch (error) {
    console.error('Error toggling resource bookmark:', error);
    throw error;
  }
};

// Increment download count for resource
export const incrementResourceDownloads = async (resourceId) => {
  try {
    const resourceRef = doc(db, 'resources', resourceId);
    const resourceSnap = await getDoc(resourceRef);
    
    if (resourceSnap.exists()) {
      const currentDownloads = resourceSnap.data().downloads || 0;
      await updateDoc(resourceRef, {
        downloads: currentDownloads + 1,
        lastDownloadedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error incrementing download count:', error);
  }
};

// Upload resource file
export const uploadResourceFile = async (file, resourceId) => {
  try {
    const storage = getStorage();
    const timestamp = Date.now();
    const fileName = `${resourceId}_${timestamp}_${file.name}`;
    const fileRef = ref(storage, `resources/${resourceId}/${fileName}`);
    
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    
    return {
      url: downloadURL,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };
  } catch (error) {
    console.error('Error uploading resource file:', error);
    throw error;
  }
};

// Get resource statistics
export const getResourceStats = async () => {
  try {
    const resourcesQuery = query(
      collection(db, 'resources'),
      where('published', '==', true)
    );
    
    const snapshot = await getDocs(resourcesQuery);
    const stats = {
      total: 0,
      guides: 0,
      templates: 0,
      videos: 0,
      courses: 0,
      tools: 0,
      free: 0,
      premium: 0,
      totalDownloads: 0,
      totalBookmarks: 0
    };
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      
      // Count by type
      if (data.type) {
        stats[data.type + 's'] = (stats[data.type + 's'] || 0) + 1;
      }
      
      // Count free vs premium
      if (data.premium) {
        stats.premium++;
      } else {
        stats.free++;
      }
      
      // Sum downloads and bookmarks
      stats.totalDownloads += data.downloads || 0;
      stats.totalBookmarks += data.bookmarkCount || 0;
    });
    
    return stats;
  } catch (error) {
    console.error('Error fetching resource stats:', error);
    throw error;
  }
};

// Get popular resources
export const getPopularResources = async (limit = 5) => {
  try {
    const resourcesQuery = query(
      collection(db, 'resources'),
      where('published', '==', true),
      orderBy('downloads', 'desc'),
      orderBy('bookmarkCount', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(resourcesQuery);
    const resources = [];
    
    snapshot.forEach((doc) => {
      resources.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      });
    });
    
    return resources;
  } catch (error) {
    console.error('Error fetching popular resources:', error);
    throw error;
  }
};

// Get recently added resources
export const getRecentResources = async (limit = 5) => {
  try {
    const resourcesQuery = query(
      collection(db, 'resources'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(resourcesQuery);
    const resources = [];
    
    snapshot.forEach((doc) => {
      resources.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      });
    });
    
    return resources;
  } catch (error) {
    console.error('Error fetching recent resources:', error);
    throw error;
  }
};

// Search resources with advanced filters
export const searchResources = async (searchParams) => {
  try {
    const {
      query: searchQuery = '',
      category,
      type,
      difficulty,
      premium,
      author,
      minDownloads,
      maxDownloads,
      sortBy = 'downloads',
      sortOrder = 'desc',
      page = 1,
      pageSize = 10
    } = searchParams;
    
    let resourcesQuery = collection(db, 'resources');
    const constraints = [where('published', '==', true)];
    
    // Add filters
    if (category && category !== 'all') {
      constraints.push(where('category', '==', category));
    }
    if (type && type !== 'all') {
      constraints.push(where('type', '==', type));
    }
    if (difficulty && difficulty !== 'all') {
      constraints.push(where('difficulty', '==', difficulty));
    }
    if (premium !== undefined) {
      constraints.push(where('premium', '==', premium));
    }
    if (author) {
      constraints.push(where('authorId', '==', author));
    }
    
    // Apply sorting
    constraints.push(orderBy(sortBy, sortOrder));
    
    // Create the query
    resourcesQuery = query(resourcesQuery, ...constraints);
    const snapshot = await getDocs(resourcesQuery);
    
    let resources = [];
    snapshot.forEach((doc) => {
      resources.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      });
    });
    
    // Apply search query filter
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      resources = resources.filter(resource => {
        return (
          resource.title?.toLowerCase().includes(queryLower) ||
          resource.description?.toLowerCase().includes(queryLower) ||
          resource.tags?.some(tag => tag.toLowerCase().includes(queryLower)) ||
          resource.author?.toLowerCase().includes(queryLower) ||
          resource.content?.toLowerCase().includes(queryLower)
        );
      });
    }
    
    // Apply download range filter
    if (minDownloads !== undefined || maxDownloads !== undefined) {
      resources = resources.filter(resource => {
        const downloads = resource.downloads || 0;
        if (minDownloads !== undefined && downloads < minDownloads) return false;
        if (maxDownloads !== undefined && downloads > maxDownloads) return false;
        return true;
      });
    }
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResources = resources.slice(startIndex, endIndex);
    
    return {
      resources: paginatedResources,
      total: resources.length,
      page,
      pageSize,
      totalPages: Math.ceil(resources.length / pageSize)
    };
  } catch (error) {
    console.error('Error searching resources:', error);
    throw error;
  }
};

// Get resource categories with counts
export const getResourceCategoriesWithCounts = async () => {
  try {
    const resourcesQuery = query(
      collection(db, 'resources'),
      where('published', '==', true)
    );
    
    const snapshot = await getDocs(resourcesQuery);
    const categoryCounts = {};
    
    snapshot.forEach((doc) => {
      const category = doc.data().category;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });
    
    return categoryCounts;
  } catch (error) {
    console.error('Error fetching resource category counts:', error);
    throw error;
  }
};

// Add resource rating
export const addResourceRating = async (resourceId, userId, rating, review) => {
  try {
    // Check if user already rated
    const ratingQuery = query(
      collection(db, 'resource_ratings'),
      where('resourceId', '==', resourceId),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(ratingQuery);
    
    if (snapshot.empty) {
      // Add new rating
      await addDoc(collection(db, 'resource_ratings'), {
        resourceId,
        userId,
        rating,
        review,
        ratedAt: Timestamp.now()
      });
      
      // Update resource rating stats
      const resourceRef = doc(db, 'resources', resourceId);
      const resourceSnap = await getDoc(resourceRef);
      
      if (resourceSnap.exists()) {
        const data = resourceSnap.data();
        const totalRatings = data.totalRatings || 0;
        const avgRating = data.rating || 0;
        
        const newTotalRatings = totalRatings + 1;
        const newAvgRating = ((avgRating * totalRatings) + rating) / newTotalRatings;
        
        await updateDoc(resourceRef, {
          rating: newAvgRating,
          totalRatings: newTotalRatings,
          lastRatedAt: Timestamp.now()
        });
      }
      
      return { success: true, message: 'Rating added successfully' };
    } else {
      return { success: false, message: 'You have already rated this resource' };
    }
  } catch (error) {
    console.error('Error adding resource rating:', error);
    throw error;
  }
};

// Get resource ratings
export const getResourceRatings = async (resourceId, limit = 10) => {
  try {
    const ratingsQuery = query(
      collection(db, 'resource_ratings'),
      where('resourceId', '==', resourceId),
      orderBy('ratedAt', 'desc'),
      limit(limit)
    );
    
    const snapshot = await getDocs(ratingsQuery);
    const ratings = [];
    
    snapshot.forEach((doc) => {
      ratings.push({
        id: doc.id,
        ...doc.data(),
        ratedAt: doc.data().ratedAt?.toDate() || new Date()
      });
    });
    
    return ratings;
  } catch (error) {
    console.error('Error fetching resource ratings:', error);
    throw error;
  }
};