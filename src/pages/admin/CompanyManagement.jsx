import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import {
  FaBuilding,
  FaCheckCircle,
  FaDownload,
  FaEnvelope,
  FaExternalLinkAlt,
  FaIndustry,
  FaSearch,
  FaSync,
  FaTimesCircle,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

const statusMeta = {
  approved: { label: 'Approved', variant: 'success' },
  active: { label: 'Active', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  rejected: { label: 'Rejected', variant: 'danger' },
  suspended: { label: 'Suspended', variant: 'dark' },
};

const formatDate = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const CompanyManagement = () => {
  const { currentUser, userProfile } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const loadCompanies = useCallback(async () => {
    setError('');
    setLoading(true);
    const response = await adminService.companies.getAllCompanies({ search, status }, 1, 100);
    if (response.success) {
      setCompanies(response.data.companies || []);
    } else {
      setError(response.error || 'Failed to load companies');
    }
    setLoading(false);
    setRefreshing(false);
  }, [search, status]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const summary = useMemo(
    () => ({
      total: companies.length,
      pending: companies.filter((company) => ['pending', 'awaiting_approval'].includes(company.status)).length,
      approved: companies.filter((company) => ['approved', 'active'].includes(company.status)).length,
      suspended: companies.filter((company) => company.status === 'suspended').length,
    }),
    [companies]
  );

  const approveCompany = async (companyId) => {
    const response = await adminService.companies.approveCompany(companyId, currentUser, userProfile);
    if (response.success) {
      await loadCompanies();
    } else {
      setError(response.error || 'Failed to approve company');
    }
  };

  const exportCsv = () => {
    const headers = ['Company', 'Email', 'Industry', 'Status', 'Created'];
    const rows = companies.map((company) => [
      company.companyName || company.name || '',
      company.email || '',
      company.industry || '',
      company.status || '',
      formatDate(company.createdAt),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `companies-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container fluid className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="mb-1"><FaBuilding className="me-2" />Company Management</h2>
          <p className="text-muted mb-0">Review employer profiles, verification status, and approval readiness.</p>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={exportCsv} disabled={!companies.length}>
            <FaDownload className="me-2" />Export
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => {
              setRefreshing(true);
              loadCompanies();
            }}
            disabled={refreshing}
          >
            <FaSync className={refreshing ? 'fa-spin me-2' : 'me-2'} />Refresh
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="g-3 mb-4">
        {[
          ['Total companies', summary.total, 'primary'],
          ['Pending review', summary.pending, 'warning'],
          ['Approved', summary.approved, 'success'],
          ['Suspended', summary.suspended, 'dark'],
        ].map(([label, value, variant]) => (
          <Col xl={3} md={6} key={label}>
            <Card className="h-100">
              <Card.Body>
                <div className={`text-${variant} text-uppercase small fw-bold`}>{label}</div>
                <div className="display-6 fw-semibold">{value}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col lg={8}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by company, email, or industry" />
              </InputGroup>
            </Col>
            <Col lg={4}>
              <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" /><p className="mt-3">Loading companies...</p></div>
          ) : companies.length === 0 ? (
            <div className="text-center py-5"><FaBuilding size={42} className="text-muted mb-3" /><h5>No companies found</h5><p className="text-muted">Adjust the filters or refresh the data.</p></div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Industry</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => {
                    const meta = statusMeta[company.status] || { label: company.status || 'Unknown', variant: 'secondary' };
                    return (
                      <tr key={company.id}>
                        <td>
                          <div className="fw-semibold">{company.companyName || company.name || 'Unnamed company'}</div>
                          <div className="text-muted small"><FaEnvelope className="me-1" />{company.email || 'No email'}</div>
                        </td>
                        <td><FaIndustry className="me-2 text-muted" />{company.industry || 'Not specified'}</td>
                        <td><Badge bg={meta.variant}>{meta.label}</Badge></td>
                        <td>{formatDate(company.createdAt)}</td>
                        <td className="text-end">
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => setSelectedCompany(company)}>
                            <FaExternalLinkAlt className="me-1" />Details
                          </Button>
                          {['pending', 'awaiting_approval'].includes(company.status) && (
                            <Button variant="outline-success" size="sm" onClick={() => approveCompany(company.id)}>
                              <FaCheckCircle className="me-1" />Approve
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={!!selectedCompany} onHide={() => setSelectedCompany(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedCompany?.companyName || selectedCompany?.name || 'Company details'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCompany && (
            <Row className="g-3">
              <Col md={6}><strong>Email</strong><div>{selectedCompany.email || 'Not available'}</div></Col>
              <Col md={6}><strong>Industry</strong><div>{selectedCompany.industry || 'Not specified'}</div></Col>
              <Col md={6}><strong>Website</strong><div>{selectedCompany.website || 'Not provided'}</div></Col>
              <Col md={6}><strong>Location</strong><div>{selectedCompany.location || selectedCompany.address || 'Not provided'}</div></Col>
              <Col xs={12}><strong>Description</strong><p className="mb-0 text-muted">{selectedCompany.description || selectedCompany.about || 'No profile description has been submitted.'}</p></Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedCompany(null)}><FaTimesCircle className="me-2" />Close</Button>
          {selectedCompany && ['pending', 'awaiting_approval'].includes(selectedCompany.status) && (
            <Button variant="success" onClick={() => approveCompany(selectedCompany.id)}><FaCheckCircle className="me-2" />Approve company</Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CompanyManagement;
