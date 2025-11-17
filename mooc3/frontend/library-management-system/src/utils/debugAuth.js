// Debug utility to check authentication status
export const debugAuth = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  console.log('=== AUTH DEBUG ===');
  console.log('Token exists:', !!token);
  console.log('Token length:', token ? token.length : 0);
  
  if (token) {
    try {
      // Decode JWT payload without verification (for debugging only)
      const base64Url = token.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        console.log('JWT Payload:', payload);
        console.log('Roles:', payload.role || payload.roles || 'Not found');
        console.log('Exp:', payload.exp ? new Date(payload.exp * 1000) : 'Not found');
        console.log('Is Expired:', payload.exp ? Date.now() >= payload.exp * 1000 : 'Unknown');
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  }
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('User from localStorage:', user);
      console.log('User role:', user.role || user.roles || 'Not found');
    } catch (e) {
      console.error('Error parsing user:', e);
    }
  }
  
  console.log('==================');
};

// Test API call with current token
export const testApiCall = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('=== API TEST ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      console.log('Error response:', await response.text());
    }
    console.log('================');
  } catch (error) {
    console.error('API Test Error:', error);
  }
};