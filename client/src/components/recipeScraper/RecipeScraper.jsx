import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config';
import './RecipeScraper.scss';

const RecipeScraper = ({ onRecipeScraped }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate URL format
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('Please enter a valid URL starting with http:// or https://');
      }

      const response = await axios.post(API_ENDPOINTS.SCRAPE_RECIPE, { url });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to scrape recipe');
      }

      if (!response.data.data) {
        throw new Error('No recipe data found on the page');
      }

      onRecipeScraped(response.data.data);
      setUrl('');
    } catch (err) {
      console.error('Scraping error:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data.message || 'Server error occurred');
      } else if (err.request) {
        // The request was made but no response was received
        setError('Could not connect to the server. Please make sure the server is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(err.message || 'Failed to scrape recipe. Please try a different URL.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-scraper">
      <h2>Import Recipe from URL</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter recipe URL (e.g., https://www.allrecipes.com/recipe/...)"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Scraping...' : 'Import Recipe'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
        <p className="help-text">
          Supported websites: AllRecipes, Food Network, BBC Good Food, and other sites with structured recipe data
        </p>
      </form>
    </div>
  );
};

export default RecipeScraper; 