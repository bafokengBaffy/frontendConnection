/* eslint-disable no-unused-vars */
import { Skeleton as MuiSkeleton, Box, Paper, Stack, alpha, styled, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const StyledSkeleton = styled(MuiSkeleton)(({ theme, animation }) => ({
  transform: 'scale(1)',
  ...(animation === 'wave' && {
    '&::after': {
      background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.08)}, transparent)`,
    },
  }),
}));

const Skeleton = ({
  // Core props
  variant = 'text',
  width,
  height,

  // Animation
  animation = 'pulse',

  // Customization
  rounded = true,

  ...props
}) => {
  const theme = useTheme();

  const getBorderRadius = () => {
    if (!rounded) return 0;

    switch (variant) {
      case 'circular':
        return '50%';
      case 'rectangular':
        return theme.shape.borderRadius;
      default:
        return theme.shape.borderRadius;
    }
  };

  return (
    <StyledSkeleton
      variant={variant}
      width={width}
      height={height}
      animation={animation}
      sx={{
        borderRadius: getBorderRadius(),
        ...props.sx,
      }}
      {...props}
    />
  );
};

// Pre-configured skeletons
export const TextSkeleton = ({ lines = 3, ...props }) => {
  return (
    <Stack spacing={1}>
      {[...Array(lines)].map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '60%' : '100%'}
          {...props}
        />
      ))}
    </Stack>
  );
};

export const AvatarSkeleton = ({ size = 40, ...props }) => (
  <Skeleton variant="circular" width={size} height={size} {...props} />
);

export const CardSkeleton = ({ ...props }) => {
  return (
    <Paper sx={{ p: 2, width: '100%' }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AvatarSkeleton size={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={120} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </Box>
      </Stack>
    </Paper>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4, ...props }) => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {[...Array(columns)].map((_, index) => (
          <Skeleton
            key={`header-${index}`}
            variant="text"
            width={`${100 / columns}%`}
            height={40}
          />
        ))}
      </Box>

      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <Box key={`row-${rowIndex}`} sx={{ display: 'flex', gap: 2, mb: 1 }}>
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              width={`${100 / columns}%`}
              height={32}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export const ListSkeleton = ({ items = 5, ...props }) => {
  return (
    <Stack spacing={1}>
      {[...Array(items)].map((_, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        </Box>
      ))}
    </Stack>
  );
};

export const ProfileSkeleton = () => {
  return (
    <Box>
      {/* Cover Image */}
      <Skeleton variant="rectangular" height={200} />

      {/* Avatar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: -5, mb: 2 }}>
        <AvatarSkeleton size={100} />
      </Box>

      {/* Info */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Skeleton variant="text" width={200} height={32} sx={{ mx: 'auto' }} />
        <Skeleton variant="text" width={150} sx={{ mx: 'auto' }} />
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 3 }}>
        {[...Array(3)].map((_, index) => (
          <Box key={index} sx={{ textAlign: 'center' }}>
            <Skeleton variant="text" width={60} height={32} />
            <Skeleton variant="text" width={40} />
          </Box>
        ))}
      </Box>

      {/* Content */}
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={100} />
        <Skeleton variant="rectangular" height={100} />
      </Stack>
    </Box>
  );
};

export default Skeleton;
