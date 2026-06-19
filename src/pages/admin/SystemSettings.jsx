/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Tab,
  Nav,
  Table,
  Modal,
  Badge,
  InputGroup,
  FormControl,
  ProgressBar,
  Accordion,
} from 'react-bootstrap';
import {
  FaCog,
  FaSave,
  FaUndo,
  FaShieldAlt,
  FaDatabase,
  FaServer,
  FaUsers,
  FaBell,
  FaKey,
  FaLock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaCloudUploadAlt,
  FaTrash,
  FaHistory,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import cloudinaryService from '../../services/cloudinaryService';
import './SystemSettings.css';

const SystemSettings = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);

  // System Settings State
  const [settings, setSettings] = useState({
    // General Settings
    general: {
      siteName: 'Career Connect Lesotho',
      siteUrl: 'https://careerconnect-lesotho.web.app',
      adminEmail: 'admin@careerconnectlesotho.com',
      supportEmail: 'support@careerconnectlesotho.com',
      timezone: 'Africa/Maseru',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      maintenanceMode: false,
      enableRegistration: true,
      enableEmailVerification: true,
      defaultUserRole: 'student',
    },

    // Security Settings
    security: {
      requireStrongPasswords: true,
      passwordMinLength: 8,
      maxLoginAttempts: 5,
      lockoutDuration: 30, // minutes
      sessionTimeout: 60, // minutes
      enable2FA: false,
      enableIPWhitelist: false,
      allowedIPs: [],
      enableRateLimiting: true,
      maxRequestsPerMinute: 100,
      enableSecurityHeaders: true,
      enableCORS: true,
    },

    // Email Settings
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      smtpEncryption: 'tls',
      fromName: 'Career Connect Lesotho',
      fromEmail: 'noreply@careerconnectlesotho.com',
      enableEmailNotifications: true,
      emailVerificationTemplate: 'default',
      passwordResetTemplate: 'default',
      welcomeEmailTemplate: 'default',
    },

    // Storage Settings
    storage: {
      maxFileSize: 10, // MB
      allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'],
      maxUserStorage: 100, // MB
      enableCompression: true,
      storageProvider: 'firebase',
      backupFrequency: 'daily',
      keepBackupsFor: 30, // days
      enableAutoCleanup: true,
    },

    // API Settings
    api: {
      enableAPI: true,
      apiVersion: 'v1',
      apiRateLimit: 1000,
      requireApiKey: true,
      enableSwagger: true,
      enableWebhooks: true,
      webhookSecret: '',
      apiKeys: [],
    },

    // Analytics Settings
    analytics: {
      enableAnalytics: true,
      analyticsProvider: 'firebase',
      trackUserBehavior: true,
      trackPageViews: true,
      trackEvents: true,
      dataRetention: 365, // days
      enableGDPRCompliance: true,
      anonymizeIP: true,
    },

    // Notification Settings
    notifications: {
      enablePushNotifications: true,
      enableEmailNotifications: true,
      enableSMSNotifications: false,
      notifyNewRegistrations: true,
      notifyFailedLogins: true,
      notifySystemErrors: true,
      notificationSound: true,
      desktopNotifications: false,
    },
  });

  // New API Key
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: ['read'],
  });

  // Backup/Restore
  const [backupFile, setBackupFile] = useState(null);

  useEffect(() => {
    // Load settings from localStorage or API
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.settings.getSystemSettings();

      if (response.success && response.data?.general) {
        setSettings((prev) => ({ ...prev, ...response.data }));
        localStorage.setItem('systemSettings', JSON.stringify(response.data));
        return;
      }

      const savedSettings = localStorage.getItem('systemSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      if (!validateSettings()) {
        return;
      }

      const response = await adminService.settings.updateSystemSettings(
        settings,
        currentUser,
        userProfile
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to save settings');
      }

      localStorage.setItem('systemSettings', JSON.stringify(settings));
      toast.success('Settings saved to Firebase successfully');
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const validateSettings = () => {
    // Validate email settings
    if (!settings.email.smtpHost || !settings.email.smtpPort) {
      toast.error('SMTP host and port are required');
      return false;
    }

    // Validate API settings
    if (settings.api.enableAPI && !settings.api.apiVersion) {
      toast.error('API version is required when API is enabled');
      return false;
    }

    // Validate storage settings
    if (settings.storage.maxFileSize <= 0) {
      toast.error('Maximum file size must be greater than 0');
      return false;
    }

    return true;
  };

  const resetToDefaults = () => {
    setSettings({
      general: {
        siteName: 'Career Connect Lesotho',
        siteUrl: 'https://careerconnect-lesotho.web.app',
        adminEmail: 'admin@careerconnectlesotho.com',
        supportEmail: 'support@careerconnectlesotho.com',
        timezone: 'Africa/Maseru',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        maintenanceMode: false,
        enableRegistration: true,
        enableEmailVerification: true,
        defaultUserRole: 'student',
      },
      security: {
        requireStrongPasswords: true,
        passwordMinLength: 8,
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        sessionTimeout: 60,
        enable2FA: false,
        enableIPWhitelist: false,
        allowedIPs: [],
        enableRateLimiting: true,
        maxRequestsPerMinute: 100,
        enableSecurityHeaders: true,
        enableCORS: true,
      },
      email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        smtpEncryption: 'tls',
        fromName: 'Career Connect Lesotho',
        fromEmail: 'noreply@careerconnectlesotho.com',
        enableEmailNotifications: true,
        emailVerificationTemplate: 'default',
        passwordResetTemplate: 'default',
        welcomeEmailTemplate: 'default',
      },
      storage: {
        maxFileSize: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'],
        maxUserStorage: 100,
        enableCompression: true,
        storageProvider: 'firebase',
        backupFrequency: 'daily',
        keepBackupsFor: 30,
        enableAutoCleanup: true,
      },
      api: {
        enableAPI: true,
        apiVersion: 'v1',
        apiRateLimit: 1000,
        requireApiKey: true,
        enableSwagger: true,
        enableWebhooks: true,
        webhookSecret: '',
        apiKeys: [],
      },
      analytics: {
        enableAnalytics: true,
        analyticsProvider: 'firebase',
        trackUserBehavior: true,
        trackPageViews: true,
        trackEvents: true,
        dataRetention: 365,
        enableGDPRCompliance: true,
        anonymizeIP: true,
      },
      notifications: {
        enablePushNotifications: true,
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        notifyNewRegistrations: true,
        notifyFailedLogins: true,
        notifySystemErrors: true,
        notificationSound: true,
        desktopNotifications: false,
      },
    });

    setShowResetModal(false);
    toast.info('Settings reset to defaults');
  };

  const generateApiKey = () => {
    if (!newApiKey.name.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    const newKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      key: `cc_${Math.random().toString(36).substr(2, 24)}_${Date.now().toString(36)}`,
      permissions: newApiKey.permissions,
      created: new Date().toISOString(),
      lastUsed: null,
      status: 'active',
    };

    setSettings((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        apiKeys: [...prev.api.apiKeys, newKey],
      },
    }));

    setNewApiKey({
      name: '',
      permissions: ['read'],
    });

    toast.success('New API key generated successfully');
  };

  const revokeApiKey = (keyId) => {
    setSettings((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        apiKeys: prev.api.apiKeys.map((key) =>
          key.id === keyId ? { ...key, status: 'revoked' } : key
        ),
      },
    }));
    toast.warning('API key revoked');
  };

  const deleteApiKey = (keyId) => {
    setSettings((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        apiKeys: prev.api.apiKeys.filter((key) => key.id !== keyId),
      },
    }));
    toast.info('API key deleted');
  };

  const handleBackup = async () => {
    const backupData = {
      settings,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      source: 'admin-system-settings',
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `system-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    try {
      const backupFileForCloud = new File([dataBlob], link.download, {
        type: 'application/json',
        lastModified: Date.now(),
      });

      const upload = await cloudinaryService.uploadToCloudinary(
        backupFileForCloud,
        'career-connect/admin/backups',
        {
          tags: ['admin', 'settings', 'backup'],
          context: `uploaded_by=${currentUser?.uid || 'system'}|backup_type=system_settings`,
        }
      );

      if (upload.success) {
        await adminService.media.registerUpload(
          {
            provider: 'cloudinary',
            folder: 'career-connect/admin/backups',
            url: upload.url,
            publicId: upload.public_id,
            resourceType: upload.resource_type || 'raw',
            bytes: upload.bytes,
            format: upload.format,
            purpose: 'system_settings_backup',
          },
          currentUser,
          userProfile
        );
        toast.success('Backup downloaded and stored in Cloudinary');
        return;
      }

      toast.warning('Backup downloaded locally, but Cloudinary upload failed');
    } catch (error) {
      console.warn('Cloudinary backup upload failed:', error);
      toast.warning('Backup downloaded locally, but Cloudinary upload failed');
    }
  };

  const handleRestore = async () => {
    if (!backupFile) {
      toast.error('Please select a backup file');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target.result);

          // Validate backup file
          if (!backupData.settings || !backupData.timestamp) {
            toast.error('Invalid backup file format');
            return;
          }

          setSettings(backupData.settings);
          setShowBackupModal(false);
          setBackupFile(null);

          toast.success('Settings restored from backup');
        } catch (error) {
          console.error('Error parsing backup file:', error);
          toast.error('Failed to parse backup file');
        }
      };
      reader.readAsText(backupFile);
    } catch (error) {
      console.error('Error reading backup file:', error);
      toast.error('Failed to read backup file');
    }
  };

  const addAllowedIP = (ip) => {
    if (!ip.trim()) return;

    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        allowedIPs: [...prev.security.allowedIPs, ip.trim()],
      },
    }));
  };

  const removeAllowedIP = (index) => {
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        allowedIPs: prev.security.allowedIPs.filter((_, i) => i !== index),
      },
    }));
  };

  const handleSettingChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading system settings...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-3">
            <FaCog className="me-2" /> System Settings
          </h2>
          <p className="text-muted">Configure and manage system-wide settings</p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={() => setShowResetModal(true)}
          >
            <FaUndo className="me-2" /> Reset
          </Button>
          <Button variant="primary" onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-2" /> Save Changes
              </>
            )}
          </Button>
        </Col>
      </Row>

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col md={3}>
            <Card className="sticky-top" style={{ top: '20px' }}>
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="general">
                      <FaCog className="me-2" /> General
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="security">
                      <FaShieldAlt className="me-2" /> Security
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="email">
                      <FaBell className="me-2" /> Email
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="storage">
                      <FaDatabase className="me-2" /> Storage
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="api">
                      <FaServer className="me-2" /> API
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="analytics">
                      <FaUsers className="me-2" /> Analytics
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notifications">
                      <FaBell className="me-2" /> Notifications
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="backup" onClick={() => setShowBackupModal(true)}>
                      <FaCloudUploadAlt className="me-2" /> Backup/Restore
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Tab.Content>
              {/* General Settings Tab */}
              <Tab.Pane eventKey="general">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaCog className="me-2" /> General Settings
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Site Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={settings.general.siteName}
                            onChange={(e) =>
                              handleSettingChange('general', 'siteName', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Site URL</Form.Label>
                          <Form.Control
                            type="url"
                            value={settings.general.siteUrl}
                            onChange={(e) =>
                              handleSettingChange('general', 'siteUrl', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Admin Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={settings.general.adminEmail}
                            onChange={(e) =>
                              handleSettingChange('general', 'adminEmail', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Support Email</Form.Label>
                          <Form.Control
                            type="email"
                            value={settings.general.supportEmail}
                            onChange={(e) =>
                              handleSettingChange('general', 'supportEmail', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Timezone</Form.Label>
                          <Form.Select
                            value={settings.general.timezone}
                            onChange={(e) =>
                              handleSettingChange('general', 'timezone', e.target.value)
                            }
                          >
                            <option value="Africa/Maseru">Africa/Maseru (GMT+2)</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">America/New_York</option>
                            <option value="Europe/London">Europe/London</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Date Format</Form.Label>
                          <Form.Select
                            value={settings.general.dateFormat}
                            onChange={(e) =>
                              handleSettingChange('general', 'dateFormat', e.target.value)
                            }
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Time Format</Form.Label>
                          <Form.Select
                            value={settings.general.timeFormat}
                            onChange={(e) =>
                              handleSettingChange('general', 'timeFormat', e.target.value)
                            }
                          >
                            <option value="24h">24 Hour</option>
                            <option value="12h">12 Hour</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Default User Role</Form.Label>
                          <Form.Select
                            value={settings.general.defaultUserRole}
                            onChange={(e) =>
                              handleSettingChange('general', 'defaultUserRole', e.target.value)
                            }
                          >
                            <option value="student">Student</option>
                            <option value="company">Company</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Check
                          type="switch"
                          id="maintenance-mode"
                          label="Maintenance Mode"
                          checked={settings.general.maintenanceMode}
                          onChange={(e) =>
                            handleSettingChange('general', 'maintenanceMode', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-registration"
                          label="Enable User Registration"
                          checked={settings.general.enableRegistration}
                          onChange={(e) =>
                            handleSettingChange('general', 'enableRegistration', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-email-verification"
                          label="Require Email Verification"
                          checked={settings.general.enableEmailVerification}
                          onChange={(e) =>
                            handleSettingChange(
                              'general',
                              'enableEmailVerification',
                              e.target.checked
                            )
                          }
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Security Settings Tab */}
              <Tab.Pane eventKey="security">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaShieldAlt className="me-2" /> Security Settings
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Password Minimum Length</Form.Label>
                          <Form.Control
                            type="number"
                            min="6"
                            max="32"
                            value={settings.security.passwordMinLength}
                            onChange={(e) =>
                              handleSettingChange(
                                'security',
                                'passwordMinLength',
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Max Login Attempts</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            max="10"
                            value={settings.security.maxLoginAttempts}
                            onChange={(e) =>
                              handleSettingChange(
                                'security',
                                'maxLoginAttempts',
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Lockout Duration (minutes)</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            max="1440"
                            value={settings.security.lockoutDuration}
                            onChange={(e) =>
                              handleSettingChange(
                                'security',
                                'lockoutDuration',
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Session Timeout (minutes)</Form.Label>
                          <Form.Control
                            type="number"
                            min="5"
                            max="1440"
                            value={settings.security.sessionTimeout}
                            onChange={(e) =>
                              handleSettingChange(
                                'security',
                                'sessionTimeout',
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Check
                          type="switch"
                          id="require-strong-passwords"
                          label="Require Strong Passwords"
                          checked={settings.security.requireStrongPasswords}
                          onChange={(e) =>
                            handleSettingChange(
                              'security',
                              'requireStrongPasswords',
                              e.target.checked
                            )
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-2fa"
                          label="Enable Two-Factor Authentication"
                          checked={settings.security.enable2FA}
                          onChange={(e) =>
                            handleSettingChange('security', 'enable2FA', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-ip-whitelist"
                          label="Enable IP Whitelist"
                          checked={settings.security.enableIPWhitelist}
                          onChange={(e) =>
                            handleSettingChange('security', 'enableIPWhitelist', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-rate-limiting"
                          label="Enable Rate Limiting"
                          checked={settings.security.enableRateLimiting}
                          onChange={(e) =>
                            handleSettingChange('security', 'enableRateLimiting', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-security-headers"
                          label="Enable Security Headers"
                          checked={settings.security.enableSecurityHeaders}
                          onChange={(e) =>
                            handleSettingChange(
                              'security',
                              'enableSecurityHeaders',
                              e.target.checked
                            )
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-cors"
                          label="Enable CORS"
                          checked={settings.security.enableCORS}
                          onChange={(e) =>
                            handleSettingChange('security', 'enableCORS', e.target.checked)
                          }
                        />
                      </Col>

                      {settings.security.enableIPWhitelist && (
                        <Col md={12}>
                          <Form.Group>
                            <Form.Label>Allowed IP Addresses</Form.Label>
                            <InputGroup className="mb-2">
                              <FormControl
                                placeholder="Enter IP address (e.g., 192.168.1.1)"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addAllowedIP(e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={() => {
                                  const input = document.querySelector(
                                    'input[placeholder*="IP address"]'
                                  );
                                  addAllowedIP(input.value);
                                  input.value = '';
                                }}
                              >
                                Add
                              </Button>
                            </InputGroup>
                            <div className="d-flex flex-wrap gap-2">
                              {settings.security.allowedIPs.map((ip, index) => (
                                <Badge
                                  key={index}
                                  bg="primary"
                                  className="d-flex align-items-center"
                                >
                                  {ip}
                                  <button
                                    type="button"
                                    className="btn-close btn-close-white ms-2"
                                    style={{ fontSize: '0.5rem' }}
                                    onClick={() => removeAllowedIP(index)}
                                    aria-label="Remove IP"
                                  />
                                </Badge>
                              ))}
                            </div>
                          </Form.Group>
                        </Col>
                      )}
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Email Settings Tab */}
              <Tab.Pane eventKey="email">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaBell className="me-2" /> Email Settings
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Alert variant="warning" className="mb-4">
                      <FaExclamationTriangle className="me-2" />
                      For security, email passwords are not displayed. Enter a new password to
                      update.
                    </Alert>

                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>SMTP Host</Form.Label>
                          <Form.Control
                            type="text"
                            value={settings.email.smtpHost}
                            onChange={(e) =>
                              handleSettingChange('email', 'smtpHost', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>SMTP Port</Form.Label>
                          <Form.Control
                            type="number"
                            value={settings.email.smtpPort}
                            onChange={(e) =>
                              handleSettingChange('email', 'smtpPort', parseInt(e.target.value))
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>SMTP Username</Form.Label>
                          <Form.Control
                            type="text"
                            value={settings.email.smtpUsername}
                            onChange={(e) =>
                              handleSettingChange('email', 'smtpUsername', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>SMTP Password</Form.Label>
                          <InputGroup>
                            <Form.Control
                              type={apiKeyVisible ? 'text' : 'password'}
                              value={settings.email.smtpPassword}
                              onChange={(e) =>
                                handleSettingChange('email', 'smtpPassword', e.target.value)
                              }
                              placeholder="Enter new password to update"
                            />
                            <Button
                              variant="outline-secondary"
                              onClick={() => setApiKeyVisible(!apiKeyVisible)}
                            >
                              {apiKeyVisible ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Encryption</Form.Label>
                          <Form.Select
                            value={settings.email.smtpEncryption}
                            onChange={(e) =>
                              handleSettingChange('email', 'smtpEncryption', e.target.value)
                            }
                          >
                            <option value="tls">TLS</option>
                            <option value="ssl">SSL</option>
                            <option value="none">None</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>From Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={settings.email.fromName}
                            onChange={(e) =>
                              handleSettingChange('email', 'fromName', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Check
                          type="switch"
                          id="enable-email-notifications"
                          label="Enable Email Notifications"
                          checked={settings.email.enableEmailNotifications}
                          onChange={(e) =>
                            handleSettingChange(
                              'email',
                              'enableEmailNotifications',
                              e.target.checked
                            )
                          }
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Storage Settings Tab */}
              <Tab.Pane eventKey="storage">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaDatabase className="me-2" /> Storage Settings
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Maximum File Size (MB)</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            max="100"
                            value={settings.storage.maxFileSize}
                            onChange={(e) =>
                              handleSettingChange(
                                'storage',
                                'maxFileSize',
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Maximum User Storage (MB)</Form.Label>
                          <Form.Control
                            type="number"
                            min="10"
                            max="1000"
                            value={settings.storage.maxUserStorage}
                            onChange={(e) =>
                              handleSettingChange(
                                'storage',
                                'maxUserStorage',
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Backup Frequency</Form.Label>
                          <Form.Select
                            value={settings.storage.backupFrequency}
                            onChange={(e) =>
                              handleSettingChange('storage', 'backupFrequency', e.target.value)
                            }
                          >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Keep Backups For (days)</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            max="365"
                            value={settings.storage.keepBackupsFor}
                            onChange={(e) =>
                              handleSettingChange(
                                'storage',
                                'keepBackupsFor',
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Label>Allowed File Types</Form.Label>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          {['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'].map(
                            (type) => (
                              <Form.Check
                                key={type}
                                type="checkbox"
                                id={`file-type-${type}`}
                                label={`.${type}`}
                                checked={settings.storage.allowedFileTypes.includes(type)}
                                onChange={(e) => {
                                  const newTypes = e.target.checked
                                    ? [...settings.storage.allowedFileTypes, type]
                                    : settings.storage.allowedFileTypes.filter((t) => t !== type);
                                  handleSettingChange('storage', 'allowedFileTypes', newTypes);
                                }}
                                className="me-3"
                              />
                            )
                          )}
                        </div>
                      </Col>
                      <Col md={12}>
                        <Form.Check
                          type="switch"
                          id="enable-compression"
                          label="Enable File Compression"
                          checked={settings.storage.enableCompression}
                          onChange={(e) =>
                            handleSettingChange('storage', 'enableCompression', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-auto-cleanup"
                          label="Enable Automatic Cleanup"
                          checked={settings.storage.enableAutoCleanup}
                          onChange={(e) =>
                            handleSettingChange('storage', 'enableAutoCleanup', e.target.checked)
                          }
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* API Settings Tab */}
              <Tab.Pane eventKey="api">
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <FaServer className="me-2" /> API Settings
                    </h5>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => document.getElementById('generate-api-key').scrollIntoView()}
                    >
                      <FaKey className="me-2" /> Generate API Key
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3 mb-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>API Version</Form.Label>
                          <Form.Control
                            type="text"
                            value={settings.api.apiVersion}
                            onChange={(e) =>
                              handleSettingChange('api', 'apiVersion', e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Rate Limit (requests per minute)</Form.Label>
                          <Form.Control
                            type="number"
                            min="10"
                            max="10000"
                            value={settings.api.apiRateLimit}
                            onChange={(e) =>
                              handleSettingChange('api', 'apiRateLimit', parseInt(e.target.value))
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Check
                          type="switch"
                          id="enable-api"
                          label="Enable API"
                          checked={settings.api.enableAPI}
                          onChange={(e) =>
                            handleSettingChange('api', 'enableAPI', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="require-api-key"
                          label="Require API Key"
                          checked={settings.api.requireApiKey}
                          onChange={(e) =>
                            handleSettingChange('api', 'requireApiKey', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-swagger"
                          label="Enable Swagger Documentation"
                          checked={settings.api.enableSwagger}
                          onChange={(e) =>
                            handleSettingChange('api', 'enableSwagger', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-webhooks"
                          label="Enable Webhooks"
                          checked={settings.api.enableWebhooks}
                          onChange={(e) =>
                            handleSettingChange('api', 'enableWebhooks', e.target.checked)
                          }
                        />
                      </Col>
                    </Row>

                    {/* Generate API Key Section */}
                    <Card id="generate-api-key" className="mb-4">
                      <Card.Header>
                        <h6 className="mb-0">Generate New API Key</h6>
                      </Card.Header>
                      <Card.Body>
                        <Row className="g-3">
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Key Name</Form.Label>
                              <Form.Control
                                type="text"
                                value={newApiKey.name}
                                onChange={(e) =>
                                  setNewApiKey({ ...newApiKey, name: e.target.value })
                                }
                                placeholder="e.g., Production API Key"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group>
                              <Form.Label>Permissions</Form.Label>
                              <div>
                                <Form.Check
                                  type="checkbox"
                                  id="perm-read"
                                  label="Read"
                                  checked={newApiKey.permissions.includes('read')}
                                  onChange={(e) => {
                                    const perms = e.target.checked
                                      ? [...newApiKey.permissions, 'read']
                                      : newApiKey.permissions.filter((p) => p !== 'read');
                                    setNewApiKey({ ...newApiKey, permissions: perms });
                                  }}
                                  className="me-3 d-inline-block"
                                />
                                <Form.Check
                                  type="checkbox"
                                  id="perm-write"
                                  label="Write"
                                  checked={newApiKey.permissions.includes('write')}
                                  onChange={(e) => {
                                    const perms = e.target.checked
                                      ? [...newApiKey.permissions, 'write']
                                      : newApiKey.permissions.filter((p) => p !== 'write');
                                    setNewApiKey({ ...newApiKey, permissions: perms });
                                  }}
                                  className="me-3 d-inline-block"
                                />
                                <Form.Check
                                  type="checkbox"
                                  id="perm-admin"
                                  label="Admin"
                                  checked={newApiKey.permissions.includes('admin')}
                                  onChange={(e) => {
                                    const perms = e.target.checked
                                      ? [...newApiKey.permissions, 'admin']
                                      : newApiKey.permissions.filter((p) => p !== 'admin');
                                    setNewApiKey({ ...newApiKey, permissions: perms });
                                  }}
                                  className="d-inline-block"
                                />
                              </div>
                            </Form.Group>
                          </Col>
                          <Col md={12}>
                            <Button
                              variant="primary"
                              onClick={generateApiKey}
                              disabled={!newApiKey.name.trim()}
                            >
                              <FaKey className="me-2" /> Generate API Key
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    {/* API Keys List */}
                    <Card>
                      <Card.Header>
                        <h6 className="mb-0">API Keys</h6>
                      </Card.Header>
                      <Card.Body>
                        {settings.api.apiKeys.length === 0 ? (
                          <Alert variant="info">
                            No API keys generated yet. Generate your first API key above.
                          </Alert>
                        ) : (
                          <div className="table-responsive">
                            <Table hover>
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Key</th>
                                  <th>Permissions</th>
                                  <th>Created</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {settings.api.apiKeys.map((apiKey) => (
                                  <tr key={apiKey.id}>
                                    <td>{apiKey.name}</td>
                                    <td>
                                      <code
                                        className="text-truncate d-block"
                                        style={{ maxWidth: '200px' }}
                                      >
                                        {apiKey.key}
                                      </code>
                                    </td>
                                    <td>
                                      {apiKey.permissions.map((perm) => (
                                        <Badge key={perm} bg="info" className="me-1">
                                          {perm}
                                        </Badge>
                                      ))}
                                    </td>
                                    <td>{new Date(apiKey.created).toLocaleDateString()}</td>
                                    <td>
                                      <Badge bg={apiKey.status === 'active' ? 'success' : 'danger'}>
                                        {apiKey.status}
                                      </Badge>
                                    </td>
                                    <td>
                                      <div className="btn-group" role="group">
                                        {apiKey.status === 'active' ? (
                                          <Button
                                            variant="outline-warning"
                                            size="sm"
                                            onClick={() => revokeApiKey(apiKey.id)}
                                          >
                                            Revoke
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => deleteApiKey(apiKey.id)}
                                          >
                                            <FaTrash />
                                          </Button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Analytics Settings Tab */}
              <Tab.Pane eventKey="analytics">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaUsers className="me-2" /> Analytics Settings
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Analytics Provider</Form.Label>
                          <Form.Select
                            value={settings.analytics.analyticsProvider}
                            onChange={(e) =>
                              handleSettingChange('analytics', 'analyticsProvider', e.target.value)
                            }
                          >
                            <option value="firebase">Firebase Analytics</option>
                            <option value="google">Google Analytics</option>
                            <option value="custom">Custom</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Data Retention (days)</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            max="730"
                            value={settings.analytics.dataRetention}
                            onChange={(e) =>
                              handleSettingChange(
                                'analytics',
                                'dataRetention',
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Check
                          type="switch"
                          id="enable-analytics"
                          label="Enable Analytics"
                          checked={settings.analytics.enableAnalytics}
                          onChange={(e) =>
                            handleSettingChange('analytics', 'enableAnalytics', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="track-user-behavior"
                          label="Track User Behavior"
                          checked={settings.analytics.trackUserBehavior}
                          onChange={(e) =>
                            handleSettingChange('analytics', 'trackUserBehavior', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="track-page-views"
                          label="Track Page Views"
                          checked={settings.analytics.trackPageViews}
                          onChange={(e) =>
                            handleSettingChange('analytics', 'trackPageViews', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="track-events"
                          label="Track Events"
                          checked={settings.analytics.trackEvents}
                          onChange={(e) =>
                            handleSettingChange('analytics', 'trackEvents', e.target.checked)
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-gdpr"
                          label="GDPR Compliance"
                          checked={settings.analytics.enableGDPRCompliance}
                          onChange={(e) =>
                            handleSettingChange(
                              'analytics',
                              'enableGDPRCompliance',
                              e.target.checked
                            )
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="anonymize-ip"
                          label="Anonymize IP Addresses"
                          checked={settings.analytics.anonymizeIP}
                          onChange={(e) =>
                            handleSettingChange('analytics', 'anonymizeIP', e.target.checked)
                          }
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Notifications Settings Tab */}
              <Tab.Pane eventKey="notifications">
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      <FaBell className="me-2" /> Notification Settings
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Check
                          type="switch"
                          id="enable-push-notifications"
                          label="Enable Push Notifications"
                          checked={settings.notifications.enablePushNotifications}
                          onChange={(e) =>
                            handleSettingChange(
                              'notifications',
                              'enablePushNotifications',
                              e.target.checked
                            )
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-email-notifications"
                          label="Enable Email Notifications"
                          checked={settings.notifications.enableEmailNotifications}
                          onChange={(e) =>
                            handleSettingChange(
                              'notifications',
                              'enableEmailNotifications',
                              e.target.checked
                            )
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="enable-sms-notifications"
                          label="Enable SMS Notifications"
                          checked={settings.notifications.enableSMSNotifications}
                          onChange={(e) =>
                            handleSettingChange(
                              'notifications',
                              'enableSMSNotifications',
                              e.target.checked
                            )
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="notify-new-registrations"
                          label="Notify on New Registrations"
                          checked={settings.notifications.notifyNewRegistrations}
                          onChange={(e) =>
                            handleSettingChange(
                              'notifications',
                              'notifyNewRegistrations',
                              e.target.checked
                            )
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="notify-failed-logins"
                          label="Notify on Failed Login Attempts"
                          checked={settings.notifications.notifyFailedLogins}
                          onChange={(e) =>
                            handleSettingChange(
                              'notifications',
                              'notifyFailedLogins',
                              e.target.checked
                            )
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="notify-system-errors"
                          label="Notify on System Errors"
                          checked={settings.notifications.notifySystemErrors}
                          onChange={(e) =>
                            handleSettingChange(
                              'notifications',
                              'notifySystemErrors',
                              e.target.checked
                            )
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="notification-sound"
                          label="Enable Notification Sound"
                          checked={settings.notifications.notificationSound}
                          onChange={(e) =>
                            handleSettingChange(
                              'notifications',
                              'notificationSound',
                              e.target.checked
                            )
                          }
                          className="mb-3"
                        />
                        <Form.Check
                          type="switch"
                          id="desktop-notifications"
                          label="Enable Desktop Notifications"
                          checked={settings.notifications.desktopNotifications}
                          onChange={(e) =>
                            handleSettingChange(
                              'notifications',
                              'desktopNotifications',
                              e.target.checked
                            )
                          }
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* Reset Settings Modal */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reset Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FaExclamationTriangle className="me-2" />
            Are you sure you want to reset all settings to default values?
          </Alert>
          <p className="text-muted">
            This action cannot be undone. All custom settings will be lost.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={resetToDefaults}>
            <FaUndo className="me-2" /> Reset to Defaults
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Backup/Restore Modal */}
      <Modal show={showBackupModal} onHide={() => setShowBackupModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCloudUploadAlt className="me-2" /> Backup & Restore
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-4">
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Backup Settings</h6>
                </Card.Header>
                <Card.Body className="text-center">
                  <FaDatabase size={48} className="text-primary mb-3" />
                  <p>Create a backup of all system settings.</p>
                  <Button variant="primary" onClick={handleBackup}>
                    <FaCloudUploadAlt className="me-2" /> Create Backup
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h6 className="mb-0">Restore Settings</h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Backup File</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".json"
                      onChange={(e) => setBackupFile(e.target.files[0])}
                    />
                    <Form.Text className="text-muted">
                      Select a previously created backup file (.json)
                    </Form.Text>
                  </Form.Group>
                  <Button
                    variant="success"
                    onClick={handleRestore}
                    disabled={!backupFile}
                    className="w-100"
                  >
                    <FaSync className="me-2" /> Restore from Backup
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBackupModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SystemSettings;
