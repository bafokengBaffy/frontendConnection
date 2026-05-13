import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';

import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

const AdminManagement = () => {
  const { currentUser, userProfile } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', displayName: '', adminLevel: 'admin' });

  const isSuperAdmin = useMemo(() => {
    const email = String(currentUser?.email || '').toLowerCase();
    const ownerEmail = String(import.meta.env.VITE_SUPER_ADMIN_EMAIL || '').toLowerCase();
    return userProfile?.adminLevel === 'super_admin' || (ownerEmail && ownerEmail === email);
  }, [currentUser?.email, userProfile?.adminLevel]);

  const loadAdmins = async () => {
    setLoading(true);
    const response = await adminService.admins.getAllAdmins();
    if (response.success) {
      setAdmins(response.data || []);
      setError('');
    } else {
      setError(response.error || 'Failed to fetch admins');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    if (!isSuperAdmin) return;
    setSaving(true);
    const result = await adminService.admins.createAdmin(form, currentUser, userProfile);
    setSaving(false);
    if (!result.success) {
      setError(result.error || 'Failed to create admin');
      return;
    }
    setForm({ email: '', displayName: '', adminLevel: 'admin' });
    await loadAdmins();
  };

  const handleSuspend = async (adminId) => {
    if (!isSuperAdmin) return;
    const result = await adminService.admins.deactivateAdmin(adminId, currentUser, userProfile);
    if (!result.success) {
      setError(result.error || 'Failed to deactivate admin');
      return;
    }
    await loadAdmins();
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Admin Management</h1>
          <p className="text-muted mb-0">Owner-level control for admin accounts and permissions.</p>
        </div>
        <Badge bg={isSuperAdmin ? 'success' : 'secondary'}>
          {isSuperAdmin ? 'Super Admin' : 'Admin'}
        </Badge>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {isSuperAdmin && (
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Create Admin</Card.Title>
            <Form onSubmit={handleCreateAdmin}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@careerconnect.co.ls"
                    required
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    value={form.displayName}
                    onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Display name"
                  />
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={form.adminLevel}
                    onChange={(e) => setForm((prev) => ({ ...prev, adminLevel: e.target.value }))}
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Button type="submit" className="w-100" disabled={saving}>
                    {saving ? 'Saving...' : 'Create'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Body>
          <Card.Title>Current Admins</Card.Title>
          {loading ? (
            <div className="py-4 text-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((adminRow) => (
                  <tr key={adminRow.id}>
                    <td>{adminRow.displayName || 'Admin User'}</td>
                    <td>{adminRow.email || 'N/A'}</td>
                    <td>
                      <Badge bg={adminRow.role === 'super_admin' ? 'dark' : 'primary'}>
                        {adminRow.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </td>
                    <td>{adminRow.status || 'active'}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={!isSuperAdmin || adminRow.role === 'super_admin'}
                        onClick={() => handleSuspend(adminRow.id)}
                      >
                        Suspend
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminManagement;
