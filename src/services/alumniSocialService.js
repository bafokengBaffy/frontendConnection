// frontend/src/services/alumniSocialService.js
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { auth, db, storage } from '../config/firebase';

// Helper function to upload multiple media files
async function uploadMultipleMedia(files, userId, folder) {
  const urls = [];
  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  return urls;
}

// Helper function to get post comments
async function getPostComments(postId, limitCount = 10) {
  const postRef = doc(db, 'alumni_posts', postId);
  const postSnap = await getDoc(postRef);
  const postData = postSnap.data();
  const comments = postData?.comments || [];
  return comments.slice(0, limitCount);
}

// Helper function to check if post is saved
async function isPostSaved(userId, postId) {
  const savedRef = doc(db, 'alumni_saved_posts', `${userId}_${postId}`);
  const savedSnap = await getDoc(savedRef);
  return savedSnap.exists();
}

// Helper function to create notification
async function createNotification(notificationData) {
  const notification = {
    ...notificationData,
    read: false,
    createdAt: Timestamp.now(),
  };

  await addDoc(collection(db, 'alumni_notifications'), notification);
}

// Main service object
export const alumniSocialService = {
  // Create a new post
  createPost: async (postData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const userRef = doc(db, 'alumni', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};

      let mediaUrls = [];
      if (postData.mediaFiles && postData.mediaFiles.length > 0) {
        mediaUrls = await uploadMultipleMedia(postData.mediaFiles, userId, 'posts');
      }

      const post = {
        userId: userId,
        authorName: userData.name || auth.currentUser.displayName || 'Alumni',
        authorPhoto: userData.photoURL || null,
        authorTitle: userData.position || userData.title || 'Alumni',
        authorCompany: userData.company || '',
        content: postData.content || '',
        media: mediaUrls,
        mediaType: postData.mediaType || 'image',
        type: postData.type || 'post',
        privacy: postData.privacy || 'public',
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        shares: 0,
        sharesCount: 0,
        tags: postData.tags || [],
        location: postData.location || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'alumni_posts'), post);

      await updateDoc(userRef, {
        postsCount: increment(1),
        lastPostAt: Timestamp.now(),
      });

      return { success: true, data: { id: docRef.id, ...post } };
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, error: error.message };
    }
  },

  // Get feed posts
  getFeed: async (lastDoc = null, pageSize = 10, filter = 'all') => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      let postsQuery = query(
        collection(db, 'alumni_posts'),
        where('privacy', '==', 'public'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        postsQuery = query(postsQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(postsQuery);
      const posts = [];
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      for (const doc of snapshot.docs) {
        const postData = doc.data();
        const isLiked = postData.likes?.includes(userId) || false;

        posts.push({
          id: doc.id,
          ...postData,
          isLiked: isLiked,
          likeCount: postData.likesCount || postData.likes?.length || 0,
          commentsCount: postData.commentsCount || postData.comments?.length || 0,
        });
      }

      return {
        success: true,
        data: posts,
        lastDoc: lastVisible,
        hasMore: snapshot.docs.length === pageSize,
      };
    } catch (error) {
      console.error('Error getting feed:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Like a post
  likePost: async (postId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const postRef = doc(db, 'alumni_posts', postId);
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
        likesCount: increment(1),
      });
      return { success: true };
    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, error: error.message };
    }
  },

  // Unlike a post
  unlikePost: async (postId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const postRef = doc(db, 'alumni_posts', postId);
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
        likesCount: increment(-1),
      });
      return { success: true };
    } catch (error) {
      console.error('Error unliking post:', error);
      return { success: false, error: error.message };
    }
  },

  // Add comment
  addComment: async (postId, commentText) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const userRef = doc(db, 'alumni', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};

      const comment = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        authorName: userData.name || auth.currentUser.displayName || 'Alumni',
        authorPhoto: userData.photoURL || null,
        content: commentText,
        likes: [],
        createdAt: Timestamp.now(),
      };

      const postRef = doc(db, 'alumni_posts', postId);
      const postSnap = await getDoc(postRef);
      const postData = postSnap.data();

      const updatedComments = [...(postData.comments || []), comment];

      await updateDoc(postRef, {
        comments: updatedComments,
        commentsCount: increment(1),
      });

      return { success: true, data: comment };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: error.message };
    }
  },

  // Share a post
  sharePost: async (postId, shareMessage = '') => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const originalPostRef = doc(db, 'alumni_posts', postId);
      const originalPostSnap = await getDoc(originalPostRef);
      const originalPost = originalPostSnap.data();

      const userRef = doc(db, 'alumni', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};

      const sharePost = {
        userId: userId,
        authorName: userData.name || auth.currentUser.displayName || 'Alumni',
        authorPhoto: userData.photoURL || null,
        authorTitle: userData.position || 'Alumni',
        content: shareMessage || `Shared a post from ${originalPost.authorName}`,
        type: 'share',
        privacy: 'public',
        originalPost: {
          id: postId,
          authorName: originalPost.authorName,
          authorPhoto: originalPost.authorPhoto,
          content: originalPost.content,
          media: originalPost.media,
        },
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        shares: 0,
        sharesCount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'alumni_posts'), sharePost);

      await updateDoc(originalPostRef, {
        shares: increment(1),
        sharesCount: increment(1),
      });

      return { success: true, data: { id: docRef.id, ...sharePost } };
    } catch (error) {
      console.error('Error sharing post:', error);
      return { success: false, error: error.message };
    }
  },

  // Save post
  savePost: async (postId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      await setDoc(doc(db, 'alumni_saved_posts', `${userId}_${postId}`), {
        userId: userId,
        postId: postId,
        savedAt: Timestamp.now(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving post:', error);
      return { success: false, error: error.message };
    }
  },

  // Unsave post
  unsavePost: async (postId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      await deleteDoc(doc(db, 'alumni_saved_posts', `${userId}_${postId}`));
      return { success: true };
    } catch (error) {
      console.error('Error unsaving post:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete post
  deletePost: async (postId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const postRef = doc(db, 'alumni_posts', postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        return { success: false, error: 'Post not found' };
      }

      if (postSnap.data().userId !== userId) {
        return { success: false, error: 'Unauthorized' };
      }

      await deleteDoc(postRef);

      await updateDoc(doc(db, 'alumni', userId), {
        postsCount: increment(-1),
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: error.message };
    }
  },

  // Report post
  reportPost: async (postId, reason) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const report = {
        postId: postId,
        userId: userId,
        reason: reason,
        status: 'pending',
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'alumni_reports'), report);
      return { success: true };
    } catch (error) {
      console.error('Error reporting post:', error);
      return { success: false, error: error.message };
    }
  },

  // Get notifications
  getNotifications: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const notificationsQuery = query(
        collection(db, 'alumni_notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(notificationsQuery);
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: notifications };
    } catch (error) {
      console.error('Error getting notifications:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    try {
      await updateDoc(doc(db, 'alumni_notifications', notificationId), { read: true });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification read:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const notificationsQuery = query(
        collection(db, 'alumni_notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(notificationsQuery);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      return { success: false, error: error.message };
    }
  },

  // Get polls
  getPolls: async () => {
    try {
      const pollsQuery = query(
        collection(db, 'alumni_polls'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(pollsQuery);
      const polls = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: polls };
    } catch (error) {
      return { success: true, data: [] };
    }
  },

  // Vote on poll
  votePoll: async (pollId, optionId) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('Not authenticated');

    try {
      const pollRef = doc(db, 'alumni_polls', pollId);
      const pollSnap = await getDoc(pollRef);
      const pollData = pollSnap.data();

      const updatedOptions = pollData.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
      );

      await updateDoc(pollRef, {
        options: updatedOptions,
        voters: arrayUnion(userId),
      });

      return { success: true };
    } catch (error) {
      console.error('Error voting poll:', error);
      return { success: false, error: error.message };
    }
  },

  // Get announcements
  getAnnouncements: async () => {
    try {
      const announcementsQuery = query(
        collection(db, 'alumni_announcements'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const snapshot = await getDocs(announcementsQuery);
      const announcements = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: announcements };
    } catch (error) {
      return { success: true, data: [] };
    }
  },
};

export default alumniSocialService;
