const axios = require('axios');

// Cache for token
let tokenCache = {
  token: null,
  expiry: null
};

const getToken = async () => {
  // Check if we have a valid token in cache
  if (tokenCache.token && tokenCache.expiry > Date.now()) {
    return tokenCache.token;
  }
  
  try {
    const response = await axios.get('https://janaushadhi.gov.in:8443/auth/generateGuestToken');
    
    if (response.data && response.data.responseCode === 200) {
      const token = response.data.responseBody;
      
      // Set token in cache with expiry (8 hours)
      tokenCache = {
        token,
        expiry: Date.now() + (8 * 60 * 60 * 1000)
      };
      
      return token;
    }
    
    throw new Error('Failed to obtain token');
  } catch (error) {
    console.error('Error getting token:', error.message);
    throw error;
  }
};

exports.getExternalProducts = async (req, res) => {
  try {
    const { pageIndex = 0, pageSize = 100, searchText = "", columnName = "id", orderBy = "asc" } = req.query;
    
    // Get token
    const token = await getToken();
    
    // Make request to external API
    const response = await axios.post(
      'https://janaushadhi.gov.in:8443/api/v1/admin/product/getAllProduct',
      {
        pageIndex: parseInt(pageIndex),
        pageSize: parseInt(pageSize),
        searchText,
        columnName,
        orderBy
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Return data
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Failed to fetch external products', error: error.message });
  }
};