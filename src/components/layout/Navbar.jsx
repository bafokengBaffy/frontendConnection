import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  alpha,
  styled,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
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

const NavButton = styled(Button)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  fontWeight: active ? 600 : 400,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: active ? '70%' : 0,
    height: 3,
    backgroundColor: theme.palette.primary.main,
    transition: theme.transitions.create('width'),
    borderRadius: theme.spacing(0.5),
  },
  '&:hover::after': {
    width: '70%',
  },
}));

const MobileMenu = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 300,
    backgroundColor: theme.palette.background.paper,
  },
}));

const Navbar = ({
  // Core props
  logo,
  title,
  items = [],

  // Actions
  actions = [],

  // User menu
  user = null,
  userMenu = [],

  // Features
  transparent = false,
  sticky = true,

  // Customization
  position = 'static',
  color = 'default',
  elevation = 1,

  // Events
  onLogoClick,
  onItemClick,

  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState({});
  const [openMenus, setOpenMenus] = useState({});

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl((prev) => ({
      ...prev,
      [item.id]: event.currentTarget,
    }));
  };

  const handleMenuClose = (itemId) => {
    setAnchorEl((prev) => ({
      ...prev,
      [itemId]: null,
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
    onItemClick?.(path);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const renderMenuItem = (item) => {
    if (item.children) {
      const isOpen = Boolean(anchorEl[item.id]);

      return (
        <Box key={item.id}>
          <NavButton
            onClick={(e) => handleMenuOpen(e, item)}
            endIcon={<ExpandMoreIcon />}
            active={isActive(item.path) ? 1 : 0}
          >
            {item.label}
          </NavButton>

          <Menu
            anchorEl={anchorEl[item.id]}
            open={isOpen}
            onClose={() => handleMenuClose(item.id)}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: theme.shadows[8],
              },
            }}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          >
            {item.children.map((child) => (
              <MenuItem
                key={child.id}
                onClick={() => {
                  handleNavigation(child.path);
                  handleMenuClose(item.id);
                }}
                sx={{
                  py: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                {child.icon && <ListItemIcon sx={{ minWidth: 36 }}>{child.icon}</ListItemIcon>}
                <ListItemText primary={child.label} secondary={child.description} />
              </MenuItem>
            ))}
          </Menu>
        </Box>
      );
    }

    return (
      <NavButton
        key={item.id}
        onClick={() => handleNavigation(item.path)}
        active={isActive(item.path) ? 1 : 0}
        startIcon={item.icon}
      >
        {item.label}
      </NavButton>
    );
  };

  const renderMobileMenuItem = (item, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.id];

    if (hasChildren) {
      return (
        <React.Fragment key={item.id}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                setOpenMenus((prev) => ({
                  ...prev,
                  [item.id]: !prev[item.id],
                }))
              }
              sx={{ pl: depth * 2 + 2 }}
            >
              {item.icon && <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.label} />
              {isOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </ListItemButton>
          </ListItem>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <List component="div" disablePadding>
                  {item.children.map((child) => renderMobileMenuItem(child, depth + 1))}
                </List>
              </motion.div>
            )}
          </AnimatePresence>
        </React.Fragment>
      );
    }

    return (
      <ListItem key={item.id} disablePadding>
        <ListItemButton
          onClick={() => handleNavigation(item.path)}
          selected={isActive(item.path)}
          sx={{ pl: depth * 2 + 2 }}
        >
          {item.icon && <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>}
          <ListItemText primary={item.label} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <StyledAppBar
      position={sticky ? 'sticky' : position}
      color={color}
      elevation={elevation}
      transparent={transparent ? 1 : 0}
      {...props}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
            }}
            onClick={() => onLogoClick?.() || navigate('/')}
          >
            {logo && (
              <Box component="img" src={logo} alt={title} sx={{ height: 40, width: 'auto' }} />
            )}
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.main,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {title}
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 4 }}>
              {items.map((item) => renderMenuItem(item))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'text'}
                color={action.color || 'primary'}
                startIcon={action.icon}
                onClick={action.onClick}
                size="small"
              >
                {action.label}
              </Button>
            ))}

            {/* Mobile Menu Toggle */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <MobileMenu
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {logo && (
              <Box component="img" src={logo} alt={title} sx={{ height: 32, width: 'auto' }} />
            )}
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List>{items.map((item) => renderMobileMenuItem(item))}</List>

        {user && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2">{user.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        )}
      </MobileMenu>
    </StyledAppBar>
  );
};

export default Navbar;
