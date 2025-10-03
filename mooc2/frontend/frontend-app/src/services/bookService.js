import axios from "axios";
import { buildApiUrl, API_ENDPOINTS } from "./apiConfig";

// Get all books
export const getAllBooks = async () => {
  try {
    const response = await axios.get(buildApiUrl(API_ENDPOINTS.BOOKS));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get book by ID
export const getBookById = async (id) => {
  try {
    const response = await axios.get(buildApiUrl(`${API_ENDPOINTS.BOOKS}/${id}`));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Search books
export const searchBooks = async (query) => {
  try {
    const url = query 
      ? buildApiUrl(`${API_ENDPOINTS.BOOKS}/search?query=${encodeURIComponent(query)}`)
      : buildApiUrl(API_ENDPOINTS.BOOKS);
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Get books by category
export const getBooksByCategory = async (categoryId) => {
  try {
    const url = categoryId 
      ? buildApiUrl(`${API_ENDPOINTS.BOOKS}/category/${categoryId}`)
      : buildApiUrl(API_ENDPOINTS.BOOKS);
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Create new book
export const createBook = async (bookData) => {
  try {
    const formData = {
      ...bookData,
      totalCopies: parseInt(bookData.totalCopies),
      availableCopies: parseInt(bookData.availableCopies),
      categoryId: parseInt(bookData.categoryId)
    };

    const response = await axios.post(buildApiUrl(API_ENDPOINTS.BOOKS), formData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Update book
export const updateBook = async (id, bookData) => {
  try {
    const formData = {
      ...bookData,
      id: parseInt(id),
      totalCopies: parseInt(bookData.totalCopies),
      availableCopies: parseInt(bookData.availableCopies),
      categoryId: parseInt(bookData.categoryId)
    };

    const response = await axios.put(buildApiUrl(`${API_ENDPOINTS.BOOKS}/${id}`), formData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Delete book
export const deleteBook = async (id) => {
  try {
    const response = await axios.delete(buildApiUrl(`${API_ENDPOINTS.BOOKS}/${id}`));
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};