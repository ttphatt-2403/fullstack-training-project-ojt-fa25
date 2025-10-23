// API Configuration - Using HTTP for Development Environment
// HTTP is simpler for local development, avoids SSL certificate issues
export const API_BASE_URL = "http://localhost:5053/api";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/Auth/login",
    REGISTER: "/Auth/register",
    ME: "/Auth/me"
  },
  USERS: "/Users",
  CATEGORIES: "/Category",
  BOOKS: "/Book",
  BORROWS: "/Borrow"
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};