import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { $numberWithCommas, $currencySymbol } from '../Utils/Helpers';

const slideIn = keyframes`
  from {
    transform: translateX(120%) rotateY(45deg);
    opacity: 0;
    scale: 0.8;
  }
  50% {
    transform: translateX(-10%) rotateY(0deg);
    opacity: 0.8;
    scale: 1.05;
  }
  to {
    transform: translateX(0) rotateY(0deg);
    opacity: 1;
    scale: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0) rotateY(0deg) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(20%) rotateY(-10deg) scale(1.02);
    opacity: 0.7;
  }
  to {
    transform: translateX(120%) rotateY(-45deg) scale(0.8);
    opacity: 0;
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-4px);
  }
  60% {
    transform: translateY(-2px);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(33, 206, 153, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(33, 206, 153, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 206, 153, 0);
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  pointer-events: none;
`;

const NotificationItem = styled.div`
  background: ${props => {
    if (props.type === 'success') return 'linear-gradient(135deg, #21ce99, #00d4aa)';
    if (props.type === 'warning') return 'linear-gradient(135deg, #ffd93d, #ffed4e)';
    if (props.type === 'error') return 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
    return 'linear-gradient(135deg, #6c5ce7, #a29bfe)';
  }};
  color: ${props => props.type === 'warning' ? '#333' : 'white'};
  padding: 20px 24px;
  border-radius: 16px;
  box-shadow: 
    0 20px 40px rgba(0,0,0,0.4),
    0 0 0 1px rgba(255,255,255,0.2),
    inset 0 1px 0 rgba(255,255,255,0.3);
  animation: ${props => props.isExiting ? slideOut : slideIn} 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: all;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    transform: scale(1.05) translateY(-2px);
    animation: ${bounce} 0.6s ease-in-out, ${pulse} 2s infinite;
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const NotificationIcon = styled.div`
  font-size: 20px;
  margin-right: 12px;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const NotificationMessage = styled.div`
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
`;

const NotificationMeta = styled.div`
  font-size: 12px;
  opacity: 0.7;
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  padding: 0;
  
  &:hover {
    opacity: 1;
  }
`;

const NotificationBadge = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  z-index: 10001;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  animation: ${slideIn} 0.3s ease-out;
`;

const InlineNotification = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InlineIcon = styled.div`
  font-size: 16px;
  color: ${props => {
    if (props.type === 'success') return '#21ce99';
    if (props.type === 'warning') return '#ffd93d';
    if (props.type === 'error') return '#ff6b6b';
    return '#6c5ce7';
  }};
`;

const InlineContent = styled.div`
  flex: 1;
`;

const InlineTitle = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
`;

const InlineMessage = styled.div`
  color: #aaa;
  font-size: 12px;
`;

const AlertNotification = ({ notifications = [], onDismiss, showInline = false, currency = 'USD' }) => {
  const [exitingNotifications, setExitingNotifications] = useState(new Set());
  
  const curSymbol = $currencySymbol(currency);

  useEffect(() => {
    // Auto-dismiss notifications after 5 seconds
    const timers = notifications.map(notification => {
      if (notification.autoDismiss !== false) {
        return setTimeout(() => {
          handleDismiss(notification.id);
        }, 5000);
      }
      return null;
    }).filter(Boolean);

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  const handleDismiss = (id) => {
    setExitingNotifications(prev => new Set([...prev, id]));
    setTimeout(() => {
      onDismiss(id);
      setExitingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'price-alert': return '💰';
      case 'portfolio-milestone': return '🎯';
      case 'market-alert': return '📈';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '🔔';
    }
  };

  const getNotificationTitle = (notification) => {
    switch (notification.type) {
      case 'price-alert':
        return `Price Alert: ${notification.coin?.toUpperCase()}`;
      case 'portfolio-milestone':
        return 'Portfolio Milestone';
      case 'market-alert':
        return 'Market Alert';
      default:
        return notification.title || 'Notification';
    }
  };

  const formatPriceAlertMessage = (notification) => {
    const { coin, condition, targetPrice, currentPrice } = notification;
    return `${coin?.toUpperCase()} has ${condition === 'above' ? 'risen above' : 'fallen below'} your target price of ${curSymbol}${$numberWithCommas(targetPrice)}. Current price: ${curSymbol}${$numberWithCommas(currentPrice)}.`;
  };

  const formatMessage = (notification) => {
    if (notification.type === 'price-alert') {
      return formatPriceAlertMessage(notification);
    }
    return notification.message;
  };

  const getNotificationType = (notification) => {
    switch (notification.type) {
      case 'price-alert':
        return notification.condition === 'above' ? 'success' : 'warning';
      case 'portfolio-milestone':
        return 'success';
      case 'market-alert':
        return 'warning';
      default:
        return notification.severity || 'info';
    }
  };

  if (showInline) {
    return (
      <div>
        {notifications.map(notification => (
          <InlineNotification key={notification.id}>
            <InlineIcon type={getNotificationType(notification)}>
              {getNotificationIcon(notification.type)}
            </InlineIcon>
            <InlineContent>
              <InlineTitle>{getNotificationTitle(notification)}</InlineTitle>
              <InlineMessage>{formatMessage(notification)}</InlineMessage>
            </InlineContent>
            <CloseButton onClick={() => handleDismiss(notification.id)}>
              ×
            </CloseButton>
          </InlineNotification>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <NotificationContainer>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          type={getNotificationType(notification)}
          isExiting={exitingNotifications.has(notification.id)}
          onClick={() => handleDismiss(notification.id)}
        >
          <NotificationHeader>
            <NotificationIcon>
              {getNotificationIcon(notification.type)}
            </NotificationIcon>
            <NotificationContent>
              <NotificationTitle>
                {getNotificationTitle(notification)}
              </NotificationTitle>
              <NotificationMessage>
                {formatMessage(notification)}
              </NotificationMessage>
              <NotificationMeta>
                <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                <span>Tap to dismiss</span>
              </NotificationMeta>
            </NotificationContent>
            <CloseButton onClick={(e) => {
              e.stopPropagation();
              handleDismiss(notification.id);
            }}>
              ×
            </CloseButton>
          </NotificationHeader>
        </NotificationItem>
      ))}
    </NotificationContainer>
  );
};

// Notification Badge Component for showing count
export const NotificationCounter = ({ count }) => {
  if (count === 0) return null;
  
  return (
    <NotificationBadge>
      {count > 99 ? '99+' : count}
    </NotificationBadge>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      ...notification
    };
    setNotifications(prev => [...prev, newNotification]);
    return newNotification.id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addPriceAlert = (coin, condition, targetPrice, currentPrice) => {
    return addNotification({
      type: 'price-alert',
      coin,
      condition,
      targetPrice,
      currentPrice,
      autoDismiss: false // Price alerts should be manually dismissed
    });
  };

  const addPortfolioMilestone = (milestone, currentValue) => {
    return addNotification({
      type: 'portfolio-milestone',
      title: 'Portfolio Milestone Reached!',
      message: `Your portfolio has reached ${milestone}! Current value: ${currentValue}`,
      autoDismiss: false
    });
  };

  const addMarketAlert = (message) => {
    return addNotification({
      type: 'market-alert',
      message,
      autoDismiss: true
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    addPriceAlert,
    addPortfolioMilestone,
    addMarketAlert
  };
};

export default AlertNotification;