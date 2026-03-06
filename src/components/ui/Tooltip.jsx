import React from 'react';
import { Tooltip as MuiTooltip, Box, Typography, alpha, styled, useTheme } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';

const StyledTooltip = styled(({ className, ...props }) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme, customcolor }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: customcolor || theme.palette.grey[900],
    color: theme.palette.getContrastText(customcolor || theme.palette.grey[900]),
    fontSize: '0.875rem',
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[4],
    maxWidth: 300,
    ...(theme.palette.mode === 'dark' && {
      backgroundColor: customcolor || theme.palette.grey[700],
    }),
  },
  '& .MuiTooltip-arrow': {
    color: customcolor || theme.palette.grey[900],
    ...(theme.palette.mode === 'dark' && {
      color: customcolor || theme.palette.grey[700],
    }),
  },
}));

const Tooltip = ({
  // Core props
  title,
  children,

  // Variants
  variant = 'standard', // 'standard' | 'rich' | 'custom'

  // Position
  placement = 'top',
  arrow = true,

  // Behavior
  enterDelay = 100,
  leaveDelay = 0,
  enterNextDelay = 0,

  // Interactive
  interactive = false,

  // Styling
  color,
  maxWidth = 300,

  // Rich content
  content,
  image,
  actions,

  // Conditional
  disabled = false,

  ...props
}) => {
  const theme = useTheme();

  const renderTitle = () => {
    if (variant === 'rich' && content) {
      return (
        <Box sx={{ p: 1 }}>
          {image && (
            <Box
              component="img"
              src={image}
              alt=""
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 1,
                mb: 1,
              }}
            />
          )}
          <Typography variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="inherit" sx={{ opacity: 0.9 }}>
            {content}
          </Typography>
          {actions && <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>{actions}</Box>}
        </Box>
      );
    }

    return title;
  };

  if (disabled) {
    return children;
  }

  return (
    <StyledTooltip
      title={renderTitle()}
      placement={placement}
      arrow={arrow}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
      enterNextDelay={enterNextDelay}
      interactive={interactive}
      customcolor={color}
      PopperProps={{
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
            },
          },
        ],
      }}
      {...props}
    >
      <span>{children}</span>
    </StyledTooltip>
  );
};

// Helper component for info tooltips
export const InfoTooltip = ({ title, children, ...props }) => {
  return (
    <Tooltip title={title} {...props}>
      {children || <HelpIcon fontSize="small" sx={{ opacity: 0.6, cursor: 'help' }} />}
    </Tooltip>
  );
};

// Helper component for truncation tooltips
export const TruncateTooltip = ({ text, maxLength = 50, ...props }) => {
  const shouldTruncate = text && text.length > maxLength;

  return (
    <Tooltip title={shouldTruncate ? text : ''} {...props}>
      <span>{shouldTruncate ? `${text.substring(0, maxLength)}...` : text}</span>
    </Tooltip>
  );
};

export default Tooltip;
