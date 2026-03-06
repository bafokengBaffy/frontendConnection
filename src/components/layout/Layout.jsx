/* eslint-disable no-empty-pattern */
import React, { useState, useEffect } from 'react';
import { Button, Badge, Image } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './Layout.css';

const Layout = ({ children }) => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activePath, setActivePath] = useState('/dashboard');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            // Set default data if document doesn't exist
            setUserData({
              name: user.displayName || 'User Name',
              email: user.email,
              userType: 'student',
              photoURL: user.photoURL,
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
    setOpenDropdown(null);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
    setOpenDropdown(null);
  };

  // Update active path when location changes
  useEffect(() => {
    setActivePath(location.pathname);
    // Close mobile sidebar on route change
    if (isMobile) {
      closeMobileSidebar();
    }
  }, [location, isMobile]);

  // Get user type from user data
  const getUserType = () => {
    if (!userData) return 'student';
    return userData.userType || 'student';
  };

  // Helper function to get user-specific dashboard path
  const getUserDashboardPath = (userType) => {
    switch (userType) {
      case 'student':
        return '/student/dashboard';
      case 'company':
        return '/company/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  };

  // User avatar placeholder based on user type
  const getUserAvatar = () => {
    const avatars = {
      student: 'bi-person-badge',
      company: 'bi-building',
      admin: 'bi-shield-check',
    };
    return avatars[getUserType()] || 'bi-person-circle';
  };

  // User role badge
  const getUserRoleBadge = () => {
    const roleColors = {
      student: 'success',
      company: 'primary',
      admin: 'warning',
    };
    const roleLabels = {
      student: 'Student',
      company: 'Company',
      admin: 'Admin',
    };

    const userType = getUserType();
    return (
      <Badge bg={roleColors[userType]} className="ms-2 role-badge">
        {roleLabels[userType]}
      </Badge>
    );
  };

  // Toggle mobile dropdown
  const toggleMobileDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  // Toggle desktop dropdown
  const toggleDesktopDropdown = (label) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Get optimized navigation structure - FIXED ROUTING PATHS
  const getOptimizedNavigation = () => {
    const userType = getUserType();

    // Define user-specific dashboard path
    const userDashboardPath = getUserDashboardPath(userType);

    // Base navigation structure for all users
    const baseNavigation = [
      {
        icon: 'bi-house-door',
        label: 'Dashboard',
        path: userDashboardPath,
        exact: true,
      },
      {
        icon: 'bi-search',
        label: 'Search',
        path: '#',
        items: [], // Will be populated based on user type
      },
      {
        icon: 'bi-bell',
        label: 'Notifications',
        path: '/notifications',
        badge: 0,
      },
      {
        icon: 'bi-person',
        label: 'Profile',
        path: '#',
        items: [], // Will be populated based on user type
      },
    ];

    // Define dropdown items for each main nav item based on user type
    // FIXED: Correct routing paths based on your file structure
    // In your Layout.jsx, update the searchItems and profileItems sections:

    const searchItems = {
      student: [
        { icon: 'bi-search', label: 'Find Jobs', path: '/student/jobs' },
        { icon: 'bi-briefcase', label: 'Internships', path: '/student/search/internships' },
      ],
      company: [
        { icon: 'bi-search', label: 'Find Candidates', path: '/company/search/students' },
        { icon: 'bi-briefcase', label: 'Market Research', path: '/company/search/market' },
        { icon: 'bi-handshake', label: 'Find Partners', path: '/company/search/partners' },
        { icon: 'bi-people', label: 'Browse Candidates', path: '/company/browse-candidates' },
      ],
      admin: [
        { icon: 'bi-search', label: 'Search Users', path: '/admin/search/users' },
        { icon: 'bi-building', label: 'Search Companies', path: '/admin/search/companies' },
        { icon: 'bi-file-text', label: 'Search Applications', path: '/admin/search/applications' },
      ],
    };

    const profileItems = {
      student: [
        { icon: 'bi-person-circle', label: 'My Profile', path: '/student/profile' },
        { icon: 'bi-file-text', label: 'My Applications', path: '/student/applications' },
        { icon: 'bi-folder', label: 'My Documents', path: '/student/documents' },
        { icon: 'bi-gear', label: 'Settings', path: '/settings' },
        { icon: 'bi-box-arrow-right', label: 'Logout', action: handleLogout },
      ],
      company: [
        { icon: 'bi-building', label: 'Company Profile', path: '/company/profile' },
        { icon: 'bi-file-text', label: 'Job Postings', path: '/company/jobs' },
        { icon: 'bi-people', label: 'Candidates', path: '/company/candidates' },
        { icon: 'bi-gear', label: 'Settings', path: '/settings' },
        { icon: 'bi-box-arrow-right', label: 'Logout', action: handleLogout },
      ],
      admin: [
        { icon: 'bi-shield-check', label: 'Admin Profile', path: '/admin/profile' },
        { icon: 'bi-people', label: 'User Management', path: '/admin/users' },
        { icon: 'bi-building', label: 'Company Management', path: '/admin/companies' },
        { icon: 'bi-gear', label: 'System Settings', path: '/admin/settings' },
        { icon: 'bi-box-arrow-right', label: 'Logout', action: handleLogout },
      ],
    };
    // Update navigation with user-specific dropdown items
    const updatedNavigation = [...baseNavigation];

    // Add search dropdown items
    const searchItem = updatedNavigation.find((item) => item.label === 'Search');
    if (searchItem) {
      searchItem.items = searchItems[userType] || searchItems.student;
    }

    // Add profile dropdown items
    const profileItem = updatedNavigation.find((item) => item.label === 'Profile');
    if (profileItem) {
      profileItem.items = profileItems[userType] || profileItems.student;
    }

    return updatedNavigation;
  };

  const navigation = getOptimizedNavigation();

  // Helper function to check if path is active
  const isPathActive = (item) => {
    if (item.exact) {
      return activePath === item.path;
    }
    return activePath.startsWith(item.path);
  };

  // Render desktop sidebar navigation with static dropdowns
  const renderDesktopSidebar = () => (
    <aside className={`layout-sidebar ${isMobile ? 'mobile-hidden' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo p-4 text-center">
        <div className="logo-container mb-3">
          <div className="logo-circle">
            <i className="bi bi-link-45deg logo-icon"></i>
          </div>
        </div>
        <h4 className="mb-1 fw-bold logo-text">CareerConnectLS</h4>
        <div className="status-badge">
          <span className="live-dot"></span>
          <small className="text-muted ms-2">Live Platform</small>
        </div>
      </div>

      {/* User Profile */}
      <div className="user-profile-section p-4">
        <div className="profile-card p-3">
          <div className="d-flex align-items-center mb-3">
            {userData?.photoURL ? (
              <Image
                src={userData.photoURL}
                roundedCircle
                width={60}
                height={60}
                className="me-3 profile-img"
                alt="Profile"
              />
            ) : (
              <div className="profile-avatar me-3">
                <i className={`bi ${getUserAvatar()} fs-2`}></i>
              </div>
            )}
            <div className="flex-grow-1">
              <div className="fw-bold user-name">{userData?.name || 'Loading...'}</div>
              <div className="small text-muted user-email">
                {userData?.email || 'user@example.com'}
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            {getUserRoleBadge()}
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleLogout}
              className="logout-btn"
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav-content flex-grow-1 p-3">
        <nav className="nav flex-column gap-2">
          {navigation.map((item, index) => {
            if (item.items && item.items.length > 0) {
              const isDropdownOpen = dropdownOpen[item.label];

              return (
                <div key={index} className="mb-1">
                  <div
                    className={`sidebar-dropdown-toggle w-100 text-start d-flex align-items-center justify-content-between p-3 ${isDropdownOpen ? 'active' : ''}`}
                    onClick={() => toggleDesktopDropdown(item.label)}
                    style={{
                      cursor: 'pointer',
                      background: 'transparent',
                      border: '1px solid transparent',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="nav-icon-container">
                        <i className={`bi ${item.icon} me-3`}></i>
                      </div>
                      <span className="nav-label">{item.label}</span>
                    </div>
                    <i
                      className={`bi ${isDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'} dropdown-arrow`}
                    ></i>
                  </div>

                  {isDropdownOpen && (
                    <div className="dropdown-menu-static">
                      {item.items.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          onClick={subItem.action || undefined}
                          className={`dropdown-item-static d-flex align-items-center py-2 px-3 ${
                            activePath === subItem.path ? 'active' : ''
                          }`}
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            margin: '2px 4px',
                            borderRadius: '6px',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <i className={`bi ${subItem.icon} me-3`}></i>
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`nav-link sidebar-link d-flex align-items-center justify-content-between p-3 rounded ${
                    isPathActive(item) ? 'active' : ''
                  }`}
                >
                  <div className="d-flex align-items-center">
                    <div className="nav-icon-container">
                      <i className={`bi ${item.icon} me-3`}></i>
                    </div>
                    <span className="nav-label">{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <Badge bg="danger" pill className="notification-badge">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            }
          })}
        </nav>
      </div>

      {/* Platform Status */}
      <div className="platform-status p-4 border-top">
        <div className="d-flex align-items-center justify-content-center">
          <div className="status-indicator">
            <span className="pulse-dot"></span>
          </div>
          <span className="ms-2 small text-muted">System Online</span>
        </div>
      </div>
    </aside>
  );

  // Render mobile sidebar (overlay style)
  const renderMobileSidebar = () => (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={`mobile-sidebar-overlay ${isMobileSidebarOpen ? 'show' : ''}`}
        onClick={closeMobileSidebar}
      />

      {/* Mobile Sidebar */}
      <aside className={`mobile-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <div className="d-flex align-items-center justify-content-between p-3">
            <div className="d-flex align-items-center">
              <div className="logo-circle-sm me-2">
                <i className="bi bi-link-45deg logo-icon"></i>
              </div>
              <div>
                <span className="fw-bold logo-text">CareerConnectLS</span>
                <div className="status-badge-sm">
                  <span className="live-dot-sm"></span>
                  <small className="text-muted ms-1">Live</small>
                </div>
              </div>
            </div>
            <Button variant="link" className="text-dark p-0" onClick={toggleMobileSidebar}>
              <i className="bi bi-x-lg fs-4"></i>
            </Button>
          </div>
        </div>

        <div className="mobile-sidebar-content">
          {/* Mobile User Info */}
          <div className="user-info p-3 mb-3">
            <div className="d-flex align-items-center mb-3">
              {userData?.photoURL ? (
                <Image
                  src={userData.photoURL}
                  roundedCircle
                  width={50}
                  height={50}
                  className="me-3 profile-img"
                  alt="Profile"
                />
              ) : (
                <div className="profile-avatar-sm me-3">
                  <i className={`bi ${getUserAvatar()}`}></i>
                </div>
              )}
              <div className="flex-grow-1">
                <div className="fw-bold user-name-sm">{userData?.name || 'Loading...'}</div>
                <div className="text-muted small user-email">
                  {userData?.email || 'user@example.com'}
                </div>
                {getUserRoleBadge()}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="nav flex-column gap-1 mb-3 px-2">
            {navigation.map((item, index) => (
              <div key={index} className="mb-1">
                {item.items && item.items.length > 0 ? (
                  <div className="mobile-dropdown-section">
                    <div
                      className={`nav-link d-flex align-items-center justify-content-between p-3 rounded ${openDropdown === item.label ? 'active' : ''}`}
                      onClick={() => toggleMobileDropdown(item.label)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="nav-icon-container">
                          <i className={`bi ${item.icon} me-3`}></i>
                        </div>
                        <span className="nav-label">{item.label}</span>
                      </div>
                      <i
                        className={`bi ${openDropdown === item.label ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                      ></i>
                    </div>

                    {openDropdown === item.label && (
                      <div className="mobile-dropdown-content slide-in">
                        {item.items.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            onClick={() => {
                              if (subItem.action) subItem.action();
                              closeMobileSidebar();
                            }}
                            className={`nav-link d-flex align-items-center py-2 px-4 ${
                              activePath === subItem.path ? 'active-sub' : ''
                            }`}
                          >
                            <i className={`bi ${subItem.icon} me-3`}></i>
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={`nav-link d-flex align-items-center justify-content-between p-3 rounded ${
                      isPathActive(item) ? 'active' : ''
                    }`}
                  >
                    <div className="d-flex align-items-center">
                      <div className="nav-icon-container">
                        <i className={`bi ${item.icon} me-3`}></i>
                      </div>
                      <span className="nav-label">{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <Badge bg="danger" pill className="notification-badge">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )}
              </div>
            ))}

            {/* Logout Button */}
            <div className="mt-4 px-2">
              <Button
                variant="outline-primary"
                className="w-100 logout-btn"
                onClick={() => {
                  handleLogout();
                  closeMobileSidebar();
                }}
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Sign Out
              </Button>
            </div>
          </nav>

          {/* Platform Status */}
          <div className="platform-status-mobile p-3 border-top mt-3">
            <div className="d-flex align-items-center justify-content-center">
              <div className="status-indicator">
                <span className="pulse-dot"></span>
              </div>
              <span className="ms-2 small text-muted">System Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );

  // Mobile Header with hamburger menu
  const renderMobileHeader = () => (
    <header className="mobile-header d-md-none">
      <div className="d-flex align-items-center justify-content-between p-3">
        <Button variant="link" className="text-dark p-0" onClick={toggleMobileSidebar}>
          <i className="bi bi-list fs-3"></i>
        </Button>

        <div className="d-flex align-items-center">
          <div className="mobile-logo-circle me-2">
            <i className="bi bi-link-45deg logo-icon"></i>
          </div>
          <span className="fw-bold logo-text-sm">CareerConnectLS</span>
        </div>

        <div className="user-avatar-mobile">
          {userData?.photoURL ? (
            <Image
              src={userData.photoURL}
              roundedCircle
              width={40}
              height={40}
              className="profile-img-sm"
              alt="Profile"
            />
          ) : (
            <div className="profile-avatar-sm">
              <i className={`bi ${getUserAvatar()}`}></i>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  return (
    <div className="layout-container">
      {/* Mobile Header */}
      {isMobile && renderMobileHeader()}

      {/* Main Layout */}
      <div className="layout-main-container">
        {/* Desktop Sidebar */}
        {renderDesktopSidebar()}

        {/* Mobile Sidebar */}
        {isMobile && renderMobileSidebar()}

        {/* Main Content Area */}
        <main
          className={`layout-content-area ${isMobile ? 'mobile' : ''} ${isMobileSidebarOpen ? 'shifted' : ''}`}
        >
          <div className="content-wrapper">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
