/* eslint-disable no-unused-vars */
import {
  getCurrentCompanyId,
  safeConvertFirebaseData,
  handleServiceError,
  COLLECTIONS,
  generateUniqueId,
  getDateRangeStart,
} from '../utils/baseService';
import { db } from '../../../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

// ============================
// VIDEO INTERVIEWS SERVICE
// ============================
export const videoInterviewService = {
  async getInterviews(filters = {}) {
    try {
      const companyId = getCurrentCompanyId();
      const { status, dateRange, sortBy = 'scheduledTime' } = filters;

      const interviewsRef = collection(db, COLLECTIONS.COMPANY_VIDEO_INTERVIEWS);
      let q = query(interviewsRef, where('companyId', '==', companyId), orderBy(sortBy, 'desc'));

      if (status && status !== 'all') {
        q = query(q, where('status', '==', status));
      }

      if (dateRange?.start && dateRange?.end) {
        q = query(
          q,
          where('scheduledTime', '>=', dateRange.start),
          where('scheduledTime', '<=', dateRange.end)
        );
      }

      const snapshot = await getDocs(q);
      const interviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...safeConvertFirebaseData(doc.data()),
      }));

      // Enrich with candidate and job data
      const enrichedInterviews = await Promise.all(
        interviews.map(async (interview) => {
          try {
            // Get candidate data
            if (interview.candidateId) {
              const candidateRef = doc(db, COLLECTIONS.STUDENTS, interview.candidateId);
              const candidateSnap = await getDoc(candidateRef);

              if (candidateSnap.exists()) {
                interview.candidate = {
                  id: candidateSnap.id,
                  ...safeConvertFirebaseData(candidateSnap.data()),
                };
              }
            }

            // Get job data
            if (interview.jobId) {
              const jobRef = doc(db, COLLECTIONS.JOBS, interview.jobId);
              const jobSnap = await getDoc(jobRef);

              if (jobSnap.exists()) {
                interview.job = {
                  id: jobSnap.id,
                  ...safeConvertFirebaseData(jobSnap.data()),
                };
              }
            }
          } catch (error) {
            console.warn('Error enriching interview:', error);
          }
          return interview;
        })
      );

      return {
        success: true,
        data: enrichedInterviews,
        stats: this.calculateInterviewStats(interviews),
      };
    } catch (error) {
      return handleServiceError(error, 'getInterviews');
    }
  },

  async scheduleInterview(interviewData) {
    try {
      const companyId = getCurrentCompanyId();
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
      const companySnap = await getDoc(companyRef);
      const companyData = companySnap.data();

      // Validate interview data
      const validation = this.validateInterviewData(interviewData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      // Generate unique meeting link
      const meetingId = generateUniqueId();
      const meetingLink = `https://meet.careerconnect.ls/${meetingId}`;

      const interviewsRef = collection(db, COLLECTIONS.COMPANY_VIDEO_INTERVIEWS);
      const interview = {
        companyId,
        meetingId,
        meetingLink,
        ...interviewData,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        metadata: {
          scheduledBy: companyId,
          companyName: companyData.name,
          platform: 'web',
        },
      };

      const docRef = await addDoc(interviewsRef, interview);

      // Create notifications
      await this.createInterviewNotifications(docRef.id, interview);

      return {
        success: true,
        data: {
          id: docRef.id,
          ...interview,
        },
      };
    } catch (error) {
      return handleServiceError(error, 'scheduleInterview');
    }
  },

  async updateInterview(interviewId, updates) {
    try {
      const companyId = getCurrentCompanyId();
      const interviewRef = doc(db, COLLECTIONS.COMPANY_VIDEO_INTERVIEWS, interviewId);
      const interviewSnap = await getDoc(interviewRef);

      if (!interviewSnap.exists()) {
        return { success: false, error: 'Interview not found' };
      }

      const currentData = interviewSnap.data();

      // Check permissions
      if (currentData.companyId !== companyId) {
        return { success: false, error: 'Permission denied' };
      }

      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(interviewRef, updatedData);

      return {
        success: true,
        data: {
          id: interviewId,
          ...currentData,
          ...updatedData,
        },
      };
    } catch (error) {
      return handleServiceError(error, 'updateInterview');
    }
  },

  async cancelInterview(interviewId, reason) {
    try {
      const companyId = getCurrentCompanyId();
      const interviewRef = doc(db, COLLECTIONS.COMPANY_VIDEO_INTERVIEWS, interviewId);
      const interviewSnap = await getDoc(interviewRef);

      if (!interviewSnap.exists()) {
        return { success: false, error: 'Interview not found' };
      }

      const currentData = interviewSnap.data();

      // Check permissions
      if (currentData.companyId !== companyId) {
        return { success: false, error: 'Permission denied' };
      }

      const updates = {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(interviewRef, updates);

      return { success: true };
    } catch (error) {
      return handleServiceError(error, 'cancelInterview');
    }
  },

  async addFeedback(interviewId, feedback) {
    try {
      const companyId = getCurrentCompanyId();
      const interviewRef = doc(db, COLLECTIONS.COMPANY_VIDEO_INTERVIEWS, interviewId);
      const interviewSnap = await getDoc(interviewRef);

      if (!interviewSnap.exists()) {
        return { success: false, error: 'Interview not found' };
      }

      const currentData = interviewSnap.data();

      // Check permissions
      if (currentData.companyId !== companyId) {
        return { success: false, error: 'Permission denied' };
      }

      const feedbackData = {
        feedback: {
          ...feedback,
          submittedBy: companyId,
          submittedAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      };

      await updateDoc(interviewRef, feedbackData);

      return { success: true };
    } catch (error) {
      return handleServiceError(error, 'addFeedback');
    }
  },

  async getInterviewAnalytics(timeRange = 'month') {
    try {
      const companyId = getCurrentCompanyId();
      const interviewsRef = collection(db, COLLECTIONS.COMPANY_VIDEO_INTERVIEWS);
      const q = query(
        interviewsRef,
        where('companyId', '==', companyId),
        where('scheduledTime', '>=', getDateRangeStart(timeRange))
      );

      const snapshot = await getDocs(q);
      const interviews = snapshot.docs.map((doc) => safeConvertFirebaseData(doc.data()));

      const analytics = {
        total: interviews.length,
        byStatus: this.groupByStatus(interviews),
        completionRate: this.calculateCompletionRate(interviews),
        upcoming: interviews.filter((i) => i.status === 'scheduled' && i.scheduledTime > new Date())
          .length,
      };

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return handleServiceError(error, 'getInterviewAnalytics');
    }
  },

  validateInterviewData(data) {
    const errors = [];

    if (!data.candidateId) errors.push('Candidate ID is required');
    if (!data.jobId) errors.push('Job ID is required');
    if (!data.scheduledTime) errors.push('Scheduled time is required');
    if (!data.duration) errors.push('Duration is required');

    if (data.scheduledTime && new Date(data.scheduledTime) <= new Date()) {
      errors.push('Scheduled time must be in the future');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  calculateInterviewStats(interviews) {
    const now = new Date();
    const stats = {
      total: interviews.length,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      missed: 0,
      upcoming: 0,
      today: 0,
    };

    interviews.forEach((interview) => {
      stats[interview.status] = (stats[interview.status] || 0) + 1;

      if (interview.status === 'scheduled' && interview.scheduledTime) {
        const scheduledDate = new Date(interview.scheduledTime);
        if (scheduledDate > now) {
          stats.upcoming++;
        }

        if (scheduledDate.toDateString() === now.toDateString()) {
          stats.today++;
        }
      }
    });

    return stats;
  },

  async createInterviewNotifications(interviewId, interview) {
    try {
      // Create notification for candidate
      const candidateNotification = {
        studentId: interview.candidateId,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `You have an interview scheduled for ${new Date(interview.scheduledTime).toLocaleString()}`,
        data: {
          interviewId,
          companyId: interview.companyId,
          scheduledTime: interview.scheduledTime,
          meetingLink: interview.meetingLink,
        },
        read: false,
        createdAt: serverTimestamp(),
      };

      const notificationsRef = collection(db, 'student_notifications');
      await addDoc(notificationsRef, candidateNotification);

      return { success: true };
    } catch (error) {
      console.error('Error creating interview notifications:', error);
    }
  },

  groupByStatus(interviews) {
    const groups = {};
    interviews.forEach((interview) => {
      const status = interview.status || 'unknown';
      groups[status] = (groups[status] || 0) + 1;
    });
    return groups;
  },

  calculateCompletionRate(interviews) {
    const completed = interviews.filter((i) => i.status === 'completed').length;
    const scheduled = interviews.filter((i) => i.status === 'scheduled').length;
    const totalScheduled = completed + scheduled;

    return totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0;
  },
};

// ============================
// AI MATCHING SERVICE
// ============================
export const aiMatchingService = {
  async getAIMatches(filters = {}) {
    try {
      const companyId = getCurrentCompanyId();
      const { jobId, minMatchScore = 70, limit = 50, sortBy = 'matchScore' } = filters;

      // Get company profile
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
      const companySnap = await getDoc(companyRef);
      const companyData = companySnap.data();

      // Get applications
      const applicationsRef = collection(db, COLLECTIONS.APPLICATIONS);
      let applicationsQuery = query(
        applicationsRef,
        where('companyId', '==', companyId),
        orderBy('appliedAt', 'desc'),
        limit(100)
      );

      if (jobId) {
        applicationsQuery = query(
          applicationsRef,
          where('companyId', '==', companyId),
          where('jobId', '==', jobId),
          orderBy('appliedAt', 'desc'),
          limit(100)
        );
      }

      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applications = applicationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...safeConvertFirebaseData(doc.data()),
      }));

      // Get student profiles and calculate match scores
      const enrichedApplications = await Promise.all(
        applications.map(async (application) => {
          try {
            const studentRef = doc(db, COLLECTIONS.STUDENTS, application.candidateId);
            const studentSnap = await getDoc(studentRef);

            if (studentSnap.exists()) {
              application.candidate = {
                id: studentSnap.id,
                ...safeConvertFirebaseData(studentSnap.data()),
              };

              application.matchScore = this.calculateMatchScore(
                application,
                application.candidate,
                companyData
              );
            }
          } catch (error) {
            console.warn(`Could not fetch student ${application.candidateId}:`, error);
          }
          return application;
        })
      );

      // Filter and sort matches
      let matches = enrichedApplications
        .filter((app) => app.matchScore >= minMatchScore)
        .sort((a, b) => {
          if (sortBy === 'matchScore') {
            return b.matchScore - a.matchScore;
          } else if (sortBy === 'recent') {
            return new Date(b.appliedAt) - new Date(a.appliedAt);
          }
          return 0;
        });

      // Limit results
      matches = matches.slice(0, limit);

      // Calculate match statistics
      const matchStats = {
        total: matches.length,
        averageScore:
          matches.length > 0
            ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length)
            : 0,
        scoreDistribution: this.calculateScoreDistribution(matches),
      };

      return {
        success: true,
        data: {
          matches,
          stats: matchStats,
          filtersApplied: filters,
        },
      };
    } catch (error) {
      return handleServiceError(error, 'getAIMatches');
    }
  },

  calculateMatchScore(application, candidate, companyData) {
    let score = 50; // Base score

    // Skills match (30%)
    if (application.jobId && candidate.skills) {
      const jobSkills = ['javascript', 'react', 'node', 'communication', 'teamwork'];
      const candidateSkills = candidate.skills.map((s) => s.toLowerCase());

      const matchingSkills = jobSkills.filter((skill) =>
        candidateSkills.some((candidateSkill) => candidateSkill.includes(skill))
      );

      const skillsScore = (matchingSkills.length / jobSkills.length) * 30;
      score += skillsScore;
    }

    // Experience match (20%)
    if (candidate.experience && candidate.experience.length > 0) {
      const yearsOfExperience = candidate.experience.reduce((total, exp) => {
        const years = exp.years || 0;
        return total + years;
      }, 0);

      const experienceScore = Math.min(yearsOfExperience, 10) * 2;
      score += experienceScore;
    }

    // Education match (15%)
    if (candidate.education && candidate.education.length > 0) {
      const highestEducation = candidate.education.reduce((highest, edu) => {
        const level = this.educationLevelToScore(edu.level);
        return level > highest ? level : highest;
      }, 0);

      score += highestEducation * 15;
    }

    // Ensure score is between 0-100
    return Math.min(Math.max(Math.round(score), 0), 100);
  },

  educationLevelToScore(level) {
    if (!level) return 0;

    const levelLower = level.toLowerCase();
    if (levelLower.includes('phd') || levelLower.includes('doctor')) return 1.0;
    if (levelLower.includes('master')) return 0.9;
    if (levelLower.includes('bachelor') || levelLower.includes('degree')) return 0.8;
    if (levelLower.includes('diploma')) return 0.6;
    if (levelLower.includes('certificate')) return 0.4;
    return 0.1;
  },

  calculateScoreDistribution(matches) {
    const distribution = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '0-59': 0,
    };

    matches.forEach((match) => {
      const score = match.matchScore;
      if (score >= 90) distribution['90-100']++;
      else if (score >= 80) distribution['80-89']++;
      else if (score >= 70) distribution['70-79']++;
      else if (score >= 60) distribution['60-69']++;
      else distribution['0-59']++;
    });

    return distribution;
  },

  async saveMatchPreference(preferenceData) {
    try {
      const companyId = getCurrentCompanyId();
      const aiMatchesRef = collection(db, COLLECTIONS.COMPANY_AI_MATCHES);

      const preference = {
        companyId,
        ...preferenceData,
        createdAt: serverTimestamp(),
        active: true,
      };

      const docRef = await addDoc(aiMatchesRef, preference);

      return {
        success: true,
        data: {
          id: docRef.id,
          ...preference,
        },
      };
    } catch (error) {
      return handleServiceError(error, 'saveMatchPreference');
    }
  },
};

// ============================
// TALENT POOL SERVICE
// ============================
export const talentPoolService = {
  async getTalentPool(filters = {}) {
    try {
      const companyId = getCurrentCompanyId();
      const {
        status = 'active',
        sortBy = 'addedAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
      } = filters;

      const talentPoolRef = collection(db, COLLECTIONS.COMPANY_TALENT_POOL);
      let q = query(talentPoolRef, where('companyId', '==', companyId), orderBy(sortBy, sortOrder));

      if (status !== 'all') {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);
      const total = snapshot.size;
      const offset = (page - 1) * limit;

      let candidates = [];
      snapshot.forEach((doc, index) => {
        if (index >= offset && index < offset + limit) {
          const data = safeConvertFirebaseData(doc.data());
          candidates.push({
            id: doc.id,
            ...data,
          });
        }
      });

      // Enrich with candidate data
      const enrichedCandidates = await Promise.all(
        candidates.map(async (candidate) => {
          try {
            const studentRef = doc(db, COLLECTIONS.STUDENTS, candidate.studentId);
            const studentSnap = await getDoc(studentRef);

            if (studentSnap.exists()) {
              candidate.profile = {
                id: studentSnap.id,
                ...safeConvertFirebaseData(studentSnap.data()),
              };
            }
          } catch (error) {
            console.warn(`Could not fetch student ${candidate.studentId}:`, error);
          }
          return candidate;
        })
      );

      // Calculate pagination
      const hasMore = offset + enrichedCandidates.length < total;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          candidates: enrichedCandidates,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore,
          },
          stats: {
            total,
            active: snapshot.docs.filter((d) => d.data().status === 'active').length,
            contacted: snapshot.docs.filter((d) => d.data().contacted).length,
            hired: snapshot.docs.filter((d) => d.data().status === 'hired').length,
          },
        },
      };
    } catch (error) {
      return handleServiceError(error, 'getTalentPool');
    }
  },

  async addToTalentPool(studentId, metadata = {}) {
    try {
      const companyId = getCurrentCompanyId();

      // Check if already in talent pool
      const talentPoolRef = collection(db, COLLECTIONS.COMPANY_TALENT_POOL);
      const existingQuery = query(
        talentPoolRef,
        where('companyId', '==', companyId),
        where('studentId', '==', studentId)
      );

      const existingSnap = await getDocs(existingQuery);

      if (!existingSnap.empty) {
        const existingDoc = existingSnap.docs[0];
        await updateDoc(doc(db, COLLECTIONS.COMPANY_TALENT_POOL, existingDoc.id), {
          status: 'active',
          updatedAt: serverTimestamp(),
          lastContacted: serverTimestamp(),
          ...metadata,
        });

        return {
          success: true,
          data: {
            id: existingDoc.id,
            action: 'updated',
          },
        };
      }

      // Add new to talent pool
      const talentData = {
        companyId,
        studentId,
        status: 'active',
        source: metadata.source || 'manual',
        tags: metadata.tags || [],
        notes: metadata.notes || '',
        matchScore: metadata.matchScore || 0,
        addedAt: serverTimestamp(),
        contacted: false,
        hired: false,
      };

      const docRef = await addDoc(talentPoolRef, talentData);

      return {
        success: true,
        data: {
          id: docRef.id,
          ...talentData,
          action: 'created',
        },
      };
    } catch (error) {
      return handleServiceError(error, 'addToTalentPool');
    }
  },

  async updateTalentStatus(talentId, status, notes = '') {
    try {
      const companyId = getCurrentCompanyId();
      const talentRef = doc(db, COLLECTIONS.COMPANY_TALENT_POOL, talentId);
      const talentSnap = await getDoc(talentRef);

      if (!talentSnap.exists()) {
        return { success: false, error: 'Candidate not found' };
      }

      const talentData = talentSnap.data();

      // Check permissions
      if (talentData.companyId !== companyId) {
        return { success: false, error: 'Permission denied' };
      }

      const updates = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (notes) {
        updates.notes = notes;
      }

      if (status === 'contacted') {
        updates.contacted = true;
        updates.contactedAt = serverTimestamp();
      }

      if (status === 'hired') {
        updates.hired = true;
        updates.hiredAt = serverTimestamp();
      }

      await updateDoc(talentRef, updates);

      return { success: true };
    } catch (error) {
      return handleServiceError(error, 'updateTalentStatus');
    }
  },

  async getTalentAnalytics() {
    try {
      const companyId = getCurrentCompanyId();
      const talentPoolRef = collection(db, COLLECTIONS.COMPANY_TALENT_POOL);
      const q = query(talentPoolRef, where('companyId', '==', companyId));

      const snapshot = await getDocs(q);

      const analytics = {
        overview: this.calculateTalentOverview(snapshot),
        sources: this.calculateSources(snapshot),
      };

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      return handleServiceError(error, 'getTalentAnalytics');
    }
  },

  calculateTalentOverview(snapshot) {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    let total = 0;
    let active = 0;
    let contacted = 0;
    let hired = 0;
    let addedThisMonth = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      total++;

      if (data.status === 'active') active++;
      if (data.contacted) contacted++;
      if (data.hired) hired++;

      const addedDate = data.addedAt?.toDate();
      if (addedDate && addedDate > oneMonthAgo) addedThisMonth++;
    });

    return {
      total,
      active,
      contacted,
      hired,
      addedThisMonth,
      conversionRate: total > 0 ? Math.round((hired / total) * 100) : 0,
      contactRate: total > 0 ? Math.round((contacted / total) * 100) : 0,
    };
  },

  calculateSources(snapshot) {
    const sources = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const source = data.source || 'unknown';
      sources[source] = (sources[source] || 0) + 1;
    });

    return Object.entries(sources)
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / snapshot.size) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  },
};
