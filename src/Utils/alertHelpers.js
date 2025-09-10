import { isUserSignedIn, putFile, getFile } from 'blockstack';

// Alert Types
export const ALERT_TYPES = {
  PRICE_ABOVE: 'price_above',
  PRICE_BELOW: 'price_below',
  PORTFOLIO_MILESTONE: 'portfolio_milestone',
  PORTFOLIO_DROP: 'portfolio_drop',
  MARKET_VOLATILITY: 'market_volatility',
  COIN_VOLUME: 'coin_volume'
};

// Alert Status
export const ALERT_STATUS = {
  ACTIVE: 'active',
  TRIGGERED: 'triggered',
  DISABLED: 'disabled',
  EXPIRED: 'expired'
};

// Storage Keys
const ALERTS_STORAGE_KEY = 'coinfox-alerts.json';
const LOCAL_STORAGE_KEY = 'coinfox-alerts';

/**
 * Save alerts to storage (Blockstack or localStorage)
 */
export const saveAlerts = async (alerts) => {
  const alertsData = {
    alerts,
    lastUpdated: new Date().toISOString(),
    version: '1.0'
  };

  try {
    if (isUserSignedIn()) {
      const encrypt = true;
      await putFile(ALERTS_STORAGE_KEY, JSON.stringify(alertsData), encrypt);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(alertsData));
    }
    return true;
  } catch (error) {
    console.error('Failed to save alerts:', error);
    return false;
  }
};

/**
 * Load alerts from storage (Blockstack or localStorage)
 * Compatible with both new format (alerts array) and legacy format (priceAlerts object)
 */
export const loadAlerts = async () => {
  try {
    let data;
    if (isUserSignedIn()) {
      const decrypt = true;
      data = await getFile(ALERTS_STORAGE_KEY, decrypt);
    } else {
      data = localStorage.getItem(LOCAL_STORAGE_KEY);
    }

    if (data) {
      const alertsData = JSON.parse(data);
      // Support both new format (alerts array) and legacy format (priceAlerts object)
      return alertsData.alerts || alertsData.priceAlerts || [];
    }
    return [];
  } catch (error) {
    console.log('No existing alerts found or error loading:', error);
    return [];
  }
};

/**
 * Create a new price alert
 */
export const createPriceAlert = (coin, type, targetPrice, options = {}) => {
  return {
    id: generateAlertId(),
    type,
    coin: coin.toLowerCase(),
    targetPrice: parseFloat(targetPrice),
    enabled: true,
    status: ALERT_STATUS.ACTIVE,
    createdAt: new Date().toISOString(),
    triggeredAt: null,
    metadata: {
      title: `${coin.toUpperCase()} Price Alert`,
      description: `Alert when ${coin.toUpperCase()} ${type === ALERT_TYPES.PRICE_ABOVE ? 'rises above' : 'falls below'} $${targetPrice}`,
      ...options
    }
  };
};

/**
 * Create a new portfolio milestone alert
 */
export const createPortfolioAlert = (type, targetValue, options = {}) => {
  return {
    id: generateAlertId(),
    type,
    targetValue: parseFloat(targetValue),
    enabled: true,
    status: ALERT_STATUS.ACTIVE,
    createdAt: new Date().toISOString(),
    triggeredAt: null,
    metadata: {
      title: 'Portfolio Milestone',
      description: `Alert when portfolio ${type === ALERT_TYPES.PORTFOLIO_MILESTONE ? 'reaches' : 'drops below'} $${targetValue}`,
      ...options
    }
  };
};

/**
 * Create a market volatility alert
 */
export const createMarketAlert = (volatilityThreshold, timeframe = '24h', options = {}) => {
  return {
    id: generateAlertId(),
    type: ALERT_TYPES.MARKET_VOLATILITY,
    volatilityThreshold: parseFloat(volatilityThreshold),
    timeframe,
    enabled: true,
    status: ALERT_STATUS.ACTIVE,
    createdAt: new Date().toISOString(),
    triggeredAt: null,
    metadata: {
      title: 'Market Volatility Alert',
      description: `Alert when market volatility exceeds ${volatilityThreshold}% in ${timeframe}`,
      ...options
    }
  };
};

/**
 * Check if price alerts should be triggered
 */
export const checkPriceAlerts = (alerts, marketData) => {
  const triggeredAlerts = [];
  const updatedAlerts = alerts.map(alert => {
    if (!alert.enabled || alert.status !== ALERT_STATUS.ACTIVE) {
      return alert;
    }

    if (alert.type === ALERT_TYPES.PRICE_ABOVE || alert.type === ALERT_TYPES.PRICE_BELOW) {
      const coinData = marketData[alert.coin];
      if (!coinData || !coinData.ticker) {
        return alert;
      }

      const currentPrice = coinData.ticker.price;
      let shouldTrigger = false;

      if (alert.type === ALERT_TYPES.PRICE_ABOVE && currentPrice >= alert.targetPrice) {
        shouldTrigger = true;
      } else if (alert.type === ALERT_TYPES.PRICE_BELOW && currentPrice <= alert.targetPrice) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        const triggeredAlert = {
          ...alert,
          status: ALERT_STATUS.TRIGGERED,
          triggeredAt: new Date().toISOString(),
          triggeredPrice: currentPrice
        };
        triggeredAlerts.push(triggeredAlert);
        return triggeredAlert;
      }
    }

    return alert;
  });

  return { updatedAlerts, triggeredAlerts };
};

/**
 * Check if portfolio alerts should be triggered
 */
export const checkPortfolioAlerts = (alerts, portfolioValue) => {
  const triggeredAlerts = [];
  const updatedAlerts = alerts.map(alert => {
    if (!alert.enabled || alert.status !== ALERT_STATUS.ACTIVE) {
      return alert;
    }

    if (alert.type === ALERT_TYPES.PORTFOLIO_MILESTONE || alert.type === ALERT_TYPES.PORTFOLIO_DROP) {
      let shouldTrigger = false;

      if (alert.type === ALERT_TYPES.PORTFOLIO_MILESTONE && portfolioValue >= alert.targetValue) {
        shouldTrigger = true;
      } else if (alert.type === ALERT_TYPES.PORTFOLIO_DROP && portfolioValue <= alert.targetValue) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        const triggeredAlert = {
          ...alert,
          status: ALERT_STATUS.TRIGGERED,
          triggeredAt: new Date().toISOString(),
          triggeredValue: portfolioValue
        };
        triggeredAlerts.push(triggeredAlert);
        return triggeredAlert;
      }
    }

    return alert;
  });

  return { updatedAlerts, triggeredAlerts };
};

/**
 * Check market volatility alerts
 */
export const checkMarketAlerts = (alerts, marketData) => {
  const triggeredAlerts = [];
  const updatedAlerts = alerts.map(alert => {
    if (!alert.enabled || alert.status !== ALERT_STATUS.ACTIVE || alert.type !== ALERT_TYPES.MARKET_VOLATILITY) {
      return alert;
    }

    // Calculate average volatility across all coins
    const volatilities = Object.values(marketData)
      .filter(coin => coin.ticker && coin.ticker.change !== undefined)
      .map(coin => Math.abs(coin.ticker.change));

    if (volatilities.length === 0) {
      return alert;
    }

    const avgVolatility = volatilities.reduce((a, b) => a + b, 0) / volatilities.length;

    if (avgVolatility >= alert.volatilityThreshold) {
      const triggeredAlert = {
        ...alert,
        status: ALERT_STATUS.TRIGGERED,
        triggeredAt: new Date().toISOString(),
        triggeredVolatility: avgVolatility
      };
      triggeredAlerts.push(triggeredAlert);
      return triggeredAlert;
    }

    return alert;
  });

  return { updatedAlerts, triggeredAlerts };
};

/**
 * Process all alerts and return triggered ones
 */
export const processAlerts = async (alerts, marketData, portfolioValue) => {
  let allTriggered = [];
  let currentAlerts = [...alerts];

  // Check price alerts
  const priceCheck = checkPriceAlerts(currentAlerts, marketData);
  currentAlerts = priceCheck.updatedAlerts;
  allTriggered = [...allTriggered, ...priceCheck.triggeredAlerts];

  // Check portfolio alerts
  const portfolioCheck = checkPortfolioAlerts(currentAlerts, portfolioValue);
  currentAlerts = portfolioCheck.updatedAlerts;
  allTriggered = [...allTriggered, ...portfolioCheck.triggeredAlerts];

  // Check market alerts
  const marketCheck = checkMarketAlerts(currentAlerts, marketData);
  currentAlerts = marketCheck.updatedAlerts;
  allTriggered = [...allTriggered, ...marketCheck.triggeredAlerts];

  // Save updated alerts if any were triggered
  if (allTriggered.length > 0) {
    await saveAlerts(currentAlerts);
  }

  return {
    alerts: currentAlerts,
    triggeredAlerts: allTriggered
  };
};

/**
 * Reset a triggered alert to active status
 */
export const resetAlert = async (alerts, alertId) => {
  const updatedAlerts = alerts.map(alert => {
    if (alert.id === alertId) {
      return {
        ...alert,
        status: ALERT_STATUS.ACTIVE,
        triggeredAt: null,
        triggeredPrice: null,
        triggeredValue: null,
        triggeredVolatility: null
      };
    }
    return alert;
  });

  await saveAlerts(updatedAlerts);
  return updatedAlerts;
};

/**
 * Toggle alert enabled/disabled status
 */
export const toggleAlert = async (alerts, alertId) => {
  const updatedAlerts = alerts.map(alert => {
    if (alert.id === alertId) {
      return {
        ...alert,
        enabled: !alert.enabled,
        status: !alert.enabled ? ALERT_STATUS.ACTIVE : ALERT_STATUS.DISABLED
      };
    }
    return alert;
  });

  await saveAlerts(updatedAlerts);
  return updatedAlerts;
};

/**
 * Delete an alert
 */
export const deleteAlert = async (alerts, alertId) => {
  const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
  await saveAlerts(updatedAlerts);
  return updatedAlerts;
};

/**
 * Get alerts by status
 */
export const getAlertsByStatus = (alerts, status) => {
  return alerts.filter(alert => alert.status === status);
};

/**
 * Get alerts by type
 */
export const getAlertsByType = (alerts, type) => {
  return alerts.filter(alert => alert.type === type);
};

/**
 * Format alert for notification display
 */
export const formatAlertNotification = (alert, currency = 'USD') => {
  const currencySymbol = currency === 'USD' ? '$' : currency;
  
  switch (alert.type) {
    case ALERT_TYPES.PRICE_ABOVE:
      return {
        type: 'price-alert',
        coin: alert.coin,
        condition: 'above',
        targetPrice: alert.targetPrice,
        currentPrice: alert.triggeredPrice,
        title: `${alert.coin.toUpperCase()} Price Alert`,
        message: `${alert.coin.toUpperCase()} has risen above your target price of ${currencySymbol}${alert.targetPrice.toLocaleString()}!`
      };
      
    case ALERT_TYPES.PRICE_BELOW:
      return {
        type: 'price-alert',
        coin: alert.coin,
        condition: 'below',
        targetPrice: alert.targetPrice,
        currentPrice: alert.triggeredPrice,
        title: `${alert.coin.toUpperCase()} Price Alert`,
        message: `${alert.coin.toUpperCase()} has fallen below your target price of ${currencySymbol}${alert.targetPrice.toLocaleString()}!`
      };
      
    case ALERT_TYPES.PORTFOLIO_MILESTONE:
      return {
        type: 'portfolio-milestone',
        title: 'Portfolio Milestone Reached!',
        message: `Your portfolio has reached ${currencySymbol}${alert.targetValue.toLocaleString()}! Current value: ${currencySymbol}${alert.triggeredValue?.toLocaleString()}`
      };
      
    case ALERT_TYPES.PORTFOLIO_DROP:
      return {
        type: 'portfolio-milestone',
        title: 'Portfolio Alert',
        message: `Your portfolio has dropped below ${currencySymbol}${alert.targetValue.toLocaleString()}. Current value: ${currencySymbol}${alert.triggeredValue?.toLocaleString()}`
      };
      
    case ALERT_TYPES.MARKET_VOLATILITY:
      return {
        type: 'market-alert',
        title: 'High Market Volatility',
        message: `Market volatility has exceeded ${alert.volatilityThreshold}%. Current average: ${alert.triggeredVolatility?.toFixed(2)}%`
      };
      
    default:
      return {
        type: 'info',
        title: 'Alert Triggered',
        message: alert.metadata?.description || 'An alert condition has been met.'
      };
  }
};

/**
 * Calculate portfolio performance metrics
 */
export const calculatePortfolioMetrics = (coinz, marketData) => {
  if (!coinz || !marketData || Object.keys(coinz).length === 0) {
    return {
      totalValue: 0,
      totalBasis: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      bestPerformer: null,
      worstPerformer: null
    };
  }

  let totalValue = 0;
  let totalBasis = 0;
  const coinPerformances = [];

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
        currentValue,
        initialValue,
        return: coinReturn,
        returnPercent: coinReturnPercent
      });
    }
  }

  const sortedByPerformance = coinPerformances.sort((a, b) => b.returnPercent - a.returnPercent);
  const totalReturn = totalValue - totalBasis;
  const totalReturnPercent = totalBasis > 0 ? (totalReturn / totalBasis) * 100 : 0;

  return {
    totalValue,
    totalBasis,
    totalReturn,
    totalReturnPercent,
    bestPerformer: sortedByPerformance[0] || null,
    worstPerformer: sortedByPerformance[sortedByPerformance.length - 1] || null,
    coinPerformances: sortedByPerformance
  };
};

/**
 * Generate unique alert ID
 */
const generateAlertId = () => {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate alert data
 */
export const validateAlert = (alert) => {
  if (!alert.type || !Object.values(ALERT_TYPES).includes(alert.type)) {
    return { valid: false, error: 'Invalid alert type' };
  }

  if (alert.type === ALERT_TYPES.PRICE_ABOVE || alert.type === ALERT_TYPES.PRICE_BELOW) {
    if (!alert.coin || typeof alert.coin !== 'string') {
      return { valid: false, error: 'Coin symbol is required for price alerts' };
    }
    if (!alert.targetPrice || isNaN(alert.targetPrice) || alert.targetPrice <= 0) {
      return { valid: false, error: 'Valid target price is required' };
    }
  }

  if (alert.type === ALERT_TYPES.PORTFOLIO_MILESTONE || alert.type === ALERT_TYPES.PORTFOLIO_DROP) {
    if (!alert.targetValue || isNaN(alert.targetValue) || alert.targetValue <= 0) {
      return { valid: false, error: 'Valid target value is required' };
    }
  }

  if (alert.type === ALERT_TYPES.MARKET_VOLATILITY) {
    if (!alert.volatilityThreshold || isNaN(alert.volatilityThreshold) || alert.volatilityThreshold <= 0) {
      return { valid: false, error: 'Valid volatility threshold is required' };
    }
  }

  return { valid: true };
};

export default {
  ALERT_TYPES,
  ALERT_STATUS,
  saveAlerts,
  loadAlerts,
  createPriceAlert,
  createPortfolioAlert,
  createMarketAlert,
  processAlerts,
  resetAlert,
  toggleAlert,
  deleteAlert,
  getAlertsByStatus,
  getAlertsByType,
  formatAlertNotification,
  calculatePortfolioMetrics,
  validateAlert
};