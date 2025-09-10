import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { $numberWithCommas, $currencySymbol } from '../Utils/Helpers';

const AnalyticsContainer = styled.div`
  padding: 32px;
  background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
  border-radius: 24px;
  margin: 24px 0;
  border: 1px solid rgba(33, 206, 153, 0.15);
  backdrop-filter: blur(20px);
  box-shadow: 
    0 20px 40px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #21ce99, #00d4aa, #6c5ce7, #a29bfe, #21ce99);
    background-size: 400% 100%;
    animation: gradientShift 8s ease-in-out infinite;
  }
  
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

const AnalyticsHeader = styled.div`
  margin-bottom: 32px;
`;

const AnalyticsTitle = styled.h2`
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #21ce99, #00d4aa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const AnalyticsSubtitle = styled.p`
  color: #aaa;
  margin: 0;
  font-size: 16px;
`;

const TimeframeSelector = styled.div`
  display: flex;
  gap: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 24px;
  width: fit-content;
`;

const TimeframeButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #21ce99, #00d4aa)' : 'rgba(255,255,255,0.05)'};
  color: ${props => props.active ? 'white' : '#aaa'};
  border: ${props => props.active ? '1px solid rgba(33, 206, 153, 0.3)' : '1px solid rgba(255,255,255,0.1)'};
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
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
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #00d4aa, #21ce99)' : 'rgba(33, 206, 153, 0.1)'};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(33, 206, 153, 0.3);
    
    &::before {
      left: 100%;
    }
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 24px;
  }
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02));
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(255,255,255,0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 50%, rgba(33, 206, 153, 0.1), transparent 70%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(33, 206, 153, 0.4);
    box-shadow: 
      0 20px 40px rgba(33, 206, 153, 0.2),
      0 0 0 1px rgba(33, 206, 153, 0.3);
      
    &::before {
      opacity: 1;
    }
  }
`;

const MetricLabel = styled.div`
  color: #aaa;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.isPositive ? '#21ce99' : '#ff6b6b'};
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 32px;
`;

const ChartCard = styled.div`
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.1);
`;

const ChartTitle = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
`;

const ChartContainer = styled.div`
  height: 400px;
  background: rgba(255,255,255,0.02);
  border-radius: 8px;
  position: relative;
  
  .highcharts-container {
    border-radius: 8px;
  }
`;

const PerformanceSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const PerformanceCard = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.1);
`;

const PerformanceTitle = styled.h4`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const CoinPerformanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CoinPerformanceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
`;

const CoinInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CoinName = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const CoinSymbol = styled.div`
  color: #aaa;
  font-size: 12px;
`;

const CoinPerformance = styled.div`
  text-align: right;
`;

const CoinReturn = styled.div`
  color: ${props => props.isPositive ? '#21ce99' : '#ff6b6b'};
  font-size: 14px;
  font-weight: 600;
`;

const CoinValue = styled.div`
  color: #aaa;
  font-size: 12px;
`;

const DiversificationSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const DiversificationCard = styled.div`
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.1);
`;

const DiversificationTitle = styled.h4`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const DiversificationMetric = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const DiversificationLabel = styled.div`
  color: #aaa;
  font-size: 14px;
`;

const DiversificationValue = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const PortfolioAnalytics = ({ coinz, marketData, totalPortfolio, currency, exchangeRate }) => {
  const [timeframe, setTimeframe] = useState('30d');
  const [portfolioMetrics, setPortfolioMetrics] = useState({
    totalReturn: 0,
    totalReturnPercent: 0,
    bestPerformer: null,
    worstPerformer: null,
    diversificationScore: 0,
    riskLevel: 'Medium',
    volatility: 0
  });
  const [chartOptions, setChartOptions] = useState({});
  const chartRef = useRef(null);

  const curSymbol = $currencySymbol(currency);

  useEffect(() => {
    calculatePortfolioMetrics();
    generateChartOptions();
  }, [coinz, marketData, totalPortfolio, timeframe]);

  const generatePortfolioData = () => {
    const now = new Date();
    const dataPoints = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30;
    const interval = timeframe === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    
    const { totalValue = 0, totalBasis = 0 } = totalPortfolio || {};
    const currentReturn = totalValue - totalBasis;
    
    return Array.from({ length: dataPoints }, (_, i) => {
      const time = now.getTime() - (dataPoints - 1 - i) * interval;
      const progress = i / (dataPoints - 1);
      
      // Simulate portfolio growth with some volatility
      const baseValue = totalBasis + (currentReturn * progress);
      const volatility = totalValue * 0.05 * Math.sin(progress * Math.PI * 2) * Math.random();
      const value = Math.max(baseValue + volatility, totalBasis * 0.8);
      
      return [time, parseFloat(value.toFixed(2))];
    });
  };

  const generateChartOptions = () => {
    const portfolioData = generatePortfolioData();
    const { totalValue = 0, totalBasis = 0 } = totalPortfolio || {};
    const isPositive = totalValue >= totalBasis;

    const options = {
      chart: {
        type: 'areaspline',
        backgroundColor: 'transparent',
        style: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        height: 350
      },
      title: {
        text: '',
        style: { display: 'none' }
      },
      xAxis: {
        type: 'datetime',
        gridLineColor: 'rgba(255,255,255,0.1)',
        lineColor: 'rgba(255,255,255,0.2)',
        tickColor: 'rgba(255,255,255,0.2)',
        labels: {
          style: { color: '#aaa', fontSize: '12px' }
        }
      },
      yAxis: {
        title: {
          text: `Portfolio Value (${curSymbol})`,
          style: { color: '#aaa', fontSize: '13px' }
        },
        gridLineColor: 'rgba(255,255,255,0.1)',
        labels: {
          style: { color: '#aaa', fontSize: '12px' },
          formatter: function() {
            return curSymbol + $numberWithCommas(this.value.toFixed(0));
          }
        }
      },
      legend: { enabled: false },
      plotOptions: {
        areaspline: {
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, isPositive ? 'rgba(33, 206, 153, 0.3)' : 'rgba(255, 107, 107, 0.3)'],
              [1, isPositive ? 'rgba(33, 206, 153, 0.05)' : 'rgba(255, 107, 107, 0.05)']
            ]
          },
          lineWidth: 3,
          lineColor: isPositive ? '#21ce99' : '#ff6b6b',
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: true,
                radius: 6
              }
            }
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(45, 45, 45, 0.95)',
        borderColor: isPositive ? '#21ce99' : '#ff6b6b',
        borderRadius: 8,
        style: { color: 'white', fontSize: '13px' },
        formatter: function() {
          const date = new Date(this.x);
          const value = this.y;
          const change = value - totalBasis;
          const changePercent = totalBasis > 0 ? (change / totalBasis) * 100 : 0;
          
          return `
            <b>${date.toLocaleDateString()} ${timeframe === '24h' ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</b><br/>
            Portfolio Value: <b>${curSymbol}${$numberWithCommas(value.toFixed(2))}</b><br/>
            Change: <b style="color: ${change >= 0 ? '#21ce99' : '#ff6b6b'}">${change >= 0 ? '+' : ''}${curSymbol}${$numberWithCommas(change.toFixed(2))} (${changePercent.toFixed(2)}%)</b>
          `;
        }
      },
      credits: { enabled: false },
      series: [{
        name: 'Portfolio Value',
        data: portfolioData
      }]
    };

    setChartOptions(options);
  };

  const calculatePortfolioMetrics = () => {
    if (!coinz || !marketData || Object.keys(coinz).length === 0) {
      return;
    }

    let totalValue = 0;
    let totalBasis = 0;
    let coinPerformances = [];

    for (const coinSymbol in coinz) {
      const coin = coinz[coinSymbol];
      const market = marketData[coinSymbol];
      
      if (market && market.ticker) {
        const currentPrice = market.ticker.price;
        const holdings = coin.hodl;
        const costBasis = coin.cost_basis;
        
        const currentValue = currentPrice * holdings;
        const initialValue = costBasis * holdings;
        const coinReturn = currentValue - initialValue;
        const coinReturnPercent = initialValue > 0 ? (coinReturn / initialValue) * 100 : 0;
        
        totalValue += currentValue;
        totalBasis += initialValue;
        
        coinPerformances.push({
          symbol: coinSymbol,
          name: coinSymbol.toUpperCase(),
          currentValue,
          initialValue,
          return: coinReturn,
          returnPercent: coinReturnPercent,
          change24h: market.ticker.change || 0,
          allocation: 0 // Will be calculated after we have total value
        });
      }
    }

    // Calculate allocations
    coinPerformances = coinPerformances.map(coin => ({
      ...coin,
      allocation: totalValue > 0 ? (coin.currentValue / totalValue) * 100 : 0
    }));

    // Sort by performance
    const sortedByPerformance = [...coinPerformances].sort((a, b) => b.returnPercent - a.returnPercent);
    
    const totalReturn = totalValue - totalBasis;
    const totalReturnPercent = totalBasis > 0 ? (totalReturn / totalBasis) * 100 : 0;
    
    // Calculate diversification score (higher is better, max 100)
    const numCoins = coinPerformances.length;
    const allocations = coinPerformances.map(c => c.allocation);
    const maxAllocation = Math.max(...allocations);
    const diversificationScore = Math.min(100, (numCoins * 15) - (maxAllocation * 0.5));
    
    // Calculate portfolio volatility (simplified)
    const volatilities = coinPerformances.map(c => Math.abs(c.change24h));
    const avgVolatility = volatilities.length > 0 ? volatilities.reduce((a, b) => a + b, 0) / volatilities.length : 0;
    
    // Determine risk level
    let riskLevel = 'Low';
    if (avgVolatility > 10) riskLevel = 'High';
    else if (avgVolatility > 5) riskLevel = 'Medium';

    setPortfolioMetrics({
      totalReturn,
      totalReturnPercent,
      bestPerformer: sortedByPerformance[0] || null,
      worstPerformer: sortedByPerformance[sortedByPerformance.length - 1] || null,
      diversificationScore: Math.round(diversificationScore),
      riskLevel,
      volatility: avgVolatility,
      coinPerformances: sortedByPerformance
    });
  };

  const formatTimeframePeriod = (tf) => {
    switch(tf) {
      case '24h': return '24 Hours';
      case '7d': return '7 Days';
      case '30d': return '30 Days';
      default: return '30 Days';
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'Low': return '#21ce99';
      case 'Medium': return '#ffd93d';
      case 'High': return '#ff6b6b';
      default: return '#aaa';
    }
  };

  const { totalValue, totalBasis } = totalPortfolio || {};

  return (
    <AnalyticsContainer>
      <AnalyticsHeader>
        <AnalyticsTitle>Portfolio Analytics</AnalyticsTitle>
        <AnalyticsSubtitle>Comprehensive insights into your investment performance</AnalyticsSubtitle>
      </AnalyticsHeader>

      <TimeframeSelector>
        {['24h', '7d', '30d'].map(tf => (
          <TimeframeButton 
            key={tf}
            active={timeframe === tf}
            onClick={() => setTimeframe(tf)}
          >
            {formatTimeframePeriod(tf)}
          </TimeframeButton>
        ))}
      </TimeframeSelector>

      <MetricsGrid>
        <MetricCard>
          <MetricLabel>Total Return</MetricLabel>
          <MetricValue>
            {curSymbol}{$numberWithCommas(portfolioMetrics.totalReturn.toFixed(2))}
          </MetricValue>
          <MetricChange isPositive={portfolioMetrics.totalReturn >= 0}>
            {portfolioMetrics.totalReturn >= 0 ? '↗' : '↘'} {portfolioMetrics.totalReturnPercent.toFixed(2)}%
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Portfolio Value</MetricLabel>
          <MetricValue>
            {curSymbol}{$numberWithCommas(totalValue?.toFixed(2) || '0.00')}
          </MetricValue>
          <MetricChange isPositive={true}>
            ↗ Total Holdings
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Diversification Score</MetricLabel>
          <MetricValue>{portfolioMetrics.diversificationScore}/100</MetricValue>
          <MetricChange isPositive={portfolioMetrics.diversificationScore > 70}>
            {portfolioMetrics.diversificationScore > 70 ? '↗ Well Diversified' : '↘ Consider Diversifying'}
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Risk Level</MetricLabel>
          <MetricValue style={{ color: getRiskColor(portfolioMetrics.riskLevel) }}>
            {portfolioMetrics.riskLevel}
          </MetricValue>
          <MetricChange isPositive={portfolioMetrics.riskLevel === 'Low'}>
            {portfolioMetrics.volatility.toFixed(1)}% avg volatility
          </MetricChange>
        </MetricCard>
      </MetricsGrid>

      <ChartsSection>
        <ChartCard>
          <ChartTitle>Portfolio Performance Over Time</ChartTitle>
          <ChartContainer>
            {chartOptions && chartOptions.series ? (
              <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                ref={chartRef}
              />
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#aaa',
                fontSize: '14px'
              }}>
                Loading portfolio performance chart...
              </div>
            )}
          </ChartContainer>
        </ChartCard>
      </ChartsSection>

      <PerformanceSection>
        <PerformanceCard>
          <PerformanceTitle>Top Performers</PerformanceTitle>
          <CoinPerformanceList>
            {portfolioMetrics.coinPerformances?.slice(0, 5).map(coin => (
              <CoinPerformanceItem key={coin.symbol}>
                <CoinInfo>
                  <CoinName>{coin.name}</CoinName>
                  <CoinSymbol>{coin.symbol}</CoinSymbol>
                </CoinInfo>
                <CoinPerformance>
                  <CoinReturn isPositive={coin.returnPercent >= 0}>
                    {coin.returnPercent >= 0 ? '+' : ''}{coin.returnPercent.toFixed(2)}%
                  </CoinReturn>
                  <CoinValue>
                    {curSymbol}{$numberWithCommas(coin.currentValue.toFixed(2))}
                  </CoinValue>
                </CoinPerformance>
              </CoinPerformanceItem>
            ))}
          </CoinPerformanceList>
        </PerformanceCard>

        <PerformanceCard>
          <PerformanceTitle>Asset Allocation</PerformanceTitle>
          <CoinPerformanceList>
            {portfolioMetrics.coinPerformances?.slice(0, 5).map(coin => (
              <CoinPerformanceItem key={coin.symbol}>
                <CoinInfo>
                  <CoinName>{coin.name}</CoinName>
                  <CoinSymbol>{coin.allocation.toFixed(1)}% of portfolio</CoinSymbol>
                </CoinInfo>
                <CoinPerformance>
                  <CoinReturn isPositive={coin.change24h >= 0}>
                    24h: {coin.change24h >= 0 ? '+' : ''}{coin.change24h?.toFixed(2) || '0.00'}%
                  </CoinReturn>
                  <CoinValue>
                    {curSymbol}{$numberWithCommas(coin.currentValue.toFixed(2))}
                  </CoinValue>
                </CoinPerformance>
              </CoinPerformanceItem>
            ))}
          </CoinPerformanceList>
        </PerformanceCard>
      </PerformanceSection>

      <DiversificationSection>
        <DiversificationCard>
          <DiversificationTitle>Portfolio Health</DiversificationTitle>
          <DiversificationMetric>
            <DiversificationLabel>Number of Assets</DiversificationLabel>
            <DiversificationValue>{Object.keys(coinz || {}).length}</DiversificationValue>
          </DiversificationMetric>
          <DiversificationMetric>
            <DiversificationLabel>Largest Position</DiversificationLabel>
            <DiversificationValue>
              {portfolioMetrics.coinPerformances?.[0]?.allocation.toFixed(1) || '0'}%
            </DiversificationValue>
          </DiversificationMetric>
          <DiversificationMetric>
            <DiversificationLabel>Risk-Adjusted Return</DiversificationLabel>
            <DiversificationValue>
              {(portfolioMetrics.totalReturnPercent / Math.max(portfolioMetrics.volatility, 1)).toFixed(2)}
            </DiversificationValue>
          </DiversificationMetric>
        </DiversificationCard>

        <DiversificationCard>
          <DiversificationTitle>Performance Summary</DiversificationTitle>
          <DiversificationMetric>
            <DiversificationLabel>Best Performer</DiversificationLabel>
            <DiversificationValue style={{ color: '#21ce99' }}>
              {portfolioMetrics.bestPerformer?.name || 'N/A'}
            </DiversificationValue>
          </DiversificationMetric>
          <DiversificationMetric>
            <DiversificationLabel>Worst Performer</DiversificationLabel>
            <DiversificationValue style={{ color: '#ff6b6b' }}>
              {portfolioMetrics.worstPerformer?.name || 'N/A'}
            </DiversificationValue>
          </DiversificationMetric>
          <DiversificationMetric>
            <DiversificationLabel>Total Invested</DiversificationLabel>
            <DiversificationValue>
              {curSymbol}{$numberWithCommas(totalBasis?.toFixed(2) || '0.00')}
            </DiversificationValue>
          </DiversificationMetric>
        </DiversificationCard>
      </DiversificationSection>
    </AnalyticsContainer>
  );
};

export default PortfolioAnalytics;