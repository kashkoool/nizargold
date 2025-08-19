// API utility for handling backend URL configuration
const getApiUrl = () => {
  // In production, use the Railway backend URL
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://nizargold-production.up.railway.app';
  }
  // In development, use the proxy (localhost:5001)
  return '';
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  
  console.log('API Call:', url); // Debug log
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  return response;
};

// Helper function for API calls with refresh token
export const apiCallWithRefresh = async (endpoint, options = {}) => {
  try {
    const response = await apiCall(endpoint, options);
    
    if (response.status === 401) {
      // Try to refresh token
      const refreshResponse = await apiCall('/api/users/refresh', {
        method: 'POST',
      });
      
      if (refreshResponse.ok) {
        // Retry the original request
        return await apiCall(endpoint, options);
      }
    }
    
    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export default apiCall;
