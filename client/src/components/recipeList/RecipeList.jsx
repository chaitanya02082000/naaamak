import React from 'react';
import "../recipeList/RecipeList.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faClock, faUtensils, faStar, faGlobe } from '@fortawesome/free-solid-svg-icons';

/**
 * Renders a single recipe in the recipe catalog list
 * @param {Object} recipe - The recipe object containing recipe information
 * @param {Function} handleRecipeDetails - The function to handle clicking on a recipe to show details
 * @param {Function} onBookmarkClick - The function to handle bookmarking a recipe
 * @param {Boolean} isBookmarked - Whether the recipe is bookmarked
 * @param {Boolean} isHome - Whether the recipe is being rendered on the home page
 * @param {Boolean} isScraped - Whether the recipe is a scraped recipe
 * @returns {JSX.Element} - The recipe list component
 */
const RecipeList = ({ recipe, recipeType, handleRecipeDetails, onBookmarkClick, isBookmarked, isHome, isScraped = false }) => {
  function handleRecipeClick(){
    if(recipeType === "searchedRecipe"){
      handleRecipeDetails(true, recipe.id);
    }
    else if(recipeType === "randomRecipe"){
      handleRecipeDetails(false, recipe);
    }
    else{
      handleRecipeDetails(false, recipe);
    }
  }

  // Calculate cooking time in minutes
  const cookingTime = recipe.readyInMinutes || (recipe.cookTime ? recipe.cookTime : 30);
  
  // Calculate difficulty level
  const getDifficultyLevel = () => {
    if (cookingTime <= 30) return 'Easy';
    if (cookingTime <= 60) return 'Medium';
    return 'Hard';
  };

  // Get recipe rating or default to 4
  const getRating = () => {
    if (recipe.spoonacularScore) {
      return Math.round(recipe.spoonacularScore / 20);
    }
    return 4;
  };

  return (
    <div className={`recipe-card ${isScraped ? 'scraped-recipe' : ''}`} onClick={handleRecipeClick}>
      <div className='recipe-image-container'>
        <img 
          src={recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={recipe.title}
          className='recipe-image'
        />
        {isHome && (
          <button 
            className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkClick(recipe.id);
            }}
          >
            <FontAwesomeIcon icon={faBookmark} />
          </button>
        )}
        {isScraped && (
          <div className="scraped-recipe-badge">
            <FontAwesomeIcon icon={faGlobe} />
            <span>Scraped</span>
          </div>
        )}
      </div>
      
      <div className='recipe-content'>
        <h3 className='recipe-title'>{recipe.title}</h3>
        
        <div className='recipe-meta'>
          <div className='meta-item'>
            <FontAwesomeIcon icon={faClock} />
            <span>{cookingTime ? cookingTime : 'N/A'}</span>
          </div>
          
          <div className='meta-item'>
            <FontAwesomeIcon icon={faUtensils} />
            <span>{getDifficultyLevel()}</span>
          </div>
          
          <div className='meta-item'>
            <FontAwesomeIcon icon={faStar} />
            <span>{getRating()} / 5</span>
          </div>
        </div>
        
        {isScraped && recipe.sourceUrl && (
          <div className='recipe-source'>
            <a 
              href={recipe.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="source-link"
            >
              <FontAwesomeIcon icon={faGlobe} /> Original Source
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeList;