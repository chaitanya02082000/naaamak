import React, { useState } from "react";
import "../recipeDetail/RecipeDetail.scss";

/**
 * Renders the recipe details component
 * @param {Object} recipe - The recipe object containing recipe information
 * @returns {JSX.Element} - The recipe details component
 */
const RecipeDetail = ({recipe}) => {
  const [activeTab, setActiveTab] = useState('instructions');

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
    </div>
  );
};

export default RecipeDetail;
