// frontend/src/pages/alumni/AlumniDashboard.jsx
import {
  Add as AddIcon,
  Article as ArticleIcon,
  AutoAwesome as AutoAwesomeIcon,
  CalendarToday as CalendarTodayIcon,
  CheckCircle as CheckCircleIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Comment as CommentIcon,
  ConnectWithoutContact as ConnectWithoutContactIcon,
  VolunteerActivism as DonationIcon,
  Event as EventIcon,
  Favorite as FavoriteIcon,
  Group as GroupIcon,
  Groups as GroupsIcon,
  Leaderboard as LeaderboardIcon,
  Lightbulb as LightbulbIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  MilitaryTech as MilitaryTechIcon,
  AttachMoney as MoneyIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  Psychology as PsychologyIcon,
  Public as PublicIcon,
  Refresh as RefreshIcon,
  RocketLaunch as RocketLaunchIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Share as ShareIcon,
  Star as StarIcon,
  Tag as TagIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  styled,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context';
import { useNotifications } from '../../hooks/useNotifications';
import { alumniService } from '../../services/alumniService';
import { alumniSocialService } from '../../services/alumniSocialService';
import {
  formatCurrency,
  formatDate,
  getRelativeTime,
  truncateText
} from '../../utils/formatters';

// ==================== STYLED COMPONENTS ====================

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

// ==================== HELPER COMPONENTS ====================

// Loading Skeleton Component
const PostSkeleton = () => (
  <Card sx={{ mb: 2, p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Skeleton variant="circular" width={48} height={48} />
      <Box sx={{ ml: 2 }}>
        <Skeleton variant="text" width={150} height={24} />
        <Skeleton variant="text" width={100} height={20} />
      </Box>
    </Box>
    <Skeleton variant="text" width="100%" height={60} />
    <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
      <Skeleton variant="rectangular" width={80} height={36} />
      <Skeleton variant="rectangular" width={80} height={36} />
      <Skeleton variant="rectangular" width={80} height={36} />
    </Box>
  </Card>
);

// Achievement Badge Component
const AchievementBadge = ({ achievement, size = 'medium' }) => {
  const getIcon = () => {
    switch (achievement.type) {
      case 'donation':
        return <DonationIcon />;
      case 'connection':
        return <PeopleIcon />;
      case 'event':
        return <EventIcon />;
      case 'post':
        return <ArticleIcon />;
      case 'mentorship':
        return <SchoolIcon />;
      default:
        return <MilitaryTechIcon />;
    }
  };

  const sizes = { small: 32, medium: 48, large: 64 };

  return (
    <Tooltip title={achievement.description}>
      <Box sx={{ textAlign: 'center' }}>
        <Avatar
          sx={{
            width: sizes[size],
            height: sizes[size],
            bgcolor: 'gold',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            margin: '0 auto',
            mb: 1,
          }}
        >
          {getIcon()}
        </Avatar>
        <Typography variant="caption" fontWeight="bold">
          {achievement.name}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// Trending Topic Component
const TrendingTopic = ({ topic }) => (
  <Paper sx={{ p: 1.5, mb: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
    <Typography variant="caption" color="textSecondary">
      Trending in Alumni
    </Typography>
    <Typography variant="subtitle2" fontWeight="bold">
      #{topic.hashtag}
    </Typography>
    <Typography variant="caption" color="textSecondary">
      {topic.posts} posts
    </Typography>
  </Paper>
);

// Notification Item Component
const NotificationItem = ({ notification, onMarkRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <FavoriteIcon color="error" />;
      case 'comment':
        return <CommentIcon color="primary" />;
      case 'share':
        return <ShareIcon color="success" />;
      case 'connection':
        return <PeopleIcon color="info" />;
      case 'event':
        return <EventIcon color="warning" />;
      default:
        return <NotificationsIcon />;
    }
  };

  return (
    <ListItem
      sx={{
        bgcolor: notification.read ? 'transparent' : 'action.hover',
        '&:hover': { bgcolor: 'action.selected' },
        cursor: 'pointer',
      }}
      onClick={() => onMarkRead(notification.id)}
    >
      <ListItemIcon>{getIcon()}</ListItemIcon>
      <ListItemText
        primary={notification.message}
        secondary={getRelativeTime(notification.createdAt?.toDate?.() || notification.createdAt)}
        primaryTypographyProps={{ variant: 'body2' }}
      />
      {!notification.read && (
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
      )}
    </ListItem>
  );
};

// Event Card Component
const EventCard = ({ event, onRegister, isRegistered }) => (
  <StyledCard>
    {event.image && (
      <CardMedia component="img" height="140" image={event.image} alt={event.title} />
    )}
    <CardContent>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}
      >
        <Typography variant="h6" component="div">
          {event.title}
        </Typography>
        {event.isVirtual && <Chip label="Virtual" size="small" color="info" />}
      </Box>
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}
      >
        <CalendarTodayIcon fontSize="small" />
        {formatDate(event.startDate?.toDate?.() || event.startDate, 'long')}
      </Typography>
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}
      >
        <LocationIcon fontSize="small" />
        {event.location || 'Virtual Event'}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {truncateText(event.description || '', 100)}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Chip
          size="small"
          icon={<PeopleIcon />}
          label={`${event.registrationsCount || 0} registered`}
        />
        <Button
          variant={isRegistered ? 'outlined' : 'contained'}
          size="small"
          disabled={isRegistered}
          onClick={() => onRegister(event.id)}
        >
          {isRegistered ? 'Registered' : 'Register'}
        </Button>
      </Box>
    </CardContent>
  </StyledCard>
);

// Connection Suggestion Card
const ConnectionSuggestionCard = ({ suggestion, onConnect }) => (
  <StyledCard>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={suggestion.photoURL} sx={{ width: 56, height: 56, mr: 2 }}>
          {suggestion.name?.charAt(0)}
        </Avatar>
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            {suggestion.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {suggestion.position} at {suggestion.company}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <StarIcon sx={{ fontSize: 14, color: '#f59e0b', mr: 0.5 }} />
            <Typography variant="caption">
              {Math.round((suggestion.matchScore || 0) * 100)}% Match
            </Typography>
            <Typography variant="caption" sx={{ ml: 1 }}>
              •
            </Typography>
            <Typography variant="caption" sx={{ ml: 1 }}>
              Class of {suggestion.graduationYear}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {suggestion.commonInterests?.slice(0, 3).map((interest, idx) => (
          <Chip key={idx} label={interest} size="small" variant="outlined" />
        ))}
      </Box>
      <Button
        variant="contained"
        fullWidth
        startIcon={<ConnectWithoutContactIcon />}
        onClick={() => onConnect(suggestion)}
      >
        Connect
      </Button>
    </CardContent>
  </StyledCard>
);

// Poll Component
const Poll = ({ poll, onVote }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {poll.question}
      </Typography>
      <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
        {poll.options?.map((option, idx) => {
          const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0;
          return (
            <Box key={idx} sx={{ mb: 2 }}>
              <FormControlLabel
                value={option.id}
                control={<Radio size="small" />}
                label={option.text}
              />
              {selectedOption && (
                <Box sx={{ mt: 0.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {option.votes || 0} votes ({percentage.toFixed(1)}%)
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </RadioGroup>
      {selectedOption && !poll.userVoted && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => onVote(poll.id, selectedOption)}
          sx={{ mt: 1 }}
        >
          Submit Vote
        </Button>
      )}
    </Paper>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================

const AlumniDashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // ==================== STATE MANAGEMENT ====================

  // Feed State
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [feedFilter, setFeedFilter] = useState('all');
  const [feedSort, setFeedSort] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Data State
  const [stats, setStats] = useState({
    collectionCounts: {
      total_connections: 0,
      active_mentorships: 0,
      total_donated: 0,
      events_attended: 0,
      posts_count: 0,
      achievements: 0,
    },
    engagementScore: 0,
    recentActivity: [],
    trendingTopics: [],
    upcomingBirthdays: [],
  });

  const [donationImpact, setDonationImpact] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [networkSuggestions, setNetworkSuggestions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [polls, setPolls] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Dialog States
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [shareMessage, setShareMessage] = useState('');

  // Form States
  const [donationAmount, setDonationAmount] = useState('');
  const [donationCampaign, setDonationCampaign] = useState('general');
  const [donationMessage, setDonationMessage] = useState('');
  const [donationIsAnonymous, setDonationIsAnonymous] = useState(false);
  const [donationIsRecurring, setDonationIsRecurring] = useState(false);
  const [donationProcessing, setDonationProcessing] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [postPrivacy, setPostPrivacy] = useState('public');
  const [postTags, setPostTags] = useState([]);
  const [postLocation, setPostLocation] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [connectionProcessing, setConnectionProcessing] = useState(false);

  // Snackbar State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Refs
  const fileInputRef = useRef(null);
  const feedEndRef = useRef(null);
  const observerRef = useRef(null);

  // ==================== DATA LOADING FUNCTIONS ====================

  const loadFeed = useCallback(
    async (reset = false) => {
      if (reset) {
        setPosts([]);
        setLastDoc(null);
        setHasMore(true);
      }

      if (!reset && (!hasMore || loadingMore)) return;

      const setIsLoading = reset ? setLoading : setLoadingMore;
      setIsLoading(true);

      try {
        const result = await alumniSocialService.getFeed(reset ? null : lastDoc, 15, feedFilter);

        if (result.success) {
          if (reset) {
            setPosts(result.data);
          } else {
            setPosts((prev) => [...prev, ...result.data]);
          }
          setLastDoc(result.lastDoc);
          setHasMore(result.hasMore);
        }
      } catch (error) {
        console.error('Error loading feed:', error);
        showNotification('Failed to load feed', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [lastDoc, hasMore, loadingMore, feedFilter, showNotification]
  );

  const loadDashboardData = useCallback(async () => {
    try {
      const [
        metricsRes,
        eventsRes,
        suggestionsRes,
        insightsRes,
        achievementsRes,
        leaderboardRes,
        pollsRes,
        announcementsRes,
      ] = await Promise.all([
        alumniService.getDashboardMetrics(),
        alumniService.getEvents(),
        alumniService.getNetworkSuggestions(),
        alumniService.getAIInsights(),
        alumniService.getAchievements(),
        alumniService.getLeaderboard(),
        alumniSocialService.getPolls(),
        alumniSocialService.getAnnouncements(),
      ]);

      if (metricsRes.success) {
        setStats((prev) => ({ ...prev, ...metricsRes.data.metrics }));
        if (metricsRes.data.trendingTopics)
          setStats((prev) => ({ ...prev, trendingTopics: metricsRes.data.trendingTopics }));
      }
      if (eventsRes.success) setUpcomingEvents(eventsRes.data);
      if (suggestionsRes.success) setNetworkSuggestions(suggestionsRes.data);
      if (insightsRes.success) setInsights(insightsRes.data?.insights || []);
      if (achievementsRes.success) setAchievements(achievementsRes.data);
      if (leaderboardRes.success) setLeaderboard(leaderboardRes.data);
      if (pollsRes.success) setPolls(pollsRes.data);
      if (announcementsRes.success) setAnnouncements(announcementsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    const result = await alumniSocialService.getNotifications();
    if (result.success) {
      setNotifications(result.data);
      const unread = result.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    }
  }, []);

  // ==================== EVENT HANDLERS ====================

  // Post Actions
  const handleLike = async (postId, isLiked) => {
    const result = isLiked
      ? await alumniSocialService.unlikePost(postId)
      : await alumniSocialService.likePost(postId);

    if (result.success) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, isLiked: !isLiked, likeCount: post.likeCount + (isLiked ? -1 : 1) }
            : post
        )
      );
    }
  };

  const handleComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    const result = await alumniSocialService.addComment(postId, commentText);
    if (result.success) {
      await loadFeed(true);
      showNotification('Comment added!', 'success');
    }
  };

  const handleShare = async (postId) => {
    setSharePostId(postId);
    setShareDialogOpen(true);
  };

  const handleShareSubmit = async () => {
    const result = await alumniSocialService.sharePost(sharePostId, shareMessage);
    if (result.success) {
      setShareDialogOpen(false);
      setShareMessage('');
      showNotification('Post shared successfully!', 'success');
      await loadFeed(true);
    }
  };

  const handleSave = async (postId, isSaved) => {
    const result = isSaved
      ? await alumniSocialService.unsavePost(postId)
      : await alumniSocialService.savePost(postId);

    if (result.success) {
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, isSaved: !isSaved } : post))
      );
      showNotification(isSaved ? 'Removed from saved' : 'Saved!', 'success');
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const result = await alumniSocialService.deletePost(postId);
      if (result.success) {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        showNotification('Post deleted', 'success');
      }
    }
  };

  const handleReportPost = async (postId) => {
    setReportPostId(postId);
    setReportDialogOpen(true);
  };

  const handleReportSubmit = async () => {
    if (!reportReason) {
      showNotification('Please select a reason', 'warning');
      return;
    }
    const result = await alumniSocialService.reportPost(reportPostId, reportReason);
    if (result.success) {
      setReportDialogOpen(false);
      setReportReason('');
      showNotification('Report submitted. Thank you for helping keep our community safe.', 'info');
    }
  };

  // Donation Handlers
  const handleDonationSubmit = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }

    setDonationProcessing(true);
    const success = await alumniService.createDonation({
      amount: parseFloat(donationAmount),
      campaign: donationCampaign,
      message: donationMessage,
      isAnonymous: donationIsAnonymous,
      isRecurring: donationIsRecurring,
      paymentMethod: 'card',
    });

    setDonationProcessing(false);

    if (success) {
      setDonationDialogOpen(false);
      setDonationAmount('');
      setDonationCampaign('general');
      setDonationMessage('');
      setDonationIsAnonymous(false);
      setDonationIsRecurring(false);
      showNotification('Thank you for your generous donation!', 'success');
      await loadDashboardData();
    } else {
      showNotification('Donation failed. Please try again.', 'error');
    }
  };

  // Post Creation Handlers
  const handleCreatePost = async () => {
    if (!postContent.trim() && selectedMedia.length === 0) {
      showNotification('Please add some content or media', 'warning');
      return;
    }

    setIsPosting(true);
    const result = await alumniSocialService.createPost({
      content: postContent,
      mediaFiles: selectedMedia,
      privacy: postPrivacy,
      tags: postTags,
      location: postLocation,
    });

    if (result.success) {
      setPostContent('');
      setSelectedMedia([]);
      setPostTags([]);
      setPostLocation('');
      setPostDialogOpen(false);
      showNotification('Post created successfully!', 'success');
      await loadFeed(true);
    } else {
      showNotification('Failed to create post', 'error');
    }
    setIsPosting(false);
  };

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024); // 10MB limit
    if (validFiles.length !== files.length) {
      showNotification('Some files exceed 10MB limit and were skipped', 'warning');
    }
    setSelectedMedia((prev) => [...prev, ...validFiles]);
  };

  const removeMedia = (index) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Connection Handlers
  const handleConnectRequest = async () => {
    if (!selectedSuggestion) return;

    setConnectionProcessing(true);
    const success = await alumniService.sendConnectionRequest(selectedSuggestion.id);
    setConnectionProcessing(false);

    if (success) {
      setConnectionDialogOpen(false);
      setSelectedSuggestion(null);
      showNotification(`Connection request sent to ${selectedSuggestion.name}`, 'success');
    } else {
      showNotification('Failed to send connection request', 'error');
    }
  };

  // Notification Handlers
  const handleMarkNotificationRead = async (notificationId) => {
    await alumniSocialService.markNotificationRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await alumniSocialService.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    showNotification('All notifications marked as read', 'success');
  };

  // Event Handlers
  const handleEventRegistration = async (eventId) => {
    const success = await alumniService.registerForEvent(eventId);
    if (success) {
      showNotification('Registered for event successfully!', 'success');
      await loadDashboardData();
    } else {
      showNotification('Failed to register for event', 'error');
    }
  };

  // Poll Handlers
  const handlePollVote = async (pollId, optionId) => {
    const result = await alumniSocialService.votePoll(pollId, optionId);
    if (result.success) {
      setPolls((prev) =>
        prev.map((poll) =>
          poll.id === pollId
            ? {
              ...poll,
              options: poll.options.map((opt) =>
                opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
              ),
              userVoted: true,
            }
            : poll
        )
      );
      showNotification('Vote submitted!', 'success');
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const getEngagementColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getEngagementLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadFeed(true);
    loadDashboardData();
    loadNotifications();
  }, [feedFilter, feedSort]);

  useEffect(() => {
    // Intersection Observer for infinite scroll
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadFeed(false);
        }
      },
      { threshold: 0.1 }
    );

    if (feedEndRef.current) {
      observerRef.current.observe(feedEndRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loadingMore, loading, feedEndRef.current]);

  // ==================== RENDER HELPERS ====================

  const statsCards = useMemo(
    () => [
      {
        title: 'Network Size',
        value: stats.collectionCounts.total_connections || 0,
        icon: <PeopleIcon />,
        color: '#3b82f6',
        trend: '+12%',
        trendUp: true,
      },
      {
        title: 'Posts Shared',
        value: stats.collectionCounts.posts_count || 0,
        icon: <ArticleIcon />,
        color: '#10b981',
        trend: '+8%',
        trendUp: true,
      },
      {
        title: 'Total Donated',
        value: formatCurrency(stats.collectionCounts.total_donated || 0),
        icon: <MoneyIcon />,
        color: '#f59e0b',
        trend: '+25%',
        trendUp: true,
      },
      {
        title: 'Events Attended',
        value: stats.collectionCounts.events_attended || 0,
        icon: <EventIcon />,
        color: '#8b5cf6',
        trend: '+5',
        trendUp: true,
      },
      {
        title: 'Achievements',
        value: stats.collectionCounts.achievements || 0,
        icon: <TrophyIcon />,
        color: '#ef4444',
        trend: '+3',
        trendUp: true,
      },
      {
        title: 'Mentorship Hours',
        value: stats.collectionCounts.active_mentorships || 0,
        icon: <SchoolIcon />,
        color: '#06b6d4',
        trend: '+15%',
        trendUp: true,
      },
    ],
    [stats]
  );

  const speedDialActions = [
    { icon: <AddIcon />, name: 'Create Post', onClick: () => setPostDialogOpen(true) },
    { icon: <DonationIcon />, name: 'Donate', onClick: () => setDonationDialogOpen(true) },
    { icon: <EventIcon />, name: 'Create Event', onClick: () => { } },
    { icon: <GroupsIcon />, name: 'Find Connections', onClick: () => setActiveTab(1) },
  ];

  // ==================== MAIN RENDER ====================

  if (loading && posts.length === 0) {
    return (
      <PageContainer title="Alumni Dashboard" subtitle="Loading your dashboard...">
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}
        >
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Welcome back, ${user?.displayName || 'Alumni'}!`}
      subtitle="Connect, share, and make an impact in the alumni community"
      actions={[
        {
          label: 'Search',
          onClick: () => setShowSearch(!showSearch),
          variant: 'outlined',
          icon: <SearchIcon />,
        },
        {
          label: 'Refresh',
          onClick: () => {
            loadFeed(true);
            loadDashboardData();
          },
          variant: 'outlined',
          icon: <RefreshIcon />,
        },
        {
          label: 'Donate',
          onClick: () => setDonationDialogOpen(true),
          variant: 'contained',
          icon: <DonationIcon />,
        },
      ]}
      breadcrumbs={[
        { label: 'Alumni', path: '/alumni' },
        { label: 'Dashboard', path: '/alumni/dashboard' },
      ]}
    >
      {/* Search Bar */}
      <Collapse in={showSearch}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search posts, events, connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Paper>
      </Collapse>

      {/* Stats Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <StyledCard>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="caption">
                        {card.title}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {card.value}
                      </Typography>
                      {card.trend && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <TrendingUpIcon
                            sx={{
                              fontSize: 12,
                              color: card.trendUp ? 'success.main' : 'error.main',
                              mr: 0.5,
                            }}
                          />
                          <Typography
                            variant="caption"
                            color={card.trendUp ? 'success.main' : 'error.main'}
                          >
                            {card.trend}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Avatar sx={{ bgcolor: alpha(card.color, 0.1), color: card.color }}>
                      {card.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Engagement Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: `linear-gradient(135deg, ${getEngagementColor(stats.engagementScore)}20, ${getEngagementColor(stats.engagementScore)}05)`,
            borderLeft: `4px solid ${getEngagementColor(stats.engagementScore)}`,
          }}
        >
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Your Engagement Score
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Based on your activity, connections, donations, and event participation
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Chip
                  label={getEngagementLabel(stats.engagementScore)}
                  sx={{ bgcolor: getEngagementColor(stats.engagementScore), color: 'white' }}
                />
                <Typography variant="caption">
                  Top {Math.floor(Math.random() * 20) + 1}% of alumni
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={stats.engagementScore}
                  size={100}
                  thickness={6}
                  sx={{ color: getEngagementColor(stats.engagementScore) }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" component="div" color="textPrimary">
                    {stats.engagementScore}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Main Content Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => {
            setActiveTab(v);
            if (v === 0) loadFeed(true);
          }}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<TimelineIcon />} label="Feed" />
          <Tab icon={<GroupsIcon />} label="Network" />
          <Tab icon={<DonationIcon />} label="Impact" />
          <Tab icon={<EventIcon />} label="Events" />
          <Tab icon={<PsychologyIcon />} label="Insights" />
          <Tab icon={<TrophyIcon />} label="Achievements" />
          <Tab icon={<LeaderboardIcon />} label="Leaderboard" />
        </Tabs>

        {/* ==================== FEED TAB ==================== */}
        {activeTab === 0 && (
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Feed Filters */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <ToggleButtonGroup
                value={feedFilter}
                exclusive
                onChange={(e, v) => v && setFeedFilter(v)}
                size="small"
              >
                <ToggleButton value="all">All Posts</ToggleButton>
                <ToggleButton value="connections">Connections</ToggleButton>
                <ToggleButton value="trending">Trending</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                value={feedSort}
                exclusive
                onChange={(e, v) => v && setFeedSort(v)}
                size="small"
              >
                <ToggleButton value="latest">Latest</ToggleButton>
                <ToggleButton value="popular">Most Liked</ToggleButton>
                <ToggleButton value="discussed">Most Discussed</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Create Post Button (Mobile) */}
            {isMobile && (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setPostDialogOpen(true)}
                sx={{ mb: 3 }}
              >
                Create Post
              </Button>
            )}

            {/* Create Post Component (Desktop) */}
            {!isMobile && <CreatePost onPostCreated={() => loadFeed(true)} />}

            {/* Feed Posts */}
            <AnimatePresence>
              {posts.map((post, index) => (
                <Post
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                  onSave={handleSave}
                  onDelete={handleDeletePost}
                  onReport={handleReportPost}
                  currentUserId={user?.uid}
                />
              ))}
            </AnimatePresence>

            {/* Loading More Indicator */}
            {loadingMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={40} />
              </Box>
            )}

            {/* End of Feed */}
            <div ref={feedEndRef} />

            {!hasMore && posts.length > 0 && (
              <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ py: 4 }}>
                You've seen all posts! 🎉
              </Typography>
            )}

            {posts.length === 0 && !loading && (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <AutoAwesomeIcon sx={{ fontSize: 64, color: 'textSecondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No posts yet
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Be the first to share something with the alumni community!
                </Typography>
                <Button variant="contained" onClick={() => setPostDialogOpen(true)}>
                  Create Your First Post
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {/* ==================== NETWORK TAB ==================== */}
        {activeTab === 1 && (
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
              {/* Left Column - Suggested Connections */}
              <Grid item xs={12} lg={8}>
                <Typography variant="h6" gutterBottom>
                  🤝 Suggested Connections
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Based on your profile, interests, and mutual connections
                </Typography>
                <Grid container spacing={2}>
                  {networkSuggestions?.slice(0, 6).map((suggestion) => (
                    <Grid item xs={12} sm={6} key={suggestion.id}>
                      <ConnectionSuggestionCard
                        suggestion={suggestion}
                        onConnect={(s) => {
                          setSelectedSuggestion(s);
                          setConnectionDialogOpen(true);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Right Column - Trending Topics & Announcements */}
              <Grid item xs={12} lg={4}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🔥 Trending Topics
                    </Typography>
                    {stats.trendingTopics?.slice(0, 5).map((topic, idx) => (
                      <TrendingTopic key={idx} topic={topic} />
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📢 Announcements
                    </Typography>
                    {announcements?.slice(0, 3).map((announcement) => (
                      <Paper key={announcement.id} sx={{ p: 2, mb: 2, bgcolor: '#fef3c7' }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {announcement.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(announcement.createdAt)}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {announcement.content}
                        </Typography>
                      </Paper>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ==================== IMPACT TAB ==================== */}
        {activeTab === 2 && (
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
              {/* Impact Summary */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📊 Your Impact Summary
                    </Typography>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h2" fontWeight="bold" color="primary">
                        {formatCurrency(stats.collectionCounts.total_donated || 0)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Lifetime Giving
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          ((stats.collectionCounts.total_donated || 0) / 10000) * 100,
                          100
                        )}
                        sx={{ mt: 2, height: 8, borderRadius: 4 }}
                      />
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ mt: 1, display: 'block' }}
                      >
                        Next milestone: $10,000
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#eff6ff' }}>
                          <Typography variant="h4" fontWeight="bold">
                            {Math.floor((stats.collectionCounts.total_donated || 0) / 100)}
                          </Typography>
                          <Typography variant="caption">Students Supported</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f0fdf4' }}>
                          <Typography variant="h4" fontWeight="bold">
                            {Math.floor((stats.collectionCounts.total_donated || 0) / 500)}
                          </Typography>
                          <Typography variant="caption">Scholarships</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fef3c7' }}>
                          <Typography variant="h4" fontWeight="bold">
                            {Math.floor((stats.collectionCounts.total_donated || 0) / 25)}
                          </Typography>
                          <Typography variant="caption">Books Purchased</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e8ff' }}>
                          <Typography variant="h4" fontWeight="bold">
                            {Math.floor((stats.collectionCounts.total_donated || 0) / 10)}
                          </Typography>
                          <Typography variant="caption">Meals Provided</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Impact Highlights */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🏆 Impact Highlights
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <SchoolIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Mentorship Impact"
                          secondary={`${stats.collectionCounts.active_mentorships || 0} students mentored`}
                        />
                        <Chip label="Active" color="success" size="small" />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <DonationIcon color="secondary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Financial Contribution"
                          secondary={`${stats.collectionCounts.donation_count || 0} donations made`}
                        />
                        <Chip label="Top 15%" color="warning" size="small" />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <EventIcon color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Community Engagement"
                          secondary={`${stats.collectionCounts.events_attended || 0} events attended`}
                        />
                        <Chip label="Active" color="success" size="small" />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemIcon>
                          <ArticleIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Content Contribution"
                          secondary={`${stats.collectionCounts.posts_count || 0} posts shared`}
                        />
                        <Chip label="Influencer" color="primary" size="small" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recognition Journey */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🌟 Your Recognition Journey
                    </Typography>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                      {[
                        {
                          level: 'Friend',
                          amount: 100,
                          achieved: stats.collectionCounts.total_donated >= 100,
                        },
                        {
                          level: 'Supporter',
                          amount: 500,
                          achieved: stats.collectionCounts.total_donated >= 500,
                        },
                        {
                          level: 'Bronze',
                          amount: 1000,
                          achieved: stats.collectionCounts.total_donated >= 1000,
                        },
                        {
                          level: 'Silver',
                          amount: 5000,
                          achieved: stats.collectionCounts.total_donated >= 5000,
                        },
                        {
                          level: 'Gold',
                          amount: 10000,
                          achieved: stats.collectionCounts.total_donated >= 10000,
                        },
                        {
                          level: 'Platinum',
                          amount: 25000,
                          achieved: stats.collectionCounts.total_donated >= 25000,
                        },
                      ].map((tier, idx) => (
                        <Grid item xs={6} sm={4} md={2} key={idx}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Avatar
                              sx={{
                                width: 64,
                                height: 64,
                                margin: '0 auto',
                                bgcolor: tier.achieved ? 'gold' : 'grey.300',
                                background: tier.achieved
                                  ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                                  : 'none',
                                mb: 1,
                              }}
                            >
                              {tier.achieved ? <CheckCircleIcon /> : <MilitaryTechIcon />}
                            </Avatar>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {tier.level}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ${tier.amount.toLocaleString()}
                            </Typography>
                            {tier.achieved && (
                              <Chip
                                label="Achieved"
                                size="small"
                                color="success"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ==================== EVENTS TAB ==================== */}
        {activeTab === 3 && (
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
              {upcomingEvents?.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <EventCard
                    event={event}
                    onRegister={handleEventRegistration}
                    isRegistered={event.isRegistered}
                  />
                </Grid>
              ))}
              {(!upcomingEvents || upcomingEvents.length === 0) && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <EventIcon sx={{ fontSize: 64, color: 'textSecondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No upcoming events
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Check back soon for alumni events and gatherings!
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* ==================== INSIGHTS TAB ==================== */}
        {activeTab === 4 && (
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={3}>
              {/* AI Insights */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  🤖 AI-Powered Insights
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Personalized recommendations based on your activity and community trends
                </Typography>
              </Grid>

              {insights?.map((insight, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                  >
                    <Card
                      sx={{
                        bgcolor: insight.priority === 'high' ? '#fef3c7' : '#eff6ff',
                        height: '100%',
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {insight.type === 'opportunity' && (
                            <RocketLaunchIcon sx={{ mr: 1, color: '#f59e0b' }} />
                          )}
                          {insight.type === 'achievement' && (
                            <TrophyIcon sx={{ mr: 1, color: '#10b981' }} />
                          )}
                          {insight.type === 'suggestion' && (
                            <LightbulbIcon sx={{ mr: 1, color: '#3b82f6' }} />
                          )}
                          <Typography variant="subtitle1" fontWeight="bold">
                            {insight.title}
                          </Typography>
                          <Chip
                            label={insight.priority}
                            size="small"
                            sx={{
                              ml: 1,
                              bgcolor: insight.priority === 'high' ? '#ef4444' : '#f59e0b',
                              color: 'white',
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {insight.description}
                        </Typography>
                        {insight.recommendation && (
                          <Alert severity="info" icon={<LightbulbIcon />} sx={{ mt: 2 }}>
                            {insight.recommendation}
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}

              {/* Polls */}
              {polls.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    📊 Community Polls
                  </Typography>
                  {polls.map((poll) => (
                    <Poll key={poll.id} poll={poll} onVote={handlePollVote} />
                  ))}
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* ==================== ACHIEVEMENTS TAB ==================== */}
        {activeTab === 5 && (
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              🏅 Your Achievements
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
              Milestones you've unlocked on your alumni journey
            </Typography>

            <Grid container spacing={3}>
              {achievements?.map((achievement) => (
                <Grid item xs={6} sm={4} md={3} key={achievement.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: achievement.unlocked ? 'success.lighter' : 'grey.50',
                      }}
                    >
                      <AchievementBadge achievement={achievement} size="large" />
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 1 }}>
                        {achievement.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {achievement.unlocked
                          ? `Unlocked ${formatDate(achievement.unlockedAt)}`
                          : achievement.requirement}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* ==================== LEADERBOARD TAB ==================== */}
        {activeTab === 6 && (
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>
              📊 Alumni Leaderboard
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
              Top contributors in the alumni community
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell align="center">Rank</TableCell>
                    <TableCell>Alumni</TableCell>
                    <TableCell align="center">Impact Score</TableCell>
                    <TableCell align="center">Donations</TableCell>
                    <TableCell align="center">Connections</TableCell>
                    <TableCell align="center">Posts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaderboard?.map((member, idx) => (
                    <TableRow key={member.id} hover>
                      <TableCell align="center">
                        {idx === 0 && <EmojiEventsIcon sx={{ color: 'gold' }} />}
                        {idx === 1 && <EmojiEventsIcon sx={{ color: 'silver' }} />}
                        {idx === 2 && <EmojiEventsIcon sx={{ color: '#cd7f32' }} />}
                        {idx > 2 && `#${idx + 1}`}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={member.photoURL}>{member.name?.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {member.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {member.title}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={`${member.impactScore}%`} color="primary" size="small" />
                      </TableCell>
                      <TableCell align="center">
                        {formatCurrency(member.totalDonated || 0)}
                      </TableCell>
                      <TableCell align="center">{member.connectionsCount || 0}</TableCell>
                      <TableCell align="center">{member.postsCount || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* ==================== DIALOGS ==================== */}

      {/* Create Post Dialog */}
      <Dialog
        open={postDialogOpen}
        onClose={() => setPostDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Create a Post</Typography>
            <IconButton onClick={() => setPostDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Privacy Selector */}
            <FormControl size="small" sx={{ mb: 2, minWidth: 120 }}>
              <Select
                value={postPrivacy}
                onChange={(e) => setPostPrivacy(e.target.value)}
                startAdornment={
                  postPrivacy === 'public' ? (
                    <PublicIcon sx={{ mr: 1 }} />
                  ) : postPrivacy === 'connections' ? (
                    <GroupIcon sx={{ mr: 1 }} />
                  ) : (
                    <LockIcon sx={{ mr: 1 }} />
                  )
                }
              >
                <MenuItem value="public">🌍 Public</MenuItem>
                <MenuItem value="connections">👥 Connections only</MenuItem>
                <MenuItem value="only-me">🔒 Only me</MenuItem>
              </Select>
            </FormControl>

            {/* Content Input */}
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Share your thoughts, achievements, or opportunities..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* Media Preview */}
            {selectedMedia.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {selectedMedia.map((file, idx) => (
                  <Box key={idx} sx={{ position: 'relative' }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${idx}`}
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white' }}
                      onClick={() => removeMedia(idx)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {/* Location Input */}
            <TextField
              fullWidth
              size="small"
              placeholder="Add location (optional)"
              value={postLocation}
              onChange={(e) => setPostLocation(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Tags Input */}
            <TextField
              fullWidth
              size="small"
              placeholder="Add tags (comma separated)"
              value={postTags.join(', ')}
              onChange={(e) =>
                setPostTags(
                  e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t)
                )
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TagIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setPostDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePost}
            disabled={(!postContent.trim() && selectedMedia.length === 0) || isPosting}
          >
            {isPosting ? <CircularProgress size={24} /> : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Donation Dialog */}
      <Dialog
        open={donationDialogOpen}
        onClose={() => setDonationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DonationIcon color="primary" />
            <Typography variant="h6">Make a Donation</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Your generosity helps support students and programs at Career Connect Lesotho.
            </Typography>

            <TextField
              fullWidth
              label="Donation Amount"
              type="number"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              placeholder="Enter amount"
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Campaign</InputLabel>
              <Select
                value={donationCampaign}
                onChange={(e) => setDonationCampaign(e.target.value)}
                label="Campaign"
              >
                <MenuItem value="general">🎓 General Scholarship Fund</MenuItem>
                <MenuItem value="mentorship">🤝 Mentorship Program</MenuItem>
                <MenuItem value="infrastructure">🏗️ Infrastructure Development</MenuItem>
                <MenuItem value="innovation">💡 Innovation Lab</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Message (Optional)"
              multiline
              rows={3}
              value={donationMessage}
              onChange={(e) => setDonationMessage(e.target.value)}
              placeholder="Leave a message with your donation..."
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={donationIsAnonymous}
                  onChange={(e) => setDonationIsAnonymous(e.target.checked)}
                />
              }
              label="Make this donation anonymous"
              sx={{ mr: 2 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={donationIsRecurring}
                  onChange={(e) => setDonationIsRecurring(e.target.checked)}
                />
              }
              label="Make this a recurring donation"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDonationDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDonationSubmit}
            variant="contained"
            disabled={donationProcessing || !donationAmount}
            startIcon={donationProcessing ? <CircularProgress size={20} /> : <DonationIcon />}
          >
            {donationProcessing ? 'Processing...' : 'Complete Donation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Post Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a message (optional)..."
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleShareSubmit} variant="contained">
            Share
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Post Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report Post</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Please select a reason for reporting this post:
          </Typography>
          <RadioGroup value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
            <FormControlLabel value="spam" control={<Radio />} label="Spam or misleading" />
            <FormControlLabel
              value="harassment"
              control={<Radio />}
              label="Harassment or bullying"
            />
            <FormControlLabel value="hate" control={<Radio />} label="Hate speech" />
            <FormControlLabel
              value="inappropriate"
              control={<Radio />}
              label="Inappropriate content"
            />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReportSubmit} variant="contained" color="error">
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Connection Request Dialog */}
      <Dialog open={connectionDialogOpen} onClose={() => setConnectionDialogOpen(false)}>
        <DialogTitle>Send Connection Request</DialogTitle>
        <DialogContent>
          <Typography>Would you like to connect with {selectedSuggestion?.name}?</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            They work as {selectedSuggestion?.position} at {selectedSuggestion?.company}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            You have {selectedSuggestion?.mutualConnections || 0} mutual connections.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConnectRequest}
            variant="contained"
            disabled={connectionProcessing}
          >
            {connectionProcessing ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Speed Dial for Mobile */}
      {isMobile && (
        <SpeedDial
          ariaLabel="SpeedDial"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          open={speedDialOpen}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.onClick();
                setSpeedDialOpen(false);
              }}
            />
          ))}
        </SpeedDial>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default AlumniDashboard;
