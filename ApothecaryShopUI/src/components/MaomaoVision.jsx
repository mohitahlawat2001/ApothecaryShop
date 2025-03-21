import React, { useState, useRef, useEffect } from 'react';
import { analyzeProductImage } from '../services/maomaoVisionService';

const MaomaoVision = ({ onProductFound }) => {
  const [open, setOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [parsedResults, setParsedResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Custom prompt state
  const [customPrompt, setCustomPrompt] = useState('');

  // Process analysis results into structured format when they arrive
  useEffect(() => {
    if (analysisResult) {
      parseAnalysisResult(analysisResult);
    }
  }, [analysisResult]);

  const parseAnalysisResult = (text) => {
    // Format the text to handle markdown-style formatting
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                             .replace(/\*(.*?)\*/g, '<em>$1</em>');
                             
    // Extract product name and other details using more robust parsing
    const lines = text.split('\n').filter(line => line.trim());
    const result = {
      productName: '',
      possibleNames: [],
      formattedDetails: {
        activeIngredient: '',
        otherIngredients: [],
        dosage: '',
        warnings: [],
        manufacturer: '',
        category: '',
      },
      rawText: formattedText, // Store the HTML-formatted text
      otherDetails: {}
    };

    // Common product detail label patterns
    const productNamePatterns = [
      /product\s*name\s*[:：]/i,
      /name\s*[:：]/i,
      /product\s*[:：]/i,
      /identified\s*as\s*[:：]/i,
      /^name\s*[:：]/i
    ];

    // First, try to find product name from specific labeled lines
    for (const line of lines) {
      const cleanLine = line.replace(/^\*\*|\*\*/g, '').trim();
      
      // Check if line matches any product name pattern
      for (const pattern of productNamePatterns) {
        if (pattern.test(cleanLine)) {
          // Extract only what appears after the colon
          const colonIndex = cleanLine.indexOf(':');
          if (colonIndex !== -1) {
            const nameAfterColon = cleanLine.substring(colonIndex + 1).trim();
            if (nameAfterColon) {
              // Look for the main product name, typically the first word
              const mainProductName = nameAfterColon.split(' ')[0].trim().replace(/[^a-zA-Z0-9]/g, '');
              if (mainProductName && mainProductName.length > 2) {
                result.productName = mainProductName;
                result.possibleNames.push(mainProductName);
                
                // Also add the full name after the colon as a possible name
                if (nameAfterColon !== mainProductName) {
                  result.possibleNames.push(nameAfterColon);
                }
                break;
              } else {
                // If main product name is too short, use the full content after colon
                result.productName = nameAfterColon;
                result.possibleNames.push(nameAfterColon);
              }
            }
          }
        }
      }
      
      // If we found a product name, break out of the loop
      if (result.productName) break;
    }

    // First pass: Group content by section headers
    let currentSection = '';
    const sectionContent = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const cleanLine = line.replace(/^\*\*\s*|\*\s*/g, '').trim(); // Clean line for processing
      
      // Check if this line is a section header (ends with colon)
      if (line.endsWith(':')) {
        currentSection = cleanLine.slice(0, -1).trim(); // Remove the colon
        sectionContent[currentSection] = [];
        continue;
      }
      
      // Handle special case for section headers without a space after the colon
      const colonIndex = cleanLine.indexOf(':');
      if (colonIndex !== -1 && colonIndex < cleanLine.length - 1) {
        const potentialHeader = cleanLine.substring(0, colonIndex).trim().toLowerCase();
        const potentialContent = cleanLine.substring(colonIndex + 1).trim();
        
        if (potentialHeader === 'product name' || potentialHeader === 'name') {
          // We've already handled this in the specific product name extraction above
          if (!result.productName) {
            result.productName = potentialContent;
            result.possibleNames.push(potentialContent);
          }
          continue;
        }
      }
      
      // Add content to current section
      if (currentSection && (line.startsWith('**') || line.startsWith('* '))) {
        sectionContent[currentSection].push(cleanLine);
      } 
      else if (currentSection) {
        sectionContent[currentSection].push(cleanLine);
      }
    }
    
    // Process the grouped content into our result structure
    for (const [section, content] of Object.entries(sectionContent)) {
      const lowerSection = section.toLowerCase();
      
      // Map common section headers to our structured data
      if (lowerSection.includes('product name') || lowerSection.includes('name:')) {
        result.productName = content.join(' ');
        result.possibleNames.push(result.productName);
      } 
      else if (lowerSection.includes('active ingredient')) {
        result.formattedDetails.activeIngredient = content.join(' ');
      }
      else if (lowerSection.includes('other ingredient') || lowerSection.includes('excipient')) {
        result.formattedDetails.otherIngredients = content;
      }
      else if (lowerSection.includes('dosage') || lowerSection.includes('administration')) {
        result.formattedDetails.dosage = content.join(' ');
        
        // Extract potential warnings from dosage text
        if (content.some(line => 
          line.toLowerCase().includes('warning') || 
          line.toLowerCase().includes('caution') ||
          line.toLowerCase().includes('not recommended') ||
          line.toLowerCase().includes('pregnancy') ||
          line.toLowerCase().includes('children')
        )) {
          const warningText = content.filter(line => 
            line.toLowerCase().includes('warning') || 
            line.toLowerCase().includes('caution') ||
            line.toLowerCase().includes('not recommended') ||
            line.toLowerCase().includes('pregnancy') ||
            line.toLowerCase().includes('children')
          );
          
          result.formattedDetails.warnings = [...result.formattedDetails.warnings, ...warningText];
        }
      }
      else if (lowerSection.includes('warning') || lowerSection.includes('caution')) {
        result.formattedDetails.warnings = [...result.formattedDetails.warnings, ...content];
      }
      else if (lowerSection.includes('manufacturer') || lowerSection.includes('made by')) {
        result.formattedDetails.manufacturer = content.join(' ');
      }
      else if (lowerSection.includes('category') || lowerSection.includes('classification')) {
        result.formattedDetails.category = content.join(' ');
      }
      // Store other sections in otherDetails
      else {
        if (!result.otherDetails[section]) {
          result.otherDetails[section] = {};
        }
        if (!result.otherDetails[section].text) {
          result.otherDetails[section].text = [];
        }
        result.otherDetails[section].text = content;
      }
    }

    // Extract other possible product names
    const nameKeywords = ['drug', 'medicine', 'tablet', 'capsule', 'syrup', 'called', 'brand'];
    for (const line of lines) {
      for (const keyword of nameKeywords) {
        if (line.toLowerCase().includes(keyword) && !result.possibleNames.includes(line)) {
          const parts = line.split(':');
          const possibleName = parts.length > 1 ? parts[1].trim() : line.trim();
          // Clean up the name if it starts with **
          const cleanName = possibleName.replace(/^\*\*\s*|\*\s*/g, '').trim();
          if (cleanName && cleanName.length > 2 && !result.possibleNames.includes(cleanName)) {
            result.possibleNames.push(cleanName);
          }
        }
      }
    }

    // Additional special case handling for ** content across multiple lines
    if (!result.productName && lines.length > 0) {
      for (const line of lines) {
        if (line.startsWith('**')) {
          result.productName = line.replace(/^\*\*\s*/, '').trim();
          result.possibleNames.push(result.productName);
          break;
        }
      }
    }

    // Filter duplicates and limit to 5 options
    result.possibleNames = [...new Set(result.possibleNames)]
      .filter(name => name && name.length > 0)
      .slice(0, 5);
      
    // If we have content but no product name yet, use the first item in possible names
    if (!result.productName && result.possibleNames.length > 0) {
      result.productName = result.possibleNames[0];
    }

    setParsedResults(result);
  };

  const handleOpenDialog = () => {
    setOpen(true);
    setError(null);
    setAnalysisResult(null);
    setParsedResults(null);
    setCapturedImage(null);
  };

  const handleCloseDialog = () => {
    stopCamera();
    setOpen(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(
        videoRef.current, 
        0, 
        0, 
        canvas.width, 
        canvas.height
      );
      
      canvas.toBlob((blob) => {
        setCapturedImage({
          url: URL.createObjectURL(blob),
          blob: blob
        });
      }, 'image/jpeg');
      
      stopCamera();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCapturedImage({
        url: URL.createObjectURL(file),
        blob: file
      });
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeProductImage(
        capturedImage.blob, 
        customPrompt || 'Identify this medicinal product and provide its name, ingredients, and dosage information. Format the output with clear labels like "Product Name:" for the name.'
      );
      setAnalysisResult(result.analysis);
    } catch (err) {
      setError('Error analyzing image: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = (searchText) => {
    if (searchText) {
      // Extract main product name (typically the first word)
      let mainProductName = searchText.split(' ')[0].trim().replace(/[^a-zA-Z0-9]/g, '');
      
      // If the main product name is too short, use the original search text
      if (!mainProductName || mainProductName.length < 3) {
        mainProductName = searchText;
      }
      
      // Close the dialog and pass the selected search term to parent component
      onProductFound(mainProductName);
      handleCloseDialog();
    }
  };

  const resetImage = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setParsedResults(null);
    setError(null);
  };

  return (
    <>
      <button 
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={handleOpenDialog}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
        Search by Image
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseDialog}></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              {/* Modal header */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Search Product by Image
                </h3>
                <button 
                  onClick={handleCloseDialog}
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal content */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="mt-2 mb-4">
                  <p className="text-sm text-gray-500">
                    Take a photo of a product or upload an image to search
                  </p>
                </div>

                {!analysisResult && (
                  <div className="w-full h-96 bg-gray-100 rounded-lg flex justify-center items-center relative overflow-hidden">
                    {!capturedImage ? (
                      <>
                        {streamRef.current ? (
                          <video 
                            ref={videoRef}
                            autoPlay 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="flex gap-2 mb-2">
                              <button 
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={startCamera}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                                Open Camera
                              </button>
                              <button
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
                                  <path d="M7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" />
                                </svg>
                                Upload Image
                              </button>
                              <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                              />
                            </div>
                            {error && (
                              <p className="text-red-500 text-sm">{error}</p>
                            )}
                          </div>
                        )}
                        
                        {streamRef.current && (
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <button 
                              className="rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={captureImage}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <img 
                          src={capturedImage.url} 
                          className="w-full h-full object-contain"
                          alt="Captured product" 
                        />
                        <button 
                          className="absolute bottom-4 right-4 bg-white bg-opacity-70 text-red-600 p-2 rounded-full hover:bg-red-100 focus:outline-none"
                          onClick={resetImage}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                )}
                
                {capturedImage && !analysisResult && (
                  <div className="mt-4">
                    <div className="mb-4">
                      <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700">Custom Analysis Prompt (Optional)</label>
                      <input
                        type="text"
                        id="custom-prompt"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Identify this medicinal product and provide its name, ingredients, and dosage information"
                      />
                    </div>
                    <button 
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing Image...
                        </>
                      ) : 'Analyze Image'}
                    </button>
                  </div>
                )}

                {parsedResults && (
                  <div className="mt-4">
                    {/* Product Name Suggestions */}
                    <div className="mb-3">
                      <h4 className="text-lg font-medium text-gray-900">Possible Product Names:</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {parsedResults.possibleNames.map((name, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(name)}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm"
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Formatted Product Details Card */}
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h4 className="text-xl font-medium text-gray-900 mb-3">Product Information</h4>
                      
                      <div className="bg-white rounded-lg shadow p-4">
                        {parsedResults.productName && (
                          <div className="mb-4 border-b pb-3">
                            <h5 className="text-lg font-semibold text-blue-800">{parsedResults.productName}</h5>
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          {/* Active Ingredient */}
                          {parsedResults.formattedDetails.activeIngredient && (
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                              <div className="text-gray-600 font-medium">Active Ingredient:</div>
                              <div className="text-gray-800">{parsedResults.formattedDetails.activeIngredient}</div>
                            </div>
                          )}
                          
                          {/* Other Ingredients */}
                          {parsedResults.formattedDetails.otherIngredients.length > 0 && (
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                              <div className="text-gray-600 font-medium">Other Ingredients:</div>
                              <div className="text-gray-800">
                                <ul className="list-disc pl-4 space-y-1">
                                  {parsedResults.formattedDetails.otherIngredients.map((ingredient, idx) => (
                                    <li key={idx}>{ingredient}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                          
                          {/* Dosage */}
                          {parsedResults.formattedDetails.dosage && (
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                              <div className="text-gray-600 font-medium">Dosage:</div>
                              <div className="text-gray-800">{parsedResults.formattedDetails.dosage}</div>
                            </div>
                          )}
                          
                          {/* Category */}
                          {parsedResults.formattedDetails.category && (
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                              <div className="text-gray-600 font-medium">Category:</div>
                              <div className="text-gray-800">{parsedResults.formattedDetails.category}</div>
                            </div>
                          )}
                          
                          {/* Manufacturer */}
                          {parsedResults.formattedDetails.manufacturer && (
                            <div className="grid grid-cols-[120px_1fr] gap-2">
                              <div className="text-gray-600 font-medium">Manufacturer:</div>
                              <div className="text-gray-800">{parsedResults.formattedDetails.manufacturer}</div>
                            </div>
                          )}
                          
                          {/* Warnings */}
                          {parsedResults.formattedDetails.warnings.length > 0 && (
                            <div className="mt-2">
                              <div className="text-red-600 font-medium mb-1">Warnings:</div>
                              <div className="bg-red-50 border border-red-100 p-2 rounded text-red-800 text-sm">
                                <ul className="list-disc pl-4 space-y-1">
                                  {parsedResults.formattedDetails.warnings.map((warning, idx) => (
                                    <li key={idx}>{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Raw Analysis */}
                      <div className="mt-4">
                        <button 
                          onClick={() => document.getElementById('rawAnalysis').classList.toggle('hidden')}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          View Raw Analysis
                        </button>
                        <div 
                          id="rawAnalysis" 
                          className="hidden mt-2 p-3 bg-gray-100 rounded text-sm text-gray-700 overflow-auto max-h-40"
                          dangerouslySetInnerHTML={{ __html: parsedResults.rawText }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              {/* Modal footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {analysisResult && (
                  <button 
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => parsedResults?.productName && handleSearch(parsedResults.productName)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    Search for {parsedResults?.productName || "Product"}
                  </button>
                )}
                <button 
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaomaoVision;
