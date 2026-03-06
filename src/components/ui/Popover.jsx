import React, { useState, useRef } from 'react';
import {
  Popover as MuiPopover,
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  alpha,
  styled,
  useTheme,
  ClickAwayListener,
  Grow,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';

const StyledPopover = styled(MuiPopover)(({ theme }) => ({
  '& .MuiPopover-paper': {
    borderRadius: theme.spacing(1.5),
    boxShadow: theme.shadows[8],
    overflow: 'hidden',
    minWidth: 200,
    maxWidth: 400,
  },
}));

const PopoverHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
}));

const PopoverContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const PopoverFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
}));

const Popover = ({
  // Core props
  children,
  trigger,

  // Variants
  variant = 'click', // 'click' | 'hover' | 'context'

  // Position
  anchorOrigin = {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin = {
    vertical: 'top',
    horizontal: 'left',
  },

  // Header & Footer
  title,
  actions = [],

  // State
  open: controlledOpen,
  onClose: controlledOnClose,

  // Behavior
  closeOnClickAway = true,
  closeOnEscape = true,

  // Styling
  width,
  maxHeight,

  // Customization
  showCloseButton = true,

  // Events
  onOpen,

  ...props
}) => {
  const theme = useTheme();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const triggerRef = useRef(null);
  const hoverTimeout = useRef();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpen = (event) => {
    if (isControlled) {
      onOpen?.(event);
    } else {
      setAnchorEl(event.currentTarget);
      setUncontrolledOpen(true);
      onOpen?.(event);
    }
  };

  const handleClose = (event, reason) => {
    if (isControlled) {
      controlledOnClose?.(event, reason);
    } else {
      setUncontrolledOpen(false);
      setAnchorEl(null);
    }
  };

  const handleClick = (event) => {
    if (variant === 'click') {
      handleOpen(event);
    }
  };

  const handleContextMenu = (event) => {
    if (variant === 'context') {
      event.preventDefault();
      handleOpen(event);
    }
  };

  const handleMouseEnter = (event) => {
    if (variant === 'hover') {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = setTimeout(() => {
        handleOpen(event);
      }, 200);
    }
  };

  const handleMouseLeave = () => {
    if (variant === 'hover') {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = setTimeout(() => {
        handleClose({}, 'mouseLeave');
      }, 100);
    }
  };

  const renderTrigger = () => {
    if (typeof trigger === 'function') {
      return trigger({ open, onOpen: handleOpen });
    }

    const triggerProps = {
      ref: triggerRef,
      onClick: handleClick,
      onContextMenu: handleContextMenu,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      style: { cursor: variant === 'click' ? 'pointer' : 'default' },
    };

    return React.cloneElement(trigger, triggerProps);
  };

  return (
    <>
      {renderTrigger()}

      <StyledPopover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        TransitionComponent={Grow}
        TransitionProps={{ timeout: 300 }}
        disableEscapeKeyDown={!closeOnEscape}
        PaperProps={{
          sx: {
            width,
            maxHeight,
          },
        }}
        {...props}
      >
        <ClickAwayListener
          onClickAway={(event) => {
            if (closeOnClickAway) {
              handleClose(event, 'clickAway');
            }
          }}
        >
          <Paper elevation={0}>
            {/* Header */}
            {title && (
              <PopoverHeader>
                <Typography variant="subtitle2" fontWeight={600}>
                  {title}
                </Typography>
                {showCloseButton && (
                  <IconButton size="small" onClick={handleClose}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </PopoverHeader>
            )}

            {/* Content */}
            <PopoverContent>{children}</PopoverContent>

            {/* Footer Actions */}
            {actions.length > 0 && (
              <PopoverFooter>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    size="small"
                    variant={action.variant || 'text'}
                    color={action.color || 'primary'}
                    onClick={() => {
                      action.onClick?.();
                      if (action.closeOnClick !== false) {
                        handleClose({}, 'action');
                      }
                    }}
                    startIcon={action.icon}
                  >
                    {action.label}
                  </Button>
                ))}
              </PopoverFooter>
            )}
          </Paper>
        </ClickAwayListener>
      </StyledPopover>
    </>
  );
};

// Pre-configured popovers
export const MenuPopover = ({ options, children, ...props }) => {
  return (
    <Popover trigger={children} width={200} {...props}>
      <Box sx={{ py: 1 }}>
        {options.map((option, index) => (
          <Button
            key={index}
            fullWidth
            variant="text"
            color={option.color || 'inherit'}
            onClick={option.onClick}
            startIcon={option.icon}
            sx={{
              justifyContent: 'flex-start',
              px: 2,
              py: 1,
              borderRadius: 0,
              textTransform: 'none',
            }}
          >
            {option.label}
          </Button>
        ))}
      </Box>
    </Popover>
  );
};

export const ActionsPopover = ({ onEdit, onDelete, children, ...props }) => {
  return (
    <Popover
      trigger={
        children || (
          <IconButton size="small">
            <MoreIcon />
          </IconButton>
        )
      }
      width={150}
      {...props}
    >
      <Box sx={{ py: 1 }}>
        <Button
          fullWidth
          startIcon={<EditIcon />}
          onClick={onEdit}
          sx={{ justifyContent: 'flex-start', px: 2, py: 1 }}
        >
          Edit
        </Button>
        <Button
          fullWidth
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          color="error"
          sx={{ justifyContent: 'flex-start', px: 2, py: 1 }}
        >
          Delete
        </Button>
      </Box>
    </Popover>
  );
};

export default Popover;
