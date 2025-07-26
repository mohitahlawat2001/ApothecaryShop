const ForecastingService = require('../services/forecastingService');

// Get forecast for a specific product
const getProductForecast = async (req, res) => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;

    const forecast = await ForecastingService.forecastStockLevel(
      productId, 
      parseInt(days)
    );

    res.json(forecast);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get bulk forecasts for multiple products
const getBulkForecast = async (req, res) => {
  try {
    const {
      productIds,
      forecastDays = 30,
      includeOnlyLowStock = false,
      limit = 50
    } = req.body;

    const forecast = await ForecastingService.generateBulkForecast({
      productIds,
      forecastDays: parseInt(forecastDays),
      includeOnlyLowStock: includeOnlyLowStock === 'true',
      limit: parseInt(limit)
    });

    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get consumption analysis for a product
const getConsumptionAnalysis = async (req, res) => {
  try {
    const { productId } = req.params;
    const { days = 30 } = req.query;

    const analysis = await ForecastingService.calculateMovingAverage(
      productId,
      parseInt(days)
    );

    res.json(analysis);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get forecasting analytics dashboard
const getForecastingAnalytics = async (req, res) => {
  try {
    const analytics = await ForecastingService.getForecastingAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reorder recommendations
const getReorderRecommendations = async (req, res) => {
  try {
    const { urgencyLevel = 'all', limit = 20 } = req.query;

    const forecast = await ForecastingService.generateBulkForecast({
      includeOnlyLowStock: true,
      limit: parseInt(limit)
    });

    let recommendations = forecast.forecasts
      .filter(f => f.reorderSuggestion.shouldReorder)
      .map(f => ({
        productId: f.productId,
        productName: f.productName,
        currentStock: f.currentStock,
        reorderLevel: f.reorderLevel,
        daysUntilStockOut: f.daysUntilStockOut,
        urgency: f.reorderSuggestion.urgency,
        suggestedOrderQuantity: f.reorderSuggestion.suggestedOrderQuantity,
        estimatedCost: f.reorderSuggestion.estimatedCost,
        confidence: f.confidence
      }));

    // Filter by urgency if specified
    if (urgencyLevel !== 'all') {
      recommendations = recommendations.filter(r => r.urgency === urgencyLevel);
    }

    res.json({
      totalRecommendations: recommendations.length,
      urgencyBreakdown: {
        high: recommendations.filter(r => r.urgency === 'high').length,
        medium: recommendations.filter(r => r.urgency === 'medium').length,
        low: recommendations.filter(r => r.urgency === 'low').length
      },
      totalEstimatedCost: recommendations.reduce((sum, r) => sum + r.estimatedCost, 0),
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProductForecast,
  getBulkForecast,
  getConsumptionAnalysis,
  getForecastingAnalytics,
  getReorderRecommendations
};