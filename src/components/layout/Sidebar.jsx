import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Divider,
  Box,
  Typography,
  Avatar,
  alpha,
  styled,
  useTheme,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 280;
const collapsedDrawerWidth = 72;

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Logo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const NavItem = styled(ListItemButton)(({ theme, depth, active }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  paddingLeft: theme.spacing(2 + (depth || 0) * 2),
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  '& .MuiListItemIcon-root': {
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    minWidth: 40,
  },
}));

const Sidebar = ({
  // Core props
  open = true,
  onClose,
  onToggle,

  // Navigation items
  items = [],

  // User data
  user = null,

  // Logo and branding
  logo,
  title,

  // Variants
  variant = 'permanent', // 'permanent' | 'persistent' | 'temporary'
  position = 'left', // 'left' | 'right'

  // Features
  collapsible = true,
  showUserInfo = true,
  showFooter = true,

  // Customization
  width = drawerWidth,
  collapsedWidth = collapsedDrawerWidth,
  backgroundColor = 'background.paper',

  // Events
  onLogout,
  onItemClick,

  ...props
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  // Handle responsive behavior
  const isMobile = window.innerWidth < theme.breakpoints.values.sm;
  const drawerVariant = isMobile ? 'temporary' : variant;

  useEffect(() => {
    if (isMobile && open) {
      onClose?.();
    }
  }, [isMobile]);

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = (item) => {
    if (item.children) {
      setOpenMenus((prev) => ({
        ...prev,
        [item.id]: !prev[item.id],
      }));
    } else if (item.path) {
      navigate(item.path);
      onItemClick?.(item);
      if (isMobile) {
        onClose?.();
      }
    }
  };

  const isItemActive = (item) => {
    if (item.path === location.pathname) return true;
    if (item.children) {
      return item.children.some((child) => child.path === location.pathname);
    }
    return false;
  };

  const renderNavItem = (item, depth = 0) => {
    const active = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.id];

    return (
      <React.Fragment key={item.id}>
        <Tooltip
          title={collapsed ? item.label : ''}
          placement="right"
          arrow
          disableHoverListener={!collapsed}
        >
          <NavItem
            depth={depth}
            active={active ? 1 : 0}
            onClick={() => handleMenuClick(item)}
            sx={{
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 1 : 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40 }}>
              {item.badge ? (
                <Badge badgeContent={item.badge} color="error" variant="dot">
                  {item.icon || <DashboardIcon />}
                </Badge>
              ) : (
                item.icon || <DashboardIcon />
              )}
            </ListItemIcon>

            {!collapsed && (
              <>
                <ListItemText
                  primary={item.label}
                  secondary={item.secondary}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: active ? 600 : 400,
                      fontSize: '0.95rem',
                    },
                  }}
                />
                {hasChildren && (
                  <ListItemIcon sx={{ minWidth: 'auto' }}>
                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemIcon>
                )}
              </>
            )}
          </NavItem>
        </Tooltip>

        {hasChildren && !collapsed && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <>
      {/* Header */}
      <DrawerHeader>
        <Logo>
          {logo && (
            <Box component="img" src={logo} alt={title} sx={{ height: 32, width: 'auto' }} />
          )}
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Typography variant="h6" fontWeight={600} noWrap>
                  {title}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </Logo>

        {collapsible && (
          <IconButton onClick={handleToggleCollapse} size="small">
            {position === 'left' ? (
              collapsed ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )
            ) : collapsed ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        )}
      </DrawerHeader>

      {/* User Info */}
      {showUserInfo && user && !collapsed && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={user.avatar} alt={user.name} sx={{ width: 48, height: 48 }}>
              {user.name?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Items */}
      <List component="nav" sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        {items.map((item) => renderNavItem(item))}
      </List>

      {/* Footer */}
      {showFooter && (
        <Box sx={{ borderTop: 1, borderColor: 'divider', p: collapsed ? 1 : 2 }}>
          {collapsed ? (
            <Tooltip title="Settings" placement="right">
              <IconButton onClick={() => navigate('/settings')} sx={{ width: '100%' }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <List>
              <NavItem onClick={() => navigate('/settings')}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </NavItem>
              <NavItem onClick={onLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </NavItem>
            </List>
          )}
        </Box>
      )}
    </>
  );

  return (
    <Drawer
      variant={drawerVariant}
      open={open}
      onClose={onClose}
      sx={{
        width: collapsed ? collapsedDrawerWidth : width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? collapsedDrawerWidth : width,
          boxSizing: 'border-box',
          backgroundColor,
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
      PaperProps={{
        sx: {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.background.default,
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.divider,
            borderRadius: '3px',
          },
        },
      }}
      anchor={position}
      {...props}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
