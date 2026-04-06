import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

import { db } from '../config/firebase';

class FirebaseSetupService {
  static async initializeCollections() {
    try {
      console.log('🔄 Initializing Firebase collections...');

      // Define required collections and their default structure
      const collections = {
        testimonials: {
          defaultDoc: {
            name: 'System Default',
            role: 'Platform Admin',
            content: 'This is a sample testimonial. Add real testimonials from the dashboard.',
            avatar: 'SA',
            rating: 5,
            status: 'approved',
            featured: true,
            createdAt: new Date(),
            isDefault: true,
          },
          fields: {
            name: 'string',
            role: 'string',
            content: 'string',
            avatar: 'string',
            rating: 'number',
            status: 'string', // approved, pending, rejected
            featured: 'boolean',
            createdAt: 'timestamp',
            userId: 'string',
            isDefault: 'boolean',
          },
        },
        platformStats: {
          defaultDoc: {
            totalStudents: 12500,
            totalInstitutions: 68,
            totalCompanies: 240,
            totalJobs: 850,
            totalMentors: 120,
            totalCourses: 450,
            lastUpdated: new Date(),
          },
          fields: {
            totalStudents: 'number',
            totalInstitutions: 'number',
            totalCompanies: 'number',
            totalJobs: 'number',
            totalMentors: 'number',
            totalCourses: 'number',
            lastUpdated: 'timestamp',
          },
        },
      };

      // Initialize each collection
      for (const [collectionName, config] of Object.entries(collections)) {
        await this.initializeCollection(collectionName, config.defaultDoc);
      }

      console.log('✅ Firebase collections initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing Firebase collections:', error);
      return false;
    }
  }

  static async initializeCollection(collectionName, defaultDoc) {
    try {
      const collectionRef = collection(db, collectionName);

      // Check if collection has any documents
      const statsDocRef = doc(collectionRef, 'stats');
      const statsDoc = await getDoc(statsDocRef);

      if (!statsDoc.exists()) {
        console.log(`📝 Creating initial document for ${collectionName}...`);
        await setDoc(statsDocRef, defaultDoc);
      }

      return true;
    } catch (error) {
      console.error(`Error initializing ${collectionName}:`, error);
      return false;
    }
  }

  static async addTestimonial(testimonialData) {
    try {
      const testimonialsRef = collection(db, 'testimonials');
      const newTestimonialRef = doc(testimonialsRef);

      const testimonial = {
        ...testimonialData,
        createdAt: new Date(),
        status: 'pending', // Default to pending for admin approval
        featured: false,
        id: newTestimonialRef.id,
      };

      await setDoc(newTestimonialRef, testimonial);
      console.log('✅ Testimonial added successfully:', testimonial.id);
      return { success: true, id: newTestimonialRef.id };
    } catch (error) {
      console.error('❌ Error adding testimonial:', error);
      return { success: false, error: error.message };
    }
  }

  static async getTestimonials() {
    try {
      const testimonialsRef = collection(db, 'testimonials');
      const snapshot = await getDoc(testimonialsRef);
      const testimonials = [];

      snapshot.forEach((doc) => {
        testimonials.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return testimonials;
    } catch (error) {
      console.error('❌ Error getting testimonials:', error);
      return [];
    }
  }

  static async updatePlatformStats(statsData) {
    try {
      const statsRef = doc(db, 'platformStats', 'stats');
      await setDoc(
        statsRef,
        {
          ...statsData,
          lastUpdated: new Date(),
        },
        { merge: true }
      );

      console.log('✅ Platform stats updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating platform stats:', error);
      return false;
    }
  }
}

export default FirebaseSetupService;
