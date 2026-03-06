import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { storageService } from './storageService';

const COLLECTIONS = {
  STUDENTS: 'students',
  APPLICATIONS: 'applications',
  JOBS: 'jobs',
  DOCUMENTS: 'documents',
  NOTIFICATIONS: 'notifications',
  COMPANIES: 'companies',
  USERS: 'users',
};

// ==================== HELPER FUNCTIONS ====================

const safeDateConvert = (firebaseDate) => {
  if (!firebaseDate) return null;
  if (firebaseDate.toDate && typeof firebaseDate.toDate === 'function') {
    return firebaseDate.toDate();
  }
  if (firebaseDate instanceof Date) {
    return firebaseDate;
  }
  if (typeof firebaseDate === 'string') {
    return new Date(firebaseDate);
  }
  return null;
};

const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  let completion = 0;

  // Basic info (30%)
  const basicFields = ['fullName', 'email', 'phone', 'address', 'dateOfBirth'];
  basicFields.forEach((field) => {
    if (profile[field]) completion += 6; // 6% per field
  });

  // Qualifications (30%)
  if (profile.qualifications) {
    const quals = profile.qualifications;
    if (quals.educationLevel && quals.educationLevel !== 'Not specified') completion += 15;
    if (quals.overallGrade && quals.overallGrade !== 'Not specified') completion += 15;
  }

  // Job Preferences (20%)
  if (profile.jobPreferences) {
    const prefs = profile.jobPreferences;
    if (prefs.industries && prefs.industries.length > 0) completion += 10;
    if (prefs.jobTypes && prefs.jobTypes.length > 0) completion += 10;
  }

  // Skills & Documents (20%)
  if (profile.skills && profile.skills.length > 0) completion += 10;
  if (profile.resumeUrl) completion += 10;

  return Math.min(100, completion);
};

const checkJobQualification = async (student, job) => {
  if (!student || !job) return false;

  const studentQuals = student.qualifications || {};
  const studentSkills = student.skills || [];

  // Check education requirements
  if (job.requirements?.minEducation) {
    const educationLevels = {
      high_school: 1,
      diploma: 2,
      bachelors: 3,
      masters: 4,
      phd: 5,
    };

    const studentLevel = educationLevels[studentQuals.educationLevel?.toLowerCase()] || 0;
    const requiredLevel = educationLevels[job.requirements.minEducation?.toLowerCase()] || 0;

    if (studentLevel < requiredLevel) return false;
  }

  // Check skills
  if (job.requirements?.skills && job.requirements.skills.length > 0) {
    const hasRequiredSkills = job.requirements.skills.every((skill) =>
      studentSkills.some(
        (s) =>
          s.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(s.toLowerCase())
      )
    );
    if (!hasRequiredSkills) return false;
  }

  // Check experience
  if (job.requirements?.minExperience && student.experience) {
    if (student.experience < job.requirements.minExperience) return false;
  }

  return true;
};

// ==================== PROFILE OPERATIONS ====================

export const initializeStudentProfile = async (userId, userData = {}) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const studentRef = doc(db, COLLECTIONS.STUDENTS, userId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      const studentData = {
        uid: userId,
        email: userData.email || '',
        fullName: userData.fullName || userData.displayName || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        userType: 'student',
        profileCompletion: 0,
        qualifications: {
          educationLevel: '',
          overallGrade: '',
          subjects: [],
          certificates: [],
        },
        jobPreferences: {
          industries: [],
          jobTypes: [],
          locations: [],
          minSalary: null,
        },
        skills: [],
        experience: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        isActive: true,
      };

      await setDoc(studentRef, studentData);

      // Also update the users collection to ensure userType is set
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: userId,
          email: userData.email || '',
          displayName: userData.fullName || userData.displayName || '',
          userType: 'student',
          role: 'student',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(userRef, {
          userType: 'student',
          role: 'student',
          updatedAt: serverTimestamp(),
        });
      }

      console.log('✅ Student profile initialized for:', userId);
      return { success: true, data: studentData };
    }
    return { success: true, data: studentSnap.data() };
  } catch (error) {
    console.error('❌ Error initializing student profile:', error);
    return { success: false, error: error.message };
  }
};

export const getStudentProfile = async (userId) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const studentRef = doc(db, COLLECTIONS.STUDENTS, userId);
    const studentSnap = await getDoc(studentRef);

    if (studentSnap.exists()) {
      const data = studentSnap.data();

      // Ensure arrays exist
      if (!Array.isArray(data.skills)) data.skills = [];
      if (!Array.isArray(data.qualifications?.subjects)) {
        data.qualifications = data.qualifications || {};
        data.qualifications.subjects = [];
      }

      // Calculate profile completion
      data.profileCompletion = calculateProfileCompletion(data);

      return { success: true, data };
    } else {
      // Try to get user data from users collection
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      // Initialize profile with user data
      const initResult = await initializeStudentProfile(userId, {
        email: userData.email || '',
        fullName: userData.displayName || '',
        userType: 'student',
      });

      if (initResult.success) {
        return { success: true, data: initResult.data };
      }

      // Return basic profile if initialization fails
      return {
        success: true,
        data: {
          uid: userId,
          qualifications: {
            educationLevel: 'Not specified',
            overallGrade: 'Not specified',
            subjects: [],
            certificates: [],
          },
          jobPreferences: {
            industries: [],
            jobTypes: [],
            locations: [],
            minSalary: null,
          },
          skills: [],
          profileCompletion: 0,
        },
      };
    }
  } catch (error) {
    console.error('❌ Error getting student profile:', error);

    // Check if this is a permission error
    if (error.code === 'permission-denied' || error.message.includes('permission')) {
      console.log('🔑 Permission denied - trying alternative approach');

      // Try to get user data instead
      try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          return {
            success: true,
            data: {
              uid: userId,
              email: userData.email,
              fullName: userData.displayName,
              userType: 'student',
              profileCompletion: 30,
              qualifications: {
                educationLevel: 'Not specified',
                overallGrade: 'Not specified',
                subjects: [],
                certificates: [],
              },
              jobPreferences: {
                industries: [],
                jobTypes: [],
                locations: [],
                minSalary: null,
              },
              skills: [],
            },
          };
        }
      } catch (userError) {
        console.error('❌ Error getting user data:', userError);
      }
    }

    return { success: false, error: error.message };
  }
};

export const updateStudentProfile = async (userId, updates) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const studentRef = doc(db, COLLECTIONS.STUDENTS, userId);

    // Check if document exists
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
      // Initialize first
      await initializeStudentProfile(userId, updates);
    } else {
      // Update existing
      await updateDoc(studentRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }

    // Recalculate profile completion
    const updatedProfile = await getStudentProfile(userId);
    if (updatedProfile.success && updatedProfile.data) {
      const completion = calculateProfileCompletion(updatedProfile.data);
      await updateDoc(studentRef, { profileCompletion: completion });
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error updating student profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateStudentQualifications = async (userId, qualifications) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const studentRef = doc(db, COLLECTIONS.STUDENTS, userId);
    await updateDoc(studentRef, {
      qualifications: qualifications,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error updating qualifications:', error);
    return { success: false, error: error.message };
  }
};

export const updateJobPreferences = async (userId, preferences) => {
  try {
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const studentRef = doc(db, COLLECTIONS.STUDENTS, userId);
    await updateDoc(studentRef, {
      jobPreferences: preferences,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error updating job preferences:', error);
    return { success: false, error: error.message };
  }
};

// ==================== DOCUMENT OPERATIONS ====================

export const uploadResume = async (file, userId) => {
  try {
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!validTypes.includes(file.type)) {
      return { success: false, error: 'Please upload a PDF or Word document' };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 10MB' };
    }

    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `students/${userId}/resumes/${timestamp}_${safeFileName}`;

    console.log('📤 Uploading resume...');

    const uploadResult = await storageService.uploadFile(file, filePath, {
      customMetadata: {
        studentId: userId,
        documentType: 'resume',
        originalName: file.name,
      },
    });

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Resume upload failed');
    }

    console.log('✅ Resume uploaded successfully via:', uploadResult.storageType);

    // Update student profile with resume URL
    const studentRef = doc(db, COLLECTIONS.STUDENTS, userId);
    await updateDoc(studentRef, {
      resumeUrl: uploadResult.url,
      resumeStorageType: uploadResult.storageType,
      updatedAt: serverTimestamp(),
    });

    // Also save to documents collection
    const documentData = {
      studentId: userId,
      documentType: 'resume',
      fileName: file.name,
      fileUrl: uploadResult.url,
      storagePath: filePath,
      storageType: uploadResult.storageType,
      uploadedAt: serverTimestamp(),
      fileSize: file.size,
      mimeType: file.type,
      status: 'active',
    };

    await addDoc(collection(db, COLLECTIONS.DOCUMENTS), documentData);

    return {
      success: true,
      url: uploadResult.url,
      storageType: uploadResult.storageType,
    };
  } catch (error) {
    console.error('❌ Error uploading resume:', error);
    return { success: false, error: error.message };
  }
};

export const getStudentDocuments = async (studentId) => {
  try {
    if (!studentId) {
      return { success: false, error: 'Student ID is required' };
    }

    const documentsRef = collection(db, COLLECTIONS.DOCUMENTS);
    const q = query(
      documentsRef,
      where('studentId', '==', studentId),
      orderBy('uploadedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const documents = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: safeDateConvert(doc.data().uploadedAt),
    }));

    return { success: true, data: documents };
  } catch (error) {
    console.error('❌ Error getting student documents:', error);
    return { success: false, error: error.message };
  }
};

export const uploadDocument = async (userId, file, documentType) => {
  try {
    if (!userId || !file) {
      return { success: false, error: 'User ID and file are required' };
    }

    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return { success: false, error: 'Please upload PDF, Word, or image files only' };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 10MB' };
    }

    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `students/${userId}/documents/${documentType}_${timestamp}_${safeFileName}`;

    console.log('📤 Starting file upload process...');

    const uploadResult = await storageService.uploadFile(file, filePath, {
      customMetadata: {
        studentId: userId,
        documentType: documentType,
        originalName: file.name,
      },
    });

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    console.log('✅ File uploaded successfully:', uploadResult.storageType);

    const documentData = {
      studentId: userId,
      documentType,
      fileName: file.name,
      fileUrl: uploadResult.url,
      storagePath: filePath,
      storageType: uploadResult.storageType,
      uploadedAt: serverTimestamp(),
      fileSize: file.size,
      mimeType: file.type,
      status: 'active',
    };

    const documentsRef = collection(db, COLLECTIONS.DOCUMENTS);
    const docRef = await addDoc(documentsRef, documentData);

    return {
      success: true,
      id: docRef.id,
      url: uploadResult.url,
      storageType: uploadResult.storageType,
      message: 'Document uploaded successfully!',
    };
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    return { success: false, error: error.message };
  }
};

export const deleteDocument = async (documentId, storagePath) => {
  try {
    if (!documentId) {
      return { success: false, error: 'Document ID is required' };
    }

    if (storagePath) {
      try {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      } catch (storageError) {
        console.warn('⚠️ Could not delete file from storage:', storageError);
      }
    }

    const documentRef = doc(db, COLLECTIONS.DOCUMENTS, documentId);
    await deleteDoc(documentRef);

    return { success: true, message: 'Document deleted successfully!' };
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    return { success: false, error: error.message };
  }
};

// ==================== JOB OPERATIONS ====================

export const getJobs = async (studentId = null) => {
  try {
    const jobsRef = collection(db, COLLECTIONS.JOBS);
    const jobsQuery = query(
      jobsRef,
      where('status', '==', 'active'),
      where('deadline', '>=', new Date())
    );
    const jobsSnap = await getDocs(jobsQuery);
    const jobs = jobsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (studentId) {
      const studentProfile = await getStudentProfile(studentId);
      if (studentProfile.success) {
        const qualifiedJobs = [];
        for (const job of jobs) {
          const isQualified = await checkJobQualification(studentProfile.data, job);
          if (isQualified) qualifiedJobs.push(job);
        }
        return { success: true, data: qualifiedJobs };
      }
    }

    return { success: true, data: jobs };
  } catch (error) {
    console.error('❌ Error getting jobs:', error);
    return { success: false, error: error.message };
  }
};

export const getRecommendedJobs = async (studentId) => {
  try {
    if (!studentId) return { success: false, error: 'Student ID is required' };

    const studentProfile = await getStudentProfile(studentId);
    if (!studentProfile.success) return { success: false, error: 'Student profile not found' };

    const jobsResult = await getJobs();
    if (!jobsResult.success) return { success: false, error: 'Failed to load jobs' };

    const student = studentProfile.data;
    const studentSkills = student.skills || [];
    const studentPreferences = student.jobPreferences || {};

    const recommendedJobs = jobsResult.data.filter((job) => {
      // Check qualifications
      const isQualified = checkJobQualification(student, job);
      if (!isQualified) return false;

      // Check preferences if set
      if (studentPreferences.industries?.length > 0) {
        if (!studentPreferences.industries.includes(job.industry)) return false;
      }

      if (studentPreferences.jobTypes?.length > 0) {
        if (!studentPreferences.jobTypes.includes(job.jobType)) return false;
      }

      if (studentPreferences.minSalary && job.salary) {
        if (job.salary < studentPreferences.minSalary) return false;
      }

      return true;
    });

    // Sort by relevance (more skills matched = higher rank)
    recommendedJobs.sort((a, b) => {
      const aSkills = a.requirements?.skills || [];
      const bSkills = b.requirements?.skills || [];

      const aMatches = aSkills.filter((skill) =>
        studentSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
      ).length;

      const bMatches = bSkills.filter((skill) =>
        studentSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
      ).length;

      return bMatches - aMatches;
    });

    return { success: true, data: recommendedJobs };
  } catch (error) {
    console.error('❌ Error getting recommended jobs:', error);
    return { success: false, error: error.message };
  }
};

// ==================== APPLICATION OPERATIONS ====================

export const applyForJob = async (applicationData) => {
  try {
    console.log('📝 Submitting job application:', applicationData);

    const application = {
      ...applicationData,
      appliedAt: serverTimestamp(),
      status: 'pending',
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'applications'), application);

    console.log('✅ Application submitted successfully:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Error submitting application:', error);
    return { success: false, error: error.message };
  }
};

export const checkExistingApplication = async (studentId, jobId) => {
  try {
    if (!studentId || !jobId) {
      return { success: false, error: 'Student ID and Job ID are required' };
    }

    const applicationsRef = collection(db, COLLECTIONS.APPLICATIONS);
    const q = query(
      applicationsRef,
      where('studentId', '==', studentId),
      where('jobId', '==', jobId)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: true, exists: false };
    } else {
      const existingApp = querySnapshot.docs[0];
      return {
        success: true,
        exists: true,
        applicationId: existingApp.id,
        data: existingApp.data(),
      };
    }
  } catch (error) {
    console.error('❌ Error checking existing application:', error);
    return { success: false, error: error.message };
  }
};

export const getStudentApplications = async (studentId) => {
  try {
    if (!studentId) return { success: false, error: 'Student ID is required' };

    const applicationsRef = collection(db, COLLECTIONS.APPLICATIONS);
    const q = query(
      applicationsRef,
      where('studentId', '==', studentId),
      orderBy('appliedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const applications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: safeDateConvert(doc.data().appliedAt),
    }));

    return { success: true, data: applications };
  } catch (error) {
    console.error('❌ Error getting student applications:', error);
    return { success: false, error: error.message };
  }
};

export const getApplicationById = async (applicationId) => {
  try {
    if (!applicationId) {
      return { success: false, error: 'Application ID is required' };
    }

    const applicationRef = doc(db, COLLECTIONS.APPLICATIONS, applicationId);
    const applicationSnap = await getDoc(applicationRef);

    if (applicationSnap.exists()) {
      const data = applicationSnap.data();
      return {
        success: true,
        data: {
          id: applicationSnap.id,
          ...data,
          appliedAt: safeDateConvert(data.appliedAt),
        },
      };
    } else {
      return { success: false, error: 'Application not found' };
    }
  } catch (error) {
    console.error('❌ Error getting application by ID:', error);
    return { success: false, error: error.message };
  }
};

export const getStudentJobApplications = async (studentId) => {
  try {
    if (!studentId) return { success: false, error: 'Student ID is required' };

    const applicationsRef = collection(db, COLLECTIONS.APPLICATIONS);
    const q = query(
      applicationsRef,
      where('studentId', '==', studentId),
      where('type', '==', 'job'),
      orderBy('appliedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const applications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: safeDateConvert(doc.data().appliedAt),
    }));

    return { success: true, data: applications };
  } catch (error) {
    console.error('❌ Error getting student job applications:', error);
    return { success: false, error: error.message };
  }
};

export const updateApplicationStatus = async (applicationId, status, notes = '') => {
  try {
    if (!applicationId) {
      return { success: false, error: 'Application ID is required' };
    }

    const applicationRef = doc(db, COLLECTIONS.APPLICATIONS, applicationId);
    await updateDoc(applicationRef, {
      status,
      notes,
      updatedAt: serverTimestamp(),
      reviewedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error updating application status:', error);
    return { success: false, error: error.message };
  }
};

// ==================== NOTIFICATION OPERATIONS ====================

export const getStudentNotifications = async (studentId, limitCount = 10) => {
  try {
    if (!studentId) return { success: false, error: 'Student ID is required' };

    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = query(
      notificationsRef,
      where('userId', '==', studentId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: safeDateConvert(doc.data().createdAt),
      read: doc.data().read || false,
    }));

    return { success: true, data: notifications };
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    return { success: true, data: [] };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

export const getUnreadNotificationsCount = async (studentId) => {
  try {
    const result = await getStudentNotifications(studentId, 100);
    if (result.success) {
      const unreadCount = result.data.filter((notification) => !notification.read).length;
      return { success: true, count: unreadCount };
    }
    return { success: true, count: 0 };
  } catch (error) {
    console.error('❌ Error getting unread notifications count:', error);
    return { success: true, count: 0 };
  }
};

export const createNotification = async (notificationData) => {
  try {
    const notification = {
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false,
    };

    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notification);
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return { success: false, error: error.message };
  }
};

// ==================== DASHBOARD OPERATIONS ====================

export const getDashboardStats = async (studentId) => {
  try {
    if (!studentId) return { success: false, error: 'Student ID is required' };

    const [applicationsRes, notificationsRes, profileRes, jobMatchesRes] = await Promise.all([
      getStudentApplications(studentId),
      getStudentNotifications(studentId),
      getStudentProfile(studentId),
      getRecommendedJobs(studentId),
    ]);

    const pendingApplications = applicationsRes.success
      ? applicationsRes.data.filter(
          (app) => app.status === 'pending' || app.status === 'under_review'
        ).length
      : 0;

    const acceptedApplications = applicationsRes.success
      ? applicationsRes.data.filter(
          (app) => app.status === 'accepted' || app.status === 'approved' || app.status === 'hired'
        ).length
      : 0;

    const jobMatches = jobMatchesRes.success ? jobMatchesRes.data.length : 0;
    const unreadNotifications = notificationsRes.success
      ? notificationsRes.data.filter((notif) => !notif.read).length
      : 0;

    const profileCompletion = profileRes.success ? profileRes.data.profileCompletion || 0 : 0;

    return {
      success: true,
      data: {
        pendingApplications,
        acceptedApplications,
        jobMatches,
        unreadNotifications,
        profileCompletion,
      },
    };
  } catch (error) {
    console.error('❌ Error getting dashboard stats:', error);
    return { success: false, error: error.message };
  }
};

// ==================== EXPORT DEFAULT ====================

export default {
  // Profile Operations
  initializeStudentProfile,
  getStudentProfile,
  updateStudentProfile,
  updateStudentQualifications,
  updateJobPreferences,

  // Document Operations
  uploadResume,
  getStudentDocuments,
  uploadDocument,
  deleteDocument,

  // Job Operations
  getJobs,
  getRecommendedJobs,
  applyForJob,
  checkExistingApplication,

  // Application Operations
  getStudentApplications,
  getStudentJobApplications,
  getApplicationById,
  updateApplicationStatus,

  // Notification Operations
  getStudentNotifications,
  markNotificationAsRead,
  getUnreadNotificationsCount,
  createNotification,

  // Dashboard Operations
  getDashboardStats,
};
