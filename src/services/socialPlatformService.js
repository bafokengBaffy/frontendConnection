import {
  addDoc,
  arrayRemove,
  arrayUnion,
  auth,
  collection,
  db,
  doc,
  getDoc,
  getDocs,
  getDownloadURL,
  increment,
  limit,
  orderBy,
  query,
  ref,
  storage,
  Timestamp,
  updateDoc,
  uploadBytes,
} from '../config/firebase';

const SOCIAL_COLLECTION = 'social_posts';
const LOCAL_STORAGE_KEY = 'career_connect_social_feed';
const LOCAL_FALLBACK_LIMIT = 24;

const PROFILE_COLLECTIONS = {
  admin: 'admins',
  alumni: 'alumni',
  company: 'companies',
  entrepreneur: 'entrepreneurs',
  government: 'government_profiles',
  institute: 'institutes',
  mentor: 'mentors',
  parent: 'parents',
  student: 'students',
  youth: 'youth',
};

const DEFAULT_SUGGESTIONS = [
  {
    id: 'spotlight-mentors',
    name: 'Mentor Circle',
    role: 'community',
    headline: 'Connect with mentors, founders, and hiring teams',
    mutualCount: 18,
  },
  {
    id: 'spotlight-alumni',
    name: 'Alumni Network',
    role: 'community',
    headline: 'Reconnect with alumni building across Lesotho and beyond',
    mutualCount: 11,
  },
  {
    id: 'spotlight-opportunities',
    name: 'Opportunity Desk',
    role: 'community',
    headline: 'See internships, events, scholarships, and collaborations in one place',
    mutualCount: 7,
  },
];

const normalizeDate = (value) => {
  if (!value) {
    return new Date().toISOString();
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });

const getLocalFeed = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to read local social feed cache', error);
    return [];
  }
};

const setLocalFeed = (posts) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts.slice(0, LOCAL_FALLBACK_LIMIT)));
};

const createSeedPosts = (profile) => {
  const displayName = profile?.displayName || profile?.fullName || profile?.companyName || 'Career Connect';

  return [
    {
      id: 'seed-welcome',
      author: {
        id: 'system',
        name: 'Career Connect',
        role: 'platform',
        avatar: '',
        headline: 'A more social career ecosystem',
      },
      content:
        'Welcome to the new community feed. Share wins, updates, questions, event photos, job tips, and collaborations so the platform feels alive every day.',
      tags: ['community', 'careerconnect', 'social'],
      media: [],
      visibility: 'public',
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      reactions: ['spark'],
      likedBy: [],
      likeCount: 12,
      commentCount: 2,
      shareCount: 4,
      comments: [
        {
          id: 'seed-comment-1',
          authorName: displayName,
          authorRole: profile?.userType || 'member',
          body: 'This is the kind of shared space the app needed.',
          createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        },
      ],
    },
    {
      id: 'seed-opportunity',
      author: {
        id: 'system-opportunities',
        name: 'Opportunity Desk',
        role: 'community',
        avatar: '',
        headline: 'Daily spotlight for jobs, funding, and events',
      },
      content:
        'Post launch tip: mix professional updates with human updates. Announce internships, mentorship openings, scholarships, portfolio drops, and real progress stories.',
      tags: ['opportunities', 'mentorship', 'jobs'],
      media: [],
      visibility: 'public',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      reactions: ['support'],
      likedBy: [],
      likeCount: 8,
      commentCount: 0,
      shareCount: 1,
      comments: [],
    },
  ];
};

const buildAuthorProfile = async (userProfile) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  const baseProfile = {
    id: currentUser.uid,
    name:
      userProfile?.displayName ||
      userProfile?.fullName ||
      userProfile?.companyName ||
      currentUser.displayName ||
      currentUser.email?.split('@')[0] ||
      'Community Member',
    role: userProfile?.userType || 'member',
    avatar: userProfile?.photoURL || userProfile?.profilePhoto || userProfile?.logo || '',
    headline:
      userProfile?.headline ||
      userProfile?.title ||
      userProfile?.currentPosition ||
      userProfile?.industry ||
      userProfile?.businessIndustry ||
      userProfile?.fieldOfStudy ||
      'Sharing progress with the community',
  };

  if (!userProfile?.userType || !PROFILE_COLLECTIONS[userProfile.userType]) {
    return baseProfile;
  }

  try {
    const profileSnap = await getDoc(doc(db, PROFILE_COLLECTIONS[userProfile.userType], currentUser.uid));
    if (!profileSnap.exists()) {
      return baseProfile;
    }

    const profileData = profileSnap.data();
    return {
      ...baseProfile,
      name:
        profileData.displayName ||
        profileData.fullName ||
        profileData.companyName ||
        profileData.instituteName ||
        profileData.businessName ||
        baseProfile.name,
      avatar:
        profileData.photoURL ||
        profileData.profilePhoto ||
        profileData.logo ||
        baseProfile.avatar,
      headline:
        profileData.headline ||
        profileData.title ||
        profileData.currentPosition ||
        profileData.industry ||
        profileData.businessIndustry ||
        profileData.fieldOfStudy ||
        baseProfile.headline,
    };
  } catch (error) {
    console.warn('Falling back to base profile for social author metadata', error);
    return baseProfile;
  }
};

const uploadMedia = async (files, userId) => {
  const uploaded = [];

  for (const file of files) {
    const ext = file.name.split('.').pop();
    const objectPath = `social/${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const storageRef = ref(storage, objectPath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    uploaded.push({
      url,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      name: file.name,
    });
  }

  return uploaded;
};

const shapePost = (id, postData, userId) => ({
  id,
  ...postData,
  createdAt: normalizeDate(postData.createdAt),
  updatedAt: normalizeDate(postData.updatedAt),
  likedBy: postData.likedBy || [],
  comments: (postData.comments || []).map((comment) => ({
    ...comment,
    createdAt: normalizeDate(comment.createdAt),
  })),
  likeCount: postData.likeCount ?? (postData.likedBy || []).length ?? 0,
  commentCount: postData.commentCount ?? (postData.comments || []).length ?? 0,
  shareCount: postData.shareCount ?? 0,
  hasLiked: (postData.likedBy || []).includes(userId),
});

const writeLocalPost = async (post) => {
  const existing = getLocalFeed();
  setLocalFeed([post, ...existing]);
  return post;
};

export const socialPlatformService = {
  async getFeed(userProfile, pageSize = 12) {
    const currentUser = auth.currentUser;
    const localFeed = getLocalFeed();

    try {
      const feedQuery = query(collection(db, SOCIAL_COLLECTION), orderBy('createdAt', 'desc'), limit(pageSize));
      const snapshot = await getDocs(feedQuery);

      if (snapshot.empty && localFeed.length === 0) {
        const seeds = createSeedPosts(userProfile);
        setLocalFeed(seeds);
        return { success: true, data: seeds };
      }

      const posts = snapshot.docs.map((entry) =>
        shapePost(entry.id, entry.data(), currentUser?.uid)
      );

      if (posts.length > 0) {
        return { success: true, data: posts };
      }
    } catch (error) {
      console.warn('Falling back to local social feed cache', error);
    }

    if (localFeed.length === 0) {
      const seeds = createSeedPosts(userProfile);
      setLocalFeed(seeds);
      return { success: true, data: seeds };
    }

    return { success: true, data: localFeed };
  },

  async createPost({ content, visibility, tags, files }, userProfile) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const author = await buildAuthorProfile(userProfile);
    const normalizedTags = (tags || []).filter(Boolean);

    try {
      const media = files?.length ? await uploadMedia(files, currentUser.uid) : [];
      const post = {
        author,
        content: content.trim(),
        visibility: visibility || 'public',
        tags: normalizedTags,
        media,
        likedBy: [],
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        comments: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, SOCIAL_COLLECTION), post);
      return { success: true, data: shapePost(docRef.id, post, currentUser.uid) };
    } catch (error) {
      const media = files?.length
        ? await Promise.all(
            files.map(async (file) => ({
              url: await fileToDataUrl(file),
              type: file.type.startsWith('video/') ? 'video' : 'image',
              name: file.name,
            }))
          )
        : [];

      const localPost = {
        id: `local-${Date.now()}`,
        author,
        content: content.trim(),
        visibility: visibility || 'public',
        tags: normalizedTags,
        media,
        likedBy: [],
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hasLiked: false,
      };

      await writeLocalPost(localPost);
      return { success: true, data: localPost, localOnly: true };
    }
  },

  async toggleLike(postId, hasLiked) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    try {
      const postRef = doc(db, SOCIAL_COLLECTION, postId);
      await updateDoc(postRef, {
        likedBy: hasLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
        likeCount: increment(hasLiked ? -1 : 1),
        updatedAt: Timestamp.now(),
      });

      return { success: true };
    } catch (error) {
      const posts = getLocalFeed().map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const nextLikedBy = hasLiked
          ? (post.likedBy || []).filter((id) => id !== currentUser.uid)
          : [...new Set([...(post.likedBy || []), currentUser.uid])];

        return {
          ...post,
          likedBy: nextLikedBy,
          likeCount: Math.max(0, (post.likeCount || 0) + (hasLiked ? -1 : 1)),
          hasLiked: !hasLiked,
        };
      });
      setLocalFeed(posts);
      return { success: true, localOnly: true };
    }
  },

  async addComment(postId, body, userProfile) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    const author = await buildAuthorProfile(userProfile);
    const comment = {
      id: `comment-${Date.now()}`,
      authorId: currentUser.uid,
      authorName: author.name,
      authorRole: author.role,
      authorAvatar: author.avatar,
      body: body.trim(),
      createdAt: Timestamp.now(),
    };

    try {
      const postRef = doc(db, SOCIAL_COLLECTION, postId);
      const postSnap = await getDoc(postRef);
      const postData = postSnap.data() || {};
      const comments = [...(postData.comments || []), comment];

      await updateDoc(postRef, {
        comments,
        commentCount: comments.length,
        updatedAt: Timestamp.now(),
      });

      return { success: true, data: { ...comment, createdAt: normalizeDate(comment.createdAt) } };
    } catch (error) {
      const posts = getLocalFeed().map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...(post.comments || []),
                { ...comment, createdAt: new Date().toISOString() },
              ],
              commentCount: (post.commentCount || 0) + 1,
            }
          : post
      );
      setLocalFeed(posts);
      return { success: true, localOnly: true };
    }
  },

  async sharePost(postId) {
    try {
      const postRef = doc(db, SOCIAL_COLLECTION, postId);
      await updateDoc(postRef, {
        shareCount: increment(1),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      const posts = getLocalFeed().map((post) =>
        post.id === postId
          ? { ...post, shareCount: (post.shareCount || 0) + 1 }
          : post
      );
      setLocalFeed(posts);
    }

    return { success: true };
  },

  async getSuggestions(userProfile) {
    const currentUser = auth.currentUser;
    const suggestions = [];

    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), limit(8)));
      usersSnap.forEach((entry) => {
        if (entry.id === currentUser?.uid) {
          return;
        }

        const data = entry.data();
        suggestions.push({
          id: entry.id,
          name: data.displayName || data.fullName || data.companyName || 'Community Member',
          role: data.userType || 'member',
          headline:
            data.title ||
            data.currentPosition ||
            data.industry ||
            data.fieldOfStudy ||
            'Building something meaningful',
          mutualCount: Math.floor(Math.random() * 12) + 1,
        });
      });
    } catch (error) {
      console.warn('Using default social suggestions', error);
    }

    if (suggestions.length > 0) {
      return { success: true, data: suggestions.slice(0, 5) };
    }

    const profileRole = userProfile?.userType ? `for ${userProfile.userType}s` : 'for the community';
    return {
      success: true,
      data: DEFAULT_SUGGESTIONS.map((entry) => ({
        ...entry,
        headline: `${entry.headline} ${profileRole}`,
      })),
    };
  },

  async getTrendingTopics(userProfile) {
    const response = await this.getFeed(userProfile, 24);
    const tagCounts = new Map();

    for (const post of response.data || []) {
      for (const tag of post.tags || []) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    const topics = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    if (topics.length > 0) {
      return { success: true, data: topics };
    }

    return {
      success: true,
      data: [
        { tag: 'community', count: 14 },
        { tag: 'mentorship', count: 9 },
        { tag: 'opportunities', count: 7 },
      ],
    };
  },
};

export default socialPlatformService;
