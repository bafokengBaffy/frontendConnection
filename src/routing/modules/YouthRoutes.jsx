// src/routing/modules/YouthRoutes.jsx
import { lazy } from 'react';
import { Route } from 'react-router-dom';

import ProtectedRoute from '../../components/layout/ProtectedRoute';

// Lazy loaded youth components
const YouthDashboard = lazy(() => import('../../pages/youth/YouthDashboard.jsx'));
const YouthProfile = lazy(() => import('../../pages/youth/profile/YouthProfile.jsx'));
const BusinessCanvas = lazy(() => import('../../pages/youth/BusinessCanvas.jsx'));
const BusinessIdeas = lazy(() => import('../../pages/youth/BusinessIdeas.jsx'));
const BusinessPlan = lazy(() => import('../../pages/youth/BusinessPlan.jsx'));
const BusinessPitching = lazy(() => import('../../pages/youth/BusinessPitching.jsx'));
const StartupRegistration = lazy(() => import('../../pages/youth/StartupRegistration.jsx'));
const FundingOpportunities = lazy(
  () => import('../../pages/youth/funding/FundingOpportunities.jsx')
);
const GrantsApplications = lazy(() => import('../../pages/youth/GrantsApplications.jsx'));
const MentorNetwork = lazy(() => import('../../pages/EntrepreneurHub/MentorNetwork'));
const MentorshipProgram = lazy(() => import('../../pages/youth/MentorshipProgram.jsx'));
const ResourceLibrary = lazy(() => import('../../pages/youth/ResourceLibrary.jsx'));
const TrainingCourses = lazy(() => import('../../pages/youth/TrainingCourses.jsx'));
const Workshops = lazy(() => import('../../pages/youth/Workshops.jsx'));
const SuccessStories = lazy(() => import('../../pages/youth/SuccessStories.jsx'));
const EntrepreneurNetwork = lazy(() => import('../../pages/youth/EntrepreneurNetwork.jsx'));
const AchievementBadge = lazy(() => import('../../pages/youth/AchievementBadge.jsx'));
const ProgressTracker = lazy(() => import('../../pages/youth/ProgressTracker'));
const PitchDeckBuilder = lazy(() => import('../../pages/youth/PitchDeckBuilder'));

// Business Sub-pages
const BusinessModelCanvas = lazy(() => import('../../pages/youth/business/BusinessModelCanvas'));
const BusinessProfile = lazy(() => import('../../pages/youth/business/BusinessProfile'));
const BusinessProgress = lazy(() => import('../../pages/youth/business/BusinessProgress'));
const CustomerSegmentation = lazy(() => import('../../pages/youth/business/CustomerSegmentation'));
const FinancialProjections = lazy(() => import('../../pages/youth/business/FinancialProjections'));
const MarketAnalysis = lazy(() => import('../../pages/youth/business/MarketAnalysis'));
const RevenueModel = lazy(() => import('../../pages/youth/business/RevenueModel'));
const ValueProposition = lazy(() => import('../../pages/youth/business/ValueProposition'));

// Funding Sub-pages
const Crowdfunding = lazy(() => import('../../pages/youth/funding/Crowdfunding.jsx'));
const InvestorConnections = lazy(() => import('../../pages/youth/funding/InvestorConnections.jsx'));
const LoanApplications = lazy(() => import('../../pages/youth/funding/LoanApplications.jsx'));
const PitchDeck = lazy(() => import('../../pages/youth/funding/PitchDeck.jsx'));

// Collaboration Sub-pages
const CoWorkingSpaces = lazy(() => import('../../pages/youth/collaboration/CoWorkingSpaces'));
const CoWorkingSpacesJSX = lazy(() => import('../../pages/youth/collaboration/CoWorkingSpaces'));
const Partnerships = lazy(() => import('../../pages/youth/collaboration/Partnerships.jsx'));
const TeamManagement = lazy(() => import('../../pages/youth/collaboration/TeamManagement.jsx'));

// Incubation Sub-pages
const AcceleratorPrograms = lazy(
  () => import('../../pages/youth/incubation/AcceleratorPrograms.jsx')
);
const IncubatorApplication = lazy(
  () => import('../../pages/youth/incubation/IncubatorApplication.jsx')
);
const ProgressMonitoring = lazy(
  () => import('../../pages/youth/incubation/ProgressMonitoring.jsx')
);
const StartupSupport = lazy(() => import('../../pages/youth/incubation/StartupSupport.jsx'));

// Marketplace Sub-pages
const Marketplace = lazy(() => import('../../pages/youth/marketplace/Marketplace.jsx'));
const OrderManagement = lazy(() => import('../../pages/youth/marketplace/OrderManagement.jsx'));
const ProductListing = lazy(() => import('../../pages/youth/marketplace/ProductListing.jsx'));
const ServiceOffering = lazy(() => import('../../pages/youth/marketplace/ServiceOffering.jsx'));

// Networking Sub-pages
const CollaborationOpportunities = lazy(
  () => import('../../pages/youth/networking/CollaborationOpportunities.jsx')
);
const EntrepreneurForum = lazy(() => import('../../pages/youth/networking/EntrepreneurForum.jsx'));
const IndustryEvents = lazy(() => import('../../pages/youth/networking/IndustryEvents.jsx'));
const PartnerMatching = lazy(() => import('../../pages/youth/networking/PartnerMatching.jsx'));

// Profile Sub-pages
const Achievements = lazy(() => import('../../pages/youth/profile/Achievements.jsx'));
const Portfolio = lazy(() => import('../../pages/youth/profile/Portfolio.jsx'));
const SkillsInventory = lazy(() => import('../../pages/youth/profile/SkillsInventory.jsx'));

// Training Sub-pages
const BusinessSimulations = lazy(
  () => import('../../pages/youth/training/BusinessSimulations.jsx')
);
const CertificationPrograms = lazy(
  () => import('../../pages/youth/training/CertificationPrograms.jsx')
);
const EntrepreneurshipCourses = lazy(
  () => import('../../pages/youth/training/EntrepreneurshipCourses.jsx')
);
const SkillDevelopment = lazy(() => import('../../pages/youth/training/SkillDevelopment.jsx'));

// Analytics Sub-pages
const BusinessMetrics = lazy(() => import('../../pages/youth/analytics/BusinessMetrics.jsx'));
const GrowthAnalytics = lazy(() => import('../../pages/youth/analytics/GrowthAnalytics.jsx'));
const PerformanceDashboard = lazy(
  () => import('../../pages/youth/analytics/PerformanceDashboard.jsx')
);
const RevenueTracking = lazy(() => import('../../pages/youth/analytics/RevenueTracking.jsx'));

/**
 * Youth Routes Configuration
 * Returns an array of Route components for youth/entrepreneur pages
 */
export const getYouthRoutes = () => {
  const routes = [
    // Youth Dashboard
    <Route
      key="youth-dashboard"
      path="/youth/dashboard"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <YouthDashboard />
        </ProtectedRoute>
      }
    />,

    // Youth Profile Routes
    <Route
      key="youth-profile"
      path="/youth/profile"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <YouthProfile />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-profile-details"
      path="/youth/profile/details"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <YouthProfile />
        </ProtectedRoute>
      }
    />,

    // Profile Sub-pages
    <Route
      key="youth-achievements"
      path="/youth/achievements"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <Achievements />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-portfolio"
      path="/youth/portfolio"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <Portfolio />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-skills"
      path="/youth/skills"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <SkillsInventory />
        </ProtectedRoute>
      }
    />,

    // Business Management
    <Route
      key="youth-business"
      path="/youth/business"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <BusinessCanvas />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-business-ideas"
      path="/youth/business/ideas"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <BusinessIdeas />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-business-plan"
      path="/youth/business/plan"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <BusinessPlan />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-business-pitch"
      path="/youth/business/pitch"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <BusinessPitching />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-startup-registration"
      path="/youth/startup/register"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <StartupRegistration />
        </ProtectedRoute>
      }
    />,

    // Business Model Canvas Components
    <Route
      key="youth-business-model"
      path="/youth/business/model"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <BusinessModelCanvas />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-business-profile"
      path="/youth/business/profile"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <BusinessProfile />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-business-progress"
      path="/youth/business/progress"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <BusinessProgress />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-customer-segmentation"
      path="/youth/business/customer-segmentation"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <CustomerSegmentation />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-financial-projections"
      path="/youth/business/financial-projections"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <FinancialProjections />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-market-analysis"
      path="/youth/business/market-analysis"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <MarketAnalysis />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-revenue-model"
      path="/youth/business/revenue-model"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <RevenueModel />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-value-proposition"
      path="/youth/business/value-proposition"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <ValueProposition />
        </ProtectedRoute>
      }
    />,

    // Funding Opportunities
    <Route
      key="youth-funding"
      path="/youth/funding"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <FundingOpportunities />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-funding-opportunities"
      path="/youth/funding/opportunities"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <FundingOpportunities />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-grants"
      path="/youth/funding/grants"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <GrantsApplications />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-crowdfunding"
      path="/youth/funding/crowdfunding"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <Crowdfunding />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-investors"
      path="/youth/funding/investors"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <InvestorConnections />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-loans"
      path="/youth/funding/loans"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <LoanApplications />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-pitch-deck"
      path="/youth/funding/pitch-deck"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <PitchDeck />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-pitch-deck-builder"
      path="/youth/pitch-deck"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <PitchDeckBuilder />
        </ProtectedRoute>
      }
    />,

    // Mentorship
    <Route
      key="youth-mentor-network"
      path="/youth/mentors"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <MentorNetwork />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-mentorship"
      path="/youth/mentorship"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <MentorshipProgram />
        </ProtectedRoute>
      }
    />,

    // Resources & Learning
    <Route
      key="youth-resources"
      path="/youth/resources"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <ResourceLibrary />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-training"
      path="/youth/training"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <TrainingCourses />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-workshops"
      path="/youth/workshops"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <Workshops />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-success-stories"
      path="/youth/success-stories"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <SuccessStories />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-entrepreneur-network"
      path="/youth/network"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <EntrepreneurNetwork />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-achievement-badge"
      path="/youth/achievements/badge"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <AchievementBadge />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-progress-tracker"
      path="/youth/progress"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <ProgressTracker />
        </ProtectedRoute>
      }
    />,

    // Training Modules
    <Route
      key="youth-business-simulations"
      path="/youth/training/simulations"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <BusinessSimulations />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-certification"
      path="/youth/training/certification"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <CertificationPrograms />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-entrepreneurship-courses"
      path="/youth/training/courses"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <EntrepreneurshipCourses />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-skill-development"
      path="/youth/training/skills"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <SkillDevelopment />
        </ProtectedRoute>
      }
    />,

    // Collaboration
    <Route
      key="youth-coworking"
      path="/youth/collaboration/coworking"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <CoWorkingSpaces />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-coworking-jsx"
      path="/youth/collaboration/spaces"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <CoWorkingSpacesJSX />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-partnerships"
      path="/youth/collaboration/partnerships"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <Partnerships />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-team"
      path="/youth/collaboration/team"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <TeamManagement />
        </ProtectedRoute>
      }
    />,

    // Incubation
    <Route
      key="youth-accelerators"
      path="/youth/incubation/accelerators"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <AcceleratorPrograms />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-incubator-application"
      path="/youth/incubation/apply"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <IncubatorApplication />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-incubation-progress"
      path="/youth/incubation/progress"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <ProgressMonitoring />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-startup-support"
      path="/youth/incubation/support"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <StartupSupport />
        </ProtectedRoute>
      }
    />,

    // Marketplace
    <Route
      key="youth-marketplace"
      path="/youth/marketplace"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <Marketplace />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-marketplace-orders"
      path="/youth/marketplace/orders"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <OrderManagement />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-marketplace-products"
      path="/youth/marketplace/products"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <ProductListing />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-marketplace-services"
      path="/youth/marketplace/services"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <ServiceOffering />
        </ProtectedRoute>
      }
    />,

    // Networking
    <Route
      key="youth-collaboration-opportunities"
      path="/youth/networking/opportunities"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <CollaborationOpportunities />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-forum"
      path="/youth/networking/forum"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <EntrepreneurForum />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-events"
      path="/youth/networking/events"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <IndustryEvents />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-partner-matching"
      path="/youth/networking/matching"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <PartnerMatching />
        </ProtectedRoute>
      }
    />,

    // Analytics
    <Route
      key="youth-analytics"
      path="/youth/analytics"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <PerformanceDashboard />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-business-metrics"
      path="/youth/analytics/metrics"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <BusinessMetrics />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-growth-analytics"
      path="/youth/analytics/growth"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <GrowthAnalytics />
        </ProtectedRoute>
      }
    />,

    <Route
      key="youth-revenue-tracking"
      path="/youth/analytics/revenue"
      element={
        <ProtectedRoute allowedUserTypes={['youth', 'entrepreneur']}>
          <RevenueTracking />
        </ProtectedRoute>
      }
    />,
  ];

  return routes;
};

export default getYouthRoutes;
