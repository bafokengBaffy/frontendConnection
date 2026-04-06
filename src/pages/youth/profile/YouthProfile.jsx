/* eslint-disable no-unused-vars */
// YouthProfile.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Briefcase,
  Award,
  Target,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Save,
  Edit3,
  Trash2,
  Plus,
  X,
  Check,
  AlertCircle,
  Settings,
  BarChart3,
  BookOpen,
  Heart,
  Share2,
  MoreVertical,
  Camera,
  Upload,
  Download,
  ChevronRight,
  ChevronLeft,
  Star,
  Clock,
  Calendar,
  Users,
  TrendingUp,
} from 'lucide-react';

import { db } from '../../../config/firebase';
import { cloudinaryService } from '../../../services/cloudinaryService';
import { useAuth } from '../../../context/AuthContext';
import { useNotifications } from '../../../hooks/useNotifications';

// Shadcn-inspired UI Components
const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      )}
      {!loading && Icon && <Icon size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />}
      {children}
    </button>
  );
};

const Input = ({ label, error, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={18} />
        </div>
      )}
      <input
        className={`w-full px-4 py-2.5 ${Icon ? 'pl-10' : ''} bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

const Textarea = ({ label, error, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <textarea
      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px] resize-y"
      {...props}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

const Select = ({ label, options, error, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <select
      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 overflow-x-auto pb-px scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200
              ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.icon && <tab.icon size={18} />}
            {tab.label}
            {tab.badge && <Badge variant="default">{tab.badge}</Badge>}
          </button>
        ))}
      </nav>
    </div>
  );
};

const ProgressBar = ({ value, max = 100, label, showValue = true, size = 'md' }) => {
  const percentage = (value / max) * 100;

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          {showValue && <span className="font-medium text-gray-900">{percentage.toFixed(0)}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-blue-600 rounded-full"
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={14} className="text-green-600" />
              <span className="text-xs text-green-600">+{trend}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};

const SkillTag = ({ skill, level, onRemove, editable }) => {
  const levelColors = {
    beginner: 'bg-blue-50 text-blue-700',
    intermediate: 'bg-green-50 text-green-700',
    advanced: 'bg-purple-50 text-purple-700',
    expert: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg group">
      <span className="text-sm font-medium text-gray-700">{skill}</span>
      {level && (
        <Badge
          variant={
            level === 'expert'
              ? 'purple'
              : level === 'advanced'
                ? 'info'
                : level === 'intermediate'
                  ? 'success'
                  : 'default'
          }
        >
          {level}
        </Badge>
      )}
      {editable && (
        <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 transition-opacity">
          <X size={14} className="text-gray-500 hover:text-red-600" />
        </button>
      )}
    </div>
  );
};

const ImageUpload = ({ currentImage, onUpload, onRemove, uploading, progress }) => {
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    await onUpload(file);
  };

  return (
    <div className="relative group">
      <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg">
        {preview ? (
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User size={40} className="text-gray-400" />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="absolute -bottom-2 -right-2 flex gap-1">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 hover:text-blue-600"
          disabled={uploading}
        >
          <Camera size={16} />
        </button>
        {currentImage && (
          <button
            onClick={onRemove}
            className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 hover:text-red-600"
            disabled={uploading}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {uploading && (
        <div className="absolute -bottom-8 left-0 right-0">
          <ProgressBar value={progress} size="sm" showValue={false} />
        </div>
      )}
    </div>
  );
};

const YouthProfile = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editMode, setEditMode] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Tabs configuration
  const tabs = useMemo(
    () => [
      { id: 'overview', label: 'Overview', icon: User },
      { id: 'business', label: 'Business', icon: Briefcase },
      { id: 'skills', label: 'Skills & Expertise', icon: Award },
      { id: 'goals', label: 'Goals & Achievements', icon: Target },
      { id: 'mentors', label: 'Mentors', icon: Users },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    []
  );

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const profileRef = doc(db, 'youthProfiles', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const data = profileSnap.data();
        // Convert Timestamps to ISO strings for consistent handling
        setProfile({
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
          dateOfBirth: data.dateOfBirth?.toDate?.()?.toISOString().split('T')[0],
        });
      } else {
        // Create default profile
        const defaultProfile = {
          userId: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          profilePhoto: user.photoURL || null,
          bio: '',
          location: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),

          businessProfile: {
            businessName: '',
            businessType: '',
            registrationNumber: '',
            yearEstablished: '',
            description: '',
            logo: null,
            website: '',
            socialMedia: {
              linkedin: '',
              twitter: '',
              instagram: '',
              facebook: '',
            },
          },

          skills: [],
          achievements: [],
          goals: [],
          interests: [],

          education: [],
          experience: [],

          mentors: [],
          savedOpportunities: [],

          preferences: {
            emailNotifications: true,
            profileVisibility: 'public',
            mentorshipAlerts: true,
            fundingAlerts: true,
          },

          stats: {
            profileViews: 0,
            mentorSessions: 0,
            applications: 0,
            achievements: 0,
          },
        };

        await setDoc(profileRef, defaultProfile);
        setProfile(defaultProfile);
        showNotification('success', 'Profile created successfully');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
      showNotification('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user, showNotification]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle profile updates
  const handleUpdate = useCallback(
    async (path, value) => {
      if (!user || !profile) return;

      try {
        setSaving(true);

        // Handle nested paths (e.g., 'businessProfile.businessName')
        const updateData = {};
        if (path.includes('.')) {
          updateData[path] = value;
        } else {
          updateData[path] = value;
        }
        updateData.updatedAt = new Date().toISOString();

        // Update Firestore
        const profileRef = doc(db, 'youthProfiles', user.uid);
        await updateDoc(profileRef, updateData);

        // Update local state
        setProfile((prev) => {
          if (path.includes('.')) {
            const [parent, child] = path.split('.');
            return {
              ...prev,
              [parent]: {
                ...prev[parent],
                [child]: value,
              },
            };
          }
          return { ...prev, [path]: value };
        });

        setUnsavedChanges(false);
        showNotification('success', 'Profile updated');
      } catch (err) {
        console.error('Error updating profile:', err);
        showNotification('error', 'Failed to update');
      } finally {
        setSaving(false);
      }
    },
    [user, profile, showNotification]
  );

  // Handle photo upload
  const handlePhotoUpload = useCallback(
    async (file) => {
      if (!user || !file) return;

      try {
        setUploading(true);
        setUploadProgress(0);

        const result = await cloudinaryService.uploadImage(file, {
          folder: `youth-profiles/${user.uid}`,
          onProgress: (progress) => setUploadProgress(progress),
        });

        await handleUpdate('profilePhoto', result.url);
        setUploadProgress(0);
      } catch (err) {
        console.error('Error uploading photo:', err);
        showNotification('error', 'Failed to upload photo');
      } finally {
        setUploading(false);
      }
    },
    [user, handleUpdate, showNotification]
  );

  // Handle photo removal
  const handlePhotoRemove = useCallback(async () => {
    if (!user) return;
    await handleUpdate('profilePhoto', null);
  }, [user, handleUpdate]);

  // Add array item (skills, goals, etc.)
  const handleAddItem = useCallback(
    async (arrayPath, item) => {
      if (!user || !profile) return;

      const currentArray = arrayPath.split('.').reduce((obj, key) => obj?.[key], profile) || [];
      const newArray = [...currentArray, item];

      await handleUpdate(arrayPath, newArray);
    },
    [user, profile, handleUpdate]
  );

  // Remove array item
  const handleRemoveItem = useCallback(
    async (arrayPath, index) => {
      if (!user || !profile) return;

      const currentArray = arrayPath.split('.').reduce((obj, key) => obj?.[key], profile) || [];
      const newArray = currentArray.filter((_, i) => i !== index);

      await handleUpdate(arrayPath, newArray);
    },
    [user, profile, handleUpdate]
  );

  // Update array item
  const handleUpdateItem = useCallback(
    async (arrayPath, index, value) => {
      if (!user || !profile) return;

      const currentArray = arrayPath.split('.').reduce((obj, key) => obj?.[key], profile) || [];
      const newArray = [...currentArray];
      newArray[index] = value;

      await handleUpdate(arrayPath, newArray);
    },
    [user, profile, handleUpdate]
  );

  // Handle delete profile
  const handleDeleteProfile = useCallback(async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete your profile? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, 'youthProfiles', user.uid));
      showNotification('success', 'Profile deleted');
      window.location.href = '/';
    } catch (err) {
      console.error('Error deleting profile:', err);
      showNotification('error', 'Failed to delete profile');
      setLoading(false);
    }
  }, [user, showNotification]);

  // Calculate profile completion
  const profileCompletion = useMemo(() => {
    if (!profile) return 0;

    const fields = [
      !!profile.displayName,
      !!profile.bio,
      !!profile.location,
      !!profile.phone,
      !!profile.businessProfile?.businessName,
      !!profile.businessProfile?.description,
      profile.skills?.length > 0,
      profile.goals?.length > 0,
      !!profile.profilePhoto,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchProfile}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
            <div className="flex items-center gap-3">
              {unsavedChanges && <Badge variant="warning">Unsaved changes</Badge>}
              <Button
                variant={editMode[activeTab] ? 'primary' : 'outline'}
                size="sm"
                icon={editMode[activeTab] ? Save : Edit3}
                onClick={() => {
                  if (editMode[activeTab]) {
                    setUnsavedChanges(false);
                  }
                  setEditMode((prev) => ({
                    ...prev,
                    [activeTab]: !prev[activeTab],
                  }));
                }}
                loading={saving}
              >
                {editMode[activeTab] ? 'Save Changes' : 'Edit Section'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32" />

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16">
              <ImageUpload
                currentImage={profile?.profilePhoto}
                onUpload={handlePhotoUpload}
                onRemove={handlePhotoRemove}
                uploading={uploading}
                progress={uploadProgress}
              />

              <div className="flex-1 pt-4 sm:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile?.displayName || 'Young Entrepreneur'}
                    </h2>
                    {profile?.businessProfile?.businessName && (
                      <p className="text-gray-600 flex items-center gap-1 mt-1">
                        <Briefcase size={16} />
                        {profile.businessProfile.businessName}
                        {profile.businessProfile.businessType && (
                          <Badge variant="info" className="ml-2">
                            {profile.businessProfile.businessType}
                          </Badge>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" icon={Share2}>
                      Share
                    </Button>
                    <Button size="sm" variant="outline" icon={Download}>
                      Export
                    </Button>
                    <Button size="sm" variant="ghost" icon={MoreVertical} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={16} />
                      {profile.location}
                    </span>
                  )}
                  {profile?.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={16} />
                      {profile.email}
                    </span>
                  )}
                  {profile?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={16} />
                      {profile.phone}
                    </span>
                  )}
                  {profile?.businessProfile?.website && (
                    <a
                      href={profile.businessProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Globe size={16} />
                      Website
                    </a>
                  )}
                </div>

                <div className="mt-4">
                  <ProgressBar value={profileCompletion} label="Profile Completion" size="md" />
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                  {profile?.businessProfile?.socialMedia?.linkedin && (
                    <a
                      href={profile.businessProfile.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Linkedin size={20} />
                    </a>
                  )}
                  {profile?.businessProfile?.socialMedia?.twitter && (
                    <a
                      href={profile.businessProfile.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Twitter size={20} />
                    </a>
                  )}
                  {profile?.businessProfile?.socialMedia?.instagram && (
                    <a
                      href={profile.businessProfile.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Instagram size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Award} label="Skills" value={profile?.skills?.length || 0} color="blue" />
          <StatCard icon={Target} label="Goals" value={profile?.goals?.length || 0} color="green" />
          <StatCard
            icon={Users}
            label="Mentors"
            value={profile?.mentors?.length || 0}
            color="purple"
          />
          <StatCard
            icon={Star}
            label="Achievements"
            value={profile?.achievements?.length || 0}
            color="orange"
          />
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Bio */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">About Me</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={editMode.overview ? Check : Edit3}
                        onClick={() =>
                          setEditMode((prev) => ({ ...prev, overview: !prev.overview }))
                        }
                      >
                        {editMode.overview ? 'Done' : 'Edit'}
                      </Button>
                    </div>

                    {editMode.overview ? (
                      <Textarea
                        value={profile?.bio || ''}
                        onChange={(e) => {
                          setProfile((prev) => ({ ...prev, bio: e.target.value }));
                          setUnsavedChanges(true);
                        }}
                        placeholder="Tell us about yourself, your journey, and your aspirations..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">
                        {profile?.bio || 'No bio added yet. Click edit to tell your story.'}
                      </p>
                    )}
                  </Card>

                  {/* Education & Experience */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                      {profile?.education?.length > 0 ? (
                        <div className="space-y-4">
                          {profile.education.map((edu, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <BookOpen size={18} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{edu.degree}</p>
                                <p className="text-sm text-gray-600">{edu.institution}</p>
                                <p className="text-xs text-gray-500">{edu.year}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No education added</p>
                      )}
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
                      {profile?.experience?.length > 0 ? (
                        <div className="space-y-4">
                          {profile.experience.map((exp, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="p-2 bg-green-50 rounded-lg">
                                <Briefcase size={18} className="text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{exp.role}</p>
                                <p className="text-sm text-gray-600">{exp.company}</p>
                                <p className="text-xs text-gray-500">{exp.duration}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No experience added</p>
                      )}
                    </Card>
                  </div>
                </div>
              )}

              {/* Business Tab */}
              {activeTab === 'business' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Business Details</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={editMode.business ? Check : Edit3}
                        onClick={() =>
                          setEditMode((prev) => ({ ...prev, business: !prev.business }))
                        }
                      >
                        {editMode.business ? 'Done' : 'Edit'}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Business Name"
                        value={profile?.businessProfile?.businessName || ''}
                        onChange={(e) => {
                          setProfile((prev) => ({
                            ...prev,
                            businessProfile: {
                              ...prev.businessProfile,
                              businessName: e.target.value,
                            },
                          }));
                          setUnsavedChanges(true);
                        }}
                        disabled={!editMode.business}
                        icon={Briefcase}
                      />

                      <Select
                        label="Business Type"
                        value={profile?.businessProfile?.businessType || ''}
                        onChange={(e) => {
                          setProfile((prev) => ({
                            ...prev,
                            businessProfile: {
                              ...prev.businessProfile,
                              businessType: e.target.value,
                            },
                          }));
                          setUnsavedChanges(true);
                        }}
                        disabled={!editMode.business}
                        options={[
                          { value: '', label: 'Select type' },
                          { value: 'sole-proprietorship', label: 'Sole Proprietorship' },
                          { value: 'partnership', label: 'Partnership' },
                          { value: 'llc', label: 'LLC' },
                          { value: 'corporation', label: 'Corporation' },
                          { value: 'nonprofit', label: 'Non-profit' },
                          { value: 'cooperative', label: 'Cooperative' },
                        ]}
                      />

                      <Input
                        label="Registration Number"
                        value={profile?.businessProfile?.registrationNumber || ''}
                        onChange={(e) => {
                          setProfile((prev) => ({
                            ...prev,
                            businessProfile: {
                              ...prev.businessProfile,
                              registrationNumber: e.target.value,
                            },
                          }));
                          setUnsavedChanges(true);
                        }}
                        disabled={!editMode.business}
                      />

                      <Input
                        label="Year Established"
                        type="number"
                        value={profile?.businessProfile?.yearEstablished || ''}
                        onChange={(e) => {
                          setProfile((prev) => ({
                            ...prev,
                            businessProfile: {
                              ...prev.businessProfile,
                              yearEstablished: e.target.value,
                            },
                          }));
                          setUnsavedChanges(true);
                        }}
                        disabled={!editMode.business}
                        min="1900"
                        max={new Date().getFullYear()}
                      />

                      <Input
                        label="Website"
                        value={profile?.businessProfile?.website || ''}
                        onChange={(e) => {
                          setProfile((prev) => ({
                            ...prev,
                            businessProfile: { ...prev.businessProfile, website: e.target.value },
                          }));
                          setUnsavedChanges(true);
                        }}
                        disabled={!editMode.business}
                        icon={Globe}
                        placeholder="https://"
                      />

                      <div className="md:col-span-2">
                        <Textarea
                          label="Business Description"
                          value={profile?.businessProfile?.description || ''}
                          onChange={(e) => {
                            setProfile((prev) => ({
                              ...prev,
                              businessProfile: {
                                ...prev.businessProfile,
                                description: e.target.value,
                              },
                            }));
                            setUnsavedChanges(true);
                          }}
                          disabled={!editMode.business}
                          placeholder="Describe your business, products, services, and target market..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="LinkedIn"
                        value={profile?.businessProfile?.socialMedia?.linkedin || ''}
                        onChange={(e) => {
                          setProfile((prev) => ({
                            ...prev,
                            businessProfile: {
                              ...prev.businessProfile,
                              socialMedia: {
                                ...prev.businessProfile.socialMedia,
                                linkedin: e.target.value,
                              },
                            },
                          }));
                          setUnsavedChanges(true);
                        }}
                        disabled={!editMode.business}
                        icon={Linkedin}
                        placeholder="LinkedIn URL"
                      />
                      <Input
                        label="Twitter"
                        value={profile?.businessProfile?.socialMedia?.twitter || ''}
                        onChange={(e) => {
                          setProfile((prev) => ({
                            ...prev,
                            businessProfile: {
                              ...prev.businessProfile,
                              socialMedia: {
                                ...prev.businessProfile.socialMedia,
                                twitter: e.target.value,
                              },
                            },
                          }));
                          setUnsavedChanges(true);
                        }}
                        disabled={!editMode.business}
                        icon={Twitter}
                        placeholder="Twitter URL"
                      />
                      <Input
                        label="Instagram"
                        value={profile?.businessProfile?.socialMedia?.instagram || ''}
                        onChange={(e) => {
                          setProfile((prev) => ({
                            ...prev,
                            businessProfile: {
                              ...prev.businessProfile,
                              socialMedia: {
                                ...prev.businessProfile.socialMedia,
                                instagram: e.target.value,
                              },
                            },
                          }));
                          setUnsavedChanges(true);
                        }}
                        disabled={!editMode.business}
                        icon={Instagram}
                        placeholder="Instagram URL"
                      />
                      <Input
                        label="Facebook"
                        value={profile?.businessProfile?.socialMedia?.facebook || ''}
                        onChange={(e) => {
                          setProfile((prev) => ({
                            ...prev,
                            businessProfile: {
                              ...prev.businessProfile,
                              socialMedia: {
                                ...prev.businessProfile.socialMedia,
                                facebook: e.target.value,
                              },
                            },
                          }));
                          setUnsavedChanges(true);
                        }}
                        disabled={!editMode.business}
                        icon={Globe}
                        placeholder="Facebook URL"
                      />
                    </div>
                  </Card>
                </div>
              )}

              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Skills & Expertise</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={editMode.skills ? Check : Edit3}
                      onClick={() => setEditMode((prev) => ({ ...prev, skills: !prev.skills }))}
                    >
                      {editMode.skills ? 'Done' : 'Edit'}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {profile?.skills?.map((skill, index) => (
                      <SkillTag
                        key={index}
                        skill={typeof skill === 'string' ? skill : skill.name}
                        level={typeof skill === 'string' ? null : skill.level}
                        onRemove={() => handleRemoveItem('skills', index)}
                        editable={editMode.skills}
                      />
                    ))}
                  </div>

                  {editMode.skills && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a new skill..."
                        value={editMode.newSkill || ''}
                        onChange={(e) =>
                          setEditMode((prev) => ({ ...prev, newSkill: e.target.value }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && editMode.newSkill) {
                            handleAddItem('skills', editMode.newSkill);
                            setEditMode((prev) => ({ ...prev, newSkill: '' }));
                          }
                        }}
                      />
                      <Button
                        icon={Plus}
                        onClick={() => {
                          if (editMode.newSkill) {
                            handleAddItem('skills', editMode.newSkill);
                            setEditMode((prev) => ({ ...prev, newSkill: '' }));
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              {/* Goals Tab */}
              {activeTab === 'goals' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Goals</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={editMode.goals ? Check : Edit3}
                        onClick={() => setEditMode((prev) => ({ ...prev, goals: !prev.goals }))}
                      >
                        {editMode.goals ? 'Done' : 'Edit'}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {profile?.goals?.map((goal, index) => (
                        <div key={index} className="flex items-center gap-3 group">
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          {editMode.goals ? (
                            <Input
                              value={typeof goal === 'string' ? goal : goal.text}
                              onChange={(e) => {
                                const newGoals = [...profile.goals];
                                newGoals[index] = e.target.value;
                                setProfile((prev) => ({ ...prev, goals: newGoals }));
                                setUnsavedChanges(true);
                              }}
                              className="flex-1"
                            />
                          ) : (
                            <span className="flex-1 text-gray-700">
                              {typeof goal === 'string' ? goal : goal.text}
                            </span>
                          )}
                          {editMode.goals && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleRemoveItem('goals', index)}
                              className="text-red-600"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {editMode.goals && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Plus}
                        onClick={() => handleAddItem('goals', '')}
                        className="mt-4"
                      >
                        Add Goal
                      </Button>
                    )}
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={editMode.achievements ? Check : Edit3}
                        onClick={() =>
                          setEditMode((prev) => ({ ...prev, achievements: !prev.achievements }))
                        }
                      >
                        {editMode.achievements ? 'Done' : 'Edit'}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {profile?.achievements?.map((achievement, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="p-2 bg-yellow-50 rounded-lg">
                            <Award size={18} className="text-yellow-600" />
                          </div>
                          {editMode.achievements ? (
                            <div className="flex-1 space-y-2">
                              <Input
                                value={achievement.title || ''}
                                onChange={(e) => {
                                  const newAchievements = [...profile.achievements];
                                  newAchievements[index] = {
                                    ...achievement,
                                    title: e.target.value,
                                  };
                                  setProfile((prev) => ({
                                    ...prev,
                                    achievements: newAchievements,
                                  }));
                                  setUnsavedChanges(true);
                                }}
                                placeholder="Achievement title"
                              />
                              <Input
                                value={achievement.date || ''}
                                onChange={(e) => {
                                  const newAchievements = [...profile.achievements];
                                  newAchievements[index] = { ...achievement, date: e.target.value };
                                  setProfile((prev) => ({
                                    ...prev,
                                    achievements: newAchievements,
                                  }));
                                  setUnsavedChanges(true);
                                }}
                                placeholder="Date"
                              />
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium text-gray-900">{achievement.title}</p>
                              {achievement.date && (
                                <p className="text-sm text-gray-500">{achievement.date}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {editMode.achievements && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Plus}
                        onClick={() => handleAddItem('achievements', { title: '', date: '' })}
                        className="mt-4"
                      >
                        Add Achievement
                      </Button>
                    )}
                  </Card>
                </div>
              )}

              {/* Mentors Tab */}
              {activeTab === 'mentors' && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">My Mentors</h3>

                  {profile?.mentors?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.mentors.map((mentor, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {mentor.name?.[0] || 'M'}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{mentor.name}</p>
                            <p className="text-sm text-gray-600">{mentor.expertise}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="info">Active</Badge>
                              <span className="text-xs text-gray-500">
                                <Clock size={12} className="inline mr-1" />
                                {mentor.sessions} sessions
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" icon={Mail} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No mentors connected yet</p>
                      <Button variant="primary" className="mt-4">
                        Find Mentors
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-500">
                            Receive email updates about opportunities
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={profile?.preferences?.emailNotifications || false}
                            onChange={(e) =>
                              handleUpdate('preferences.emailNotifications', e.target.checked)
                            }
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Profile Visibility</p>
                          <p className="text-sm text-gray-500">Who can see your profile</p>
                        </div>
                        <Select
                          value={profile?.preferences?.profileVisibility || 'public'}
                          onChange={(e) =>
                            handleUpdate('preferences.profileVisibility', e.target.value)
                          }
                          options={[
                            { value: 'public', label: 'Public' },
                            { value: 'mentors', label: 'Mentors Only' },
                            { value: 'private', label: 'Private' },
                          ]}
                          className="w-40"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Mentorship Alerts</p>
                          <p className="text-sm text-gray-500">Get notified about mentor matches</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={profile?.preferences?.mentorshipAlerts || false}
                            onChange={(e) =>
                              handleUpdate('preferences.mentorshipAlerts', e.target.checked)
                            }
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Funding Alerts</p>
                          <p className="text-sm text-gray-500">
                            Get notified about funding opportunities
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={profile?.preferences?.fundingAlerts || false}
                            onChange={(e) =>
                              handleUpdate('preferences.fundingAlerts', e.target.checked)
                            }
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-red-200">
                    <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Once you delete your profile, there is no going back. Please be certain.
                    </p>
                    <Button variant="danger" icon={Trash2} onClick={handleDeleteProfile}>
                      Delete Profile
                    </Button>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default YouthProfile;
