/* eslint-disable no-unused-vars */
import { Badge as MuiBadge, Avatar, Box, alpha, styled, useTheme } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

const StyledBadge = styled(MuiBadge)(({ theme, status, variant, color }) => {
  const getColor = () => {
    if (color) return color;
    switch (status) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      case 'online':
        return '#44b700';
      case 'offline':
        return theme.palette.grey[400];
      case 'away':
        return theme.palette.warning.main;
      case 'busy':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const badgeColor = getColor();

  return {
    '& .MuiBadge-badge': {
      ...(variant === 'dot' && {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: badgeColor,
        color: badgeColor,
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      }),
      ...(variant === 'standard' && {
        backgroundColor: badgeColor,
        color: theme.palette.getContrastText(badgeColor),
        fontWeight: 600,
        fontSize: '0.75rem',
      }),
      ...(status === 'online' && {
        '&::after': {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          animation: 'ripple 1.2s infinite ease-in-out',
          border: '1px solid currentColor',
          content: '""',
        },
      }),
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  };
});

const Badge = ({
  // Core props
  children,
  content,
  status,

  // Variants
  variant = 'standard', // 'standard' | 'dot' | 'icon'

  // Position
  anchorOrigin = {
    vertical: 'top',
    horizontal: 'right',
  },

  // Color
  color,

  // Size
  size = 'medium', // 'small' | 'medium' | 'large'

  // Features
  overlap = 'rectangular',
  showZero = false,
  max = 99,

  // Icons
  icon,

  // Status indicators
  pulse = false,

  ...props
}) => {
  const theme = useTheme();

  const getBadgeContent = () => {
    if (variant === 'icon') {
      switch (status) {
        case 'verified':
          return <VerifiedIcon fontSize="small" />;
        case 'premium':
          return <StarIcon fontSize="small" />;
        case 'business':
          return <BusinessIcon fontSize="small" />;
        default:
          return icon;
      }
    }

    if (typeof content === 'number' && content > max) {
      return `${max}+`;
    }

    return content;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          '& .MuiBadge-badge': {
            minWidth: 16,
            height: 16,
            fontSize: '0.625rem',
          },
        };
      case 'large':
        return {
          '& .MuiBadge-badge': {
            minWidth: 24,
            height: 24,
            fontSize: '0.875rem',
          },
        };
      default:
        return {};
    }
  };

  if (variant === 'icon') {
    return (
      <StyledBadge
        badgeContent={getBadgeContent()}
        anchorOrigin={anchorOrigin}
        overlap={overlap}
        status={status}
        variant="standard"
        color={color}
        sx={getSizeStyles()}
        {...props}
      >
        {children}
      </StyledBadge>
    );
  }

  return (
    <StyledBadge
      badgeContent={getBadgeContent()}
      anchorOrigin={anchorOrigin}
      variant={variant}
      overlap={overlap}
      max={max}
      showZero={showZero}
      status={status}
      color={color}
      sx={{
        ...getSizeStyles(),
        ...(pulse && {
          '& .MuiBadge-badge': {
            animation: 'pulse 2s infinite',
          },
        }),
      }}
      {...props}
    >
      {children}
    </StyledBadge>
  );
};

// Pre-configured badges
export const OnlineBadge = ({ children, ...props }) => (
  <Badge variant="dot" status="online" overlap="circular" {...props}>
    {children}
  </Badge>
);

export const OfflineBadge = ({ children, ...props }) => (
  <Badge variant="dot" status="offline" overlap="circular" {...props}>
    {children}
  </Badge>
);

export const NotificationBadge = ({ count, children, ...props }) => (
  <Badge badgeContent={count} color="error" variant="standard" {...props}>
    {children}
  </Badge>
);

export const VerifiedBadge = ({ children, ...props }) => (
  <Badge
    variant="icon"
    status="verified"
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    {...props}
  >
    {children}
  </Badge>
);

export default Badge;
