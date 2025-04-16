import React from 'react';
import "../recipeList/RecipeList.scss";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faClock, faUtensils, faStar } from '@fortawesome/free-solid-svg-icons';

/**
 * Renders a single recipe in the recipe catalog list
 * @param {Object} recipe - The recipe object containing recipe information
 * @param {Function} handleRecipeDetails - The function to handle clicking on a recipe to show details
 * @param {Function} onBookmarkClick - The function to handle bookmarking a recipe
 * @param {Boolean} isBookmarked - Whether the recipe is bookmarked
 * @param {Boolean} isHome - Whether the recipe is being rendered on the home page
 * @returns {JSX.Element} - The recipe list component
 */
const RecipeList = ({ recipe, recipeType, handleRecipeDetails, onBookmarkClick, isBookmarked, isHome }) => {
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
  const cookingTime = recipe.readyInMinutes || 30;
  
  // Calculate difficulty level
  const getDifficultyLevel = () => {
    if (cookingTime <= 30) return 'Easy';
    if (cookingTime <= 60) return 'Medium';
    return 'Hard';
  };

  return (
    <div className='recipe-card' onClick={handleRecipeClick}>
      <div className='recipe-image-container'>
        <img 
          src={recipe.image} 
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
      </div>
      
      <div className='recipe-content'>
        <h3 className='recipe-title'>{recipe.title}</h3>
        
        <div className='recipe-meta'>
          <div className='meta-item'>
            <FontAwesomeIcon icon={faClock} />
            <span>{cookingTime} min</span>
          </div>
          
          <div className='meta-item'>
            <FontAwesomeIcon icon={faUtensils} />
            <span>{getDifficultyLevel()}</span>
          </div>
          
          <div className='meta-item'>
            <FontAwesomeIcon icon={faStar} />
            <span>{recipe.spoonacularScore ? Math.round(recipe.spoonacularScore / 20) : 4} / 5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeList;