import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { $numberWithCommas, $currencySymbol } from '../Utils/Helpers';

const AlertsContainer = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 24px;
  margin: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
`;

const AlertsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const AlertsTitle = styled.h2`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const AddAlertButton = styled.button`
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 206, 153, 0.3);
  }
`;

const AlertTabs = styled.div`
  display: flex;
  gap: 2px;
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
`;

const AlertTab = styled.button`
  background: ${props => props.active ? 'rgba(255,255,255,0.2)' : 'transparent'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover {
    background: rgba(255,255,255,0.15);
  }
`;

const AlertList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AlertItem = styled.div`
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(33, 206, 153, 0.3);
    transform: translateX(4px);
  }
`;

const AlertInfo = styled.div`
  flex: 1;
`;

const AlertName = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const AlertDescription = styled.div`
  color: #aaa;
  font-size: 12px;
`;

const AlertStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    if (props.status === 'active') return '#21ce99';
    if (props.status === 'triggered') return '#ff6b6b';
    return '#aaa';
  }};
`;

const AlertToggle = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background: linear-gradient(135deg, #21ce99, #00d4aa);
  }
  
  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.2);
  transition: 0.3s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(12px);
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: linear-gradient(145deg, #1a1a1a, #2d2d2d, #1a1a1a);
  border-radius: 24px;
  padding: 40px;
  width: 95%;
  max-width: 600px;
  min-height: 500px;
  border: 2px solid rgba(33, 206, 153, 0.3);
  box-shadow: 
    0 25px 50px rgba(0,0,0,0.5),
    0 0 0 1px rgba(255,255,255,0.1),
    inset 0 1px 0 rgba(255,255,255,0.1);
  animation: modalEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  
  @keyframes modalEnter {
    from { 
      opacity: 0;
      transform: translateY(50px) scale(0.9);
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
    height: 4px;
    background: linear-gradient(90deg, #21ce99, #00d4aa, #21ce99);
    background-size: 200% 100%;
    animation: shimmer 2s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0%, 100% { background-position: 200% 0; }
    50% { background-position: -200% 0; }
  }
`;

const ModalTitle = styled.h3`
  color: white;
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 32px 0;
  text-align: center;
  background: linear-gradient(135deg, #21ce99, #00d4aa, #21ce99);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 4px 8px rgba(33, 206, 153, 0.3);
  position: relative;
  
  &::before {
    content: '✨';
    position: absolute;
    left: -50px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 24px;
    animation: pulse 2s ease-in-out infinite;
  }
  
  &::after {
    content: '🚀';
    position: absolute;
    right: -50px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 24px;
    animation: pulse 2s ease-in-out infinite 0.5s;
  }
  
  @keyframes pulse {
    0%, 100% { transform: translateY(-50%) scale(1); opacity: 0.8; }
    50% { transform: translateY(-50%) scale(1.2); opacity: 1; }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  position: relative;
`;

const Label = styled.label`
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
  display: block;
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255,255,255,0.08);
  border: 2px solid rgba(33, 206, 153, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  color: white;
  font-size: 18px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #21ce99;
    box-shadow: 0 0 20px rgba(33, 206, 153, 0.3);
    transform: scale(1.02);
  }
  
  &::placeholder {
    color: #999;
    font-size: 16px;
  }
`;

const Select = styled.select`
  width: 100%;
  background: rgba(255,255,255,0.08);
  border: 2px solid rgba(33, 206, 153, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  color: white;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #21ce99;
    box-shadow: 0 0 20px rgba(33, 206, 153, 0.3);
    transform: scale(1.02);
  }
  
  option {
    background: #2d2d2d;
    color: white;
    font-size: 16px;
    padding: 10px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(33, 206, 153, 0.2);
`;

const Button = styled.button`
  flex: 1;
  padding: 18px 24px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  ${props => props.primary ? `
    background: linear-gradient(135deg, #21ce99, #00d4aa);
    color: white;
    border: 2px solid transparent;
    
    &:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 8px 25px rgba(33, 206, 153, 0.4);
      
      &::before {
        left: 100%;
      }
    }
  ` : `
    background: transparent;
    color: white;
    border: 2px solid rgba(255,255,255,0.3);
    
    &:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.5);
      transform: translateY(-2px);
      
      &::before {
        left: 100%;
      }
    }
  `}
`;

const SmartAlerts = ({ coinz, marketData, currency }) => {
  const [activeTab, setActiveTab] = useState('price');
  const [showModal, setShowModal] = useState(false);
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'price',
      coin: 'BTC',
      condition: 'above',
      value: 50000,
      status: 'active',
      description: 'Bitcoin price above $50,000'
    },
    {
      id: 2,
      type: 'portfolio',
      condition: 'milestone',
      value: 100000,
      status: 'active',
      description: 'Portfolio reaches $100,000'
    },
    {
      id: 3,
      type: 'market',
      condition: 'volatility',
      value: 20,
      status: 'triggered',
      description: 'High market volatility detected'
    }
  ]);

  const [newAlert, setNewAlert] = useState({
    type: 'price',
    coin: '',
    condition: 'above',
    value: ''
  });

  const curSymbol = $currencySymbol(currency);

  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === 'price') return alert.type === 'price';
    if (activeTab === 'portfolio') return alert.type === 'portfolio';
    if (activeTab === 'market') return alert.type === 'market';
    return true;
  });

  const handleAddAlert = () => {
    if (newAlert.value && (newAlert.type === 'portfolio' || newAlert.coin)) {
      const alert = {
        id: Date.now(),
        ...newAlert,
        status: 'active',
        description: generateDescription(newAlert)
      };
      setAlerts([...alerts, alert]);
      setShowModal(false);
      setNewAlert({ type: 'price', coin: '', condition: 'above', value: '' });
    }
  };

  const generateDescription = (alert) => {
    if (alert.type === 'price') {
      return `${alert.coin.toUpperCase()} price ${alert.condition} ${curSymbol}${alert.value}`;
    } else if (alert.type === 'portfolio') {
      return `Portfolio ${alert.condition} ${curSymbol}${alert.value}`;
    } else {
      return `Market ${alert.condition} alert`;
    }
  };

  const toggleAlert = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id 
        ? { ...alert, status: alert.status === 'active' ? 'inactive' : 'active' }
        : alert
    ));
  };

  return (
    <AlertsContainer>
      <AlertsHeader>
        <AlertsTitle>Smart Alerts</AlertsTitle>
        <AddAlertButton onClick={() => setShowModal(true)}>
          + Add Alert
        </AddAlertButton>
      </AlertsHeader>

      <AlertTabs>
        <AlertTab 
          active={activeTab === 'price'} 
          onClick={() => setActiveTab('price')}
        >
          Price Alerts
        </AlertTab>
        <AlertTab 
          active={activeTab === 'portfolio'} 
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio
        </AlertTab>
        <AlertTab 
          active={activeTab === 'market'} 
          onClick={() => setActiveTab('market')}
        >
          Market
        </AlertTab>
      </AlertTabs>

      <AlertList>
        {filteredAlerts.map(alert => (
          <AlertItem key={alert.id}>
            <AlertInfo>
              <AlertName>{alert.description}</AlertName>
              <AlertDescription>
                {alert.status === 'triggered' ? 'Alert triggered recently' : 'Monitoring...'}
              </AlertDescription>
            </AlertInfo>
            <AlertStatus>
              <StatusIndicator status={alert.status} />
              <AlertToggle>
                <ToggleInput 
                  type="checkbox" 
                  checked={alert.status === 'active'}
                  onChange={() => toggleAlert(alert.id)}
                />
                <ToggleSlider />
              </AlertToggle>
            </AlertStatus>
          </AlertItem>
        ))}
      </AlertList>

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>🎯 CREATE SMART ALERT 🎯</ModalTitle>
            
            <FormGroup>
              <Label>Alert Type</Label>
              <Select 
                value={newAlert.type}
                onChange={e => setNewAlert({...newAlert, type: e.target.value})}
              >
                <option value="price">Price Alert</option>
                <option value="portfolio">Portfolio Milestone</option>
                <option value="market">Market Alert</option>
              </Select>
            </FormGroup>

            {newAlert.type === 'price' && (
              <FormGroup>
                <Label>Coin</Label>
                <Select 
                  value={newAlert.coin}
                  onChange={e => setNewAlert({...newAlert, coin: e.target.value})}
                >
                  <option value="">Select Coin</option>
                  {Object.keys(coinz || {}).map(coin => (
                    <option key={coin} value={coin}>{coin.toUpperCase()}</option>
                  ))}
                </Select>
              </FormGroup>
            )}

            <FormGroup>
              <Label>Condition</Label>
              <Select 
                value={newAlert.condition}
                onChange={e => setNewAlert({...newAlert, condition: e.target.value})}
              >
                {newAlert.type === 'price' ? (
                  <>
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                  </>
                ) : newAlert.type === 'portfolio' ? (
                  <>
                    <option value="reaches">Reaches</option>
                    <option value="drops">Drops Below</option>
                  </>
                ) : (
                  <>
                    <option value="volatility">High Volatility</option>
                    <option value="trend">Trend Change</option>
                  </>
                )}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Value ({curSymbol})</Label>
              <Input 
                type="number"
                placeholder="Enter value"
                value={newAlert.value}
                onChange={e => setNewAlert({...newAlert, value: e.target.value})}
              />
            </FormGroup>

            <ButtonGroup>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button primary onClick={handleAddAlert}>Create Alert</Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </AlertsContainer>
  );
};

export default SmartAlerts;

