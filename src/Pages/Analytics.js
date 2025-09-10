import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import PortfolioAnalytics from '../Components/PortfolioAnalytics';
import PriceAlert from '../Components/PriceAlert';
import AlertNotification, { useNotifications } from '../Components/AlertNotification';
import { $numberWithCommas, $currencySymbol } from '../Utils/Helpers';
import { processAlerts, loadAlerts, formatAlertNotification } from '../Utils/alertHelpers';

const AnalyticsPage = styled.div`
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 80%, rgba(33, 206, 153, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(108, 92, 231, 0.15) 0%, transparent 50%),
    linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%);
  color: white;
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      linear-gradient(45deg, transparent 48%, rgba(33, 206, 153, 0.03) 49%, rgba(33, 206, 153, 0.03) 51%, transparent 52%),
      linear-gradient(-45deg, transparent 48%, rgba(108, 92, 231, 0.03) 49%, rgba(108, 92, 231, 0.03) 51%, transparent 52%);
    background-size: 60px 60px;
    animation: backgroundShift 20s linear infinite;
    pointer-events: none;
    z-index: 0;
  }
  
  @keyframes backgroundShift {
    0% { transform: translate(0, 0); }
    100% { transform: translate(60px, 60px); }
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
`;

const Header = styled.div`
  background: 
    linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02)),
    linear-gradient(90deg, rgba(33, 206, 153, 0.1), transparent, rgba(108, 92, 231, 0.1));
  padding: 24px 32px;
  border-bottom: 1px solid rgba(33, 206, 153, 0.2);
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #21ce99, #00d4aa, #6c5ce7, #a29bfe);
    background-size: 300% 100%;
    animation: headerGradient 6s ease-in-out infinite;
  }
  
  @keyframes headerGradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled(Link)`
  color: #aaa;
  text-decoration: none;
  font-size: 24px;
  transition: color 0.2s ease;
  
  &:hover {
    color: #21ce99;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 32px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #21ce99, #00d4aa, #6c5ce7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100%;
  animation: titleShimmer 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  gap: 16px;
  
  &::before {
    content: '📊';
    font-size: 36px;
    background: none;
    -webkit-text-fill-color: initial;
    filter: drop-shadow(0 4px 8px rgba(33, 206, 153, 0.4));
    animation: iconFloat 2s ease-in-out infinite;
  }
  
  @keyframes titleShimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes iconFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
  }
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
`;

const HeaderStat = styled.div`
  text-align: right;
`;

const HeaderStatLabel = styled.div`
  color: #aaa;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const HeaderStatValue = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin-top: 2px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  
  @media (max-width: 768px) {
    padding: 24px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 16px 12px;
  }
`;

const TabNavigation = styled.div`
  display: flex;
  gap: 4px;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.9), rgba(45, 45, 45, 0.8));
  border-radius: 20px;
  padding: 8px;
  margin-bottom: 40px;
  width: fit-content;
  border: 2px solid rgba(33, 206, 153, 0.2);
  backdrop-filter: blur(15px);
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #21ce99, #00d4aa, #6c5ce7, #a29bfe, #21ce99);
    background-size: 300% 100%;
    animation: tabGradient 4s ease-in-out infinite;
  }
  
  @keyframes tabGradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

const TabButton = styled.button`
  background: ${props => props.active ? 
    'linear-gradient(135deg, #21ce99, #00d4aa)' : 
    'transparent'};
  color: ${props => props.active ? 'white' : '#aaa'};
  border: ${props => props.active ? 
    '2px solid rgba(33, 206, 153, 0.5)' : 
    '2px solid transparent'};
  padding: 16px 28px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  min-width: 120px;
  
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
  
  &::after {
    content: ${props => props.children?.includes('Alerts') ? "'🔔'" : props.children?.includes('Analytics') ? "'📊'" : "'📋'"};
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    opacity: ${props => props.active ? 1 : 0.5};
    transition: all 0.3s ease;
  }
  
  &:hover {
    background: ${props => props.active ? 
      'linear-gradient(135deg, #00d4aa, #21ce99)' : 
      'rgba(33, 206, 153, 0.1)'};
    color: white;
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 25px rgba(33, 206, 153, 0.3);
    border-color: rgba(33, 206, 153, 0.6);
    
    &::before {
      left: 100%;
    }
    
    &::after {
      opacity: 1;
      transform: translateY(-50%) scale(1.2);
    }
  }
  
  ${props => props.children?.includes('Alerts') && `
    &:hover {
      animation: alertPulse 0.6s ease-in-out;
    }
    
    @keyframes alertPulse {
      0%, 100% { box-shadow: 0 8px 25px rgba(33, 206, 153, 0.3); }
      50% { box-shadow: 0 12px 35px rgba(33, 206, 153, 0.5), 0 0 20px rgba(33, 206, 153, 0.3); }
    }
  `}
`;

const TabContent = styled.div`
  ${props => !props.active && 'display: none;'}
  animation: ${props => props.active ? 'fadeInUp 0.5s ease-out' : 'none'};
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const OverviewCard = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    border-color: rgba(33, 206, 153, 0.3);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
`;

const OverviewIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color || 'linear-gradient(135deg, #21ce99, #00d4aa)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 16px;
`;

const OverviewTitle = styled.h3`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const OverviewValue = styled.div`
  color: #21ce99;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const OverviewDescription = styled.p`
  color: #aaa;
  font-size: 12px;
  margin: 0;
  line-height: 1.4;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const ActionCard = styled.button`
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  color: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(33, 206, 153, 0.3);
    transform: translateY(-2px);
  }
`;

const ActionIcon = styled.div`
  font-size: 24px;
  margin-bottom: 12px;
`;

const ActionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const ActionDescription = styled.div`
  font-size: 12px;
  color: #aaa;
`;

const RecentActivity = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.1);
`;

const ActivityTitle = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
`;

const ActivityInfo = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  color: white;
  font-size: 14px;
  margin-bottom: 2px;
`;

const ActivityTime = styled.div`
  color: #aaa;
  font-size: 12px;
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

const Analytics = ({ coinz, marketData, totalPortfolio, currency, exchangeRate, saveNewPref }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notifications, addNotification, removeNotification } = useNotifications();

  const curSymbol = $currencySymbol(currency);

  useEffect(() => {
    initializeAnalytics();
  }, []);

  // Reload alerts when switching to alerts tab
  useEffect(() => {
    if (activeTab === 'alerts') {
      initializeAnalytics();
    }
  }, [activeTab]);

  useEffect(() => {
    if (alerts.length > 0 && marketData) {
      checkAlertConditions();
    }
  }, [marketData, totalPortfolio]);

  const initializeAnalytics = async () => {
    try {
      const loadedAlerts = await loadAlerts();
      setAlerts(loadedAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh alerts - can be called when alerts are modified
  const refreshAlerts = async () => {
    try {
      const loadedAlerts = await loadAlerts();
      setAlerts(loadedAlerts);
    } catch (error) {
      console.error('Failed to refresh alerts:', error);
    }
  };

  const checkAlertConditions = async () => {
    if (!marketData || Object.keys(marketData).length === 0) return;

    try {
      const portfolioValue = totalPortfolio?.totalValue || 0;
      const { alerts: updatedAlerts, triggeredAlerts } = await processAlerts(
        alerts,
        marketData,
        portfolioValue
      );

      setAlerts(updatedAlerts);

      // Add notifications for triggered alerts
      triggeredAlerts.forEach(alert => {
        const notification = formatAlertNotification(alert, currency);
        addNotification(notification);
      });
    } catch (error) {
      console.error('Failed to process alerts:', error);
    }
  };


  const getPortfolioStats = () => {
    if (!totalPortfolio) {
      return {
        totalValue: 0,
        totalReturn: 0,
        totalReturnPercent: 0
      };
    }

    const { totalValue, totalBasis } = totalPortfolio;
    const totalReturn = totalValue - totalBasis;
    const totalReturnPercent = totalBasis > 0 ? (totalReturn / totalBasis) * 100 : 0;

    return {
      totalValue: totalValue || 0,
      totalReturn,
      totalReturnPercent
    };
  };

  const stats = getPortfolioStats();
  const activeAlerts = alerts.filter(a => a.enabled && a.status === 'active').length;
  const triggeredAlerts = alerts.filter(a => a.status === 'triggered').length;

  const recentActivity = [
    {
      text: 'Portfolio value updated',
      time: '5 minutes ago'
    },
    {
      text: `${activeAlerts} alerts are currently active`,
      time: '10 minutes ago'
    },
    {
      text: 'Market data refreshed',
      time: '15 minutes ago'
    }
  ];

  if (isLoading) {
    return (
      <AnalyticsPage>
        <Container>
          <EmptyState>
            <EmptyIcon>⏳</EmptyIcon>
            <EmptyText>Loading analytics...</EmptyText>
          </EmptyState>
        </Container>
      </AnalyticsPage>
    );
  }

  return (
    <AnalyticsPage>
      <AlertNotification 
        notifications={notifications}
        onDismiss={removeNotification}
        currency={currency}
      />
      
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <BackButton to="/">←</BackButton>
            <HeaderTitle>Portfolio Analytics</HeaderTitle>
          </HeaderLeft>
          <HeaderStats>
            <HeaderStat>
              <HeaderStatLabel>Portfolio Value</HeaderStatLabel>
              <HeaderStatValue>
                {curSymbol}{$numberWithCommas(stats.totalValue.toFixed(2))}
              </HeaderStatValue>
            </HeaderStat>
            <HeaderStat>
              <HeaderStatLabel>Total Return</HeaderStatLabel>
              <HeaderStatValue style={{ color: stats.totalReturn >= 0 ? '#21ce99' : '#ff6b6b' }}>
                {stats.totalReturn >= 0 ? '+' : ''}{stats.totalReturnPercent.toFixed(2)}%
              </HeaderStatValue>
            </HeaderStat>
          </HeaderStats>
        </HeaderContent>
      </Header>

      <Container>
        <TabNavigation>
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            🏠 Overview
          </TabButton>
          <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
            📊 Analytics
          </TabButton>
          <TabButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')}>
            🎯 Alerts ({activeAlerts})
          </TabButton>
        </TabNavigation>

        <TabContent active={activeTab === 'overview'}>
          <OverviewGrid>
            <OverviewCard>
              <OverviewIcon>💰</OverviewIcon>
              <OverviewTitle>Portfolio Value</OverviewTitle>
              <OverviewValue>{curSymbol}{$numberWithCommas(stats.totalValue.toFixed(2))}</OverviewValue>
              <OverviewDescription>
                {stats.totalReturn >= 0 ? 'Up' : 'Down'} {curSymbol}{$numberWithCommas(Math.abs(stats.totalReturn).toFixed(2))} ({stats.totalReturnPercent.toFixed(2)}%) total
              </OverviewDescription>
            </OverviewCard>

            <OverviewCard style={{
              background: triggeredAlerts > 0 ? 
                'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 107, 107, 0.05))' :
                'linear-gradient(135deg, rgba(33, 206, 153, 0.1), rgba(33, 206, 153, 0.05))',
              border: `2px solid ${triggeredAlerts > 0 ? 'rgba(255, 107, 107, 0.3)' : 'rgba(33, 206, 153, 0.3)'}`
            }}>
              <OverviewIcon color={triggeredAlerts > 0 ? 
                'linear-gradient(135deg, #ff6b6b, #ff8e8e)' : 
                'linear-gradient(135deg, #21ce99, #00d4aa)'}
              >
                🎯
              </OverviewIcon>
              <OverviewTitle style={{ color: triggeredAlerts > 0 ? '#ff6b6b' : '#21ce99' }}>
                Active Alerts
              </OverviewTitle>
              <OverviewValue style={{ 
                color: triggeredAlerts > 0 ? '#ff6b6b' : '#21ce99',
                fontSize: '32px'
              }}>
                {activeAlerts}
              </OverviewValue>
              <OverviewDescription>
                {triggeredAlerts > 0 ? 
                  `🔥 ${triggeredAlerts} triggered recently` : 
                  '✅ All alerts monitoring normally'}
              </OverviewDescription>
            </OverviewCard>

            <OverviewCard>
              <OverviewIcon color="linear-gradient(135deg, #6c5ce7, #a29bfe)">🪙</OverviewIcon>
              <OverviewTitle>Holdings</OverviewTitle>
              <OverviewValue>{Object.keys(coinz || {}).length}</OverviewValue>
              <OverviewDescription>
                Cryptocurrencies in your portfolio
              </OverviewDescription>
            </OverviewCard>

            <OverviewCard>
              <OverviewIcon color="linear-gradient(135deg, #ffd93d, #ffed4e)">📊</OverviewIcon>
              <OverviewTitle>Performance</OverviewTitle>
              <OverviewValue style={{ color: stats.totalReturn >= 0 ? '#21ce99' : '#ff6b6b' }}>
                {stats.totalReturn >= 0 ? '+' : ''}{stats.totalReturnPercent.toFixed(1)}%
              </OverviewValue>
              <OverviewDescription>
                Overall portfolio performance
              </OverviewDescription>
            </OverviewCard>

          </OverviewGrid>

          <QuickActions>
            <ActionCard onClick={() => setActiveTab('alerts')} style={{
              background: 'linear-gradient(135deg, rgba(33, 206, 153, 0.1), rgba(33, 206, 153, 0.05))',
              border: '2px solid rgba(33, 206, 153, 0.3)'
            }}>
              <ActionIcon style={{ fontSize: '28px' }}>🎯</ActionIcon>
              <ActionTitle style={{ color: '#21ce99' }}>Manage Alerts</ActionTitle>
              <ActionDescription>Set up price and portfolio alerts</ActionDescription>
            </ActionCard>
            <ActionCard onClick={() => setActiveTab('analytics')}>
              <ActionIcon>📈</ActionIcon>
              <ActionTitle>View Analytics</ActionTitle>
              <ActionDescription>Detailed performance metrics</ActionDescription>
            </ActionCard>
            <ActionCard>
              <ActionIcon>📤</ActionIcon>
              <ActionTitle>Export Data</ActionTitle>
              <ActionDescription>Download portfolio report</ActionDescription>
            </ActionCard>
            <ActionCard>
              <ActionIcon>⚙️</ActionIcon>
              <ActionTitle>Settings</ActionTitle>
              <ActionDescription>Configure preferences</ActionDescription>
            </ActionCard>
          </QuickActions>

          <RecentActivity>
            <ActivityTitle>Recent Activity</ActivityTitle>
            <ActivityList>
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index}>
                  <ActivityInfo>
                    <ActivityText>{activity.text}</ActivityText>
                    <ActivityTime>{activity.time}</ActivityTime>
                  </ActivityInfo>
                </ActivityItem>
              ))}
            </ActivityList>
          </RecentActivity>
        </TabContent>

        <TabContent active={activeTab === 'analytics'}>
          <PortfolioAnalytics
            coinz={coinz}
            marketData={marketData}
            totalPortfolio={totalPortfolio}
            currency={currency}
            exchangeRate={exchangeRate}
          />
        </TabContent>

        <TabContent active={activeTab === 'alerts'}>
          <PriceAlert
            coinz={coinz}
            marketData={marketData}
            currency={currency}
            saveNewPref={saveNewPref}
          />
        </TabContent>
      </Container>
    </AnalyticsPage>
  );
};

export default Analytics;