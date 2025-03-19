import React, { useState } from 'react';
import { generateAiResponse } from '../services/maomaoAiService';

const StockMovementAiAnalysis = ({ stockMovements, productName }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Helper function to clean AI response from unwanted markdown code blocks
  const cleanAiResponse = (response) => {
    // Remove markdown code block markers if present
    return response
      .replace(/^```html\s*/i, '') // Remove opening ```html
      .replace(/\s*```$/i, '');     // Remove closing ```
  };

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare data to send to AI service
      const movementsSummary = stockMovements.map(movement => ({
        date: new Date(movement.createdAt).toLocaleDateString(),
        type: movement.type === 'in' ? 'Stock In' : 'Stock Out',
        quantity: movement.quantity,
        previousStock: movement.previousStock,
        newStock: movement.newStock,
        reason: movement.reason
      }));
      
      const prompt = `As an inventory management expert, analyze these stock movements for the product "${productName}":
${JSON.stringify(movementsSummary)}

Please provide:
1. A summary of overall stock movement patterns
2. Any concerning trends or issues identified
3. Recommendations for inventory management
4. Prediction of future stock needs based on current patterns

Format your response as HTML with proper headings (<h3>), paragraphs (<p>), and lists (<ul>, <li>) for better readability.
DO NOT include markdown code block markers (like \`\`\`html or \`\`\`) in your response.`;

      const requestData = {
        prompt,
        userName: 'Inventory Manager',
        userContext: 'Analyzing stock movement data for business insights',
        outputFormat: 'html',
        structuredOutput: false
      };
      
      const response = await generateAiResponse(requestData);
      // Clean the response before setting it
      setAnalysis(cleanAiResponse(response.response));
      setShowAnalysis(true);
    } catch (err) {
      console.error('Error generating AI analysis:', err);
      setError('Failed to generate analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnalysis = () => {
    if (showAnalysis) {
      setShowAnalysis(false);
    } else if (analysis) {
      setShowAnalysis(true);
    } else {
      generateAnalysis();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">AI Stock Movement Analysis</h2>
        <button
          onClick={toggleAnalysis}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : showAnalysis ? 'Hide Analysis' : analysis ? 'Show Analysis' : 'Generate Analysis'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          <p className="mt-4 text-gray-600">Generating intelligent analysis...</p>
        </div>
      )}
      
      {showAnalysis && analysis && (
        <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: analysis }}
          ></div>
        </div>
      )}
      
      {!loading && !showAnalysis && !error && (
        <div className="text-gray-500 italic p-4 bg-gray-50 rounded-lg">
          <p>Click the "Generate Analysis" button to get AI-powered insights about these stock movements.</p>
          <p className="mt-2 text-sm">The analysis will include patterns, trends, inventory management recommendations, and future stock predictions.</p>
        </div>
      )}
    </div>
  );
};

export default StockMovementAiAnalysis;
