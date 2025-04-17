import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config';
import './RecipeScraper.scss';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const RecipeScraper = ({ onRecipeScraped, onRecipeSaved }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrapedRecipe, setScrapedRecipe] = useState(null);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Get user and token from Redux store
  const { user, token } = useSelector((state) => state);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setScrapedRecipe(null);
    setSaveSuccess(false);

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

      setScrapedRecipe(response.data.data);
      onRecipeScraped(response.data.data);
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
  
  const handleSaveRecipe = async () => {
    if (!scrapedRecipe || !user || !token) return;
    
    setSavingRecipe(true);
    setSaveSuccess(false);
    setError('');
    
    try {
      const response = await axios.post(
        API_ENDPOINTS.SAVE_SCRAPED_RECIPE(user._id),
        scrapedRecipe,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        setSaveSuccess(true);
        if (onRecipeSaved) {
          onRecipeSaved(response.data.data);
        }
        
        // Reset the form after a short delay
        setTimeout(() => {
          setScrapedRecipe(null);
          setUrl('');
          setSaveSuccess(false);
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Failed to save recipe');
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save recipe');
    } finally {
      setSavingRecipe(false);
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
            disabled={loading || !!scrapedRecipe || saveSuccess}
          />
          <button type="submit" disabled={loading || !!scrapedRecipe || saveSuccess}>
            {loading ? 'Scraping...' : 'Import Recipe'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
        
        {!scrapedRecipe && !saveSuccess && (
          <p className="help-text">
            Supported websites: AllRecipes, Food Network, BBC Good Food, and other sites with structured recipe data
          </p>
        )}
        
        {saveSuccess && (
          <div className="success-message">
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>Recipe saved successfully! You can find it in your profile.</span>
          </div>
        )}
        
        {scrapedRecipe && !saveSuccess && (
          <div className="scraped-recipe-preview">
            <h3>Scraped Recipe: {scrapedRecipe.name}</h3>
            {scrapedRecipe.image && (
              <img src={scrapedRecipe.image} alt={scrapedRecipe.name} className="recipe-preview-image" />
            )}
            <div className="recipe-actions">
              <button 
                type="button" 
                className="save-recipe-btn"
                onClick={handleSaveRecipe}
                disabled={savingRecipe}
              >
                {savingRecipe ? 'Saving...' : 'Save to My Recipes'}
              </button>
              <button 
                type="button" 
                className="discard-recipe-btn"
                onClick={() => {
                  setScrapedRecipe(null);
                  setUrl('');
                }}
                disabled={savingRecipe}
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default RecipeScraper; 