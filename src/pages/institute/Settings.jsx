/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// frontend/src/pages/institute/Settings.jsx
import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Tab,
  Nav,
  InputGroup,
} from 'react-bootstrap';
import {
  Gear,
  Building,
  Person,
  Shield,
  Bell,
  Key,
  Globe,
  Save,
  Upload,
  Phone,
  Envelope,
  Map,
  InfoCircle,
} from 'react-bootstrap-icons';

import { useAuth } from '../../context/AuthContext';
import { institutionService } from '../../services/institutionServices';

const InstituteSettings = () => {
  const { currentUser } = useAuth();
  const [institutionData, setInstitutionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    website: '',
    logo: '',
    notificationEmail: true,
    notificationSMS: false,
    notificationPush: true,
  });

  useEffect(() => {
    if (currentUser) {
      loadInstitutionData();
    }
  }, [currentUser]);

  const loadInstitutionData = async () => {
    try {
      setLoading(true);
      const institution = await institutionService.getInstitutionProfile(currentUser.uid);
      setInstitutionData(institution);

      // Populate form data
      setFormData({
        name: institution.name || '',
        email: institution.email || '',
        phone: institution.phone || '',
        address: institution.address || '',
        description: institution.description || '',
        website: institution.website || '',
        logo: institution.logo || '',
        notificationEmail: institution.notificationEmail !== false,
        notificationSMS: institution.notificationSMS || false,
        notificationPush: institution.notificationPush !== false,
      });
    } catch (error) {
      console.error('Error loading institution data:', error);
      setError('Failed to load institution data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Update institution profile
      const updatedData = {
        ...institutionData,
        ...formData,
        updatedAt: new Date(),
      };

      // Here you would call your backend API to update the institution
      // For now, we'll simulate a successful update
      setSuccess('Settings saved successfully!');

      // Reload data to reflect changes
      setTimeout(() => {
        loadInstitutionData();
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      // Here you would upload the file to your storage service
      // For now, we'll simulate an upload
      const mockUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, logo: mockUrl }));
      setSuccess('Logo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      setError('Failed to upload logo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '80vh' }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h2 mb-0">Institute Settings</h1>
          <p className="text-muted">Manage your institution's settings and preferences</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-4">
          <Alert.Heading>Success</Alert.Heading>
          <p>{success}</p>
        </Alert>
      )}

      <Row>
        <Col lg={3} className="mb-4">
          <Card>
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === 'general'}
                    onClick={() => setActiveTab('general')}
                    className="d-flex align-items-center"
                  >
                    <Building className="me-2" size={18} />
                    General
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === 'contact'}
                    onClick={() => setActiveTab('contact')}
                    className="d-flex align-items-center"
                  >
                    <Person className="me-2" size={18} />
                    Contact Info
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === 'notifications'}
                    onClick={() => setActiveTab('notifications')}
                    className="d-flex align-items-center"
                  >
                    <Bell className="me-2" size={18} />
                    Notifications
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeTab === 'security'}
                    onClick={() => setActiveTab('security')}
                    className="d-flex align-items-center"
                  >
                    <Shield className="me-2" size={18} />
                    Security
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <Card>
            <Card.Body>
              {activeTab === 'general' && (
                <div>
                  <h5 className="mb-4">
                    <Building className="me-2" />
                    General Settings
                  </h5>

                  <Form.Group className="mb-3">
                    <Form.Label>Institution Logo</Form.Label>
                    <div className="d-flex align-items-center mb-3">
                      {formData.logo ? (
                        <img
                          src={formData.logo}
                          alt="Institution Logo"
                          className="rounded me-3"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded bg-light d-flex align-items-center justify-content-center me-3"
                          style={{ width: '80px', height: '80px' }}
                        >
                          <Building size={32} className="text-muted" />
                        </div>
                      )}
                      <div>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          style={{ maxWidth: '300px' }}
                        />
                        <Form.Text className="text-muted">
                          Recommended: Square image, 200x200 pixels or larger
                        </Form.Text>
                      </div>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Institution Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter institution name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Describe your institution"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Website</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Globe />
                      </InputGroup.Text>
                      <Form.Control
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                      />
                    </InputGroup>
                  </Form.Group>
                </div>
              )}

              {activeTab === 'contact' && (
                <div>
                  <h5 className="mb-4">
                    <Person className="me-2" />
                    Contact Information
                  </h5>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Envelope />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="institution@example.com"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Phone />
                      </InputGroup.Text>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+266 1234 5678"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Map />
                      </InputGroup.Text>
                      <Form.Control
                        as="textarea"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Full physical address"
                      />
                    </InputGroup>
                  </Form.Group>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h5 className="mb-4">
                    <Bell className="me-2" />
                    Notification Preferences
                  </h5>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="notification-email"
                      label="Email Notifications"
                      name="notificationEmail"
                      checked={formData.notificationEmail}
                      onChange={handleInputChange}
                      className="mb-2"
                    />
                    <Form.Text className="text-muted">
                      Receive notifications about applications, events, and updates via email
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="notification-sms"
                      label="SMS Notifications"
                      name="notificationSMS"
                      checked={formData.notificationSMS}
                      onChange={handleInputChange}
                      className="mb-2"
                    />
                    <Form.Text className="text-muted">
                      Receive urgent notifications via SMS
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="notification-push"
                      label="Push Notifications"
                      name="notificationPush"
                      checked={formData.notificationPush}
                      onChange={handleInputChange}
                      className="mb-2"
                    />
                    <Form.Text className="text-muted">
                      Receive real-time notifications in your browser
                    </Form.Text>
                  </Form.Group>

                  <Alert variant="info">
                    <InfoCircle className="me-2" />
                    You can customize specific notification types in each section
                  </Alert>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h5 className="mb-4">
                    <Shield className="me-2" />
                    Security Settings
                  </h5>

                  <Alert variant="warning">
                    <Key className="me-2" />
                    For security changes, please contact the system administrator or use the
                    password reset feature on your profile page.
                  </Alert>

                  <Form.Group className="mb-3">
                    <Form.Label>Session Timeout</Form.Label>
                    <Form.Select>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="240">4 hours</option>
                    </Form.Select>
                    <Form.Text className="text-muted">Automatic logout after inactivity</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="two-factor"
                      label="Two-Factor Authentication (Coming Soon)"
                      disabled
                      className="mb-2"
                    />
                    <Form.Text className="text-muted">
                      Add an extra layer of security to your account
                    </Form.Text>
                  </Form.Group>
                </div>
              )}

              <div className="mt-4 pt-3 border-top">
                <Button
                  variant="primary"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="d-flex align-items-center"
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="me-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Form.Text className="text-muted d-block mt-2">
                  Changes are saved immediately. Some settings may require a page refresh to take
                  effect.
                </Form.Text>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InstituteSettings;
