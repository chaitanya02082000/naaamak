const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  SCRAPE_RECIPE: `${API_URL}/api/recipes/scrape`,
  // Add other API endpoints here as needed
};

export const config = {
  googleClientId: '219305754619-svqh75oiql4l8vj6rd4somtoi11rv8kt.apps.googleusercontent.com', // Replace with your actual Google Client ID
};

export default API_ENDPOINTS; 