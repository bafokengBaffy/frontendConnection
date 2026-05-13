import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaBell,
  FaBriefcase,
  FaBuilding,
  FaChartLine,
  FaChalkboardTeacher,
  FaCog,
  FaFileAlt,
  FaGraduationCap,
  FaHome,
  FaRocket,
  FaSchool,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaUsers,
  FaUserShield,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const ROLE_NAVIGATION = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: FaHome },
    { label: 'Pending Approvals', path: '/admin/pending-approvals', icon: FaUsers },
    { label: 'Users', path: '/admin/users', icon: FaUser },
    { label: 'Admin Management', path: '/admin/admins', icon: FaUserShield },
    { label: 'Settings', path: '/admin/settings', icon: FaCog },
  ],
  student: [
    { label: 'Dashboard', path: '/student/dashboard', icon: FaHome },
    { label: 'Jobs', path: '/student/jobs', icon: FaBriefcase },
    { label: 'Applications', path: '/student/applications', icon: FaFileAlt },
    { label: 'Documents', path: '/student/documents', icon: FaFileAlt },
    { label: 'Notifications', path: '/student/notifications', icon: FaBell },
    { label: 'Profile', path: '/student/profile', icon: FaUser },
    { label: 'Settings', path: '/settings', icon: FaCog },
  ],
  company: [
    { label: 'Dashboard', path: '/company/dashboard', icon: FaHome },
    { label: 'Jobs', path: '/company/jobs', icon: FaBriefcase },
    { label: 'Applications', path: '/company/applications', icon: FaFileAlt },
    { label: 'Profile', path: '/company/profile', icon: FaBuilding },
    { label: 'Settings', path: '/company/settings', icon: FaCog },
  ],
  institute: [
    { label: 'Dashboard', path: '/institute/dashboard', icon: FaHome },
    { label: 'Applications', path: '/institute/applications', icon: FaFileAlt },
    { label: 'Profile', path: '/institute/profile', icon: FaSchool },
    { label: 'Settings', path: '/institute/settings', icon: FaCog },
  ],
  mentor: [
    { label: 'Dashboard', path: '/mentor/dashboard', icon: FaHome },
    { label: 'Applications', path: '/mentor/applications', icon: FaFileAlt },
    { label: 'Profile', path: '/mentor/profile', icon: FaChalkboardTeacher },
    { label: 'Sessions', path: '/mentor/sessions', icon: FaUsers },
  ],
  youth: [
    { label: 'Dashboard', path: '/youth/dashboard', icon: FaHome },
    { label: 'Funding', path: '/youth/funding', icon: FaChartLine },
    { label: 'Profile', path: '/youth/profile', icon: FaRocket },
    { label: 'Mentorship', path: '/youth/mentorship', icon: FaUsers },
  ],
  entrepreneur: [
    { label: 'Dashboard', path: '/entrepreneur/dashboard', icon: FaHome },
    { label: 'Hub', path: '/entrepreneur-hub/dashboard', icon: FaChartLine },
    { label: 'Profile', path: '/entrepreneur/profile', icon: FaRocket },
    { label: 'Applications', path: '/entrepreneur-hub/applications', icon: FaFileAlt },
  ],
  parent: [
    { label: 'Dashboard', path: '/parent/dashboard', icon: FaHome },
    { label: 'Student Progress', path: '/parent/student-progress', icon: FaChartLine },
    { label: 'Communication', path: '/parent/communication-hub', icon: FaUsers },
  ],
  alumni: [
    { label: 'Dashboard', path: '/alumni/dashboard', icon: FaHome },
    { label: 'Profile', path: '/alumni/profile', icon: FaGraduationCap },
    { label: 'Network', path: '/alumni/network', icon: FaUsers },
  ],
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CC';

const roleLabel = (userProfile) => {
  if (!userProfile?.userType) return 'Member';
  return userProfile.userType.charAt(0).toUpperCase() + userProfile.userType.slice(1);
};

const Layout = ({ children }) => {
  const { userProfile, currentUser, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = useMemo(() => {
    const userType = userProfile?.userType || 'student';
    return ROLE_NAVIGATION[userType] || ROLE_NAVIGATION.student;
  }, [userProfile?.userType]);

  const displayName =
    userProfile?.displayName ||
    userProfile?.fullName ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Career Connect User';

  const pageTitle = useMemo(() => {
    const activeItem = navigationItems.find(
      (item) =>
        location.pathname === item.path ||
        (item.path !== '/' && location.pathname.startsWith(`${item.path}/`))
    );
    return activeItem?.label || 'Workspace';
  }, [location.pathname, navigationItems]);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const renderSidebar = () => (
    <>
      <div className="app-shell__brand">
        <div className="app-shell__brand-mark">CC</div>
        <div>
          <div className="app-shell__brand-title">Career Connect</div>
          <div className="app-shell__brand-subtitle">Lesotho workspace</div>
        </div>
      </div>

      <div className="app-shell__profile">
        <div className="app-shell__avatar">{getInitials(displayName)}</div>
        <div className="app-shell__profile-copy">
          <strong>{displayName}</strong>
          <span>{currentUser?.email}</span>
          <em>{roleLabel(userProfile)}</em>
        </div>
      </div>

      <nav className="app-shell__nav" aria-label="Primary">
        {navigationItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `app-shell__nav-link${isActive ? ' app-shell__nav-link--active' : ''}`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button type="button" className="app-shell__logout" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Sign out</span>
      </button>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">{renderSidebar()}</aside>

      <div className="app-shell__mobile-topbar">
        <button
          type="button"
          className="app-shell__menu-button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <FaBars />
        </button>
        <div className="app-shell__mobile-title">
          <strong>{pageTitle}</strong>
          <span>{roleLabel(userProfile)}</span>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="app-shell__overlay"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          />
          <aside className="app-shell__mobile-drawer">
            <div className="app-shell__mobile-drawer-header">
              <span>Navigation</span>
              <button
                type="button"
                className="app-shell__menu-button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <FaTimes />
              </button>
            </div>
            {renderSidebar()}
          </aside>
        </>
      )}

      <main className="app-shell__content">
        <div className="app-shell__content-inner">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
