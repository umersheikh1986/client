import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 400px;
`;

const Notification = styled.div`
  background: ${props => props.type === 'success' ? '#21ce99' : props.type === 'error' ? '#ff6b6b' : '#404042'};
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NotificationIcon = styled.span`
  font-size: 18px;
`;

const NotificationText = styled.div`
  font-size: 14px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  margin-left: 16px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for custom notification events
    const handleNotification = (event) => {
      const { type, message, duration = 5000 } = event.detail;
      addNotification(type, message, duration);
    };

    window.addEventListener('showNotification', handleNotification);
    return () => window.removeEventListener('showNotification', handleNotification);
  }, []);

  const addNotification = (type, message, duration = 5000) => {
    const id = Date.now();
    const newNotification = { id, type, message };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove notification after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContainer>
      {notifications.map(notification => (
        <Notification key={notification.id} type={notification.type}>
          <NotificationContent>
            <NotificationIcon>
              {notification.type === 'success' ? '✅' : 
               notification.type === 'error' ? '❌' : 'ℹ️'}
            </NotificationIcon>
            <NotificationText>{notification.message}</NotificationText>
          </NotificationContent>
          <CloseButton onClick={() => removeNotification(notification.id)}>
            ×
          </CloseButton>
        </Notification>
      ))}
    </NotificationContainer>
  );
};

// Helper function to show notifications from anywhere in the app
export const showNotification = (type, message, duration) => {
  window.dispatchEvent(new CustomEvent('showNotification', {
    detail: { type, message, duration }
  }));
};

export default NotificationSystem;

