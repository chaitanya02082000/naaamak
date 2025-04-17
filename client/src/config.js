const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  SCRAPE_RECIPE: `${API_URL}/api/recipes/scrape`,
  // Add other API endpoints here as needed
};

export default API_ENDPOINTS; 