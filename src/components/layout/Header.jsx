import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Badge,
  Tooltip,
  alpha,
  styled,
  useTheme,
  useMediaQuery,
  InputBase,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Help as HelpIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  AccountCircle as AccountCircleIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const StyledAppBar = styled(AppBar)(({ theme, transparent }) => ({
  backgroundColor: transparent ? 'transparent' : theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: transparent ? 'none' : theme.shadows[1],
  backdropFilter: transparent ? 'none' : 'blur(8px)',
  transition: theme.transitions.create(['background-color', 'box-shadow', 'backdrop-filter']),
  borderBottom: transparent ? 'none' : `1px solid ${theme.palette.divider}`,
}));

const SearchWrapper = styled(Box)(({ theme, focused }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.03),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.05),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  transition: theme.transitions.create(['background-color', 'box-shadow']),
  ...(focused && {
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    backgroundColor: alpha(theme.palette.common.black, 0.02),
  }),
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontSize: '0.75rem',
    minWidth: 18,
    height: 18,
  },
}));

const Header = ({
  // Core props
  title,
  logo,

  // Navigation
  onMenuClick,
  menuOpen = false,

  // User data
  user = null,
  userMenu = [],

  // Features
  showSearch = true,
  showNotifications = true,
  showSettings = true,
  showUserMenu = true,
  showThemeToggle = true,

  // Search
  onSearch,
  searchPlaceholder = 'Search...',

  // Notifications
  notifications = [],
  onNotificationClick,
  onNotificationsOpen,

  // Theme
  theme: themeMode = 'light',
  onThemeToggle,

  // Customization
  position = 'fixed',
  color = 'default',
  elevation = 1,
  transparent = false,

  // Events
  onLogout,
  onProfileClick,
  onSettingsClick,

  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
    onNotificationsOpen?.();
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchValue) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const handleLogout = async () => {
    handleMenuClose();
    onLogout?.();
  };

  const handleNavigation = (path) => {
    handleMenuClose();
    navigate(path);
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <StyledAppBar
      position={position}
      color={color}
      elevation={elevation}
      transparent={transparent ? 1 : 0}
      {...props}
    >
      <Toolbar>
        {/* Menu Toggle */}
        {onMenuClick && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            size="large"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {logo && <Box component="img" src={logo} alt="Logo" sx={{ height: 40, width: 'auto' }} />}
          <Typography
            variant="h6"
            component="div"
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontWeight: 600,
              color: theme.palette.primary.main,
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Search Bar */}
        {showSearch && !isMobile && (
          <SearchWrapper focused={searchFocused}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={searchPlaceholder}
              inputProps={{ 'aria-label': 'search' }}
              value={searchValue}
              onChange={handleSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyPress={handleSearchSubmit}
            />
          </SearchWrapper>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Mobile Search */}
          {showSearch && isMobile && (
            <IconButton color="inherit" size="large">
              <SearchIcon />
            </IconButton>
          )}

          {/* Theme Toggle */}
          {showThemeToggle && (
            <Tooltip title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton color="inherit" onClick={onThemeToggle} size="large">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={themeMode}
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                  </motion.div>
                </AnimatePresence>
              </IconButton>
            </Tooltip>
          )}

          {/* Notifications */}
          {showNotifications && (
            <>
              <Tooltip title="Notifications">
                <IconButton color="inherit" onClick={handleNotificationOpen} size="large">
                  <NotificationBadge badgeContent={unreadNotifications} color="error">
                    <NotificationsIcon />
                  </NotificationBadge>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={notificationAnchor}
                open={Boolean(notificationAnchor)}
                onClose={handleNotificationClose}
                PaperProps={{
                  sx: {
                    width: 360,
                    maxHeight: 480,
                    mt: 1.5,
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">Notifications</Typography>
                </Box>

                {notifications.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No notifications</Typography>
                  </Box>
                ) : (
                  <>
                    {notifications.slice(0, 5).map((notification, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => {
                          onNotificationClick?.(notification);
                          handleNotificationClose();
                        }}
                        sx={{
                          py: 2,
                          borderBottom: index < notifications.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                          bgcolor: notification.read
                            ? 'transparent'
                            : alpha(theme.palette.primary.main, 0.04),
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                            {notification.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.message}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}

                    {notifications.length > 5 && (
                      <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Button size="small" onClick={() => navigate('/notifications')}>
                          View All
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </Menu>
            </>
          )}

          {/* Settings */}
          {showSettings && (
            <Tooltip title="Settings">
              <IconButton color="inherit" onClick={() => navigate('/settings')} size="large">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* User Menu */}
          {showUserMenu && user && (
            <>
              <Tooltip title="Account">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="large"
                  edge="end"
                  aria-label="account"
                  aria-haspopup="true"
                  sx={{ ml: 1 }}
                >
                  {user.avatar ? (
                    <Avatar src={user.avatar} alt={user.name} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <AccountCircleIcon />
                  )}
                  {!isMobile && <ArrowDownIcon sx={{ ml: 0.5 }} />}
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2">{user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                  {user.role && (
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{ mt: 1 }}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
                <Divider />

                {userMenu.length > 0 ? (
                  userMenu.map((item, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => {
                        handleMenuClose();
                        item.onClick?.() || handleNavigation(item.path);
                      }}
                    >
                      {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                      <Typography variant="body2">{item.label}</Typography>
                    </MenuItem>
                  ))
                ) : (
                  <>
                    <MenuItem onClick={() => handleNavigation('/profile')}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography variant="body2">Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('/settings')}>
                      <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography variant="body2">Settings</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('/help')}>
                      <ListItemIcon>
                        <HelpIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography variant="body2">Help</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      <Typography variant="body2">Logout</Typography>
                    </MenuItem>
                  </>
                )}
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
