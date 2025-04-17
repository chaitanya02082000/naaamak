const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Recipe endpoints
  SCRAPE_RECIPE: `${API_URL}/api/recipes/scrape`,
  
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