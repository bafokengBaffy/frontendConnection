/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import {
  Box,
  Container,
  Typography,
  Paper,
  alpha,
  styled,
  Skeleton,
  Breadcrumbs,
  Link,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import React from 'react';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  PictureAsPdf as PdfIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import Breadcrumb from './Breadcrumb';

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  backgroundImage: `
    radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.12)}, transparent 32%),
    radial-gradient(circle at top right, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 28%),
    linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${theme.palette.background.default} 100%)
  `,
}));

const PageHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.82),
  backdropFilter: 'blur(18px)',
  marginBottom: theme.spacing(3),
  position: 'sticky',
  top: 0,
  zIndex: 10,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 0),
    marginBottom: theme.spacing(2),
  },
}));

const HeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-start',
  },
}));

const TitleSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
  },
}));

const ActionSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'flex-start',
  },
}));

const StyledPaper = styled(Paper)(({ theme, noPadding }) => ({
  padding: noPadding ? 0 : theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.45)}`,
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  transition: theme.transitions.create(['box-shadow']),
  '&:hover': {
    boxShadow: '0 30px 70px rgba(15, 23, 42, 0.12)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: noPadding ? 0 : theme.spacing(2),
    borderRadius: theme.spacing(1.5),
  },
}));

const PageContainer = ({
  // Core props
  children,
  title,
  subtitle,

  // Header
  showHeader = true,
  showBreadcrumbs = true,
  showBackButton = false,
  showActions = true,

  // Breadcrumbs
  breadcrumbs = [],
  homePath = '/',

  // Actions
  actions = [],
  onBack,
  onRefresh,
  onDownload,
  onPrint,
  onShare,

  // Loading
  loading = false,
  skeletonCount = 3,

  // Layout
  maxWidth = 'lg',
  noPadding = false,
  centered = false,

  // Features
  fullscreen = false,
  onFullscreen,

  // Customization
  headerColor = 'background.paper',
  backgroundColor = 'background.default',

  // Metadata
  meta = {},

  ...props
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    onFullscreen?.(!isFullscreen);
  };

  const renderSkeleton = () => {
    return (
      <>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={20} />
        </Box>
        {[...Array(skeletonCount)].map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={100}
            sx={{ mb: 2, borderRadius: 2 }}
          />
        ))}
      </>
    );
  };

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <PageHeader sx={{ backgroundColor: headerColor }}>
        <Container maxWidth={maxWidth}>
          <HeaderContent>
            <TitleSection>
              {showBackButton && (
                <Tooltip title="Go back">
                  <IconButton onClick={onBack} size="large">
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
              )}

              <Box>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography
                    variant="h4"
                    component="h1"
                    fontWeight={600}
                    gutterBottom={!!subtitle}
                    sx={{ letterSpacing: '-0.02em' }}
                  >
                    {title}
                  </Typography>
                  {subtitle && (
                    <Typography variant="body1" color="text.secondary">
                      {subtitle}
                    </Typography>
                  )}
                </motion.div>

                {showBreadcrumbs && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Breadcrumbs items={breadcrumbs} homePath={homePath} sx={{ mt: 1 }} />
                  </motion.div>
                )}
              </Box>
            </TitleSection>

            {showActions && (
              <ActionSection>
                {/* Default Actions */}
                {onRefresh && (
                  <Tooltip title="Refresh">
                    <IconButton onClick={onRefresh} size="large">
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {onDownload && (
                  <Tooltip title="Download">
                    <IconButton onClick={onDownload} size="large">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {onPrint && (
                  <Tooltip title="Print">
                    <IconButton onClick={onPrint} size="large">
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {onShare && (
                  <Tooltip title="Share">
                    <IconButton onClick={onShare} size="large">
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {fullscreen && (
                  <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                    <IconButton onClick={toggleFullscreen} size="large">
                      {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>
                  </Tooltip>
                )}

                {/* Custom Actions */}
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outlined'}
                    color={action.color || 'primary'}
                    startIcon={action.icon}
                    onClick={action.onClick}
                    size="medium"
                  >
                    {action.label}
                  </Button>
                ))}
              </ActionSection>
            )}
          </HeaderContent>
        </Container>
      </PageHeader>
    );
  };

  const renderContent = () => {
    if (loading) {
      return renderSkeleton();
    }

    if (noPadding) {
      return children;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <StyledPaper noPadding={noPadding}>{children}</StyledPaper>
      </motion.div>
    );
  };

  return (
    <PageWrapper sx={{ backgroundColor }}>
      {renderHeader()}

      <Container
        maxWidth={maxWidth}
        sx={{
          flex: 1,
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 1.5, sm: 2, md: 3 },
          ...(centered && {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }),
        }}
      >
        {renderContent()}
      </Container>

      {/* Metadata */}
      {Object.keys(meta).length > 0 && (
        <Box sx={{ display: 'none' }}>
          {Object.entries(meta).map(([key, value]) => (
            <meta key={key} name={key} content={value} />
          ))}
        </Box>
      )}
    </PageWrapper>
  );
};

export default PageContainer;
