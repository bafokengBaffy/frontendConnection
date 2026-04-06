/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Github,
  Award,
  Briefcase,
  GraduationCap,
  Languages,
  Star,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
} from 'lucide-react';

import { mentorService } from '../../services/mentorService';
import { useAuth } from '../../hooks/useAuth';
import './MentorStyles.css';

const MentorProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await mentorService.getMentorProfile(user.uid);
      if (profileData.success) {
        setProfile(profileData.data);
        setEditForm(profileData.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const result = await mentorService.uploadProfilePhoto(user.uid, file);
      if (result.success) {
        setProfile({ ...profile, profilePhoto: result.photoUrl });
        setEditForm({ ...editForm, profilePhoto: result.photoUrl });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayAdd = (field, item) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), item],
    }));
  };

  const handleArrayRemove = (field, index) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const result = await mentorService.updateMentorProfile(user.uid, editForm);
      if (result.success) {
        setProfile(result.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="mentor-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="mentor-profile">
      {/* Profile Header */}
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="cover-photo">
          <div className="profile-photo-container">
            <img
              src={profile?.profilePhoto || 'https://via.placeholder.com/150'}
              alt={profile?.fullName}
              className="profile-photo"
            />
            {isEditing && (
              <label className="photo-upload-btn">
                <Upload size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  style={{ display: 'none' }}
                />
              </label>
            )}
            {uploadingPhoto && <div className="uploading-spinner"></div>}
          </div>

          {!isEditing ? (
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              <Edit2 size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="profile-info">
          <h1>
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={editForm.fullName || ''}
                onChange={handleInputChange}
                placeholder="Full Name"
              />
            ) : (
              profile?.fullName
            )}
            {profile?.isVerified && <CheckCircle className="verified-badge" size={20} />}
          </h1>

          <p className="title">
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={editForm.title || ''}
                onChange={handleInputChange}
                placeholder="Professional Title"
              />
            ) : (
              profile?.title
            )}
          </p>

          <div className="rating">
            <Star size={16} fill="#F59E0B" color="#F59E0B" />
            <span>{profile?.rating || '5.0'}</span>
            <span>({profile?.totalReviews || 0} reviews)</span>
          </div>

          <div className="stats">
            <div className="stat">
              <Briefcase size={16} />
              <span>{profile?.totalSessions || 0} Sessions</span>
            </div>
            <div className="stat">
              <Users size={16} />
              <span>{profile?.totalStudents || 0} Students</span>
            </div>
            <div className="stat">
              <Clock size={16} />
              <span>Member since {new Date(profile?.createdAt?.toDate()).getFullYear()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'expertise' ? 'active' : ''}`}
          onClick={() => setActiveTab('expertise')}
        >
          Expertise
        </button>
        <button
          className={`tab ${activeTab === 'experience' ? 'active' : ''}`}
          onClick={() => setActiveTab('experience')}
        >
          Experience
        </button>
        <button
          className={`tab ${activeTab === 'education' ? 'active' : ''}`}
          onClick={() => setActiveTab('education')}
        >
          Education
        </button>
        <button
          className={`tab ${activeTab === 'certifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('certifications')}
        >
          Certifications
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        className="tab-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="bio-section">
              <h3>About Me</h3>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editForm.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={5}
                />
              ) : (
                <p>{profile?.bio || 'No bio provided.'}</p>
              )}
            </div>

            <div className="contact-info">
              <h3>Contact Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <Mail size={16} />
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email || ''}
                      onChange={handleInputChange}
                      placeholder="Email"
                    />
                  ) : (
                    <span>{profile?.email || user?.email}</span>
                  )}
                </div>
                <div className="info-item">
                  <Phone size={16} />
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone || ''}
                      onChange={handleInputChange}
                      placeholder="Phone"
                    />
                  ) : (
                    <span>{profile?.phone || 'Not provided'}</span>
                  )}
                </div>
                <div className="info-item">
                  <MapPin size={16} />
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={editForm.location || ''}
                      onChange={handleInputChange}
                      placeholder="Location"
                    />
                  ) : (
                    <span>{profile?.location || 'Not provided'}</span>
                  )}
                </div>
                <div className="info-item">
                  <Languages size={16} />
                  {isEditing ? (
                    <input
                      type="text"
                      name="languages"
                      value={editForm.languages?.join(', ') || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          languages: e.target.value.split(',').map((l) => l.trim()),
                        })
                      }
                      placeholder="Languages (comma separated)"
                    />
                  ) : (
                    <span>{profile?.languages?.join(', ') || 'English'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="social-links">
              <h3>Social Links</h3>
              <div className="links-grid">
                <div className="link-item">
                  <Globe size={16} />
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={editForm.socialLinks?.website || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          socialLinks: { ...editForm.socialLinks, website: e.target.value },
                        })
                      }
                      placeholder="Website"
                    />
                  ) : (
                    <a
                      href={profile?.socialLinks?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profile?.socialLinks?.website || 'Not provided'}
                    </a>
                  )}
                </div>
                <div className="link-item">
                  <Linkedin size={16} />
                  {isEditing ? (
                    <input
                      type="url"
                      name="linkedin"
                      value={editForm.socialLinks?.linkedin || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          socialLinks: { ...editForm.socialLinks, linkedin: e.target.value },
                        })
                      }
                      placeholder="LinkedIn"
                    />
                  ) : (
                    <a
                      href={profile?.socialLinks?.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profile?.socialLinks?.linkedin || 'Not provided'}
                    </a>
                  )}
                </div>
                <div className="link-item">
                  <Twitter size={16} />
                  {isEditing ? (
                    <input
                      type="url"
                      name="twitter"
                      value={editForm.socialLinks?.twitter || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          socialLinks: { ...editForm.socialLinks, twitter: e.target.value },
                        })
                      }
                      placeholder="Twitter"
                    />
                  ) : (
                    <a
                      href={profile?.socialLinks?.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profile?.socialLinks?.twitter || 'Not provided'}
                    </a>
                  )}
                </div>
                <div className="link-item">
                  <Github size={16} />
                  {isEditing ? (
                    <input
                      type="url"
                      name="github"
                      value={editForm.socialLinks?.github || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          socialLinks: { ...editForm.socialLinks, github: e.target.value },
                        })
                      }
                      placeholder="GitHub"
                    />
                  ) : (
                    <a
                      href={profile?.socialLinks?.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profile?.socialLinks?.github || 'Not provided'}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expertise' && (
          <div className="expertise-tab">
            <h3>Areas of Expertise</h3>
            <div className="expertise-list">
              {(isEditing ? editForm.expertise : profile?.expertise || []).map((exp, index) => (
                <div key={index} className="expertise-item">
                  <span>{exp}</span>
                  {isEditing && (
                    <button onClick={() => handleArrayRemove('expertise', index)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="add-expertise">
                  <input
                    type="text"
                    placeholder="Add expertise"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        handleArrayAdd('expertise', e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Plus size={16} />
                </div>
              )}
            </div>

            <h3 style={{ marginTop: '30px' }}>Industries</h3>
            <div className="industries-list">
              {(isEditing ? editForm.industries : profile?.industries || []).map(
                (industry, index) => (
                  <div key={index} className="industry-item">
                    <span>{industry}</span>
                    {isEditing && (
                      <button onClick={() => handleArrayRemove('industries', index)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )
              )}
              {isEditing && (
                <div className="add-industry">
                  <input
                    type="text"
                    placeholder="Add industry"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        handleArrayAdd('industries', e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Plus size={16} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="experience-tab">
            <div className="section-header">
              <h3>Work Experience</h3>
              {isEditing && (
                <button className="add-btn">
                  <Plus size={16} />
                  Add Experience
                </button>
              )}
            </div>
            {(isEditing ? editForm.workExperience : profile?.workExperience || []).map(
              (exp, index) => (
                <div key={index} className="experience-item">
                  <div className="exp-header">
                    <h4>{exp.position}</h4>
                    {isEditing && (
                      <button onClick={() => handleArrayRemove('workExperience', index)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="company">{exp.company}</p>
                  <p className="duration">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </p>
                  <p className="description">{exp.description}</p>
                </div>
              )
            )}
          </div>
        )}

        {activeTab === 'education' && (
          <div className="education-tab">
            <div className="section-header">
              <h3>Education</h3>
              {isEditing && (
                <button className="add-btn">
                  <Plus size={16} />
                  Add Education
                </button>
              )}
            </div>
            {(isEditing ? editForm.education : profile?.education || []).map((edu, index) => (
              <div key={index} className="education-item">
                <GraduationCap size={20} />
                <div className="edu-details">
                  <h4>{edu.degree}</h4>
                  <p className="institution">{edu.institution}</p>
                  <p className="year">{edu.year}</p>
                </div>
                {isEditing && (
                  <button onClick={() => handleArrayRemove('education', index)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'certifications' && (
          <div className="certifications-tab">
            <div className="section-header">
              <h3>Certifications</h3>
              {isEditing && (
                <button className="add-btn">
                  <Plus size={16} />
                  Add Certification
                </button>
              )}
            </div>
            {(isEditing ? editForm.certifications : profile?.certifications || []).map(
              (cert, index) => (
                <div key={index} className="certification-item">
                  <Award size={20} />
                  <div className="cert-details">
                    <h4>{cert.name}</h4>
                    <p className="issuer">{cert.issuer}</p>
                    <p className="year">Issued {cert.year}</p>
                  </div>
                  {cert.fileUrl && (
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-cert"
                    >
                      View
                    </a>
                  )}
                  {isEditing && (
                    <button onClick={() => handleArrayRemove('certifications', index)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MentorProfile;
