/* eslint-disable no-unused-vars */
import {
  Card as MuiCard,
  CardHeader,
  CardContent,
  CardActions,
  CardMedia,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  alpha,
  styled,
  Skeleton,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const StyledCard = styled(MuiCard)(({ theme, clickable, selected }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  transition: theme.transitions.create(['box-shadow', 'transform']),
  ...(clickable && {
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  }),
  ...(selected && {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  }),
}));

const StyledCardMedia = styled(CardMedia)({
  paddingTop: '56.25%', // 16:9 aspect ratio
  position: 'relative',
  '&:hover .media-overlay': {
    opacity: 1,
  },
});

const MediaOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s',
  color: 'white',
});

const Card = ({
  // Core props
  children,
  title,
  subtitle,
  avatar,
  image,
  imageProps,
  mediaHeight = 200,

  // Actions
  actions = [],
  headerActions,
  onAction,

  // States
  loading = false,
  clickable = false,
  selected = false,
  onClick,

  // Features
  elevation = 1,
  variant = 'elevation', // 'elevation' | 'outlined'
  square = false,

  // Action buttons
  favorited = false,
  bookmarked = false,
  onFavorite,
  onBookmark,
  onShare,
  onEdit,
  onDelete,

  // Chips/Tags
  chips = [],

  // Footer
  footer,

  // Styling
  headerDivider = false,
  contentPadding = true,
  className,
  ...props
}) => {
  const renderMedia = () => {
    if (loading) {
      return <Skeleton variant="rectangular" height={mediaHeight} animation="wave" />;
    }

    if (!image) return null;

    if (typeof image === 'string') {
      return (
        <StyledCardMedia
          image={image}
          title={title}
          sx={{ height: mediaHeight, paddingTop: 0 }}
          {...imageProps}
        >
          {imageProps?.overlay && (
            <MediaOverlay className="media-overlay">{imageProps.overlay}</MediaOverlay>
          )}
        </StyledCardMedia>
      );
    }

    return image;
  };

  const renderAvatar = () => {
    if (loading) {
      return <Skeleton variant="circular" width={40} height={40} />;
    }

    if (avatar) {
      if (typeof avatar === 'string') {
        return <Avatar src={avatar} alt={title} />;
      }
      return avatar;
    }

    return null;
  };

  const renderHeader = () => {
    if (loading) {
      return (
        <CardHeader
          avatar={<Skeleton variant="circular" width={40} height={40} />}
          title={<Skeleton width="60%" />}
          subheader={<Skeleton width="40%" />}
        />
      );
    }

    return (
      <CardHeader
        avatar={renderAvatar()}
        title={title}
        subheader={subtitle}
        action={
          headerActions || (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton size="small">
                <MoreIcon fontSize="small" />
              </IconButton>
            </Box>
          )
        }
      />
    );
  };

  const renderChips = () => {
    if (!chips.length) return null;

    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {chips.map((chip, index) => (
          <Chip
            key={index}
            label={chip.label}
            size="small"
            color={chip.color}
            variant={chip.variant || 'outlined'}
            icon={chip.icon}
            onClick={chip.onClick}
            onDelete={chip.onDelete}
          />
        ))}
      </Box>
    );
  };

  const renderActions = () => {
    const defaultActions = [];

    if (onFavorite) {
      defaultActions.push(
        <IconButton
          key="favorite"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
          color={favorited ? 'error' : 'default'}
        >
          {favorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      );
    }

    if (onBookmark) {
      defaultActions.push(
        <IconButton
          key="bookmark"
          onClick={(e) => {
            e.stopPropagation();
            onBookmark();
          }}
          color={bookmarked ? 'primary' : 'default'}
        >
          {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>
      );
    }

    if (onShare) {
      defaultActions.push(
        <IconButton
          key="share"
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
        >
          <ShareIcon />
        </IconButton>
      );
    }

    const allActions = [...defaultActions, ...actions];

    if (allActions.length === 0) return null;

    return (
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Box>{allActions}</Box>
        {footer}
      </CardActions>
    );
  };

  return (
    <StyledCard
      className={className}
      elevation={elevation}
      variant={variant}
      square={square}
      clickable={clickable ? 1 : 0}
      selected={selected ? 1 : 0}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {renderMedia()}
      {renderHeader()}
      {headerDivider && <Divider />}

      <CardContent sx={{ flex: 1, p: contentPadding ? 3 : 0 }}>
        {renderChips()}
        {children}
      </CardContent>

      {renderActions()}
    </StyledCard>
  );
};

// Specialized card types
export const ProductCard = (props) => (
  <Card
    {...props}
    actions={[
      <Button key="buy" size="small" color="primary">
        Buy Now
      </Button>,
      <Button key="details" size="small">
        Details
      </Button>,
    ]}
  />
);

export const ProfileCard = ({ name, role, location, ...props }) => (
  <Card {...props}>
    <Typography variant="h6">{name}</Typography>
    <Typography color="text.secondary" gutterBottom>
      {role}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {location}
    </Typography>
  </Card>
);

export const StatsCard = ({ title, value, icon, trend, ...props }) => (
  <Card {...props} contentPadding>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography color="text.secondary" variant="body2">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mt: 1 }}>
          {value}
        </Typography>
        {trend && (
          <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
            {trend > 0 ? '+' : ''}
            {trend}%
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: 'primary.light',
          color: 'primary.main',
        }}
      >
        {icon}
      </Box>
    </Box>
  </Card>
);

export default Card;
