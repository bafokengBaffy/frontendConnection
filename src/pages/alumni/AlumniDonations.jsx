// frontend/src/pages/alumni/AlumniDonations.jsx
import {
  AccountBalance as BankIcon,
  Close as CloseIcon,
  CreditCard as CreditCardIcon,
  VolunteerActivism as DonationIcon,
  Download as DownloadIcon,
  AccountBalanceWallet as PayPalIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  School as SchoolIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import alumniService from '../../services/alumniService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const donationTiers = [
  { amount: 50, label: 'Supporter', benefits: ['Recognition on website', 'Monthly newsletter'] },
  {
    amount: 100,
    label: 'Friend',
    benefits: ['All Supporter benefits', 'Digital certificate', 'Social media shoutout'],
  },
  {
    amount: 250,
    label: 'Advocate',
    benefits: ['All Friend benefits', 'Name in annual report', 'Invitation to exclusive events'],
  },
  {
    amount: 500,
    label: 'Champion',
    benefits: ['All Advocate benefits', 'Recognition plaque', 'Meet and greet with leadership'],
  },
  {
    amount: 1000,
    label: 'Leader',
    benefits: ['All Champion benefits', 'Named scholarship opportunity', 'Lifetime recognition'],
  },
  {
    amount: 5000,
    label: 'Visionary',
    benefits: ['All Leader benefits', 'Custom impact report', 'Legacy society membership'],
  },
];

const paymentMethods = [
  { id: 'card', name: 'Credit / Debit Card', icon: <CreditCardIcon /> },
  { id: 'paypal', name: 'PayPal', icon: <PayPalIcon /> },
  { id: 'bank', name: 'Bank Transfer', icon: <BankIcon /> },
];

const donationTypes = [
  { id: 'one-time', name: 'One-time Donation', description: 'Make a single donation today' },
  {
    id: 'monthly',
    name: 'Monthly Donation',
    description: 'Sustain impact with recurring monthly gifts',
  },
  {
    id: 'yearly',
    name: 'Yearly Donation',
    description: 'Annual commitment to support our mission',
  },
];

const campaigns = [
  {
    id: 'general',
    name: 'General Fund',
    description: 'Support overall operations and programs',
    color: '#3b82f6',
  },
  {
    id: 'scholarship',
    name: 'Scholarship Fund',
    description: 'Provide education opportunities for students',
    color: '#10b981',
  },
  {
    id: 'mentorship',
    name: 'Mentorship Program',
    description: 'Support mentorship initiatives',
    color: '#f59e0b',
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Improve facilities and resources',
    color: '#8b5cf6',
  },
  {
    id: 'innovation',
    name: 'Innovation Lab',
    description: 'Fund research and innovation',
    color: '#ef4444',
  },
];

const AlumniDonations = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [donationHistory, setDonationHistory] = useState([]);
  const [campaignsList, setCampaignsList] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [donationStats, setDonationStats] = useState({
    totalAmount: 0,
    totalCount: 0,
    averageAmount: 0,
    recognitionLevel: 'Start Your Journey',
  });

  // Donation form state
  const [donationForm, setDonationForm] = useState({
    amount: '',
    customAmount: '',
    donationType: 'one-time',
    campaignId: 'general',
    campaignName: 'General Fund',
    paymentMethod: 'card',
    currency: 'USD',
    message: '',
    isAnonymous: false,
    taxReceipt: true,
    dedication: {
      name: '',
      message: '',
      type: 'in_honor_of',
    },
    recurringDetails: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      dayOfMonth: 1,
    },
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadDonationData();
  }, []);

  const loadDonationData = async () => {
    setLoading(true);
    try {
      const [historyRes, campaignsRes] = await Promise.all([
        alumniService.getDonationHistory(),
        alumniService.getDonationCampaigns(),
      ]);

      if (historyRes.success) {
        setDonationHistory(historyRes.data.donations);
        setDonationStats(historyRes.data.summary);
      }

      if (campaignsRes.success) {
        setCampaignsList(campaignsRes.data);
      } else {
        setCampaignsList(campaigns);
      }
    } catch (error) {
      console.error('Error loading donation data:', error);
      showNotification('Failed to load donation data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDonationFormChange = (field, value) => {
    setDonationForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleDonationAmountSelect = (amount) => {
    setDonationForm((prev) => ({ ...prev, amount: amount.toString(), customAmount: '' }));
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setDonationForm((prev) => ({ ...prev, customAmount: value, amount: value }));
  };

  const validateDonationForm = () => {
    const errors = {};
    const amount = parseFloat(donationForm.amount);

    if (!donationForm.amount || isNaN(amount) || amount < 1) {
      errors.amount = 'Please enter a valid donation amount (minimum $1)';
    }

    if (amount > 50000) {
      errors.amount = 'For donations over $50,000, please contact us directly';
    }

    if (!donationForm.paymentMethod) {
      errors.paymentMethod = 'Please select a payment method';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitDonation = async () => {
    if (!validateDonationForm()) return;

    setLoading(true);
    const donationData = {
      amount: parseFloat(donationForm.amount),
      campaignId: donationForm.campaignId,
      campaignName: donationForm.campaignName,
      donationType: donationForm.donationType,
      paymentMethod: donationForm.paymentMethod,
      currency: donationForm.currency,
      message: donationForm.message,
      isAnonymous: donationForm.isAnonymous,
      taxReceipt: donationForm.taxReceipt,
      dedication: donationForm.dedication.name ? donationForm.dedication : null,
    };

    const result = await alumniService.createDonation(donationData);
    setLoading(false);

    if (result.success) {
      setDonationDialogOpen(false);
      resetDonationForm();
      showNotification('Thank you for your generous donation!', 'success');
      loadDonationData();
    } else {
      showNotification(result.error || 'Donation failed. Please try again.', 'error');
    }
  };

  const resetDonationForm = () => {
    setDonationForm({
      amount: '',
      customAmount: '',
      donationType: 'one-time',
      campaignId: 'general',
      campaignName: 'General Fund',
      paymentMethod: 'card',
      currency: 'USD',
      message: '',
      isAnonymous: false,
      taxReceipt: true,
      dedication: { name: '', message: '', type: 'in_honor_of' },
      recurringDetails: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        dayOfMonth: 1,
      },
    });
    setActiveStep(0);
    setFormErrors({});
  };

  const getDonationImpact = () => {
    const amount = parseFloat(donationForm.amount) || 0;
    return {
      studentsSupported: Math.floor(amount / 100),
      scholarshipsProvided: Math.floor(amount / 500),
      programsFunded: Math.floor(amount / 1000),
      mealsProvided: Math.floor(amount / 10),
      booksPurchased: Math.floor(amount / 25),
    };
  };

  const steps = ['Select Amount', 'Choose Campaign', 'Payment Method', 'Review & Donate'];

  return (
    <PageContainer
      title="Alumni Donations"
      subtitle="Make a difference in the lives of students and the community"
      actions={[
        {
          label: 'Make a Donation',
          onClick: () => setDonationDialogOpen(true),
          variant: 'contained',
          icon: <DonationIcon />,
        },
        {
          label: 'Download Report',
          onClick: () => { },
          variant: 'outlined',
          icon: <DownloadIcon />,
        },
      ]}
      breadcrumbs={[
        { label: 'Alumni', path: '/alumni' },
        { label: 'Donations', path: '/alumni/donations' },
      ]}
    >
      {/* Donation Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Donated
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(donationStats.totalAmount)}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      Lifetime giving
                    </Typography>
                  </Box>
                  <DonationIcon sx={{ fontSize: 48, color: '#667eea', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Donations
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {donationStats.totalCount}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Transactions
                    </Typography>
                  </Box>
                  <ReceiptIcon sx={{ fontSize: 48, color: '#10b981', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Recognition Level
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {donationStats.recognitionLevel}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Keep giving to level up
                    </Typography>
                  </Box>
                  <TrophyIcon sx={{ fontSize: 48, color: '#f59e0b', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Students Impacted
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {Math.floor(donationStats.totalAmount / 100)}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      +{Math.floor(donationStats.totalAmount / 500)} scholarships
                    </Typography>
                  </Box>
                  <SchoolIcon sx={{ fontSize: 48, color: '#8b5cf6', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Donation History" />
          <Tab label="Impact Dashboard" />
          <Tab label="Campaigns" />
          <Tab label="Tax Receipts" />
        </Tabs>

        {/* Donation History Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Campaign</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Receipt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donationHistory.map((donation) => (
                    <TableRow key={donation.id} hover>
                      <TableCell>
                        {formatDate(donation.createdAt?.toDate?.() || donation.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Chip label={donation.campaignName} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">{formatCurrency(donation.amount)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {donation.paymentMethod === 'card' && <CreditCardIcon fontSize="small" />}
                          {donation.paymentMethod === 'paypal' && <PayPalIcon fontSize="small" />}
                          {donation.paymentMethod === 'bank' && <BankIcon fontSize="small" />}
                          <Typography variant="body2">{donation.paymentMethod}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={donation.status}
                          size="small"
                          color={donation.status === 'completed' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => { }}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {donationHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">
                          No donations yet. Make your first donation today!
                        </Typography>
                        <Button
                          variant="contained"
                          sx={{ mt: 2 }}
                          onClick={() => setDonationDialogOpen(true)}
                        >
                          Make a Donation
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Impact Dashboard Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Your Impact Summary
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Total Contribution
                        </Typography>
                        <Typography variant="h3" fontWeight="bold">
                          {formatCurrency(donationStats.totalAmount)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((donationStats.totalAmount / 10000) * 100, 100)}
                          sx={{ mt: 1, height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#eff6ff' }}>
                            <Typography variant="h4">
                              {Math.floor(donationStats.totalAmount / 100)}
                            </Typography>
                            <Typography variant="caption">Students Supported</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f0fdf4' }}>
                            <Typography variant="h4">
                              {Math.floor(donationStats.totalAmount / 500)}
                            </Typography>
                            <Typography variant="caption">Scholarships</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fef3c7' }}>
                            <Typography variant="h4">
                              {Math.floor(donationStats.totalAmount / 25)}
                            </Typography>
                            <Typography variant="caption">Books Purchased</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f3e8ff' }}>
                            <Typography variant="h4">
                              {Math.floor(donationStats.totalAmount / 10)}
                            </Typography>
                            <Typography variant="caption">Meals Provided</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recognition Journey
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Friend of Foundation</Typography>
                        <Typography variant="body2" color="success.main">
                          ✓ Achieved
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={100} sx={{ mb: 2, height: 6 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Bronze Supporter ($500+)</Typography>
                        <Typography variant="body2">
                          {Math.min(100, (donationStats.totalAmount / 500) * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (donationStats.totalAmount / 500) * 100)}
                        sx={{ mb: 2, height: 6 }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Silver Supporter ($1,000+)</Typography>
                        <Typography variant="body2">
                          {Math.min(100, (donationStats.totalAmount / 1000) * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (donationStats.totalAmount / 1000) * 100)}
                        sx={{ mb: 2, height: 6 }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Gold Benefactor ($5,000+)</Typography>
                        <Typography variant="body2">
                          {Math.min(100, (donationStats.totalAmount / 5000) * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (donationStats.totalAmount / 5000) * 100)}
                        sx={{ mb: 2, height: 6 }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Platinum Benefactor ($10,000+)</Typography>
                        <Typography variant="body2">
                          {Math.min(100, (donationStats.totalAmount / 10000) * 100)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (donationStats.totalAmount / 10000) * 100)}
                        sx={{ height: 6 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Campaigns Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {campaignsList.map((campaign) => (
                <Grid item xs={12} md={6} key={campaign.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 4,
                            height: 40,
                            bgcolor: campaign.color,
                            borderRadius: 2,
                            mr: 2,
                          }}
                        />
                        <Box flex={1}>
                          <Typography variant="h6">{campaign.name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {campaign.description}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setDonationForm((prev) => ({
                              ...prev,
                              campaignId: campaign.id,
                              campaignName: campaign.name,
                            }));
                            setDonationDialogOpen(true);
                          }}
                        >
                          Donate
                        </Button>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Progress</Typography>
                          <Typography variant="body2">
                            {formatCurrency(campaign.raisedAmount || 0)} /{' '}
                            {formatCurrency(campaign.goalAmount || 10000)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            ((campaign.raisedAmount || 0) / (campaign.goalAmount || 10000)) * 100
                          }
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ mt: 1, display: 'block' }}
                        >
                          {campaign.donorCount || 0} donors
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Tax Receipts Tab */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tax Receipts
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Download your tax receipts for donations made in the last 7 years
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tax Year</TableCell>
                        <TableCell>Total Donations</TableCell>
                        <TableCell align="center">Receipt</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[2024, 2023, 2022].map((year) => {
                        const yearDonations = donationHistory.filter(
                          (d) =>
                            new Date(d.createdAt?.toDate?.() || d.createdAt).getFullYear() === year
                        );
                        const total = yearDonations.reduce((sum, d) => sum + d.amount, 0);
                        return (
                          <TableRow key={year}>
                            <TableCell>{year}</TableCell>
                            <TableCell>{formatCurrency(total)}</TableCell>
                            <TableCell align="center">
                              <Button size="small" disabled={total === 0}>
                                Download PDF
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>

      {/* Professional Donation Dialog */}
      <Dialog
        open={donationDialogOpen}
        onClose={() => setDonationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              Make a Donation
            </Typography>
            <IconButton onClick={() => setDonationDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ my: 3 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <AnimatePresence mode="wait">
            {/* Step 1: Select Amount */}
            {activeStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Select Donation Type
                </Typography>
                <RadioGroup
                  value={donationForm.donationType}
                  onChange={(e) => handleDonationFormChange('donationType', e.target.value)}
                  sx={{ mb: 3 }}
                >
                  <Grid container spacing={2}>
                    {donationTypes.map((type) => (
                      <Grid item xs={12} key={type.id}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            bgcolor:
                              donationForm.donationType === type.id
                                ? 'action.hover'
                                : 'background.paper',
                          }}
                        >
                          <FormControlLabel
                            value={type.id}
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography fontWeight="bold">{type.name}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {type.description}
                                </Typography>
                              </Box>
                            }
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </RadioGroup>

                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Select Amount
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {donationTiers.map((tier) => (
                    <Grid item xs={6} sm={4} key={tier.amount}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          cursor: 'pointer',
                          bgcolor:
                            donationForm.amount === tier.amount.toString()
                              ? 'primary.light'
                              : 'background.paper',
                          color:
                            donationForm.amount === tier.amount.toString() ? 'white' : 'inherit',
                          transition: 'all 0.2s',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
                        }}
                        onClick={() => handleDonationAmountSelect(tier.amount)}
                      >
                        <Typography variant="h5" fontWeight="bold">
                          ${tier.amount}
                        </Typography>
                        <Typography variant="caption">{tier.label}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Custom Amount"
                      type="number"
                      value={donationForm.customAmount}
                      onChange={handleCustomAmountChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      placeholder="Enter custom amount"
                      error={!!formErrors.amount}
                      helperText={formErrors.amount}
                    />
                  </Grid>
                </Grid>

                {donationForm.amount && parseFloat(donationForm.amount) > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Alert severity="info" icon={<DonationIcon />}>
                      <Typography variant="body2">
                        Your donation of {formatCurrency(parseFloat(donationForm.amount))} will:
                      </Typography>
                      <Box component="ul" sx={{ mt: 1, mb: 0 }}>
                        <li>
                          Support {Math.floor(parseFloat(donationForm.amount) / 100)} students
                        </li>
                        <li>
                          Provide {Math.floor(parseFloat(donationForm.amount) / 500)} scholarships
                        </li>
                        <li>Fund {Math.floor(parseFloat(donationForm.amount) / 1000)} programs</li>
                      </Box>
                    </Alert>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Choose Campaign */}
            {activeStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Select a Campaign
                </Typography>
                <Grid container spacing={2}>
                  {campaignsList.map((campaign) => (
                    <Grid item xs={12} key={campaign.id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          borderColor:
                            donationForm.campaignId === campaign.id ? campaign.color : 'divider',
                          bgcolor:
                            donationForm.campaignId === campaign.id
                              ? `${campaign.color}10`
                              : 'background.paper',
                          transition: 'all 0.2s',
                        }}
                        onClick={() => handleDonationFormChange('campaignId', campaign.id)}
                      >
                        <FormControlLabel
                          value={campaign.id}
                          control={<Radio checked={donationForm.campaignId === campaign.id} />}
                          label={
                            <Box>
                              <Typography fontWeight="bold">{campaign.name}</Typography>
                              <Typography variant="body2" color="textSecondary">
                                {campaign.description}
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Add a personal message (optional)"
                  value={donationForm.message}
                  onChange={(e) => handleDonationFormChange('message', e.target.value)}
                  placeholder="Share why you're donating..."
                  sx={{ mt: 3 }}
                />

                <FormGroup sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={donationForm.isAnonymous}
                        onChange={(e) => handleDonationFormChange('isAnonymous', e.target.checked)}
                      />
                    }
                    label="Make this donation anonymous"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={donationForm.taxReceipt}
                        onChange={(e) => handleDonationFormChange('taxReceipt', e.target.checked)}
                      />
                    }
                    label="Email tax receipt"
                  />
                </FormGroup>
              </motion.div>
            )}

            {/* Step 3: Payment Method */}
            {activeStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Select Payment Method
                </Typography>
                <Grid container spacing={2}>
                  {paymentMethods.map((method) => (
                    <Grid item xs={12} sm={4} key={method.id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          cursor: 'pointer',
                          bgcolor:
                            donationForm.paymentMethod === method.id
                              ? 'primary.light'
                              : 'background.paper',
                          color: donationForm.paymentMethod === method.id ? 'white' : 'inherit',
                          transition: 'all 0.2s',
                          '&:hover': { transform: 'translateY(-2px)' },
                        }}
                        onClick={() => handleDonationFormChange('paymentMethod', method.id)}
                      >
                        {method.icon}
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {method.name}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {donationForm.paymentMethod === 'card' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Card Details
                      </Typography>
                      <TextField
                        fullWidth
                        label="Card Number"
                        placeholder="1234 5678 9012 3456"
                        sx={{ mb: 2 }}
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField fullWidth label="Expiry Date" placeholder="MM/YY" />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField fullWidth label="CVV" placeholder="123" />
                        </Grid>
                      </Grid>
                      <TextField fullWidth label="Cardholder Name" sx={{ mt: 2 }} />
                    </Paper>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 4: Review & Donate */}
            {activeStep === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Review Your Donation
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Amount
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {formatCurrency(parseFloat(donationForm.amount) || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Type
                      </Typography>
                      <Typography>
                        {donationTypes.find((t) => t.id === donationForm.donationType)?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Campaign
                      </Typography>
                      <Typography>
                        {campaignsList.find((c) => c.id === donationForm.campaignId)?.name ||
                          donationForm.campaignName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">
                        Payment Method
                      </Typography>
                      <Typography>
                        {paymentMethods.find((m) => m.id === donationForm.paymentMethod)?.name}
                      </Typography>
                    </Grid>
                    {donationForm.message && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                          Message
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                          <Typography variant="body2" fontStyle="italic">
                            "{donationForm.message}"
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <Alert severity="info" icon={<ReceiptIcon />}>
                        A tax receipt will be sent to your email address.
                      </Alert>
                    </Grid>
                  </Grid>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDonationDialogOpen(false)}>Cancel</Button>
          {activeStep > 0 && (
            <Button onClick={() => setActiveStep((prev) => prev - 1)}>Back</Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={() => setActiveStep((prev) => prev + 1)}
              disabled={
                activeStep === 0 && (!donationForm.amount || parseFloat(donationForm.amount) <= 0)
              }
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitDonation}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <DonationIcon />}
            >
              {loading ? 'Processing...' : 'Complete Donation'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default AlumniDonations;
