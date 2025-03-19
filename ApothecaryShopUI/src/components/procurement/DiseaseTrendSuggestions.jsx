import React, { useState, useEffect } from 'react';
import { getTrendingDiseaseProducts } from '../../services/maomaoAiService';

function DiseaseTrendSuggestions({ onProductSelect, isJanAushadhi }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTrendingDiseaseProducts(isJanAushadhi);
      
      // Process suggestions to extract clean drug names
      const processedSuggestions = (response.response || []).map(item => {
        // Extract just the drug name without dosage or descriptions
        // This regex attempts to get just the medicine name part
        const drugNameMatch = item.match(/^([A-Za-z\s\-]+)(?:\s+\d|\s+\(|\s+\-|$)/);
        return drugNameMatch ? drugNameMatch[1].trim() : item;
      });
      
      setSuggestions(processedSuggestions);
    } catch (err) {
      console.error('Failed to fetch disease trend suggestions:', err);
      setError('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded) {
      fetchSuggestions();
    }
  }, [expanded, isJanAushadhi]);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleSuggestionClick = (suggestion) => {
    // Add logging to help diagnose issues
    console.log(`Searching for: ${suggestion}`);
    
    // Directly trigger search with the drug name
    // Pass suggestion and true to ensure immediate search
    onProductSelect(suggestion, true);
  };

  return (
    <div className="mt-2 border rounded-md overflow-hidden bg-white">
      <button
        onClick={toggleExpanded}
        className="w-full px-4 py-2 text-left bg-blue-50 hover:bg-blue-100 flex justify-between items-center"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="font-medium">MaomaoAi Trend Analysis</span>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${expanded ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {expanded && (
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-2">{error}</div>
          ) : suggestions.length === 0 ? (
            <div className="text-gray-500 text-center py-2">No suggestions available</div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Based on recent disease trends, consider stocking these medications:
              </p>
              <ul className="divide-y divide-gray-200 max-h-40 overflow-y-auto pr-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="py-2">
                    <button
                      type="button" // Explicitly setting type to prevent form submission
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left hover:bg-gray-50 p-2 rounded flex justify-between items-center"
                    >
                      <span className="font-medium text-blue-600">{suggestion}</span>
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiseaseTrendSuggestions;
