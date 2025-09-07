// API utility for handling backend URL configuration
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production (Vercel), use same-origin so /api routes are proxied by vercel.json
    return '';
  }
  // In development, use localhost:5001
  return 'http://localhost:5001';
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const token = localStorage.getItem('token');
  
  // Check if this is a FormData request
  const isFormData = options.body instanceof FormData;
  const isFormDataByConstructor = options.body && typeof options.body === 'object' && options.body.constructor && options.body.constructor.name === 'FormData';
  const isFormDataByEntries = options.body && typeof options.body.entries === 'function';
  
  // Use the most reliable detection method
  const isFormDataRequest = isFormData || isFormDataByConstructor || isFormDataByEntries;
  
  const headers = {};
  
  // Only set Content-Type for non-FormData requests
  if (!isFormDataRequest) {
    headers['Content-Type'] = 'application/json';
    } else {
    // Don't set Content-Type for FormData - let browser set it with boundary
    }
  
  // Add any custom headers from options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
  
  return response;
};

// Helper function for API calls with refresh token
export const apiCallWithRefresh = async (endpoint, options = {}) => {
  try {
    const response = await apiCall(endpoint, options);
    
    if (response.status === 401) {
      const refreshResponse = await apiCall('/api/users/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }),
      });
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        localStorage.setItem('token', refreshData.token);
        
        // For FormData requests, we need to recreate the FormData for retry
        // since FormData can only be read once
        let retryOptions = { ...options };
        if (options.body instanceof FormData) {
          const newFormData = new FormData();
          for (let [key, value] of options.body.entries()) {
            newFormData.append(key, value);
          }
          retryOptions.body = newFormData;
        }
        
        const retryResponse = await apiCall(endpoint, retryOptions);
        return retryResponse;
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return response;
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

export default apiCall;
