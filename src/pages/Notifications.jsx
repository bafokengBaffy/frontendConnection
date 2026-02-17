/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  ListGroup, 
  Badge,
  Button,
  Form,
  Spinner,
  Alert
} from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { app } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import './Notifications.css';

const Notifications = () => {
  const { currentUser, userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Determine user type and fetch appropriate notifications
        const userType = userProfile?.userType || 'student';
        let notificationsQuery;
        
        if (userType === 'student') {
          notificationsQuery = query(
            collection(app, 'notifications'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
        } else if (userType === 'company') {
          notificationsQuery = query(
            collection(app, 'notifications'),
            where('companyId', '==', userProfile?.companyId || currentUser.uid),
            orderBy('createdAt', 'desc')
          );
        } else {
          // Admin notifications
          notificationsQuery = query(
            collection(app, 'notifications'),
            orderBy('createdAt', 'desc')
          );
        }

        const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
          const notifs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setNotifications(notifs);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching notifications:', error);
          setError('Failed to load notifications');
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up notifications:', error);
        setError('Failed to load notifications');
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser, userProfile]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(app, 'notifications', notificationId), {
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const batchPromises = unreadNotifications.map(notification =>
        updateDoc(doc( 'notifications', notification.id), {
          read: true,
          readAt: new Date()
        })
      );
      
      await Promise.all(batchPromises);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // In a real app, you'd have a delete function
      // For now, we'll mark as archived
      await updateDoc(doc( 'notifications', notificationId), {
        archived: true
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading notifications...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="notifications-page py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Notifications</h1>
        {notifications.some(n => !n.read) && (
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={markAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {notifications.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <i className="bi bi-bell fs-1 text-muted mb-3"></i>
            <h4>No notifications yet</h4>
            <p className="text-muted">You'll see important updates here.</p>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <ListGroup variant="flush">
            {notifications.map((notification) => (
              <ListGroup.Item 
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1 me-3">
                    <div className="d-flex align-items-center mb-1">
                      <div className={`notification-type-icon me-2 ${notification.type || 'info'}`}>
                        <i className={`bi ${getNotificationIcon(notification.type)}`}></i>
                      </div>
                      <h6 className="mb-0">{notification.title}</h6>
                      {!notification.read && (
                        <Badge bg="primary" pill className="ms-2">New</Badge>
                      )}
                    </div>
                    <p className="text-muted mb-2">{notification.message}</p>
                    <small className="text-muted">
                      {formatDate(notification.createdAt)}
                    </small>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    {!notification.read && (
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <i className="bi bi-check"></i>
                      </Button>
                    )}
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete"
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}
    </Container>
  );
};

// Helper function to get appropriate icon for notification type
const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return 'bi-check-circle';
    case 'warning':
      return 'bi-exclamation-triangle';
    case 'error':
      return 'bi-x-circle';
    case 'info':
    default:
      return 'bi-info-circle';
  }
};

export default Notifications;