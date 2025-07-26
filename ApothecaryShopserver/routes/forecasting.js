const express = require('express');
const router = express.Router();
const forecastingController = require('../controllers/forecastingController');
const auth = require('../middleware/auth');

// Get forecast for a specific product
router.get('/product/:productId', auth, forecastingController.getProductForecast);

// Get consumption analysis for a product
router.get('/analysis/:productId', auth, forecastingController.getConsumptionAnalysis);

// Get forecasting analytics
router.get('/analytics', auth, forecastingController.getForecastingAnalytics);

// Get reorder recommendations
router.get('/recommendations', auth, forecastingController.getReorderRecommendations);

// Get bulk forecasts
router.post('/bulk', auth, forecastingController.getBulkForecast);

module.exports = router;