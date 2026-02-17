import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, updateProfile } from 'firebase/auth';
import { db } from '../../config/firebase';

function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    industry: '',
    size: '',
    foundedYear: '',
    description: '',
    contactPerson: '',
    contactPosition: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const docRef = doc(db, 'companies', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile({
            companyName: docSnap.data().companyName || '',
            email: docSnap.data().email || user.email || '',
            phone: docSnap.data().phone || '',
            address: docSnap.data().address || '',
            website: docSnap.data().website || '',
            industry: docSnap.data().industry || '',
            size: docSnap.data().size || '',
            foundedYear: docSnap.data().foundedYear || '',
            description: docSnap.data().description || '',
            contactPerson: docSnap.data().contactPerson || '',
            contactPosition: docSnap.data().contactPosition || ''
          });
        } else {
          // Create initial profile with user data
          setProfile({
            ...profile,
            email: user.email || '',
            companyName: user.displayName || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!profile.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // Update Firestore document
        const docRef = doc(db, 'companies', user.uid);
        await updateDoc(docRef, {
          ...profile,
          updatedAt: new Date(),
          uid: user.uid
        });

        // Update Firebase Auth profile
        await updateProfile(user, {
          displayName: profile.companyName
        });

        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading Profile...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="h2 mb-4">Company Profile</h1>
      
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Company Information</Card.Title>
              
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="companyName"
                        value={profile.companyName}
                        onChange={handleChange}
                        isInvalid={!!errors.companyName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.companyName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="+266 1234 5678"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Website</Form.Label>
                      <Form.Control
                        type="url"
                        name="website"
                        value={profile.website}
                        onChange={handleChange}
                        placeholder="https://example.com"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    placeholder="Company address"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Industry *</Form.Label>
                      <Form.Select
                        name="industry"
                        value={profile.industry}
                        onChange={handleChange}
                        isInvalid={!!errors.industry}
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Retail">Retail</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Tourism">Tourism</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.industry}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Size</Form.Label>
                      <Form.Select
                        name="size"
                        value={profile.size}
                        onChange={handleChange}
                      >
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Founded Year</Form.Label>
                      <Form.Control
                        type="number"
                        name="foundedYear"
                        value={profile.foundedYear}
                        onChange={handleChange}
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="YYYY"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Person</Form.Label>
                      <Form.Control
                        type="text"
                        name="contactPerson"
                        value={profile.contactPerson}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Contact Position</Form.Label>
                  <Form.Control
                    type="text"
                    name="contactPosition"
                    value={profile.contactPosition}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Company Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={profile.description}
                    onChange={handleChange}
                    placeholder="Describe your company's mission, values, and what you do..."
                  />
                </Form.Group>

                {errors.submit && (
                  <Alert variant="danger" className="mb-3">
                    {errors.submit}
                  </Alert>
                )}

                <div className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '120px', height: '120px' }}>
                  <span className="text-white display-4">
                    {profile.companyName?.charAt(0) || 'C'}
                  </span>
                </div>
              </div>
              <h3>{profile.companyName || 'Company Name'}</h3>
              <p className="text-muted">{profile.industry || 'Industry'}</p>
              <Button variant="outline-primary" className="w-100 mb-2">
                Upload Logo
              </Button>
              <Button variant="outline-secondary" className="w-100">
                Change Cover Photo
              </Button>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Company Stats</Card.Title>
              <div className="d-flex justify-content-between mb-2">
                <span>Jobs Posted</span>
                <strong>12</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Active Jobs</span>
                <strong>8</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Applicants</span>
                <strong>156</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Member Since</span>
                <strong>2024</strong>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Account Settings</Card.Title>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Notification Preferences</Form.Label>
                  <Form.Check 
                    type="checkbox" 
                    label="Email notifications" 
                    defaultChecked 
                  />
                  <Form.Check 
                    type="checkbox" 
                    label="SMS notifications" 
                  />
                  <Form.Check 
                    type="checkbox" 
                    label="Job application alerts" 
                    defaultChecked 
                  />
                </Form.Group>
                <Button variant="outline-primary" className="w-100">
                  Manage Settings
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CompanyProfile;