import React, { useState } from 'react';
import { generateAiResponse } from '../services/maomaoAiService';
import { FaRobot, FaSpinner, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const DashboardAiAnalysis = ({ stats }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);
    setIsExpanded(true); // Open the panel to make spinner visible
    
    try {
      // Create a prompt that includes all the inventory statistics
      const prompt = `
        As an inventory management expert, analyze this apothecary shop's current inventory stats and provide actionable recommendations:
        
        - Total Products: ${stats.totalProducts}
        - Low Stock Products: ${stats.lowStockProducts} 
        - Expiring Soon Products: ${stats.expiringProducts}
        - Expired Products: ${stats.expiredProducts}
        - Total Inventory Value: $${stats.totalValue.toFixed(2)}
        
        Provide a concise analysis of the inventory health and 3-5 specific recommendations to optimize inventory management. 
        Include insights about stock levels, product expiration management, and potential financial considerations.
        Do not include any markdown or code formatting syntax like backticks in your response.
      `;
      
      const response = await generateAiResponse({
        prompt,
        userName: 'Inventory Manager',
        userContext: 'Analyzing inventory dashboard statistics',
        outputFormat: 'html',
        structuredOutput: false
      });
      
      // Clean the response to remove any backticks that might be in the HTML
      const cleanedResponse = response.response.replace(/```html|```|`/g, '');
      setAnalysis(cleanedResponse);
    } catch (err) {
      console.error('Error generating inventory analysis:', err);
      setError('Failed to generate inventory analysis. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FaRobot className="mr-2 text-blue-500" />
            MaoMao AI Inventory Analysis
          </h3>
          
          {!analysis && !loading && (
            <button
              onClick={generateAnalysis}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              Analyze Inventory
            </button>
          )}
          
          {analysis && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              {isExpanded ? (
                <>
                  <FaChevronUp className="mr-1" /> 
                </>
              ) : (
                <>
                  <FaChevronDown className="mr-1" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Modified to ensure content is completely hidden when collapsed */}
      <div className={`transition-all duration-300 ${isExpanded || loading ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {loading && (
          <div className="p-5 flex justify-center items-center">
            <FaSpinner className="animate-spin text-blue-500 mr-2 text-xl" />
            <span className="text-gray-600">Generating analysis...</span>
          </div>
        )}
        
        {error && (
          <div className="p-5 text-red-500">
            {error}
          </div>
        )}
        
        {analysis && (
          <div 
            className="p-5 text-gray-700"
            dangerouslySetInnerHTML={{ __html: analysis }}
          />
        )}
      </div>
      
      {/* Modified to add clear separation between collapsed content and "Show analysis" button */}
      {!isExpanded && analysis && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <FaChevronDown className="mr-1" /> Show analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardAiAnalysis;
