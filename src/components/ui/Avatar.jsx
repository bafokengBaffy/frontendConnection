/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { Avatar as MuiAvatar, Badge, alpha, styled, useTheme } from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Work as WorkIcon,
} from '@mui/icons-material';

const StyledAvatar = styled(MuiAvatar)(({ theme, size, status, clickable }) => ({
  ...(size === 'small' && {
    width: 32,
    height: 32,
    fontSize: '0.875rem',
  }),
  ...(size === 'medium' && {
    width: 40,
    height: 40,
    fontSize: '1rem',
  }),
  ...(size === 'large' && {
    width: 56,
    height: 56,
    fontSize: '1.25rem',
  }),
  ...(size === 'xlarge' && {
    width: 80,
    height: 80,
    fontSize: '2rem',
  }),
  ...(clickable && {
    cursor: 'pointer',
    transition: theme.transitions.create(['opacity', 'transform']),
    '&:hover': {
      opacity: 0.8,
      transform: 'scale(1.05)',
    },
  }),
  ...(status === 'online' && {
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.success.main}`,
  }),
  ...(status === 'offline' && {
    opacity: 0.7,
    filter: 'grayscale(100%)',
  }),
  ...(status === 'busy' && {
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.error.main}`,
  }),
}));

const Avatar = ({
  // Core props
  src,
  alt,
  name,

  // Size
  size = 'medium',

  // Variants
  variant = 'circular', // 'circular' | 'rounded' | 'square'

  // Status
  status,

  // Type (for default icons)
  type = 'user', // 'user' | 'company' | 'student' | 'employee'

  // Features
  bordered = false,
  clickable = false,
  onClick,

  // Badge
  badge,
  badgeColor = 'primary',
  badgePosition = 'bottom-right',

  // Colors
  bgColor,
  textColor,

  // Fallback
  fallback,

  ...props
}) => {
  const theme = useTheme();
  const [error, setError] = useState(false);

  const getInitials = () => {
    if (!name) return '';

    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'company':
        return <BusinessIcon />;
      case 'student':
        return <SchoolIcon />;
      case 'employee':
        return <WorkIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const handleError = () => {
    setError(true);
  };

  const getBadgePosition = () => {
    switch (badgePosition) {
      case 'top-right':
        return { vertical: 'top', horizontal: 'right' };
      case 'top-left':
        return { vertical: 'top', horizontal: 'left' };
      case 'bottom-right':
        return { vertical: 'bottom', horizontal: 'right' };
      case 'bottom-left':
        return { vertical: 'bottom', horizontal: 'left' };
      default:
        return { vertical: 'bottom', horizontal: 'right' };
    }
  };

  const avatar = (
    <StyledAvatar
      src={error ? null : src}
      alt={alt || name}
      variant={variant}
      size={size}
      status={status}
      clickable={clickable ? 1 : 0}
      onClick={onClick}
      sx={{
        ...(bgColor && {
          backgroundColor: bgColor,
        }),
        ...(textColor && {
          color: textColor,
        }),
        ...(bordered && {
          border: `2px solid ${theme.palette.divider}`,
        }),
      }}
      {...props}
    >
      {!src || error ? (name ? getInitials() : fallback || getDefaultIcon()) : null}
    </StyledAvatar>
  );

  if (badge) {
    return (
      <Badge
        overlap="circular"
        anchorOrigin={getBadgePosition()}
        badgeContent={badge}
        color={badgeColor}
      >
        {avatar}
      </Badge>
    );
  }

  return avatar;
};

// Avatar Group
export const AvatarGroup = ({ avatars = [], max = 4, size = 'medium', ...props }) => {
  const visibleAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        '& > *:not(:first-of-type)': {
          marginLeft: -1.5,
        },
      }}
    >
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          size={size}
          {...avatar}
          sx={{
            border: (theme) => `2px solid ${theme.palette.background.paper}`,
            ...avatar.sx,
          }}
        />
      ))}

      {remaining > 0 && (
        <Avatar
          size={size}
          sx={{
            bgcolor: (theme) => theme.palette.grey[300],
            border: (theme) => `2px solid ${theme.palette.background.paper}`,
          }}
        >
          +{remaining}
        </Avatar>
      )}
    </Box>
  );
};

// Status Avatar
export const StatusAvatar = ({ status, ...props }) => (
  <Avatar
    status={status}
    sx={{
      '&::after':
        status === 'online'
          ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              animation: 'ripple 1.2s infinite ease-in-out',
              border: '2px solid currentColor',
              boxSizing: 'border-box',
            }
          : {},
    }}
    {...props}
  />
);

export default Avatar;
