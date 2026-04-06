import { useState } from 'react';
import { Alert, Badge, Button, Card } from 'react-bootstrap';

import { useAuth } from '../../context/AuthContext';

const UserTypeDebug = () => {
  const { currentUser, userProfile, updateUserType } = useAuth();
  const [updating, setUpdating] = useState(false);

  const userTypes = [
    'admin',
    'entrepreneur',
    'youth',
    'student',
    'company',
    'institution',
    'employer',
  ];

  const handleUserTypeChange = async (newUserType) => {
    setUpdating(true);
    try {
      const result = await updateUserType(newUserType);
      if (result.success) {
        alert(`✅ User type changed to ${newUserType}. Page will reload.`);
        window.location.reload();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error changing user type:', error);
      alert('❌ Error changing user type: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!currentUser) {
    return (
      <Card className="mt-3 border-warning">
        <Card.Header className="bg-warning text-dark">
          <strong>🧪 Developer Tools</strong>
        </Card.Header>
        <Card.Body>
          <Alert variant="info" className="small">
            Please log in to use user type debugging tools.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mt-3 border-warning">
      <Card.Header className="bg-warning text-dark">
        <strong>🧪 Developer Tools - User Type Debug</strong>
      </Card.Header>
      <Card.Body>
        <Alert variant="info" className="small">
          <strong>Current User:</strong> {currentUser.email}
          <br />
          <strong>Current User Type:</strong>{' '}
          <Badge bg="primary">{userProfile?.userType || 'unknown'}</Badge>
          <br />
          <strong>User ID:</strong> {currentUser.uid}
        </Alert>

        <div className="mb-3">
          <h6 className="text-dark">Switch User Type:</h6>
          <div className="d-flex flex-wrap gap-2">
            {userTypes.map((userType) => (
              <Button
                key={userType}
                variant={userProfile?.userType === userType ? 'success' : 'outline-secondary'}
                size="sm"
                onClick={() => handleUserTypeChange(userType)}
                disabled={updating || userProfile?.userType === userType}
              >
                {userType}
                {userProfile?.userType === userType && ' ✓'}
              </Button>
            ))}
          </div>
          {updating && <small className="text-muted mt-2 d-block">Updating user type...</small>}
        </div>

        <div className="border-top pt-3">
          <h6 className="text-dark">Dashboard Access:</h6>
          <div className="d-flex flex-wrap gap-2">
            {userTypes.map((userType) => (
              <Button
                key={userType}
                variant="outline-primary"
                size="sm"
                onClick={() => (window.location.href = `/${userType}`)}
                disabled={userProfile?.userType !== userType}
              >
                Go to {userType} dashboard
              </Button>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default UserTypeDebug;
