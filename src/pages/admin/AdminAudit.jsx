import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, InputGroup, Pagination, Row, Spinner, Table } from 'react-bootstrap';
import { FaDownload, FaHistory, FaSearch, FaShieldAlt, FaSync } from 'react-icons/fa';

import adminService from '../../services/adminService';

const formatDateTime = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const labelAction = (action = '') => action.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const AdminAudit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 25;

  const loadLogs = useCallback(async () => {
    setError('');
    setLoading(true);
    const response = await adminService.audit.getAuditLogs({ search, action }, page, pageSize);
    if (response.success) {
      setLogs(response.data.logs || []);
      setTotalPages(response.data.totalPages || 1);
    } else {
      setError(response.error || 'Failed to load audit logs');
    }
    setLoading(false);
    setRefreshing(false);
  }, [action, page, search]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const actionOptions = useMemo(() => ['all', ...new Set(logs.map((log) => log.action).filter(Boolean))], [logs]);

  const exportCsv = () => {
    const headers = ['Time', 'Action', 'Admin', 'Admin ID', 'Details'];
    const rows = logs.map((log) => [
      formatDateTime(log.timestamp),
      labelAction(log.action),
      log.adminName || '',
      log.adminId || '',
      JSON.stringify(log),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container fluid className="py-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="mb-1"><FaShieldAlt className="me-2" />Admin Audit</h2>
          <p className="text-muted mb-0">Track privileged actions, approvals, settings changes, and media uploads.</p>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={exportCsv} disabled={!logs.length}><FaDownload className="me-2" />Export</Button>
          <Button
            variant="outline-primary"
            onClick={() => {
              setRefreshing(true);
              loadLogs();
            }}
            disabled={refreshing}
          >
            <FaSync className={refreshing ? 'fa-spin me-2' : 'me-2'} />Refresh
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col lg={8}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Search action, admin, ID, or details" />
              </InputGroup>
            </Col>
            <Col lg={4}>
              <Form.Select value={action} onChange={(event) => { setPage(1); setAction(event.target.value); }}>
                {actionOptions.map((option) => <option value={option} key={option}>{option === 'all' ? 'All actions' : labelAction(option)}</option>)}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" /><p className="mt-3">Loading audit logs...</p></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5"><FaHistory size={42} className="text-muted mb-3" /><h5>No audit events found</h5><p className="text-muted">Administrative activity will appear here when actions are logged.</p></div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Admin</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-nowrap">{formatDateTime(log.timestamp)}</td>
                      <td><Badge bg="primary">{labelAction(log.action)}</Badge></td>
                      <td>
                        <div className="fw-semibold">{log.adminName || 'System Administrator'}</div>
                        <div className="text-muted small">{log.adminId || 'system'}</div>
                      </td>
                      <td><code className="small text-wrap">{JSON.stringify(Object.fromEntries(Object.entries(log).filter(([key]) => !['id', 'timestamp', 'action', 'adminName', 'adminId'].includes(key))))}</code></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
        {totalPages > 1 && (
          <Card.Footer className="d-flex justify-content-end">
            <Pagination className="mb-0">
              <Pagination.Prev disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} />
              {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 7).map((pageNumber) => (
                <Pagination.Item key={pageNumber} active={pageNumber === page} onClick={() => setPage(pageNumber)}>{pageNumber}</Pagination.Item>
              ))}
              <Pagination.Next disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} />
            </Pagination>
          </Card.Footer>
        )}
      </Card>
    </Container>
  );
};

export default AdminAudit;
