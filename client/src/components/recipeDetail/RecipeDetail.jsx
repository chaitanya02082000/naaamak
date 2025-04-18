import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import "../recipeDetail/RecipeDetail.scss";

/**
 * Renders the recipe details component
 * @param {Object} props - Component props
 * @param {Object} props.recipe - The recipe object containing recipe information (optional)
 * @returns {JSX.Element} - The recipe details component
 */
const RecipeDetail = ({ recipe: propRecipe }) => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(propRecipe || null);
  const [activeTab, setActiveTab] = useState('instructions');
  const [loading, setLoading] = useState(!propRecipe);
  const [error, setError] = useState(null);
  
  // Get user and token from Redux store instead of context
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  // State for Gemini Feature
  const [geminiQuestion, setGeminiQuestion] = useState('');
  const [geminiAnswer, setGeminiAnswer] = useState('');
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState('');

  useEffect(() => {
    // If recipe was provided as prop, use it and skip fetching
    if (propRecipe) {
      setRecipe(propRecipe);
      setLoading(false);
      setError(null);
      return;
    }
    
    // Otherwise fetch the recipe using ID from URL params
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        // Use token in the request headers if the API requires authentication
        const response = await axios.get(
          `/api/recipes/${id}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        setRecipe(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError('Failed to load recipe details.');
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if id is present and propRecipe is not provided
    if (id) {
      fetchRecipe();
    } else if (!propRecipe) {
      // Only set error if no prop recipe and no id
      setLoading(false);
      setError("Recipe ID is missing.");
    }
  }, [id, token, propRecipe]);

  // Update recipe state when propRecipe changes
  useEffect(() => {
    if (propRecipe) {
      setRecipe(propRecipe);
      setLoading(false);
      setError(null);
    }
  }, [propRecipe]);

  // Function to handle asking Gemini
  const handleAskGemini = async (e) => {
    e.preventDefault();
    if (!geminiQuestion.trim()) {
      setGeminiError('Please enter a question.');
      return;
    }
    // Check token from Redux
    if (!token) {
      setGeminiError('You must be logged in to ask questions.');
      return;
    }

    // Need recipe ID for the API call
    const recipeId = recipe.id || recipe._id || id;
    if (!recipeId) {
      setGeminiError('Cannot identify recipe. Please try again later.');
      return;
    }

    setGeminiLoading(true);
    setGeminiAnswer('');
    setGeminiError('');

    try {
      console.log('Sending question about recipe:', recipeId);
      console.log('Token (first 10 chars):', token ? token.substring(0, 10) + '...' : 'No token');
      
      // Check if recipe is from external API (Spoonacular) or from database
      const isExternalRecipe = !!recipe.spoonacularId || 
                              !!recipe.extendedIngredients || 
                              typeof recipeId === 'number';
      
      // For external recipes, include the recipe data in the request
      const requestData = {
        question: geminiQuestion
      };
      
      // If it's an external recipe that might not be in the database, send the recipe data
      if (isExternalRecipe) {
        console.log('Using external recipe data in request');
        requestData.recipeData = recipe;
      }
      
      const headers = { 
        Authorization: `Bearer ${token}`
      };
      
      console.log('Request headers:', headers);
      
      const response = await axios.post(
        `/api/recipes/${recipeId}/ask`,
        requestData,
        { headers }
      );
      
      if (response.data && response.data.answer) {
        setGeminiAnswer(response.data.answer);
      } else {
        setGeminiError('Received empty response from AI service.');
      }
    } catch (err) {
      console.error("Error asking Gemini:", err);
      
      // Handle different error scenarios with helpful messages
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = err.response.status;
        const errorMessage = err.response.data?.message || 'Unknown error occurred';
        
        console.log(`AI service error (${status}):`, errorMessage);
        
        if (status === 404) {
          setGeminiError('Recipe not found. Please try again with a different recipe.');
        } else if (status === 401) {
          setGeminiError('Authentication failed. Please log in again.');
        } else if (status === 403) {
          setGeminiError('Access denied. You do not have permission to use this feature.');
        } else if (status === 429) {
          setGeminiError('AI service is busy. Please try again in a few minutes.');
        } else {
          setGeminiError(`Error: ${errorMessage}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.log('No response received from AI service');
        setGeminiError('No response from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setGeminiError('Failed to process your question. Please try again.');
      }
    } finally {
      setGeminiLoading(false);
    }
  };

  // Helper function to get ingredients in the correct format
  const getIngredients = () => {
    if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) {
      // Spoonacular API format
      return recipe.extendedIngredients.map(ingredient => 
        ingredient.original || ingredient.originalString || ingredient.name || ingredient
      );
    } else if (recipe.ingredients && recipe.ingredients.length > 0) {
      // Scraped recipe format
      return recipe.ingredients;
    }
    return [];
  };

  // Helper function to get instructions in the correct format
  const getInstructions = () => {
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
      // Spoonacular API format
      const steps = recipe.analyzedInstructions[0].steps;
      if (steps && steps.length > 0) {
        return steps.map(step => `${step.number}. ${step.step}`).join('<br><br>');
      }
    }
    
    if (recipe.instructions) {
      if (typeof recipe.instructions === 'string') {
        // Already formatted HTML string
        return recipe.instructions;
      } else if (Array.isArray(recipe.instructions)) {
        // Array of step strings or objects
        return recipe.instructions
          .map((step, index) => typeof step === 'string' ? 
            `${index + 1}. ${step}` : 
            `${step.number || (index + 1)}. ${step.step || JSON.stringify(step)}`)
          .join('<br><br>');
      }
    }
    return '';
  };

  // Helper function to get image URL in the correct format
  const getImageUrl = () => {
    if (!recipe.image) return '';
    
    if (typeof recipe.image === 'string') {
      return recipe.image;
    } else if (Array.isArray(recipe.image)) {
      // If it's an array, take the first URL
      return recipe.image[0];
    } else if (recipe.image.url) {
      // If it's an object with a url property
      return recipe.image.url;
    }
    return '';
  };

  if (loading) return <div className="loading">Loading recipe...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!recipe) return <div className="no-recipe">Recipe not found or still loading.</div>;

  return (
    <div className="recipe-detail-container">
      <h1 className="recipe-detail-heading">{recipe.title || recipe.name}</h1>
      <div className="recipe-detail-flex-container">
        <div className="recipe-detail-left-wrapper">
          <span className="cooking-time">
            Cooking time: <span style={{color: "#5457b6"}}>
              {recipe.readyInMinutes ? `${recipe.readyInMinutes} minutes` : recipe.totalTime || 'Not specified'}
            </span>
          </span>
          <img
            className="recipe-detail-image"
            src={getImageUrl()}
            alt={recipe.title || recipe.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
            }}
          />
        </div>
        <div className="recipe-detail-right-wrapper">
          <div className="recipe-detail-button-wrapper">
            <button 
              className={`${activeTab === 'instructions' ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab('instructions')}
            >
              Instructions
            </button>
            <button 
              className={`${activeTab === 'ingredients' ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab('ingredients')}
            >
              Ingredients
            </button>
          </div>
          {activeTab === "instructions" && (
            <div className="recipe-detail-instruction">
              <div
                dangerouslySetInnerHTML={{
                  __html: recipe.summary || recipe.description || '',
                }}
              />
              <div
                dangerouslySetInnerHTML={{
                  __html: getInstructions(),
                }}
              />
            </div>
          )}
          {activeTab === "ingredients" && (
            <ul>
              {getIngredients().map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Gemini Ask Feature Section */}
      {user && token && ( // Only show if user is logged in
        <div className="gemini-ask-section recipe-section">
          <h2>Ask AI About This Recipe</h2>
          {/* Add debug info in development mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="recipe-debug-info">
              <div><strong>Recipe ID:</strong> {recipe.id || recipe._id || id || 'None'} ({typeof (recipe.id || recipe._id || id)})</div>
              <div><strong>Source:</strong> {recipe.sourceUrl ? 'External URL' : recipe.spoonacularId ? 'Spoonacular API' : recipe.extendedIngredients ? 'External API' : recipe._id ? 'MongoDB' : 'Unknown'}</div>
              <div><strong>Data Format:</strong> {recipe.extendedIngredients ? 'Spoonacular' : recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions[0]?.step ? 'Step Objects' : 'Standard'}</div>
              <div><strong>Has Ingredients:</strong> {recipe.ingredients ? (Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 'Yes') : recipe.extendedIngredients ? recipe.extendedIngredients.length : 'No'}</div>
            </div>
          )}
          <form onSubmit={handleAskGemini}>
            <textarea
              value={geminiQuestion}
              onChange={(e) => setGeminiQuestion(e.target.value)}
              placeholder="e.g., Can I substitute chicken for beef?"
              rows="3"
              disabled={geminiLoading}
            />
            <button type="submit" disabled={geminiLoading}>
              {geminiLoading ? 'Asking AI...' : 'Ask Question'}
            </button>
          </form>
          {geminiError && <p className="error gemini-error">{geminiError}</p>}
          {geminiAnswer && (
            <div className="gemini-answer">
              <h3>AI Answer:</h3>
              <p>{geminiAnswer}</p>
            </div>
          )}
        </div>
      )}
      {!user && (
        <p><Link to="/">Log in</Link> to ask questions about this recipe.</p>
      )}
    </div>
  );
};

export default RecipeDetail;
