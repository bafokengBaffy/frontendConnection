import { useEffect, useMemo, useState } from 'react';
import {
  FiCompass,
  FiHeart,
  FiImage,
  FiMessageCircle,
  FiRefreshCw,
  FiRepeat,
  FiSend,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';
import socialPlatformService from '../../services/socialPlatformService';
import './SocialDashboardSection.css';

const formatTimeAgo = (value) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const initialsFor = (name) =>
  (name || 'CC')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const roleLabel = (role) => {
  if (!role) return 'member';
  return role.replace(/_/g, ' ');
};

const SocialDashboardSection = ({
  audience = 'community',
  title = 'Community Pulse',
  subtitle = 'A shared feed for wins, questions, media, events, and collaboration updates.',
}) => {
  const { currentUser, userProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [composerText, setComposerText] = useState('');
  const [composerTags, setComposerTags] = useState('');
  const [composerVisibility, setComposerVisibility] = useState('public');
  const [composerFiles, setComposerFiles] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const displayName = useMemo(
    () =>
      userProfile?.displayName ||
      userProfile?.fullName ||
      userProfile?.companyName ||
      currentUser?.displayName ||
      currentUser?.email?.split('@')[0] ||
      'Community Member',
    [currentUser, userProfile]
  );

  const refreshFeed = async () => {
    setLoading(true);

    try {
      const [feed, people, trending] = await Promise.all([
        socialPlatformService.getFeed(userProfile),
        socialPlatformService.getSuggestions(userProfile),
        socialPlatformService.getTrendingTopics(userProfile),
      ]);

      setPosts(feed.data || []);
      setSuggestions(people.data || []);
      setTopics(trending.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    refreshFeed();
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  const handleFilesSelected = (event) => {
    setComposerFiles(Array.from(event.target.files || []));
  };

  const handleCreatePost = async () => {
    const tags = composerTags
      .split(',')
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (!composerText.trim() && composerFiles.length === 0) {
      return;
    }

    setPosting(true);
    try {
      const result = await socialPlatformService.createPost(
        {
          content: composerText,
          visibility: composerVisibility,
          tags,
          files: composerFiles,
        },
        userProfile
      );

      if (result.success && result.data) {
        setPosts((prev) => [result.data, ...prev]);
        setComposerText('');
        setComposerTags('');
        setComposerFiles([]);
      }
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (postId, hasLiked) => {
    await socialPlatformService.toggleLike(postId, hasLiked);

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              hasLiked: !hasLiked,
              likeCount: Math.max(0, (post.likeCount || 0) + (hasLiked ? -1 : 1)),
            }
          : post
      )
    );
  };

  const handleCommentSubmit = async (postId) => {
    const draft = (commentDrafts[postId] || '').trim();
    if (!draft) {
      return;
    }

    const result = await socialPlatformService.addComment(postId, draft, userProfile);
    if (!result.success) {
      return;
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [...(post.comments || []), result.data || {
                id: `comment-${Date.now()}`,
                authorName: displayName,
                authorRole: userProfile?.userType || 'member',
                body: draft,
                createdAt: new Date().toISOString(),
              }],
              commentCount: (post.commentCount || 0) + 1,
            }
          : post
      )
    );
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleShare = async (postId) => {
    await socialPlatformService.sharePost(postId);
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, shareCount: (post.shareCount || 0) + 1 }
          : post
      )
    );
  };

  return (
    <section className="social-section">
      <div className="social-section__header">
        <div>
          <div className="social-section__eyebrow">{audience} social layer</div>
          <h2 className="social-section__title">{title}</h2>
          <p className="social-section__subtitle">{subtitle}</p>
        </div>
        <div className="social-section__meta">
          <div className="social-pill">{posts.length} live posts</div>
          <div className="social-pill">{suggestions.length} people to know</div>
          <button className="social-button social-button--ghost" onClick={refreshFeed}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      <div className="social-section__body">
        <div className="social-section__main">
          <div className="social-card social-composer">
            <div className="social-composer__top">
              <div className="social-avatar">{initialsFor(displayName)}</div>
              <div style={{ flex: 1 }}>
                <div className="social-card__title">Post as {displayName}</div>
                <div className="social-card__subtitle">
                  Share progress, opportunities, wins, photos, or questions with the network.
                </div>
                <textarea
                  className="social-composer__input"
                  placeholder="What would make the community smarter, more connected, or more inspired today?"
                  value={composerText}
                  onChange={(event) => setComposerText(event.target.value)}
                />
              </div>
            </div>

            <div className="social-media-preview">
              {composerFiles.map((file) => (
                <div key={`${file.name}-${file.size}`} className="social-media-preview__item">
                  <img src={URL.createObjectURL(file)} alt={file.name} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: '0.9rem' }}>
              <input
                className="social-tag-input"
                placeholder="Add tags like career, funding, hiring, mentorship"
                value={composerTags}
                onChange={(event) => setComposerTags(event.target.value)}
              />
            </div>

            <div className="social-composer__controls" style={{ marginTop: '1rem' }}>
              <div className="social-composer__toolbar">
                <label className="social-action" htmlFor={`social-media-${audience}`}>
                  <FiImage /> Add media
                </label>
                <input
                  id={`social-media-${audience}`}
                  hidden
                  multiple
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFilesSelected}
                />
              </div>

              <div className="social-composer__visibility">
                <span>Visibility</span>
                <select
                  className="social-select"
                  value={composerVisibility}
                  onChange={(event) => setComposerVisibility(event.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="connections">Connections</option>
                </select>
                <button
                  className="social-button social-button--primary"
                  disabled={posting}
                  onClick={handleCreatePost}
                >
                  <FiSend /> {posting ? 'Posting...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>

          <div className="social-card">
            <div className="social-card__title">Live Feed</div>
            <div className="social-card__subtitle">
              Built to feel closer to Facebook and LinkedIn: status updates, media, reactions, and comments.
            </div>
          </div>

          {loading ? (
            <div className="social-card social-loading">Loading the community feed...</div>
          ) : null}

          {posts.map((post) => (
            <article key={post.id} className="social-card social-post">
              <div className="social-post__header">
                <div className="social-avatar social-avatar--small">
                  {initialsFor(post.author?.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="social-post__name">{post.author?.name}</div>
                  <p className="social-post__headline">
                    {post.author?.headline || roleLabel(post.author?.role)}
                  </p>
                  <p className="social-post__time">{formatTimeAgo(post.createdAt)}</p>
                </div>
              </div>

              <div className="social-post__content">{post.content}</div>

              {post.media?.length ? (
                <div className="social-post__media">
                  {post.media.map((asset) => (
                    <img key={asset.url} src={asset.url} alt={asset.name || 'Post media'} />
                  ))}
                </div>
              ) : null}

              {post.tags?.length ? (
                <div className="social-post__taglist">
                  {post.tags.map((tag) => (
                    <span key={`${post.id}-${tag}`} className="social-tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="social-post__stats">
                <span>{post.likeCount || 0} reactions</span>
                <span>{post.commentCount || 0} comments</span>
                <span>{post.shareCount || 0} shares</span>
              </div>

              <div className="social-post__actions">
                <div className="social-composer__toolbar">
                  <button
                    className="social-action"
                    onClick={() => handleToggleLike(post.id, post.hasLiked)}
                  >
                    <FiHeart /> {post.hasLiked ? 'Liked' : 'Like'}
                  </button>
                  <button className="social-action">
                    <FiMessageCircle /> Comment
                  </button>
                  <button className="social-action" onClick={() => handleShare(post.id)}>
                    <FiRepeat /> Share
                  </button>
                </div>
              </div>

              <div className="social-post__comment-bar">
                <input
                  className="social-comment-input"
                  placeholder="Write a comment..."
                  value={commentDrafts[post.id] || ''}
                  onChange={(event) =>
                    setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))
                  }
                />
                <button
                  className="social-button social-button--primary"
                  onClick={() => handleCommentSubmit(post.id)}
                >
                  Reply
                </button>
              </div>

              {post.comments?.length ? (
                <div className="social-comment-list">
                  {post.comments.slice(-3).map((comment) => (
                    <div key={comment.id} className="social-comment">
                      <div className="social-comment__meta">
                        <strong>{comment.authorName}</strong> · {roleLabel(comment.authorRole)} ·{' '}
                        {formatTimeAgo(comment.createdAt)}
                      </div>
                      <div>{comment.body || comment.content}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}

          {!loading && posts.length === 0 ? (
            <div className="social-card social-empty">
              No posts yet. Start the rhythm by sharing your first update.
            </div>
          ) : null}
        </div>

        <aside className="social-section__sidebar">
          <div className="social-card">
            <div className="social-card__title">Trending Now</div>
            <div className="social-card__subtitle">
              Topics people are already pushing around the network.
            </div>
            <div style={{ marginTop: '0.8rem' }}>
              {topics.map((topic) => (
                <div key={topic.tag} className="social-side-item">
                  <FiTrendingUp style={{ marginTop: '0.15rem', color: '#f97316' }} />
                  <div>
                    <p className="social-side-item__title">#{topic.tag}</p>
                    <p className="social-side-item__copy">{topic.count} active mentions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="social-card">
            <div className="social-card__title">People To Know</div>
            <div className="social-card__subtitle">
              More normal-app energy means more discovery, not only job listings.
            </div>
            <div style={{ marginTop: '0.8rem' }}>
              {suggestions.map((person) => (
                <div key={person.id} className="social-side-item">
                  <div className="social-avatar social-avatar--small">
                    {initialsFor(person.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="social-side-item__title">{person.name}</p>
                    <p className="social-side-item__copy">{person.headline}</p>
                    <p className="social-side-item__copy">
                      {person.mutualCount || 0} community links nearby
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="social-card">
            <div className="social-card__title">What This Unlocks</div>
            <div className="social-card__subtitle">
              The product starts behaving more like a daily-use platform.
            </div>
            <div style={{ marginTop: '0.8rem' }}>
              <div className="social-side-item">
                <FiCompass style={{ marginTop: '0.15rem', color: '#1d4ed8' }} />
                <div>
                  <p className="social-side-item__title">Live discovery</p>
                  <p className="social-side-item__copy">
                    Follow progress, opportunities, and event media in one stream.
                  </p>
                </div>
              </div>
              <div className="social-side-item">
                <FiUsers style={{ marginTop: '0.15rem', color: '#1d4ed8' }} />
                <div>
                  <p className="social-side-item__title">Human presence</p>
                  <p className="social-side-item__copy">
                    Alumni, students, parents, mentors, companies, and institutions can all show up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default SocialDashboardSection;
