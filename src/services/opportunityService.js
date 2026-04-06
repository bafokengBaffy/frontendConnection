/* eslint-disable no-unused-vars */
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
  Timestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { db } from '../config/firebase';

// Opportunity types
export const OPPORTUNITY_TYPES = {
  JOB: 'job',
  COURSE: 'course',
  FUNDING: 'funding',
  BUSINESS_IDEA: 'business',
  MENTORSHIP: 'mentorship',
  NETWORKING: 'networking',
  INCUBATION: 'incubation',
  COMPETITION: 'competition',
  RESOURCE: 'resource',
};

// Categories
export const CATEGORIES = {
  TECHNOLOGY: 'technology',
  BUSINESS: 'business',
  EDUCATION: 'education',
  HEALTHCARE: 'healthcare',
  AGRICULTURE: 'agriculture',
  MARKETING: 'marketing',
  FINANCE: 'finance',
  ARTS: 'arts',
  SPORTS: 'sports',
  OTHER: 'other',
};

// Opportunity status
export const STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  UPCOMING: 'upcoming',
  DRAFT: 'draft',
};

// Get all opportunities with filters
export const getOpportunities = async ({
  type = null,
  category = null,
  location = null,
  searchQuery = '',
  page = 1,
  pageSize = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}) => {
  try {
    let opportunitiesQuery = collection(db, 'opportunities');
    const constraints = [];

    // Apply filters
    if (type) constraints.push(where('type', '==', type));
    if (category) constraints.push(where('category', '==', category));
    if (location) constraints.push(where('location', '==', location));

    // Filter by status (only show open/upcoming to users)
    constraints.push(where('status', 'in', ['open', 'upcoming']));

    // Apply sorting
    constraints.push(orderBy(sortBy, sortOrder));

    // Add pagination
    constraints.push(limit(pageSize));

    // Create the query
    opportunitiesQuery = query(opportunitiesQuery, ...constraints);

    const snapshot = await getDocs(opportunitiesQuery);
    const opportunities = [];

    snapshot.forEach((doc) => {
      opportunities.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        deadline: doc.data().deadline?.toDate() || null,
      });
    });

    // If there's a search query, filter results
    let filteredOpportunities = opportunities;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredOpportunities = opportunities.filter(
        (opp) =>
          opp.title?.toLowerCase().includes(query) ||
          opp.description?.toLowerCase().includes(query) ||
          opp.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          opp.company?.toLowerCase().includes(query) ||
          opp.institution?.toLowerCase().includes(query) ||
          opp.organization?.toLowerCase().includes(query)
      );
    }

    // Get total count for pagination
    const countQuery = query(
      collection(db, 'opportunities'),
      where('status', 'in', ['open', 'upcoming'])
    );
    const countSnapshot = await getDocs(countQuery);
    const total = countSnapshot.size;

    return {
      opportunities: filteredOpportunities,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    throw error;
  }
};

// Get single opportunity by ID
export const getOpportunityById = async (id) => {
  try {
    const opportunityRef = doc(db, 'opportunities', id);
    const opportunitySnap = await getDoc(opportunityRef);

    if (opportunitySnap.exists()) {
      const data = opportunitySnap.data();
      return {
        id: opportunitySnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        deadline: data.deadline?.toDate() || null,
        updatedAt: data.updatedAt?.toDate() || null,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    throw error;
  }
};

// Get opportunities by user (for saved/bookmarked)
export const getSavedOpportunities = async (userId) => {
  try {
    const savedQuery = query(
      collection(db, 'saved_opportunities'),
      where('userId', '==', userId),
      orderBy('savedAt', 'desc')
    );

    const snapshot = await getDocs(savedQuery);
    const savedIds = snapshot.docs.map((doc) => doc.data().opportunityId);

    if (savedIds.length === 0) return [];

    // Fetch the actual opportunities
    const opportunities = [];
    for (const oppId of savedIds) {
      try {
        const opportunity = await getOpportunityById(oppId);
        if (opportunity) {
          opportunities.push(opportunity);
        }
      } catch (error) {
        console.error(`Error fetching opportunity ${oppId}:`, error);
      }
    }

    return opportunities;
  } catch (error) {
    console.error('Error fetching saved opportunities:', error);
    throw error;
  }
};

// Save/unsave opportunity for user
export const toggleSaveOpportunity = async (userId, opportunityId) => {
  try {
    const savedQuery = query(
      collection(db, 'saved_opportunities'),
      where('userId', '==', userId),
      where('opportunityId', '==', opportunityId)
    );

    const snapshot = await getDocs(savedQuery);

    if (snapshot.empty) {
      // Save the opportunity
      await addDoc(collection(db, 'saved_opportunities'), {
        userId,
        opportunityId,
        savedAt: Timestamp.now(),
      });

      // Increment saved count on opportunity
      const oppRef = doc(db, 'opportunities', opportunityId);
      await updateDoc(oppRef, {
        savedCount: (await getDoc(oppRef)).data().savedCount + 1,
      });

      return { saved: true };
    } else {
      // Unsave the opportunity
      const savedDoc = snapshot.docs[0];
      await deleteDoc(doc(db, 'saved_opportunities', savedDoc.id));

      // Decrement saved count on opportunity
      const oppRef = doc(db, 'opportunities', opportunityId);
      await updateDoc(oppRef, {
        savedCount: Math.max(0, (await getDoc(oppRef)).data().savedCount - 1),
      });

      return { saved: false };
    }
  } catch (error) {
    console.error('Error toggling saved opportunity:', error);
    throw error;
  }
};

// Get opportunity statistics
export const getOpportunityStats = async () => {
  try {
    const opportunitiesQuery = query(
      collection(db, 'opportunities'),
      where('status', 'in', ['open', 'upcoming'])
    );

    const snapshot = await getDocs(opportunitiesQuery);
    const stats = {
      total: 0,
      jobs: 0,
      courses: 0,
      funding: 0,
      business: 0,
      mentorship: 0,
      networking: 0,
      incubation: 0,
      competitions: 0,
      resources: 0,
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      stats[data.type + 's'] = (stats[data.type + 's'] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching opportunity stats:', error);
    throw error;
  }
};

// Apply for an opportunity
export const applyForOpportunity = async (opportunityId, userId, applicationData) => {
  try {
    const applicationRef = await addDoc(collection(db, 'applications'), {
      opportunityId,
      userId,
      status: 'pending',
      appliedAt: Timestamp.now(),
      ...applicationData,
    });

    // Update opportunity application count
    const oppRef = doc(db, 'opportunities', opportunityId);
    await updateDoc(oppRef, {
      applicationCount: (await getDoc(oppRef)).data().applicationCount + 1,
    });

    return applicationRef.id;
  } catch (error) {
    console.error('Error applying for opportunity:', error);
    throw error;
  }
};

// Upload opportunity document
export const uploadOpportunityDocument = async (file, opportunityId) => {
  try {
    const storage = getStorage();
    const fileRef = ref(storage, `opportunities/${opportunityId}/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Get user's applications
export const getUserApplications = async (userId) => {
  try {
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('userId', '==', userId),
      orderBy('appliedAt', 'desc')
    );

    const snapshot = await getDocs(applicationsQuery);
    const applications = [];

    for (const appDoc of snapshot.docs) {
      const appData = appDoc.data();
      const opportunity = await getOpportunityById(appData.opportunityId);

      applications.push({
        id: appDoc.id,
        ...appData,
        appliedAt: appData.appliedAt?.toDate() || new Date(),
        opportunity,
      });
    }

    return applications;
  } catch (error) {
    console.error('Error fetching user applications:', error);
    throw error;
  }
};

// Search opportunities with advanced filters
export const searchOpportunities = async (searchParams) => {
  try {
    const {
      query: searchQuery = '',
      type,
      category,
      location,
      minSalary,
      maxSalary,
      deadlineAfter,
      deadlineBefore,
      experienceLevel,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      pageSize = 10,
    } = searchParams;

    let opportunitiesQuery = collection(db, 'opportunities');
    const constraints = [where('status', 'in', ['open', 'upcoming'])];

    // Add type filter
    if (type && type !== 'all') {
      constraints.push(where('type', '==', type));
    }

    // Add category filter
    if (category && category !== 'all') {
      constraints.push(where('category', '==', category));
    }

    // Add location filter
    if (location) {
      constraints.push(where('location', '==', location));
    }

    // Add salary range filter
    if (minSalary !== undefined || maxSalary !== undefined) {
      const salaryConstraints = [];
      if (minSalary !== undefined) salaryConstraints.push(where('minSalary', '>=', minSalary));
      if (maxSalary !== undefined) salaryConstraints.push(where('maxSalary', '<=', maxSalary));
      // Note: This assumes salary fields exist in the opportunity document
    }

    // Add deadline filters
    if (deadlineAfter) {
      constraints.push(where('deadline', '>=', Timestamp.fromDate(new Date(deadlineAfter))));
    }
    if (deadlineBefore) {
      constraints.push(where('deadline', '<=', Timestamp.fromDate(new Date(deadlineBefore))));
    }

    // Add experience level filter
    if (experienceLevel && experienceLevel !== 'all') {
      constraints.push(where('experienceLevel', '==', experienceLevel));
    }

    // Apply sorting
    constraints.push(orderBy(sortBy, sortOrder));

    // Create the query
    opportunitiesQuery = query(opportunitiesQuery, ...constraints);
    const snapshot = await getDocs(opportunitiesQuery);

    let opportunities = [];
    snapshot.forEach((doc) => {
      opportunities.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        deadline: doc.data().deadline?.toDate() || null,
      });
    });

    // Apply search query filter on the client side for better flexibility
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      opportunities = opportunities.filter((opp) => {
        return (
          opp.title?.toLowerCase().includes(queryLower) ||
          opp.description?.toLowerCase().includes(queryLower) ||
          opp.tags?.some((tag) => tag.toLowerCase().includes(queryLower)) ||
          opp.company?.toLowerCase().includes(queryLower) ||
          opp.requirements?.toLowerCase().includes(queryLower) ||
          opp.skills?.some((skill) => skill.toLowerCase().includes(queryLower))
        );
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOpportunities = opportunities.slice(startIndex, endIndex);

    return {
      opportunities: paginatedOpportunities,
      total: opportunities.length,
      page,
      pageSize,
      totalPages: Math.ceil(opportunities.length / pageSize),
    };
  } catch (error) {
    console.error('Error searching opportunities:', error);
    throw error;
  }
};

// Get popular opportunities (most viewed/applied)
export const getPopularOpportunities = async (limit = 5) => {
  try {
    const opportunitiesQuery = query(
      collection(db, 'opportunities'),
      where('status', 'in', ['open', 'upcoming']),
      orderBy('viewCount', 'desc'),
      orderBy('applicationCount', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(opportunitiesQuery);
    const opportunities = [];

    snapshot.forEach((doc) => {
      opportunities.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });

    return opportunities;
  } catch (error) {
    console.error('Error fetching popular opportunities:', error);
    throw error;
  }
};

// Get recently posted opportunities
export const getRecentOpportunities = async (limit = 5) => {
  try {
    const opportunitiesQuery = query(
      collection(db, 'opportunities'),
      where('status', 'in', ['open', 'upcoming']),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );

    const snapshot = await getDocs(opportunitiesQuery);
    const opportunities = [];

    snapshot.forEach((doc) => {
      opportunities.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      });
    });

    return opportunities;
  } catch (error) {
    console.error('Error fetching recent opportunities:', error);
    throw error;
  }
};

// Increment view count for an opportunity
export const incrementViewCount = async (opportunityId) => {
  try {
    const oppRef = doc(db, 'opportunities', opportunityId);
    const oppSnap = await getDoc(oppRef);

    if (oppSnap.exists()) {
      const currentCount = oppSnap.data().viewCount || 0;
      await updateDoc(oppRef, {
        viewCount: currentCount + 1,
        lastViewedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

// Get opportunities by creator (for companies/institutions)
export const getOpportunitiesByCreator = async (creatorId, creatorType) => {
  try {
    const opportunitiesQuery = query(
      collection(db, 'opportunities'),
      where('creatorId', '==', creatorId),
      where('creatorType', '==', creatorType),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(opportunitiesQuery);
    const opportunities = [];

    snapshot.forEach((doc) => {
      opportunities.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        deadline: doc.data().deadline?.toDate() || null,
      });
    });

    return opportunities;
  } catch (error) {
    console.error('Error fetching creator opportunities:', error);
    throw error;
  }
};

// Get opportunity categories with counts
export const getCategoriesWithCounts = async () => {
  try {
    const opportunitiesQuery = query(
      collection(db, 'opportunities'),
      where('status', 'in', ['open', 'upcoming'])
    );

    const snapshot = await getDocs(opportunitiesQuery);
    const categoryCounts = {};

    snapshot.forEach((doc) => {
      const category = doc.data().category;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    return categoryCounts;
  } catch (error) {
    console.error('Error fetching category counts:', error);
    throw error;
  }
};
