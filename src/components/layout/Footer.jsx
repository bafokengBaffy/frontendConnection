import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  TextField,
  Button,
  Stack,
  styled,
  useTheme,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ArrowRight as ArrowRightIcon,
  Send as SendIcon,
} from '@mui/icons-material';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(6, 0, 3),
  marginTop: 'auto',
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  transition: theme.transitions.create(['background-color', 'transform']),
  '&:hover': {
    transform: 'translateY(-3px)',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  fontSize: '0.9rem',
  marginBottom: theme.spacing(1),
  transition: theme.transitions.create(['color', 'transform']),
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateX(4px)',
    textDecoration: 'none',
  },
}));

const NewsletterInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
  },
}));

const Footer = ({
  // Core props
  logo,
  brandName,
  description,

  // Sections
  sections = [],

  // Social links
  social = [],

  // Contact info
  contact = {},

  // Newsletter
  newsletter = true,
  newsletterPlaceholder = 'Enter your email',
  newsletterButtonText = 'Subscribe',
  onSubscribe,

  // Copyright
  copyright,
  copyrightText,

  // Links
  links = [],

  // Customization
  variant = 'default', // 'default' | 'minimal' | 'compact'
  position = 'static',

  ...props
}) => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const defaultSocial = [
    { icon: <FacebookIcon />, url: '#', label: 'Facebook' },
    { icon: <TwitterIcon />, url: '#', label: 'Twitter' },
    { icon: <LinkedInIcon />, url: '#', label: 'LinkedIn' },
    { icon: <InstagramIcon />, url: '#', label: 'Instagram' },
  ];

  const socialLinks = social.length > 0 ? social : defaultSocial;

  const defaultSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', url: '/features' },
        { label: 'Pricing', url: '/pricing' },
        { label: 'FAQ', url: '/faq' },
        { label: 'Support', url: '/support' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', url: '/about' },
        { label: 'Blog', url: '/blog' },
        { label: 'Careers', url: '/careers' },
        { label: 'Press', url: '/press' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', url: '/privacy' },
        { label: 'Terms', url: '/terms' },
        { label: 'Security', url: '/security' },
        { label: 'Cookies', url: '/cookies' },
      ],
    },
  ];

  const footerSections = sections.length > 0 ? sections : defaultSections;

  const handleSubscribe = (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    onSubscribe?.(email);
  };

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <FooterContainer component="footer" position={position} {...props}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {logo && (
                <Box
                  component="img"
                  src={logo}
                  alt={brandName}
                  sx={{ height: 32, width: 'auto' }}
                />
              )}
              <Typography variant="body2" color="text.secondary">
                © {currentYear} {brandName || 'Company'}. All rights reserved.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              {socialLinks.map((item, index) => (
                <IconButton
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener"
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  {item.icon}
                </IconButton>
              ))}
            </Stack>
          </Box>
        </Container>
      </FooterContainer>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <FooterContainer component="footer" position={position} {...props}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {logo && (
                  <Box
                    component="img"
                    src={logo}
                    alt={brandName}
                    sx={{ height: 32, width: 'auto' }}
                  />
                )}
                <Typography variant="h6">{brandName}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {description || 'Your trusted platform for connecting talent with opportunities.'}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Grid container spacing={4}>
                {footerSections.slice(0, 2).map((section, index) => (
                  <Grid item xs={6} key={index}>
                    <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                      {section.title}
                    </Typography>
                    <Stack spacing={0.5}>
                      {section.links.map((link, linkIndex) => (
                        <FooterLink key={linkIndex} href={link.url} underline="none">
                          <ArrowRightIcon fontSize="small" />
                          {link.label}
                        </FooterLink>
                      ))}
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {currentYear} {brandName || 'Company'}. All rights reserved.
            </Typography>

            <Stack direction="row" spacing={2}>
              <Link href="/privacy" variant="body2" color="text.secondary" underline="hover">
                Privacy
              </Link>
              <Link href="/terms" variant="body2" color="text.secondary" underline="hover">
                Terms
              </Link>
              <Link href="/cookies" variant="body2" color="text.secondary" underline="hover">
                Cookies
              </Link>
            </Stack>
          </Box>
        </Container>
      </FooterContainer>
    );
  }

  // Default variant
  return (
    <FooterContainer component="footer" position={position} {...props}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {logo && (
                <Box
                  component="img"
                  src={logo}
                  alt={brandName}
                  sx={{ height: 40, width: 'auto' }}
                />
              )}
              <Typography variant="h5" fontWeight={600}>
                {brandName}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              {description || 'Your trusted platform for connecting talent with opportunities.'}
            </Typography>

            {/* Contact Info */}
            <Stack spacing={1} sx={{ mt: 2 }}>
              {contact.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Link
                    href={`mailto:${contact.email}`}
                    variant="body2"
                    color="text.secondary"
                    underline="hover"
                  >
                    {contact.email}
                  </Link>
                </Box>
              )}

              {contact.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Link
                    href={`tel:${contact.phone}`}
                    variant="body2"
                    color="text.secondary"
                    underline="hover"
                  >
                    {contact.phone}
                  </Link>
                </Box>
              )}

              {contact.address && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {contact.address}
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Social Links */}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {socialLinks.map((item, index) => (
                <SocialButton
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener"
                  size="small"
                  aria-label={item.label}
                >
                  {item.icon}
                </SocialButton>
              ))}
            </Stack>
          </Grid>

          {/* Navigation Sections */}
          {footerSections.map((section, index) => (
            <Grid item xs={6} sm={3} md={2} key={index}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                {section.title}
              </Typography>
              <Stack spacing={1}>
                {section.links.map((link, linkIndex) => (
                  <FooterLink key={linkIndex} href={link.url} underline="none">
                    {link.label}
                  </FooterLink>
                ))}
              </Stack>
            </Grid>
          ))}

          {/* Newsletter */}
          {newsletter && (
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Subscribe to our newsletter
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Get the latest updates and offers delivered to your inbox.
              </Typography>

              <Box component="form" onSubmit={handleSubscribe} sx={{ display: 'flex', gap: 1 }}>
                <NewsletterInput
                  name="email"
                  type="email"
                  placeholder={newsletterPlaceholder}
                  size="small"
                  fullWidth
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                  sx={{ minWidth: 'auto', px: 3 }}
                >
                  {newsletterButtonText}
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {copyrightText || `© ${currentYear} ${brandName || 'Company'}. All rights reserved.`}
          </Typography>

          <Stack direction="row" spacing={2}>
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.url}
                variant="body2"
                color="text.secondary"
                underline="hover"
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
