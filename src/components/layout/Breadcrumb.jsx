/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  alpha,
  styled,
  useTheme,
} from '@mui/material';
import React from 'react';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  MoreHoriz as MoreHorizIcon,
  Folder as FolderIcon,
  Description as FileIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const StyledBreadcrumbs = styled(MuiBreadcrumbs)(({ theme }) => ({
  '& .MuiBreadcrumbs-separator': {
    margin: theme.spacing(0, 1),
  },
}));

const BreadcrumbLink = styled(Link)(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: active ? theme.palette.text.primary : theme.palette.text.secondary,
  fontWeight: active ? 600 : 400,
  textDecoration: 'none',
  cursor: 'pointer',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  transition: theme.transitions.create(['background-color', 'color']),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
}));

const BreadcrumbItem = styled(Box)(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: active ? theme.palette.text.primary : theme.palette.text.secondary,
  fontWeight: active ? 600 : 400,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
}));

const Breadcrumb = ({
  // Core props
  items = [],
  homePath = '/',

  // Features
  showHome = true,
  showIcons = true,
  maxItems = 5,
  itemsBeforeCollapse = 2,
  itemsAfterCollapse = 2,

  // Customization
  separator = <NavigateNextIcon fontSize="small" />,
  variant = 'default', // 'default' | 'outlined' | 'contained'

  // Events
  onItemClick,

  ...props
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Generate breadcrumbs from current path if items not provided
  const generateBreadcrumbs = () => {
    if (items.length > 0) return items;

    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    let currentPath = '';

    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      breadcrumbs.push({
        label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
        path: currentPath,
        icon:
          index === paths.length - 1 ? (
            <FileIcon fontSize="small" />
          ) : (
            <FolderIcon fontSize="small" />
          ),
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleClick = (path) => (e) => {
    e.preventDefault();
    navigate(path);
    onItemClick?.(path);
  };

  const handleEllipsisClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleEllipsisClose = () => {
    setAnchorEl(null);
  };

  const handleEllipsisItemClick = (path) => {
    navigate(path);
    handleEllipsisClose();
    onItemClick?.(path);
  };

  const getVariantStyles = (active) => {
    switch (variant) {
      case 'outlined':
        return {
          border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
          backgroundColor: 'transparent',
        };
      case 'contained':
        return {
          backgroundColor: active ? theme.palette.primary.main : theme.palette.background.paper,
          color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
          boxShadow: active ? theme.shadows[2] : 'none',
        };
      default:
        return {};
    }
  };

  const renderBreadcrumbItem = (item, index, isLast) => {
    const isActive = isLast || location.pathname === item.path;

    if (isLast) {
      return (
        <BreadcrumbItem
          key={item.path || index}
          active={isActive ? 1 : 0}
          sx={getVariantStyles(isActive)}
        >
          {showIcons && item.icon}
          <Typography variant="body2">{item.label}</Typography>
        </BreadcrumbItem>
      );
    }

    return (
      <BreadcrumbLink
        key={item.path || index}
        onClick={handleClick(item.path)}
        active={isActive ? 1 : 0}
        sx={getVariantStyles(isActive)}
      >
        {showIcons && item.icon}
        <Typography variant="body2">{item.label}</Typography>
      </BreadcrumbLink>
    );
  };

  const getVisibleBreadcrumbs = () => {
    if (breadcrumbs.length <= maxItems) {
      return breadcrumbs;
    }

    const visibleItems = [];
    const totalItems = breadcrumbs.length;

    // Add first items
    for (let i = 0; i < itemsBeforeCollapse; i++) {
      visibleItems.push(breadcrumbs[i]);
    }

    // Add ellipsis
    visibleItems.push({ ellipsis: true });

    // Add last items
    for (let i = totalItems - itemsAfterCollapse; i < totalItems; i++) {
      visibleItems.push(breadcrumbs[i]);
    }

    return visibleItems;
  };

  const visibleBreadcrumbs = getVisibleBreadcrumbs();

  return (
    <StyledBreadcrumbs separator={separator} aria-label="breadcrumb" {...props}>
      {/* Home Icon */}
      {showHome && (
        <BreadcrumbLink
          onClick={handleClick(homePath)}
          active={location.pathname === homePath ? 1 : 0}
        >
          <HomeIcon fontSize="small" />
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Home
          </Typography>
        </BreadcrumbLink>
      )}

      {/* Breadcrumb Items */}
      {visibleBreadcrumbs.map((item, index) => {
        if (item.ellipsis) {
          return (
            <React.Fragment key="ellipsis">
              <Tooltip title="More pages">
                <IconButton
                  size="small"
                  onClick={handleEllipsisClick}
                  sx={{
                    width: 24,
                    height: 24,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  }}
                >
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleEllipsisClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    maxHeight: 300,
                  },
                }}
              >
                {breadcrumbs
                  .slice(itemsBeforeCollapse, -itemsAfterCollapse)
                  .map((hiddenItem, hiddenIndex) => (
                    <MenuItem
                      key={hiddenIndex}
                      onClick={() => handleEllipsisItemClick(hiddenItem.path)}
                      sx={{
                        py: 1,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      {showIcons && hiddenItem.icon && (
                        <Box component="span" sx={{ mr: 1, display: 'flex' }}>
                          {hiddenItem.icon}
                        </Box>
                      )}
                      <Typography variant="body2">{hiddenItem.label}</Typography>
                    </MenuItem>
                  ))}
              </Menu>
            </React.Fragment>
          );
        }

        const isLast = index === visibleBreadcrumbs.length - 1;
        return renderBreadcrumbItem(item, index, isLast);
      })}
    </StyledBreadcrumbs>
  );
};

export default Breadcrumb;
