const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Batch = require('../models/Batch');

// Simple inventory forecasting service
class ForecastingService {
  
  // Calculate moving average consumption
  static async calculateMovingAverage(productId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const movements = await StockMovement.find({
        product: productId,
        type: 'out',
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 });

      if (movements.length === 0) {
        return { average: 0, trend: 'stable', confidence: 'low' };
      }

      const totalConsumption = movements.reduce((sum, movement) => sum + movement.quantity, 0);
      const dailyAverage = totalConsumption / days;

      // Calculate trend (simple linear regression)
      const trend = this.calculateTrend(movements);
      const confidence = this.calculateConfidence(movements, days);

      return {
        average: dailyAverage,
        totalConsumption,
        movementCount: movements.length,
        trend,
        confidence,
        periodDays: days
      };
    } catch (error) {
      throw new Error(`Failed to calculate moving average: ${error.message}`);
    }
  }

  // Calculate consumption trend
  static calculateTrend(movements) {
    if (movements.length < 2) return 'stable';

    const n = movements.length;
    const midpoint = Math.floor(n / 2);
    
    const firstHalf = movements.slice(0, midpoint);
    const secondHalf = movements.slice(midpoint);

    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.quantity, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.quantity, 0) / secondHalf.length;

    const trendRatio = secondHalfAvg / firstHalfAvg;

    if (trendRatio > 1.2) return 'increasing';
    if (trendRatio < 0.8) return 'decreasing';
    return 'stable';
  }

  // Calculate confidence level
  static calculateConfidence(movements, days) {
    if (movements.length === 0) return 'none';
    if (movements.length < 3) return 'very_low';
    if (movements.length < 7) return 'low';
    if (movements.length < 14) return 'medium';
    if (movements.length >= 14 && days >= 30) return 'high';
    return 'medium';
  }

  // Forecast stock levels for next N days
  static async forecastStockLevel(productId, forecastDays = 30) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Get consumption analysis
      const analysisWeeks = [7, 14, 30, 60]; // Multiple periods for better accuracy
      const analyses = {};
      
      for (const days of analysisWeeks) {
        analyses[`${days}days`] = await this.calculateMovingAverage(productId, days);
      }

      // Use weighted average of different periods
      const weights = { '7days': 0.4, '14days': 0.3, '30days': 0.2, '60days': 0.1 };
      let weightedConsumption = 0;
      let totalWeight = 0;

      for (const [period, analysis] of Object.entries(analyses)) {
        if (analysis.confidence !== 'none' && analysis.confidence !== 'very_low') {
          const weight = weights[period] || 0.1;
          weightedConsumption += analysis.average * weight;
          totalWeight += weight;
        }
      }

      const dailyConsumption = totalWeight > 0 ? weightedConsumption / totalWeight : 0;

      // Apply trend adjustment
      const latestTrend = analyses['14days'].trend;
      let trendMultiplier = 1;
      
      if (latestTrend === 'increasing') trendMultiplier = 1.2;
      else if (latestTrend === 'decreasing') trendMultiplier = 0.8;

      const adjustedDailyConsumption = dailyConsumption * trendMultiplier;

      // Calculate forecast
      const forecast = [];
      let currentStock = product.stockQuantity;

      for (let day = 1; day <= forecastDays; day++) {
        currentStock -= adjustedDailyConsumption;
        
        // Add some randomness for realistic forecasting
        const variance = adjustedDailyConsumption * 0.1; // 10% variance
        const randomFactor = (Math.random() - 0.5) * variance;
        
        forecast.push({
          day,
          date: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
          predictedStock: Math.max(0, Math.round(currentStock + randomFactor)),
          expectedConsumption: Math.round(adjustedDailyConsumption)
        });

        // Stop if stock reaches zero
        if (currentStock <= 0) break;
      }

      // Calculate stock-out date
      const stockOutDay = forecast.find(f => f.predictedStock <= 0);
      const reorderSuggestion = this.calculateReorderSuggestion(
        product,
        adjustedDailyConsumption,
        stockOutDay
      );

      return {
        productId,
        productName: product.name,
        currentStock: product.stockQuantity,
        reorderLevel: product.reorderLevel,
        dailyConsumptionRate: Math.round(adjustedDailyConsumption * 100) / 100,
        forecastPeriod: forecastDays,
        trend: latestTrend,
        confidence: this.getOverallConfidence(analyses),
        stockOutDate: stockOutDay ? stockOutDay.date : null,
        daysUntilStockOut: stockOutDay ? stockOutDay.day : null,
        forecast: forecast.slice(0, 30), // Return max 30 days for performance
        reorderSuggestion,
        analyses
      };
    } catch (error) {
      throw new Error(`Failed to forecast stock level: ${error.message}`);
    }
  }

  // Calculate reorder suggestion
  static calculateReorderSuggestion(product, dailyConsumption, stockOutDay) {
    const leadTime = 7; // Assume 7-day lead time
    const safetyStock = dailyConsumption * 3; // 3-day safety stock
    
    const suggestedReorderPoint = (dailyConsumption * leadTime) + safetyStock;
    const suggestedOrderQuantity = dailyConsumption * 30; // 30-day supply

    return {
      shouldReorder: product.stockQuantity <= suggestedReorderPoint,
      suggestedReorderPoint: Math.round(suggestedReorderPoint),
      suggestedOrderQuantity: Math.round(suggestedOrderQuantity),
      urgency: stockOutDay && stockOutDay.day <= 14 ? 'high' : 
               stockOutDay && stockOutDay.day <= 30 ? 'medium' : 'low',
      estimatedCost: Math.round(suggestedOrderQuantity * product.unitPrice),
      leadTimeDays: leadTime
    };
  }

  // Get overall confidence from multiple analyses
  static getOverallConfidence(analyses) {
    const confidenceScores = {
      'none': 0,
      'very_low': 1,
      'low': 2,
      'medium': 3,
      'high': 4
    };

    const scores = Object.values(analyses).map(a => confidenceScores[a.confidence] || 0);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    if (avgScore >= 3.5) return 'high';
    if (avgScore >= 2.5) return 'medium';
    if (avgScore >= 1.5) return 'low';
    if (avgScore >= 0.5) return 'very_low';
    return 'none';
  }

  // Generate forecasts for multiple products
  static async generateBulkForecast(options = {}) {
    try {
      const {
        productIds = null,
        forecastDays = 30,
        includeOnlyLowStock = false,
        limit = 50
      } = options;

      let filter = {};
      
      if (productIds && productIds.length > 0) {
        filter._id = { $in: productIds };
      }

      if (includeOnlyLowStock) {
        filter.$expr = { $lte: ['$stockQuantity', '$reorderLevel'] };
      }

      const products = await Product.find(filter).limit(limit);
      const forecasts = [];

      for (const product of products) {
        try {
          const forecast = await this.forecastStockLevel(product._id, forecastDays);
          forecasts.push(forecast);
        } catch (error) {
          console.error(`Failed to forecast for product ${product._id}:`, error.message);
          // Continue with other products
        }
      }

      // Sort by urgency and stock-out date
      forecasts.sort((a, b) => {
        if (a.daysUntilStockOut && b.daysUntilStockOut) {
          return a.daysUntilStockOut - b.daysUntilStockOut;
        }
        if (a.daysUntilStockOut) return -1;
        if (b.daysUntilStockOut) return 1;
        return 0;
      });

      return {
        totalForecasts: forecasts.length,
        criticalProducts: forecasts.filter(f => f.daysUntilStockOut && f.daysUntilStockOut <= 7).length,
        lowStockProducts: forecasts.filter(f => f.reorderSuggestion.shouldReorder).length,
        forecasts
      };
    } catch (error) {
      throw new Error(`Failed to generate bulk forecast: ${error.message}`);
    }
  }

  // Get forecasting analytics
  static async getForecastingAnalytics() {
    try {
      const totalProducts = await Product.countDocuments();
      const lowStockProducts = await Product.countDocuments({
        $expr: { $lte: ['$stockQuantity', '$reorderLevel'] }
      });

      // Get stock movement statistics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const movementStats = await StockMovement.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]);

      const stats = {
        totalProducts,
        lowStockProducts,
        lowStockPercentage: totalProducts > 0 ? (lowStockProducts / totalProducts * 100).toFixed(2) : 0,
        movementStats: movementStats.reduce((acc, stat) => {
          acc[stat._id] = stat;
          return acc;
        }, {}),
        lastUpdated: new Date()
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get forecasting analytics: ${error.message}`);
    }
  }
}

module.exports = ForecastingService;