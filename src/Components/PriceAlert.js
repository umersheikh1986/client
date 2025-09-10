import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { isUserSignedIn, putFile, getFile } from 'blockstack';
import { $numberWithCommas, $currencySymbol } from '../Utils/Helpers';

const AlertContainer = styled.div`
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  border-radius: 20px;
  padding: 32px;
  margin: 24px 0;
  border: 1px solid rgba(33, 206, 153, 0.2);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #21ce99, #00d4aa, #21ce99);
    background-size: 200% 100%;
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%,
    100% {
      background-position: 200% 0;
    }
    50% {
      background-position: -200% 0;
    }
  }
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const AlertTitle = styled.h3`
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: '🔔';
    font-size: 28px;
    filter: drop-shadow(0 2px 4px rgba(33, 206, 153, 0.3));
  }
`;

const AddAlertButton = styled.button`
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 24px rgba(33, 206, 153, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
  }
`;

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const AlertItem = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(33, 206, 153, 0.1), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    border-color: rgba(33, 206, 153, 0.4);
    transform: translateX(8px) translateY(-2px);
    box-shadow: 0 8px 24px rgba(33, 206, 153, 0.15), 0 0 0 1px rgba(33, 206, 153, 0.2);

    &::before {
      left: 100%;
    }
  }
`;

const AlertInfo = styled.div`
  flex: 1;
`;

const AlertCoinName = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const AlertCondition = styled.div`
  color: #aaa;
  font-size: 12px;
  margin-bottom: 2px;
`;

const AlertStatus = styled.div`
  color: ${(props) =>
    props.status === 'active' ? '#21ce99' : props.status === 'triggered' ? '#ff6b6b' : '#aaa'};
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
`;

const AlertActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => {
    if (props.status === 'active') return '#21ce99';
    if (props.status === 'triggered') return '#ff6b6b';
    return '#aaa';
  }};
`;

const ActionButton = styled.button`
  background: ${(props) =>
    props.danger ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255,255,255,0.1)'};
  color: ${(props) => (props.danger ? '#ff6b6b' : 'white')};
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.danger ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255,255,255,0.15)'};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: linear-gradient(145deg, #2d2d2d, #262626);
  border-radius: 20px;
  padding: 32px;
  width: 90%;
  max-width: 420px;
  min-height: 480px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  display: flex;
  flex-direction: column;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #21ce99, #00d4aa, #21ce99);
    border-radius: 20px 20px 0 0;
  }
`;

const ModalTitle = styled.h3`
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px 0;
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: '🎯';
    font-size: 28px;
    filter: drop-shadow(0 2px 4px rgba(33, 206, 153, 0.3));
  }
`;

const FormGroup = styled.div`
  margin-bottom: 28px;
  position: relative;
  flex-shrink: 0;
`;

const Label = styled.label`
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 14px;
  display: block;
  position: relative;
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  &::after {
    content: ${(props) => (props.required ? "'*'" : "''")};
    color: #ff6b6b;
    margin-left: 6px;
    font-size: 16px;
  }
`;

const Select = styled.select`
  width: 100%;
  background: #2d2d2d;
  border: 1px solid #555;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;

  option {
    background: #2d2d2d;
    color: white;
  }
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid ${(props) => (props.error ? '#ff6b6b' : 'rgba(255,255,255,0.2)')};
  border-radius: 12px;
  padding: 18px 20px;
  color: white !important;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => (props.error ? '#ff6b6b' : '#21ce99')};
    box-shadow: 0 0 0 3px
      ${(props) => (props.error ? 'rgba(255, 107, 107, 0.1)' : 'rgba(33, 206, 153, 0.1)')};
    transform: scale(1.02);
  }

  &::placeholder {
    color: #888;
    font-size: 15px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-top: auto;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
`;

const Button = styled.button`
  flex: 1;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  ${(props) =>
    props.primary
      ? `
    background: linear-gradient(135deg, #21ce99, #00d4aa);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 8px 20px rgba(33, 206, 153, 0.4);
      
      &::before {
        left: 100%;
      }
    }
  `
      : `
    background: transparent;
    color: white;
    border: 2px solid rgba(255,255,255,0.3);
    
    &:hover:not(:disabled) {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.5);
      transform: translateY(-2px);
      
      &::before {
        left: 100%;
      }
    }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #aaa;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  margin: 0;
`;

const ErrorText = styled.div`
  color: #ff6b6b;
  font-size: 14px;
  margin-top: 8px;
  font-weight: 600;
  padding: 8px 12px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  border-left: 3px solid #ff6b6b;
`;

const SuccessText = styled.div`
  color: #21ce99;
  font-size: 14px;
  margin-top: 8px;
  font-weight: 600;
  padding: 8px 12px;
  background: rgba(33, 206, 153, 0.1);
  border-radius: 8px;
  border-left: 3px solid #21ce99;
`;

const LoadingSpinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #21ce99;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const PricePreview = styled.div`
  background: rgba(33, 206, 153, 0.15);
  border: 2px solid rgba(33, 206, 153, 0.4);
  border-radius: 12px;
  padding: 16px 20px;
  margin-top: 12px;
  color: #21ce99;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 4px 12px rgba(33, 206, 153, 0.2);
  animation: glow 2s ease-in-out infinite alternate;

  @keyframes glow {
    from {
      box-shadow: 0 4px 12px rgba(33, 206, 153, 0.2);
    }
    to {
      box-shadow: 0 4px 20px rgba(33, 206, 153, 0.4);
    }
  }
`;

const PriceAlert = ({ coinz, marketData, currency, saveNewPref }) => {
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [newAlert, setNewAlert] = useState({
    coin: '',
    type: 'above',
    targetPrice: '',
    enabled: true
  });

  const curSymbol = $currencySymbol(currency);

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    if (alerts.length > 0) {
      checkAlerts();
    }
  }, [marketData, alerts]);

  const loadAlerts = async () => {
    try {
      if (isUserSignedIn()) {
        const decrypt = true;
        const data = await getFile('coinfox-alerts.json', decrypt);
        if (data) {
          const alertsData = JSON.parse(data);
          // Support both legacy format (priceAlerts) and new format (alerts)
          setAlerts(alertsData.alerts || alertsData.priceAlerts || []);
        }
      } else {
        const savedAlerts = localStorage.getItem('coinfox-alerts');
        if (savedAlerts) {
          const alertsData = JSON.parse(savedAlerts);
          // Support both legacy format (priceAlerts) and new format (alerts)
          setAlerts(alertsData.alerts || alertsData.priceAlerts || []);
        }
      }
    } catch (error) {
      console.log('No existing alerts found');
    }
  };

  const saveAlerts = async (updatedAlerts) => {
    // Use unified format that's compatible with Analytics.js
    const alertsData = {
      alerts: updatedAlerts,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };

    try {
      if (isUserSignedIn()) {
        const encrypt = true;
        await putFile('coinfox-alerts.json', JSON.stringify(alertsData), encrypt);
      } else {
        localStorage.setItem('coinfox-alerts', JSON.stringify(alertsData));
      }
      setAlerts(updatedAlerts);
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  };

  const checkAlerts = () => {
    const updatedAlerts = alerts.map((alert) => {
      if (!alert.enabled || alert.status === 'triggered') return alert;

      const coinData = marketData[alert.coin];
      if (!coinData || !coinData.ticker) return alert;

      const currentPrice = coinData.ticker.price;
      const targetPrice = parseFloat(alert.targetPrice);

      let shouldTrigger = false;
      if (alert.type === 'above' && currentPrice >= targetPrice) {
        shouldTrigger = true;
      } else if (alert.type === 'below' && currentPrice <= targetPrice) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        // Trigger notification (could be enhanced with browser notifications)
        console.log(
          `Alert triggered: ${alert.coin} is ${alert.type} ${curSymbol}${targetPrice}`
        );
        return { ...alert, status: 'triggered', triggeredAt: new Date().toISOString() };
      }

      return alert;
    });

    if (JSON.stringify(updatedAlerts) !== JSON.stringify(alerts)) {
      saveAlerts(updatedAlerts);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newAlert.coin) {
      newErrors.coin = 'Please select a coin';
    }

    if (!newAlert.targetPrice) {
      newErrors.targetPrice = 'Please enter a target price';
    } else if (parseFloat(newAlert.targetPrice) <= 0) {
      newErrors.targetPrice = 'Price must be greater than 0';
    }

    // Check if current price exists for validation
    const coinData = marketData[newAlert.coin];
    if (coinData && coinData.ticker && newAlert.targetPrice) {
      const currentPrice = coinData.ticker.price;
      const targetPrice = parseFloat(newAlert.targetPrice);

      if (newAlert.type === 'above' && targetPrice <= currentPrice) {
        newErrors.targetPrice = `Target price should be above current price (${curSymbol}${currentPrice.toFixed(
          2
        )})`;
      } else if (newAlert.type === 'below' && targetPrice >= currentPrice) {
        newErrors.targetPrice = `Target price should be below current price (${curSymbol}${currentPrice.toFixed(
          2
        )})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setNewAlert({ ...newAlert, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      // Reset all form state when closing modal
      setNewAlert({ coin: '', type: 'above', targetPrice: '', enabled: true });
      setErrors({});
      setIsSubmitting(false);
      setShowModal(false);
    }
  };

  const handleAddAlert = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const alert = {
        id: Date.now(),
        coin: newAlert.coin,
        type: newAlert.type,
        targetPrice: newAlert.targetPrice,
        enabled: true,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      const updatedAlerts = [...alerts, alert];
      await saveAlerts(updatedAlerts);

      // Reset all modal state
      setNewAlert({ coin: '', type: 'above', targetPrice: '', enabled: true });
      setErrors({});
      setShowModal(false);
    } catch (error) {
      setErrors({ submit: 'Failed to create alert. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAlert = (id) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    );
    saveAlerts(updatedAlerts);
  };

  const deleteAlert = (id) => {
    const updatedAlerts = alerts.filter((alert) => alert.id !== id);
    saveAlerts(updatedAlerts);
  };

  const resetAlert = (id) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === id ? { ...alert, status: 'active', triggeredAt: null } : alert
    );
    saveAlerts(updatedAlerts);
  };

  const activeAlerts = alerts.filter((a) => a.enabled && a.status === 'active');
  const triggeredAlerts = alerts.filter((a) => a.status === 'triggered');

  return (
    <AlertContainer>
      <AlertHeader>
        <AlertTitle>Price Alerts ({activeAlerts.length} active)</AlertTitle>
        <AddAlertButton onClick={() => setShowModal(true)}>+ Add Alert</AddAlertButton>
      </AlertHeader>

      {alerts.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🔔</EmptyIcon>
          <EmptyText>
            No price alerts set. Create your first alert to get notified when coins reach your
            target prices.
          </EmptyText>
        </EmptyState>
      ) : (
        <AlertList>
          {alerts.map((alert) => {
            const coinData = marketData[alert.coin];
            const currentPrice = coinData?.ticker?.price || 0;

            return (
              <AlertItem key={alert.id}>
                <AlertInfo>
                  <AlertCoinName>{alert.coin.toUpperCase()}</AlertCoinName>
                  <AlertCondition>
                    Notify when price goes {alert.type} {curSymbol}
                    {$numberWithCommas(alert.targetPrice)}
                  </AlertCondition>
                  <AlertCondition>
                    Current: {curSymbol}
                    {$numberWithCommas(currentPrice.toFixed(2))}
                  </AlertCondition>
                  <AlertStatus status={alert.status}>
                    {alert.status === 'triggered'
                      ? 'Triggered'
                      : alert.enabled
                      ? 'Active'
                      : 'Disabled'}
                  </AlertStatus>
                </AlertInfo>
                <AlertActions>
                  <StatusIndicator status={alert.enabled ? alert.status : 'disabled'} />
                  {alert.status === 'triggered' && (
                    <ActionButton onClick={() => resetAlert(alert.id)}>Reset</ActionButton>
                  )}
                  <ActionButton onClick={() => toggleAlert(alert.id)}>
                    {alert.enabled ? 'Disable' : 'Enable'}
                  </ActionButton>
                  <ActionButton danger onClick={() => deleteAlert(alert.id)}>
                    Delete
                  </ActionButton>
                </AlertActions>
              </AlertItem>
            );
          })}
        </AlertList>
      )}

      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Create Price Alert</ModalTitle>

            <FormGroup>
              <Label required>Select Coin</Label>
              <Select
                value={newAlert.coin}
                error={errors.coin}
                onChange={(e) => handleInputChange('coin', e.target.value)}
              >
                <option value=''>Choose a coin from your portfolio</option>
                {Object.keys(coinz || {}).map((coin) => (
                  <option key={coin} value={coin}>
                    {coin.toUpperCase()}
                  </option>
                ))}
              </Select>
              {errors.coin && <ErrorText>{errors.coin}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Alert Type</Label>
              <Select
                value={newAlert.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value='above' >Price Above</option>
                <option value='below'>Price Below</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label required>Target Price ({curSymbol})</Label>
              <Input
                type='number'
                step='0.01'
                placeholder='Enter target price'
                value={newAlert.targetPrice}
                error={errors.targetPrice}
                onChange={(e) => handleInputChange('targetPrice', e.target.value)}
              />
              {errors.targetPrice && <ErrorText>{errors.targetPrice}</ErrorText>}
              {newAlert.coin && marketData[newAlert.coin]?.ticker && (
                <PricePreview>
                  Current price: {curSymbol}
                  {marketData[newAlert.coin].ticker.price.toFixed(2)}
                </PricePreview>
              )}
            </FormGroup>

            {errors.submit && (
              <ErrorText style={{ textAlign: 'center', marginBottom: '20px' }}>
                {errors.submit}
              </ErrorText>
            )}
            <ButtonGroup>
              <Button onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button primary onClick={handleAddAlert} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    Creating...
                  </>
                ) : (
                  'Create Alert'
                )}
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </AlertContainer>
  );
};

export default PriceAlert;
