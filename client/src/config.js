// Determine API URL based on environment
// Use Render backend in production, localhost in development
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://naaamak.onrender.com'
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

export const API_ENDPOINTS = {
  // Recipe endpoints
  SCRAPE_RECIPE: `${API_URL}/api/recipes/scrape`,
  SAVE_SCRAPED_RECIPE: (userId) => `${API_URL}/api/recipes/${userId}/save`,
  GET_USER_SCRAPED_RECIPES: (userId) => `${API_URL}/api/recipes/${userId}`,
  
  // Auth endpoints
  REGISTER: `${API_URL}/auth/register`,
  LOGIN: `${API_URL}/auth/login`,
  
  // User endpoints
  GET_USER_SAVED_RECIPES: (userId) => `${API_URL}/users/${userId}/savedRecipe`,
  SAVE_RECIPE: (userId) => `${API_URL}/users/${userId}/savedRecipe`,
  
  // Asset endpoints
  GET_USER_PICTURE: (pictureName) => `${API_URL}/assets/${pictureName}`,
};

export default API_ENDPOINTS; 