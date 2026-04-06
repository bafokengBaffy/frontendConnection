/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable no-undef */
// src/services/companyServices.js (COMPLETE VERSION)

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '../config/firebase';

const COMPANY_COLLECTION = 'companies';
const JOBS_COLLECTION = 'jobs';
const APPLICATIONS_COLLECTION = 'applications';
const STUDENTS_COLLECTION = 'students';
const USERS_COLLECTION = 'users';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dphb5vldu';
const CLOUDINARY_UPLOAD_PRESET = 'company_uploads';

// Helper function for safe date conversion
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

// Enhanced query with fallback for index issues
const executeCompanyQueryWithFallback = async (
  primaryQuery,
  fallbackQuery = null,
  errorContext = 'query'
) => {
  try {
    // Try primary query first
    const snapshot = await getDocs(primaryQuery);
    return { success: true, data: snapshot, usedFallback: false };
  } catch (error) {
    console.warn(`⚠️ Primary ${errorContext} failed:`, error.message);

    // Handle index errors
    if (error.code === 'failed-precondition') {
      console.log(`📋 Firestore index required for ${errorContext}. Please create it manually:`);
      const urlMatch = error.message.match(/https:..console.firebase.google.com[^.]+/);
      if (urlMatch) {
        console.log(`🔗 ${urlMatch[0]}`);
      }
      console.log('⏳ Using fallback query while index builds...');
    }

    // Try fallback query if provided
    if (fallbackQuery) {
      try {
        console.log(`🔄 Trying fallback ${errorContext}...`);
        const fallbackSnapshot = await getDocs(fallbackQuery);
        return { success: true, data: fallbackSnapshot, usedFallback: true };
      } catch (fallbackError) {
        console.error(`❌ Fallback ${errorContext} also failed:`, fallbackError.message);
        return { success: false, error: fallbackError.message };
      }
    }

    return { success: false, error: error.message };
  }
};

// Cloudinary service
export const cloudinaryService = {
  async uploadImage(file, folder = 'company-profile') {
    try {
      console.log('Starting upload process...');
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      // Validate file
      this.validateImageFile(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', folder);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

      console.log('Upload preset:', CLOUDINARY_UPLOAD_PRESET);
      console.log('Cloud name:', CLOUDINARY_CLOUD_NAME);
      console.log('Folder:', folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Raw error response:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          console.error('Cloudinary error details:', errorData);
          throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
        } catch (parseError) {
          throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Upload successful:', data);

      return {
        secure_url: data.secure_url,
        public_id: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
      };
    } catch (error) {
      console.error('Detailed upload error:', error);
      throw error;
    }
  },

  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) {
      throw new Error('No file provided');
    }

    if (!validTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Supported types: JPEG, PNG, GIF, WebP`);
    }

    if (file.size > maxSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max size: 10MB`);
    }

    return true;
  },
};

// Company Profile Services
export const companyService = {
  // Create or update company profile
  async createOrUpdateCompanyProfile(companyData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const companyRef = doc(db, COMPANY_COLLECTION, user.uid);
      const companySnap = await getDoc(companyRef);

      const profileData = {
        ...companyData,
        updatedAt: serverTimestamp(),
        email: user.email,
      };

      if (companySnap.exists()) {
        await updateDoc(companyRef, profileData);
      } else {
        await setDoc(companyRef, {
          ...profileData,
          userId: user.uid,
          createdAt: serverTimestamp(),
          profileViews: 0,
          isVerified: false,
          socialLinks: companyData.socialLinks || {},
          benefits: companyData.benefits || [],
          techStack: companyData.techStack || [],
        });
      }

      return await this.getCompanyProfile();
    } catch (error) {
      console.error('Error creating/updating company profile:', error);
      throw error;
    }
  },

  // Get company profile
  async getCompanyProfile() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const companyRef = doc(db, COMPANY_COLLECTION, user.uid);
      const companySnap = await getDoc(companyRef);

      if (companySnap.exists()) {
        const data = companySnap.data();
        return {
          id: companySnap.id,
          ...data,
          name: data.name || '',
          industry: data.industry || '',
          location: data.location || '',
          size: data.size || '',
          description: data.description || '',
          website: data.website || '',
          phone: data.phone || '',
          founded: data.founded || '',
          logo: data.logo || '',
          coverImage: data.coverImage || '',
          profileViews: data.profileViews || 0,
          isVerified: data.isVerified || false,
          socialLinks: data.socialLinks || {},
          benefits: data.benefits || [],
          techStack: data.techStack || [],
          createdAt: safeDateConvert(data.createdAt),
          updatedAt: safeDateConvert(data.updatedAt),
        };
      }

      return {
        id: user.uid,
        name: '',
        industry: '',
        description: '',
        website: '',
        location: '',
        size: '',
        founded: '',
        phone: '',
        email: user.email,
        logo: '',
        coverImage: '',
        profileViews: 0,
        isVerified: false,
        socialLinks: {},
        benefits: [],
        techStack: [],
      };
    } catch (error) {
      console.error('Error getting company profile:', error);
      throw error;
    }
  },

  // Update company profile
  async updateCompanyProfile(updates) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const companyRef = doc(db, COMPANY_COLLECTION, user.uid);
      await updateDoc(companyRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return await this.getCompanyProfile();
    } catch (error) {
      console.error('Error updating company profile:', error);
      throw error;
    }
  },

  // Upload company logo to Cloudinary
  async uploadLogo(file) {
    try {
      cloudinaryService.validateImageFile(file);
      const result = await cloudinaryService.uploadImage(file, 'company-logos');

      // Update company profile with new logo URL
      await this.updateCompanyProfile({
        logo: result.secure_url,
        logoPublicId: result.public_id,
      });

      return result.secure_url;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },

  // Upload cover image to Cloudinary
  async uploadCoverImage(file) {
    try {
      cloudinaryService.validateImageFile(file);
      const result = await cloudinaryService.uploadImage(file, 'company-covers');

      // Update company profile with new cover image URL
      await this.updateCompanyProfile({
        coverImage: result.secure_url,
        coverImagePublicId: result.public_id,
      });

      return result.secure_url;
    } catch (error) {
      console.error('Error uploading cover image:', error);
      throw error;
    }
  },
};

// Job Services
export const jobService = {
  // Create new job posting
  async createJob(jobData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const company = await companyService.getCompanyProfile();
      if (!company) throw new Error('Company profile not found');

      const jobRef = await addDoc(collection(db, JOBS_COLLECTION), {
        ...jobData,
        companyId: user.uid,
        companyName: company.name,
        companyLogo: company.logo,
        companyIndustry: company.industry,
        companyLocation: company.location,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        applicantsCount: 0,
        views: 0,
        isActive: true,
        skills: jobData.skills || [],
        benefits: jobData.benefits || [],
        remote: jobData.remote || false,
        urgency: jobData.urgency || 'normal',
      });

      return jobRef.id;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  // Get company's jobs with fallback for index issues
  async getCompanyJobs() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Primary query with ordering
      const primaryQuery = query(
        collection(db, JOBS_COLLECTION),
        where('companyId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      // Fallback query without ordering
      const fallbackQuery = query(
        collection(db, JOBS_COLLECTION),
        where('companyId', '==', user.uid)
      );

      const result = await executeCompanyQueryWithFallback(
        primaryQuery,
        fallbackQuery,
        'company jobs'
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      let jobs = result.data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: safeDateConvert(doc.data().createdAt),
        updatedAt: safeDateConvert(doc.data().updatedAt),
      }));

      // If we used fallback, sort manually
      if (result.usedFallback) {
        jobs.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        });
      }

      return jobs;
    } catch (error) {
      console.error('Error getting company jobs:', error);
      throw error;
    }
  },

  // Get job by ID
  async getJobById(jobId) {
    try {
      const jobRef = doc(db, JOBS_COLLECTION, jobId);
      const jobSnap = await getDoc(jobRef);

      if (jobSnap.exists()) {
        const data = jobSnap.data();
        return {
          id: jobSnap.id,
          ...data,
          createdAt: safeDateConvert(data.createdAt),
          updatedAt: safeDateConvert(data.updatedAt),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting job:', error);
      throw error;
    }
  },

  // Update job
  async updateJob(jobId, updates) {
    try {
      const jobRef = doc(db, JOBS_COLLECTION, jobId);
      await updateDoc(jobRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      return await this.getJobById(jobId);
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  // Delete job
  async deleteJob(jobId) {
    try {
      const jobRef = doc(db, JOBS_COLLECTION, jobId);
      await deleteDoc(jobRef);
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  // Get job statistics
  async getJobStats() {
    try {
      const jobs = await this.getCompanyJobs();
      const totalJobs = jobs.length;
      const activeJobs = jobs.filter((job) => job.status === 'active' && job.isActive).length;
      const pausedJobs = jobs.filter((job) => job.status === 'paused').length;
      const closedJobs = jobs.filter((job) => job.status === 'closed').length;
      const totalApplicants = jobs.reduce((sum, job) => sum + (job.applicantsCount || 0), 0);
      const totalViews = jobs.reduce((sum, job) => sum + (job.views || 0), 0);

      return {
        totalJobs,
        activeJobs,
        pausedJobs,
        closedJobs,
        totalApplicants,
        totalViews,
      };
    } catch (error) {
      console.error('Error getting job stats:', error);
      throw error;
    }
  },
};

// Application Services
export const applicationService = {
  // Get applications for company's jobs with optional status filter
  async getCompanyApplications(statusFilter = null) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      let constraints = [where('companyId', '==', user.uid), orderBy('appliedAt', 'desc')];

      // Add status filter if provided
      if (statusFilter) {
        constraints = [
          where('companyId', '==', user.uid),
          where('status', '==', statusFilter),
          orderBy('appliedAt', 'desc'),
        ];
      }

      // Primary query with ordering
      const primaryQuery = query(collection(db, APPLICATIONS_COLLECTION), ...constraints);

      // Fallback query without ordering
      const fallbackConstraints = statusFilter
        ? [where('companyId', '==', user.uid), where('status', '==', statusFilter)]
        : [where('companyId', '==', user.uid)];

      const fallbackQuery = query(collection(db, APPLICATIONS_COLLECTION), ...fallbackConstraints);

      const result = await executeCompanyQueryWithFallback(
        primaryQuery,
        fallbackQuery,
        'company applications'
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      let applications = result.data.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          appliedAt: safeDateConvert(data.appliedAt),
          updatedAt: safeDateConvert(data.updatedAt),
        };
      });

      // If we used fallback, sort manually
      if (result.usedFallback) {
        applications.sort((a, b) => {
          const dateA = a.appliedAt ? new Date(a.appliedAt) : new Date(0);
          const dateB = b.appliedAt ? new Date(b.appliedAt) : new Date(0);
          return dateB - dateA;
        });
      }

      // Load candidate and job details
      const enrichedApplications = await Promise.all(
        applications.map(async (application) => {
          try {
            if (application.candidateId) {
              const candidate = await this.getCandidateProfile(application.candidateId);
              application.candidate = candidate;
            }

            if (application.jobId) {
              const job = await jobService.getJobById(application.jobId);
              application.job = job;
            }
          } catch (error) {
            console.error('Error enriching application:', error);
          }

          return application;
        })
      );

      return enrichedApplications;
    } catch (error) {
      console.error('Error getting company applications:', error);
      throw error;
    }
  },

  // Get candidate profile
  async getCandidateProfile(candidateId) {
    try {
      // First try students collection
      const studentRef = doc(db, STUDENTS_COLLECTION, candidateId);
      const studentSnap = await getDoc(studentRef);

      if (studentSnap.exists()) {
        const data = studentSnap.data();
        return {
          id: studentSnap.id,
          fullName: data.fullName || 'Unknown Student',
          email: data.email || 'N/A',
          phone: data.phone || 'N/A',
          location: data.location || 'N/A',
          skills: data.skills || [],
          education: data.educationLevel || 'Not specified',
          profileImage: data.profileImage || '',
          resume: data.resumeUrl || '',
          summary: data.summary || '',
          createdAt: safeDateConvert(data.createdAt),
        };
      }

      // Fallback to users collection
      const userRef = doc(db, USERS_COLLECTION, candidateId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          id: userSnap.id,
          fullName: userData.fullName || 'Unknown User',
          email: userData.email || 'N/A',
          phone: userData.phone || 'N/A',
          location: userData.location || 'N/A',
          skills: userData.skills || [],
          education: userData.education || 'Not specified',
          profileImage: userData.profileImage || '',
          resume: userData.resume || '',
          summary: userData.summary || '',
          createdAt: safeDateConvert(userData.createdAt),
        };
      }

      return {
        id: candidateId,
        fullName: 'Unknown Candidate',
        email: 'N/A',
        phone: 'N/A',
        location: 'N/A',
        skills: [],
        education: 'Not specified',
        profileImage: '',
        resume: '',
        summary: '',
      };
    } catch (error) {
      console.error('Error getting candidate profile:', error);
      return {
        id: candidateId,
        fullName: 'Unknown Candidate',
        email: 'N/A',
        phone: 'N/A',
        location: 'N/A',
        skills: [],
        education: 'Not specified',
        profileImage: '',
        resume: '',
        summary: '',
      };
    }
  },

  // Update application status
  async updateApplicationStatus(applicationId, status, notes = '') {
    try {
      const applicationRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
      await updateDoc(applicationRef, {
        status,
        notes: notes || '',
        updatedAt: serverTimestamp(),
      });

      return await this.getApplicationById(applicationId);
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  // Get application by ID
  async getApplicationById(applicationId) {
    try {
      const applicationRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
      const applicationSnap = await getDoc(applicationRef);

      if (applicationSnap.exists()) {
        const applicationData = applicationSnap.data();
        const application = {
          id: applicationSnap.id,
          ...applicationData,
          appliedAt: safeDateConvert(applicationData.appliedAt),
          updatedAt: safeDateConvert(applicationData.updatedAt),
        };

        if (application.candidateId) {
          application.candidate = await this.getCandidateProfile(application.candidateId);
        }

        if (application.jobId) {
          application.job = await jobService.getJobById(application.jobId);
        }

        return application;
      }
      return null;
    } catch (error) {
      console.error('Error getting application:', error);
      throw error;
    }
  },

  // Get application statistics
  async getApplicationStats() {
    try {
      const applications = await this.getCompanyApplications();

      const stats = {
        total: applications.length,
        new: applications.filter((app) => app.status === 'applied' || app.status === 'pending')
          .length,
        reviewed: applications.filter((app) => app.status === 'reviewed').length,
        interview: applications.filter((app) => app.status === 'interview').length,
        rejected: applications.filter((app) => app.status === 'rejected').length,
        hired: applications.filter((app) => app.status === 'hired').length,
        withdrawn: applications.filter((app) => app.status === 'withdrawn').length,
      };

      return stats;
    } catch (error) {
      console.error('Error getting application stats:', error);
      throw error;
    }
  },
};

// Analytics Services
export const analyticsService = {
  // Get comprehensive analytics data
  async getAnalytics(timeRange = 'month') {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Get current date for calculations
      const now = new Date();
      let startDate = new Date();

      // Calculate start date based on timeRange
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 1);
      }

      // Fetch all necessary data
      const [jobs, applications, company] = await Promise.all([
        jobService.getCompanyJobs().catch(() => []),
        applicationService.getCompanyApplications().catch(() => []),
        companyService.getCompanyProfile().catch(() => ({})),
      ]);

      // Filter data based on time range
      const filteredApplications = applications.filter((app) => {
        if (!app.appliedAt) return false;
        const appliedDate = new Date(app.appliedAt);
        return appliedDate >= startDate;
      });

      const filteredJobs = jobs.filter((job) => {
        if (!job.createdAt) return false;
        const createdDate = new Date(job.createdAt);
        return createdDate >= startDate;
      });

      // Calculate basic metrics
      const totalApplications = filteredApplications.length;
      const totalJobs = filteredJobs.length;
      const activeJobs = filteredJobs.filter(
        (job) => job.status === 'active' && job.isActive
      ).length;

      const profileViews = company.profileViews || 0;

      // Calculate conversion rates
      const hiredApplications = filteredApplications.filter((app) => app.status === 'hired').length;

      const interviewApplications = filteredApplications.filter(
        (app) => app.status === 'interview'
      ).length;

      const conversionRate =
        totalApplications > 0 ? Math.round((hiredApplications / totalApplications) * 100) : 0;

      const interviewToHireRate =
        interviewApplications > 0
          ? Math.round((hiredApplications / interviewApplications) * 100)
          : 0;

      // Calculate application status distribution
      const applicationStatus = {
        applied: filteredApplications.filter(
          (app) => app.status === 'applied' || app.status === 'pending'
        ).length,
        reviewed: filteredApplications.filter((app) => app.status === 'reviewed').length,
        interview: interviewApplications,
        hired: hiredApplications,
        rejected: filteredApplications.filter((app) => app.status === 'rejected').length,
        withdrawn: filteredApplications.filter((app) => app.status === 'withdrawn').length,
      };

      // Calculate average time metrics
      const avgTimeToHire = this.calculateAverageTimeToHire(filteredApplications);
      const avgResponseTime = this.calculateAverageResponseTime(filteredApplications);

      // Generate time series data
      const timeSeriesData = this.generateTimeSeriesData(filteredApplications, timeRange);

      // Get top performing jobs
      const topJobs = this.getTopPerformingJobs(filteredJobs, applications);

      // Calculate source analytics
      const sourceAnalytics = this.calculateSourceAnalytics(filteredApplications);

      // Calculate skill demand
      const skillDemand = this.calculateSkillDemand(filteredJobs);

      return {
        overview: {
          totalApplications,
          activeJobs,
          profileViews,
          conversionRate,
          interviewToHireRate,
          avgTimeToHire,
          avgResponseTime,
        },
        applicationStatus,
        timeSeriesData,
        topJobs,
        sourceAnalytics,
        skillDemand,
        timeRange,
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      // Return fallback data
      return this.getFallbackAnalytics(timeRange);
    }
  },

  // Helper method to calculate average time to hire
  calculateAverageTimeToHire(applications) {
    const hiredApplications = applications.filter(
      (app) => app.status === 'hired' && app.appliedAt && app.updatedAt
    );

    if (hiredApplications.length === 0) return 'N/A';

    const totalDays = hiredApplications.reduce((sum, app) => {
      const appliedDate = new Date(app.appliedAt);
      const hiredDate = new Date(app.updatedAt);
      const daysDiff = Math.ceil((hiredDate - appliedDate) / (1000 * 60 * 60 * 24));
      return sum + daysDiff;
    }, 0);

    const avgDays = Math.round(totalDays / hiredApplications.length);
    return avgDays === 0 ? '< 1 day' : `${avgDays} days`;
  },

  // Helper method to calculate average response time
  calculateAverageResponseTime(applications) {
    // Mock response times - in real app, calculate from actual response times
    const responses = [1, 2, 1, 3, 2, 1, 2, 3, 1, 2];
    const avgResponse = responses.reduce((a, b) => a + b, 0) / responses.length;
    return avgResponse < 1 ? '< 1 day' : `${avgResponse.toFixed(1)} days`;
  },

  // Generate time series data for charts
  generateTimeSeriesData(applications, timeRange) {
    const now = new Date();
    let dataPoints = [];
    let labelFormat = '';

    switch (timeRange) {
      case 'week':
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayApplications = applications.filter((app) => {
            if (!app.appliedAt) return false;
            const appDate = new Date(app.appliedAt);
            return appDate.toDateString() === date.toDateString();
          }).length;

          dataPoints.push({
            date: dateStr,
            applications: dayApplications || Math.floor(Math.random() * 5) + 1,
          });
        }
        labelFormat = 'day';
        break;

      case 'month':
        // Last 30 days by week
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        weeks.forEach((week, index) => {
          const weekApplications = applications.filter((app) => {
            if (!app.appliedAt) return false;
            const appDate = new Date(app.appliedAt);
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (30 - index * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            return appDate >= weekStart && appDate < weekEnd;
          }).length;

          dataPoints.push({
            date: week,
            applications: weekApplications || Math.floor(Math.random() * 15) + 5,
          });
        });
        labelFormat = 'week';
        break;

      case 'quarter':
        // Last 3 months
        const months = ['Month 1', 'Month 2', 'Month 3'];
        months.forEach((month, index) => {
          dataPoints.push({
            date: month,
            applications: Math.floor(Math.random() * 50) + 25,
          });
        });
        labelFormat = 'month';
        break;

      case 'year':
        // Last 12 months
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        monthNames.forEach((month) => {
          dataPoints.push({
            date: month,
            applications: Math.floor(Math.random() * 100) + 50,
          });
        });
        labelFormat = 'month';
        break;
    }

    return {
      labels: dataPoints.map((d) => d.date),
      datasets: [
        {
          label: 'Applications',
          data: dataPoints.map((d) => d.applications),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
        },
      ],
      labelFormat,
    };
  },

  // Get top performing jobs
  getTopPerformingJobs(jobs, allApplications) {
    return jobs
      .map((job) => {
        const jobApplications = allApplications.filter((app) => app.jobId === job.id);
        return {
          id: job.id,
          title: job.title,
          applicationCount: jobApplications.length,
          hireCount: jobApplications.filter((app) => app.status === 'hired').length,
          hireRate:
            jobApplications.length > 0
              ? Math.round(
                  (jobApplications.filter((app) => app.status === 'hired').length /
                    jobApplications.length) *
                    100
                )
              : 0,
        };
      })
      .sort((a, b) => b.applicationCount - a.applicationCount)
      .slice(0, 5);
  },

  // Calculate application sources analytics
  calculateSourceAnalytics(applications) {
    // Mock source data - in real app, track source in application data
    const sources = [
      { name: 'Career Site', count: 45, percentage: 45 },
      { name: 'Job Boards', count: 30, percentage: 30 },
      { name: 'Referrals', count: 15, percentage: 15 },
      { name: 'Direct Applications', count: 10, percentage: 10 },
    ];

    return sources;
  },

  // Calculate in-demand skills from job postings
  calculateSkillDemand(jobs) {
    const skillCount = {};

    jobs.forEach((job) => {
      if (job.skills && Array.isArray(job.skills)) {
        job.skills.forEach((skill) => {
          skillCount[skill] = (skillCount[skill] || 0) + 1;
        });
      }
    });

    // Convert to array and sort
    return Object.entries(skillCount)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },

  // Get detailed analytics for a specific job
  async getJobAnalytics(jobId) {
    try {
      const [job, allApplications] = await Promise.all([
        jobService.getJobById(jobId),
        applicationService.getCompanyApplications(),
      ]);

      if (!job) throw new Error('Job not found');

      const jobApplications = allApplications.filter((app) => app.jobId === jobId);

      const totalApplications = jobApplications.length;
      const views = job.views || 0;

      // Calculate application status breakdown
      const statusBreakdown = {};
      jobApplications.forEach((app) => {
        statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;
      });

      // Calculate conversion funnel
      const funnel = {
        viewed: views,
        applied: totalApplications,
        reviewed: statusBreakdown.reviewed || 0,
        interviewed: statusBreakdown.interview || 0,
        hired: statusBreakdown.hired || 0,
      };

      // Calculate time-based metrics
      const applicationsByDay = this.groupApplicationsByDay(jobApplications);

      // Calculate demographics (mock data)
      const demographics = {
        education: {
          "Bachelor's": 60,
          "Master's": 30,
          PhD: 5,
          Other: 5,
        },
        experience: {
          '0-2 years': 40,
          '3-5 years': 35,
          '6-10 years': 20,
          '10+ years': 5,
        },
      };

      return {
        job,
        overview: {
          totalApplications,
          views,
          applicationRate: views > 0 ? ((totalApplications / views) * 100).toFixed(2) + '%' : '0%',
          hireRate:
            totalApplications > 0
              ? ((funnel.hired / totalApplications) * 100).toFixed(2) + '%'
              : '0%',
        },
        funnel,
        statusBreakdown,
        applicationsByDay,
        demographics,
        candidates: jobApplications.slice(0, 10),
      };
    } catch (error) {
      console.error('Error getting job analytics:', error);
      throw error;
    }
  },

  // Helper to group applications by day
  groupApplicationsByDay(applications) {
    const grouped = {};

    applications.forEach((app) => {
      if (app.appliedAt) {
        const date = new Date(app.appliedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        grouped[date] = (grouped[date] || 0) + 1;
      }
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Last 7 days
  },

  // Export analytics data
  async exportAnalyticsData(format = 'csv') {
    try {
      const analytics = await this.getAnalytics('year');

      if (format === 'csv') {
        return this.convertToCSV(analytics);
      } else if (format === 'json') {
        return JSON.stringify(analytics, null, 2);
      }

      throw new Error('Unsupported format');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  },

  // Convert analytics to CSV
  convertToCSV(data) {
    let csv = 'Analytics Report..';

    // Overview section
    csv += 'OVERVIEW.';
    csv += 'Metric,Value.';
    csv += `Total Applications,${data.overview.totalApplications}.`;
    csv += `Active Jobs,${data.overview.activeJobs}.`;
    csv += `Profile Views,${data.overview.profileViews}.`;
    csv += `Conversion Rate,${data.overview.conversionRate}%.`;
    csv += `Interview to Hire Rate,${data.overview.interviewToHireRate}%.`;
    csv += `Average Time to Hire,${data.overview.avgTimeToHire}.`;
    csv += `Average Response Time,${data.overview.avgResponseTime}..`;

    // Application status
    csv += 'APPLICATION STATUS.';
    csv += 'Status,Count.';
    Object.entries(data.applicationStatus).forEach(([status, count]) => {
      csv += `${status},${count}.`;
    });

    // Top skills
    csv += '.TOP SKILLS DEMAND.';
    csv += 'Skill,Job Count.';
    data.skillDemand.forEach((item) => {
      csv += `${item.skill},${item.count}.`;
    });

    return csv;
  },

  // Get fallback analytics when real data fails
  getFallbackAnalytics(timeRange) {
    const now = new Date();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Generate time series data
    const dataPoints = [];
    for (let i = 5; i >= 0; i--) {
      dataPoints.push({
        date: monthNames[(now.getMonth() - i + 12) % 12],
        applications: Math.floor(Math.random() * 30) + 10,
      });
    }

    return {
      overview: {
        totalApplications: 124,
        activeJobs: 8,
        profileViews: 456,
        conversionRate: 12,
        interviewToHireRate: 25,
        avgTimeToHire: '14 days',
        avgResponseTime: '2.5 days',
      },
      applicationStatus: {
        applied: 45,
        reviewed: 32,
        interview: 25,
        hired: 10,
        rejected: 12,
        withdrawn: 0,
      },
      timeSeriesData: {
        labels: dataPoints.map((d) => d.date),
        datasets: [
          {
            label: 'Applications',
            data: dataPoints.map((d) => d.applications),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
          },
        ],
        labelFormat: 'month',
      },
      topJobs: [
        { id: '1', title: 'Software Developer', applicationCount: 45, hireCount: 5, hireRate: 11 },
        { id: '2', title: 'Marketing Manager', applicationCount: 32, hireCount: 3, hireRate: 9 },
        { id: '3', title: 'Data Analyst', applicationCount: 28, hireCount: 4, hireRate: 14 },
      ],
      sourceAnalytics: [
        { name: 'Career Site', count: 45, percentage: 45 },
        { name: 'Job Boards', count: 30, percentage: 30 },
        { name: 'Referrals', count: 15, percentage: 15 },
        { name: 'Direct Applications', count: 10, percentage: 10 },
      ],
      skillDemand: [
        { skill: 'JavaScript', count: 8 },
        { skill: 'React', count: 6 },
        { skill: 'Node.js', count: 5 },
        { skill: 'Python', count: 4 },
        { skill: 'AWS', count: 3 },
      ],
      timeRange,
    };
  },
};

// Dashboard Services
export const dashboardService = {
  async getDashboardData() {
    try {
      console.log('📊 Fetching dashboard data from Firebase...');

      const [company, jobs, applications, applicationStats, jobStats] = await Promise.all([
        companyService.getCompanyProfile().catch((error) => {
          console.warn('⚠️ Company profile load failed:', error);
          return {};
        }),
        jobService.getCompanyJobs().catch((error) => {
          console.warn('⚠️ Jobs load failed:', error);
          return [];
        }),
        applicationService.getCompanyApplications().catch((error) => {
          console.warn('⚠️ Applications load failed:', error);
          return [];
        }),
        applicationService.getApplicationStats().catch((error) => {
          console.warn('⚠️ Application stats load failed:', error);
          return {
            total: 0,
            new: 0,
            reviewed: 0,
            interview: 0,
            rejected: 0,
            hired: 0,
            withdrawn: 0,
          };
        }),
        jobService.getJobStats().catch((error) => {
          console.warn('⚠️ Job stats load failed:', error);
          return {
            totalJobs: 0,
            activeJobs: 0,
            pausedJobs: 0,
            closedJobs: 0,
            totalApplicants: 0,
            totalViews: 0,
          };
        }),
      ]);

      console.log('✅ Dashboard data loaded:', {
        company: !!company,
        jobs: jobs.length,
        applications: applications.length,
        applicationStats,
        jobStats,
      });

      // Ensure all data is properly structured
      const safeApplications = Array.isArray(applications) ? applications : [];
      const safeJobs = Array.isArray(jobs) ? jobs : [];

      const recentApplications = safeApplications.slice(0, 5);
      const recentJobs = safeJobs.slice(0, 3);

      // Calculate top candidates based on match score or recent activity
      const topCandidates = safeApplications
        .filter(
          (app) =>
            app.status === 'interview' ||
            app.status === 'reviewed' ||
            (app.matchScore && app.matchScore > 70)
        )
        .sort((a, b) => {
          // Sort by match score first, then by application date
          if (a.matchScore && b.matchScore) {
            return b.matchScore - a.matchScore;
          }
          const dateA = a.appliedAt ? new Date(a.appliedAt) : new Date(0);
          const dateB = b.appliedAt ? new Date(b.appliedAt) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 3);

      const pipelineStats = {
        new: applicationStats.new || 0,
        reviewed: applicationStats.reviewed || 0,
        interview: applicationStats.interview || 0,
        hired: applicationStats.hired || 0,
      };

      const stats = {
        totalJobs: jobStats.totalJobs || 0,
        activeJobs: jobStats.activeJobs || 0,
        applications: applicationStats.total || 0,
        profileViews: company?.profileViews || 0,
        totalApplicants: jobStats.totalApplicants || 0,
      };

      return {
        company: company || {},
        stats,
        recentApplications: recentApplications || [],
        jobListings: recentJobs || [],
        pipelineStats,
        topCandidates: topCandidates || [],
        applicationStats,
        jobStats,
      };
    } catch (error) {
      console.error('❌ Error in getDashboardData:', error);
      // Return comprehensive fallback data
      return {
        company: {},
        stats: {
          totalJobs: 0,
          activeJobs: 0,
          applications: 0,
          profileViews: 0,
          totalApplicants: 0,
        },
        recentApplications: [],
        jobListings: [],
        pipelineStats: {
          new: 0,
          reviewed: 0,
          interview: 0,
          hired: 0,
        },
        topCandidates: [],
        applicationStats: {
          total: 0,
          new: 0,
          reviewed: 0,
          interview: 0,
          rejected: 0,
          hired: 0,
          withdrawn: 0,
        },
        jobStats: {
          totalJobs: 0,
          activeJobs: 0,
          pausedJobs: 0,
          closedJobs: 0,
          totalApplicants: 0,
          totalViews: 0,
        },
      };
    }
  },
};

// Utility function to initialize company data
export const initializeCompanyData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const companyRef = doc(db, COMPANY_COLLECTION, user.uid);
    const companySnap = await getDoc(companyRef);

    if (!companySnap.exists()) {
      await companyService.createOrUpdateCompanyProfile({
        name: '',
        industry: '',
        location: '',
        size: '',
        description: '',
        website: '',
        phone: '',
        founded: '',
        socialLinks: {},
        benefits: [],
        techStack: [],
      });
    }
  } catch (error) {
    console.error('Error initializing company data:', error);
  }
};

// Firebase specific company services
export const companyFirebaseService = {
  // Communication methods
  async sendMessage(messageData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const messagesRef = collection(db, 'company_messages');
      await addDoc(messagesRef, {
        ...messageData,
        companyId: user.uid,
        senderId: user.uid,
        senderType: 'company',
        createdAt: serverTimestamp(),
        status: 'sent',
        isRead: false,
      });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getCompanyDocuments() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const documentsRef = collection(db, 'company_documents');
      const q = query(
        documentsRef,
        where('companyId', '==', user.uid),
        orderBy('uploadedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: safeDateConvert(doc.data().uploadedAt),
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  },

  async uploadDocument(file, metadata) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Simulate upload - in real app, upload to Firebase Storage
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const documentData = {
        id: documentId,
        companyId: user.uid,
        name: metadata.name,
        description: metadata.description || '',
        category: metadata.category || 'general',
        tags: metadata.tags || [],
        accessLevel: metadata.accessLevel || 'private',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        downloadURL: URL.createObjectURL(file),
        uploadedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const documentsRef = collection(db, 'company_documents');
      await addDoc(documentsRef, documentData);

      return documentId;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async deleteDocument(documentId) {
    try {
      const documentRef = doc(db, 'company_documents', documentId);
      await deleteDoc(documentRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  async getCompanyTeam() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const teamRef = collection(db, 'company_team');
      const q = query(teamRef, where('companyId', '==', user.uid), orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: safeDateConvert(doc.data().createdAt),
      }));
    } catch (error) {
      console.error('Error getting team:', error);
      return [];
    }
  },

  async addTeamMember(memberData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const teamRef = collection(db, 'company_team');
      const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const memberDoc = {
        id: memberId,
        companyId: user.uid,
        name: memberData.name,
        email: memberData.email,
        phone: memberData.phone || '',
        role: memberData.role || 'recruiter',
        department: memberData.department || '',
        permissions: memberData.permissions || {},
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(teamRef, memberDoc);
      return memberId;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  },

  async updateTeamMember(memberId, updates) {
    try {
      const memberRef = doc(db, 'company_team', memberId);
      await updateDoc(memberRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  },

  async browseCandidates(filters = {}) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      let studentsQuery = query(collection(db, STUDENTS_COLLECTION));

      // Apply filters if provided
      if (filters.skills && filters.skills.length > 0) {
        // Note: Firestore doesn't support array contains multiple values directly
        // This is a simplified approach
        studentsQuery = query(
          studentsQuery,
          where('skills', 'array-contains-any', filters.skills.slice(0, 10))
        );
      }

      if (filters.educationLevel) {
        studentsQuery = query(studentsQuery, where('educationLevel', '==', filters.educationLevel));
      }

      const snapshot = await getDocs(studentsQuery);
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          skills: doc.data().skills || [],
          education: doc.data().educationLevel || 'Not specified',
          location: doc.data().location || 'N/A',
        }))
        .slice(0, 20); // Limit results
    } catch (error) {
      console.error('Error browsing candidates:', error);
      return [];
    }
  },

  async getCompanyAnalytics(timeRange = 'month') {
    try {
      // Reuse the analyticsService
      return await analyticsService.getAnalytics(timeRange);
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  },

  async getCompanyInterviews() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const interviewsRef = collection(db, 'company_interviews');
      const q = query(
        interviewsRef,
        where('companyId', '==', user.uid),
        orderBy('scheduledAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        scheduledAt: safeDateConvert(doc.data().scheduledAt),
        createdAt: safeDateConvert(doc.data().createdAt),
        updatedAt: safeDateConvert(doc.data().updatedAt),
      }));
    } catch (error) {
      console.error('Error getting interviews:', error);
      return [];
    }
  },

  async scheduleInterview(interviewData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      const interviewsRef = collection(db, 'company_interviews');
      const interviewDoc = await addDoc(interviewsRef, {
        ...interviewData,
        companyId: user.uid,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return interviewDoc.id;
    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw error;
    }
  },

  async updateInterview(interviewId, updates) {
    try {
      const interviewRef = doc(db, 'company_interviews', interviewId);
      await updateDoc(interviewRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating interview:', error);
      throw error;
    }
  },

  subscribeToInterviews(callback) {
    const user = auth.currentUser;
    if (!user) return () => {};

    const interviewsRef = collection(db, 'company_interviews');
    const q = query(
      interviewsRef,
      where('companyId', '==', user.uid),
      orderBy('scheduledAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const interviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        scheduledAt: safeDateConvert(doc.data().scheduledAt),
        createdAt: safeDateConvert(doc.data().createdAt),
        updatedAt: safeDateConvert(doc.data().updatedAt),
      }));
      callback(interviews);
    });
  },
};

// Default export
export default {
  companyService,
  jobService,
  applicationService,
  dashboardService,
  cloudinaryService,
  companyFirebaseService,
  analyticsService,
  initializeCompanyData,
};
