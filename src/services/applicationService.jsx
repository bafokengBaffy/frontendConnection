/* eslint-disable no-unused-vars */
// src/services/applicationService.jsx
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';

import { db } from '../config/firebase';

/**
 * Application Service
 * Handles all application-related operations
 */

// Firestore collections
const APPLICATIONS_COLLECTION = 'applications';
const JOBS_COLLECTION = 'jobs';
const USERS_COLLECTION = 'users';
const COMPANIES_COLLECTION = 'companies';

/**
 * Get applications for a specific student
 * @param {string} studentId - The ID of the student
 * @param {Object} options - Optional parameters for filtering/pagination
 * @returns {Promise<Array>} - Array of application objects
 */
export const getStudentApplications = async (studentId, options = {}) => {
  try {
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    const {
      status = null,
      limitCount = 20,
      lastDoc = null,
      sortBy = 'appliedDate',
      sortOrder = 'desc',
    } = options;

    // Build the query
    let applicationsQuery = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('studentId', '==', studentId),
      orderBy(sortBy, sortOrder),
      limit(limitCount)
    );

    // Add status filter if provided
    if (status) {
      applicationsQuery = query(applicationsQuery, where('status', '==', status));
    }

    // Add pagination if lastDoc is provided
    if (lastDoc) {
      applicationsQuery = query(applicationsQuery, startAfter(lastDoc));
    }

    // Execute query
    const querySnapshot = await getDocs(applicationsQuery);

    const applications = [];
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    // Process each application
    for (const docSnap of querySnapshot.docs) {
      const applicationData = docSnap.data();
      const application = {
        id: docSnap.id,
        ...applicationData,
        // Convert Firestore Timestamps to Date objects
        appliedDate: applicationData.appliedDate?.toDate
          ? applicationData.appliedDate.toDate()
          : applicationData.appliedDate,
        updatedAt: applicationData.updatedAt?.toDate
          ? applicationData.updatedAt.toDate()
          : applicationData.updatedAt,
      };

      // Fetch job details for each application
      if (application.jobId) {
        try {
          const jobDoc = await getDoc(doc(db, JOBS_COLLECTION, application.jobId));
          if (jobDoc.exists()) {
            const jobData = jobDoc.data();
            application.job = {
              id: jobDoc.id,
              ...jobData,
              // Convert Timestamps
              createdAt: jobData.createdAt?.toDate ? jobData.createdAt.toDate() : jobData.createdAt,
              deadline: jobData.deadline?.toDate ? jobData.deadline.toDate() : jobData.deadline,
            };

            // Fetch company details for the job
            if (application.job.companyId) {
              const companyDoc = await getDoc(
                doc(db, COMPANIES_COLLECTION, application.job.companyId)
              );
              if (companyDoc.exists()) {
                application.company = {
                  id: companyDoc.id,
                  ...companyDoc.data(),
                };
              }
            }
          }
        } catch (jobError) {
          console.warn(`Error fetching job details for application ${docSnap.id}:`, jobError);
          // Continue processing other applications even if one fails
        }
      }

      applications.push(application);
    }

    return {
      success: true,
      data: applications,
      lastDoc: lastVisible,
      hasMore: applications.length === limitCount,
    };
  } catch (error) {
    console.error('Error fetching student applications:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      lastDoc: null,
      hasMore: false,
    };
  }
};

/**
 * Get a specific application by ID
 * @param {string} applicationId - The ID of the application
 * @returns {Promise<Object>} - Application object with details
 */
export const getApplicationById = async (applicationId) => {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required');
    }

    const applicationDoc = await getDoc(doc(db, APPLICATIONS_COLLECTION, applicationId));

    if (!applicationDoc.exists()) {
      throw new Error('Application not found');
    }

    const applicationData = applicationDoc.data();
    const application = {
      id: applicationDoc.id,
      ...applicationData,
      appliedDate: applicationData.appliedDate?.toDate
        ? applicationData.appliedDate.toDate()
        : applicationData.appliedDate,
      updatedAt: applicationData.updatedAt?.toDate
        ? applicationData.updatedAt.toDate()
        : applicationData.updatedAt,
    };

    // Fetch job details
    if (application.jobId) {
      const jobDoc = await getDoc(doc(db, JOBS_COLLECTION, application.jobId));
      if (jobDoc.exists()) {
        const jobData = jobDoc.data();
        application.job = {
          id: jobDoc.id,
          ...jobData,
          createdAt: jobData.createdAt?.toDate ? jobData.createdAt.toDate() : jobData.createdAt,
          deadline: jobData.deadline?.toDate ? jobData.deadline.toDate() : jobData.deadline,
        };

        // Fetch company details
        if (application.job.companyId) {
          const companyDoc = await getDoc(doc(db, COMPANIES_COLLECTION, application.job.companyId));
          if (companyDoc.exists()) {
            application.company = {
              id: companyDoc.id,
              ...companyDoc.data(),
            };
          }
        }
      }
    }

    return {
      success: true,
      data: application,
    };
  } catch (error) {
    console.error('Error fetching application by ID:', error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

/**
 * Create a new job application
 * @param {Object} applicationData - Application data
 * @param {string} applicationData.studentId - Student ID
 * @param {string} applicationData.jobId - Job ID
 * @param {Object} applicationData.resumeData - Resume/CV data
 * @param {string} applicationData.coverLetter - Cover letter text
 * @param {Array} applicationData.documents - Array of document references
 * @returns {Promise<Object>} - Created application object
 */
export const submitApplication = async (applicationData) => {
  try {
    const {
      studentId,
      jobId,
      resumeData,
      coverLetter = '',
      documents = [],
      customQuestions = [],
    } = applicationData;

    // Validate required fields
    if (!studentId || !jobId) {
      throw new Error('Student ID and Job ID are required');
    }

    // Check if student already applied
    const existingAppsQuery = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('studentId', '==', studentId),
      where('jobId', '==', jobId)
    );

    const existingApps = await getDocs(existingAppsQuery);
    if (!existingApps.empty) {
      throw new Error('You have already applied for this job');
    }

    // Create application object
    const application = {
      studentId,
      jobId,
      status: 'pending', // pending, reviewed, shortlisted, rejected, hired
      appliedDate: serverTimestamp(),
      updatedAt: serverTimestamp(),
      resumeData: resumeData || {},
      coverLetter,
      documents,
      customQuestions,
      notes: [],
      history: [
        {
          status: 'pending',
          date: serverTimestamp(),
          notes: 'Application submitted',
        },
      ],
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), application);

    // Update job application count
    const jobRef = doc(db, JOBS_COLLECTION, jobId);
    await updateDoc(jobRef, {
      applicationCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      data: {
        id: docRef.id,
        ...application,
      },
      message: 'Application submitted successfully',
    };
  } catch (error) {
    console.error('Error creating application:', error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

/**
 * Update application status
 * @param {string} applicationId - Application ID
 * @param {string} status - New status
 * @param {string} notes - Optional notes about status change
 * @param {string} updatedBy - Who is updating the status
 * @returns {Promise<Object>} - Updated application
 */
export const updateApplicationStatus = async (applicationId, status, notes = '', updatedBy) => {
  try {
    if (!applicationId || !status) {
      throw new Error('Application ID and status are required');
    }

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const applicationRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    const applicationDoc = await getDoc(applicationRef);

    if (!applicationDoc.exists()) {
      throw new Error('Application not found');
    }

    const currentData = applicationDoc.data();
    const historyEntry = {
      status,
      date: serverTimestamp(),
      notes: notes || `Status changed to ${status}`,
      updatedBy,
    };

    await updateDoc(applicationRef, {
      status,
      updatedAt: serverTimestamp(),
      history: [...(currentData.history || []), historyEntry],
    });

    return {
      success: true,
      data: {
        id: applicationId,
        status,
        updatedAt: new Date().toISOString(),
      },
      message: 'Application status updated successfully',
    };
  } catch (error) {
    console.error('Error updating application status:', error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

/**
 * Withdraw an application
 * @param {string} applicationId - Application ID
 * @param {string} studentId - Student ID (for authorization)
 * @param {string} reason - Reason for withdrawal
 * @returns {Promise<Object>} - Result of withdrawal
 */
export const withdrawApplication = async (applicationId, studentId, reason = '') => {
  try {
    if (!applicationId || !studentId) {
      throw new Error('Application ID and Student ID are required');
    }

    const applicationRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    const applicationDoc = await getDoc(applicationRef);

    if (!applicationDoc.exists()) {
      throw new Error('Application not found');
    }

    const applicationData = applicationDoc.data();

    // Verify ownership
    if (applicationData.studentId !== studentId) {
      throw new Error('You are not authorized to withdraw this application');
    }

    // Check if already withdrawn or finalized
    if (applicationData.status === 'withdrawn') {
      throw new Error('Application is already withdrawn');
    }

    if (['hired', 'rejected'].includes(applicationData.status)) {
      throw new Error(`Cannot withdraw application with status: ${applicationData.status}`);
    }

    const historyEntry = {
      status: 'withdrawn',
      date: serverTimestamp(),
      notes: reason || 'Application withdrawn by student',
      updatedBy: studentId,
    };

    await updateDoc(applicationRef, {
      status: 'withdrawn',
      updatedAt: serverTimestamp(),
      history: [...(applicationData.history || []), historyEntry],
      withdrawalReason: reason,
    });

    return {
      success: true,
      message: 'Application withdrawn successfully',
    };
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get application statistics for a student
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} - Application statistics
 */
export const getApplicationStats = async (studentId) => {
  try {
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    const applicationsQuery = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('studentId', '==', studentId)
    );

    const querySnapshot = await getDocs(applicationsQuery);

    let total = 0;
    let pending = 0;
    let reviewed = 0;
    let shortlisted = 0;
    let rejected = 0;
    let hired = 0;
    let withdrawn = 0;

    querySnapshot.forEach((doc) => {
      total++;
      const status = doc.data().status;
      switch (status) {
        case 'pending':
          pending++;
          break;
        case 'reviewed':
          reviewed++;
          break;
        case 'shortlisted':
          shortlisted++;
          break;
        case 'rejected':
          rejected++;
          break;
        case 'hired':
          hired++;
          break;
        case 'withdrawn':
          withdrawn++;
          break;
      }
    });

    return {
      success: true,
      data: {
        total,
        pending,
        reviewed,
        shortlisted,
        rejected,
        hired,
        withdrawn,
        successRate: total > 0 ? (((shortlisted + hired) / total) * 100).toFixed(2) : 0,
      },
    };
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

/**
 * Search applications with filters
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} - Filtered applications
 */
export const searchApplications = async (filters = {}) => {
  try {
    const {
      studentId,
      jobId,
      companyId,
      status,
      dateFrom,
      dateTo,
      limitCount = 20,
      lastDoc = null,
    } = filters;

    let applicationsQuery = collection(db, APPLICATIONS_COLLECTION);

    // Build query constraints
    const constraints = [];

    if (studentId) constraints.push(where('studentId', '==', studentId));
    if (jobId) constraints.push(where('jobId', '==', jobId));
    if (status) constraints.push(where('status', '==', status));

    // Date range filtering
    if (dateFrom) constraints.push(where('appliedDate', '>=', new Date(dateFrom)));
    if (dateTo) constraints.push(where('appliedDate', '<=', new Date(dateTo)));

    // Add ordering
    constraints.push(orderBy('appliedDate', 'desc'));
    constraints.push(limit(limitCount));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    applicationsQuery = query(applicationsQuery, ...constraints);
    const querySnapshot = await getDocs(applicationsQuery);

    const applications = [];
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    for (const docSnap of querySnapshot.docs) {
      const applicationData = docSnap.data();
      const application = {
        id: docSnap.id,
        ...applicationData,
        appliedDate: applicationData.appliedDate?.toDate
          ? applicationData.appliedDate.toDate()
          : applicationData.appliedDate,
        updatedAt: applicationData.updatedAt?.toDate
          ? applicationData.updatedAt.toDate()
          : applicationData.updatedAt,
      };

      // Additional data fetching if needed
      if (companyId) {
        // Verify company matches if companyId filter is applied
        if (application.jobId) {
          const jobDoc = await getDoc(doc(db, JOBS_COLLECTION, application.jobId));
          if (jobDoc.exists() && jobDoc.data().companyId === companyId) {
            applications.push(application);
          }
        }
      } else {
        applications.push(application);
      }
    }

    return {
      success: true,
      data: applications,
      lastDoc: lastVisible,
      hasMore: applications.length === limitCount,
    };
  } catch (error) {
    console.error('Error searching applications:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
};

/**
 * Add note to application
 * @param {string} applicationId - Application ID
 * @param {Object} noteData - Note data
 * @returns {Promise<Object>} - Updated application
 */
export const addApplicationNote = async (applicationId, noteData) => {
  try {
    if (!applicationId || !noteData) {
      throw new Error('Application ID and note data are required');
    }

    const { content, authorId, authorName, authorType } = noteData;

    if (!content || !authorId) {
      throw new Error('Note content and author ID are required');
    }

    const applicationRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    const applicationDoc = await getDoc(applicationRef);

    if (!applicationDoc.exists()) {
      throw new Error('Application not found');
    }

    const currentData = applicationDoc.data();
    const newNote = {
      id: `note_${Date.now()}`,
      content,
      authorId,
      authorName: authorName || 'Anonymous',
      authorType: authorType || 'system',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const updatedNotes = [...(currentData.notes || []), newNote];

    await updateDoc(applicationRef, {
      notes: updatedNotes,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      data: newNote,
      message: 'Note added successfully',
    };
  } catch (error) {
    console.error('Error adding application note:', error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
};

// Export all functions
export const applicationService = {
  getStudentApplications,
  getApplicationById,
  submitApplication,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationStats,
  searchApplications,
  addApplicationNote,
};

export default applicationService;
