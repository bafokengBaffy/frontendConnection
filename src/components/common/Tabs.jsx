import React, { useState, useEffect } from 'react';
import {
  Tabs as MuiTabs,
  Tab,
  Box,
  Badge,
  alpha,
  styled,
  useTheme,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { MoreHoriz as MoreIcon, Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const StyledTabs = styled(MuiTabs)(({ theme, variant }) => ({
  minHeight: 48,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  '& .MuiTab-root': {
    minHeight: 48,
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: theme.transitions.create(['color', 'background-color']),
    '&:hover': {
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  },
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
  width: '100%',
}));

const Tabs = ({
  // Core props
  tabs = [],
  value,
  onChange,
  defaultTab = 0,

  // Variants
  variant = 'standard', // 'standard' | 'fullWidth' | 'scrollable'
  orientation = 'horizontal',

  // Features
  addable = false,
  closable = false,
  reorderable = false,
  lazy = true,
  destroyInactive = false,

  // Styling
  centered = false,
  textColor = 'primary',
  indicatorColor = 'primary',

  // Icons
  showIcon = false,
  iconPosition = 'start',

  // Badges
  showBadge = false,

  // Actions
  onAdd,
  onClose,
  onReorder,

  // Custom rendering
  renderTab,
  renderTabPanel,

  // State
  loading = false,
  disabled = false,

  ...props
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(value || defaultTab);
  const [tabOrder, setTabOrder] = useState(tabs.map((_, index) => index));
  const [contextMenu, setContextMenu] = useState(null);
  const [menuTab, setMenuTab] = useState(null);

  useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleChange = (event, newValue) => {
    if (!disabled) {
      setActiveTab(newValue);
      onChange?.(newValue);
    }
  };

  const handleClose = (tabIndex, event) => {
    event.stopPropagation();
    onClose?.(tabIndex);
  };

  const handleAdd = () => {
    onAdd?.();
  };

  const handleContextMenu = (event, tabIndex) => {
    event.preventDefault();
    setContextMenu(event.currentTarget);
    setMenuTab(tabIndex);
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
    setMenuTab(null);
  };

  const handleReorder = (oldIndex, newIndex) => {
    const newOrder = [...tabOrder];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);
    setTabOrder(newOrder);
    onReorder?.(newOrder);
  };

  const getTabBadge = (tab) => {
    if (!showBadge || !tab.badge) return null;

    if (typeof tab.badge === 'number') {
      return (
        <Badge
          badgeContent={tab.badge}
          color={tab.badgeColor || 'primary'}
          max={99}
          sx={{ ml: 1 }}
        />
      );
    }

    return tab.badge;
  };

  const renderTabContent = (tab, index) => {
    if (renderTab) {
      return renderTab(tab, index, { active: activeTab === index });
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showIcon && tab.icon && (
          <Box component="span" sx={{ display: 'flex' }}>
            {tab.icon}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {tab.label}
          {getTabBadge(tab)}
        </Box>

        {closable && tabs.length > 1 && (
          <IconButton
            size="small"
            component="span"
            onClick={(e) => handleClose(index, e)}
            sx={{
              ml: 0.5,
              p: 0.5,
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <StyledTabs
          value={activeTab}
          onChange={handleChange}
          variant={variant}
          orientation={orientation}
          centered={centered}
          textColor={textColor}
          indicatorColor={indicatorColor}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ flex: 1 }}
          {...props}
        >
          {tabOrder.map((tabIndex) => {
            const tab = tabs[tabIndex];
            return (
              <Tab
                key={tab.id || tabIndex}
                label={renderTabContent(tab, tabIndex)}
                disabled={tab.disabled || disabled}
                icon={showIcon && tab.icon}
                iconPosition={iconPosition}
                onContextMenu={(e) => handleContextMenu(e, tabIndex)}
                sx={tab.sx}
              />
            );
          })}
        </StyledTabs>

        {addable && (
          <Tooltip title="Add Tab">
            <IconButton
              onClick={handleAdd}
              sx={{
                ml: 1,
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Context Menu */}
      <Menu anchorEl={contextMenu} open={Boolean(contextMenu)} onClose={handleContextMenuClose}>
        <MenuItem onClick={handleContextMenuClose}>Duplicate</MenuItem>
        <MenuItem onClick={handleContextMenuClose}>Rename</MenuItem>
        {closable && (
          <MenuItem
            onClick={() => {
              onClose?.(menuTab);
              handleContextMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            Close
          </MenuItem>
        )}
      </Menu>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {tabs.map((tab, index) => {
          const isActive = index === activeTab;

          if (!isActive && lazy && !destroyInactive) {
            return null;
          }

          if (!isActive && destroyInactive) {
            return null;
          }

          return (
            <motion.div
              key={tab.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              style={{ display: isActive ? 'block' : 'none' }}
            >
              <TabPanel
                role="tabpanel"
                hidden={!isActive}
                id={`tabpanel-${index}`}
                aria-labelledby={`tab-${index}`}
              >
                {renderTabPanel ? renderTabPanel(tab, index) : tab.content}
              </TabPanel>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </Box>
  );
};

// Specialized tab variants
export const VerticalTabs = (props) => (
  <Box sx={{ display: 'flex', gap: 3 }}>
    <Tabs
      orientation="vertical"
      variant="scrollable"
      sx={{
        borderRight: 1,
        borderColor: 'divider',
        minWidth: 200,
        '& .MuiTabs-indicator': {
          left: 0,
          right: 'auto',
        },
      }}
      {...props}
    />
  </Box>
);

export const IconTabs = (props) => <Tabs showIcon iconPosition="start" centered {...props} />;

export const ScrollableTabs = (props) => (
  <Tabs variant="scrollable" scrollButtons="auto" {...props} />
);

export default Tabs;
