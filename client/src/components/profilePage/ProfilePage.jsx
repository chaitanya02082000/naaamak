import React, { useEffect, useState } from "react";
import "../profilePage/ProfilePage.scss";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setSavedRecipes } from "../../state/index";
import Header from "../header/Header";
import User from "../user/User";
import RecipeList from "../recipeList/RecipeList";
import RecipeDetail from "../recipeDetail/RecipeDetail";
import RecipeScraper from "../recipeScraper/RecipeScraper";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [spoonacularRecipes, setSpoonacularRecipes] = useState([]);
  const [scrapedRecipes, setScrapedRecipes] = useState([]);
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [activeTab, setActiveTab] = useState("spoonacular"); // "spoonacular" or "scraped"
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Select user, token, and saved recipes from the Redux store
  const { user, token, savedRecipes } = useSelector((state) => state);

  // Get API key from environment variables
  const API_KEY = process.env.REACT_APP_RECIPE_APP_API_KEY;

  // Fetch saved recipes and update state and Redux store
  const getSavedRecipes = async () => {
    setLoading(true);
    try {
      // Fetch saved recipes from the backend
      const savedRecipesResponse = await axios.get(
        API_ENDPOINTS.GET_USER_SAVED_RECIPES(user._id),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const savedRecipesData = await savedRecipesResponse.data;

      // Update saved recipes in the Redux store
      if (savedRecipesData) {
        dispatch(
          setSavedRecipes({
            savedRecipes: savedRecipesData,
          })
        );
      }

      // Fetch recipe details from Spoonacular API for each saved recipe
      if (savedRecipesData && savedRecipesData.length > 0) {
        const response = await axios.get(`https://api.spoonacular.com/recipes/informationBulk?apiKey=${API_KEY}&ids=${savedRecipesData.join(',')}`);
        const data = response.data;
        setSpoonacularRecipes([...data]);
      }
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch scraped recipes saved by the user
  const getScrapedRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        API_ENDPOINTS.GET_USER_SCRAPED_RECIPES(user._id),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        setScrapedRecipes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching scraped recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load both types of recipes on initial render
  useEffect(() => {
    if (user && token) {
      getSavedRecipes();
      getScrapedRecipes();
    }
  }, [user, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Callback function to handle click on a recipe in the recipe list
  function handleRecipeDetails(check, recipeDetail) {
    setRecipeDetail(recipeDetail);
  }

  // Function to navigate to Home Page
  function handleNavigateHome() {
    setRecipeDetail(null);
    navigate('/home');
  }

  // Function to navigate to Profile Page
  function handleNavigateProfile(userId) {
    setRecipeDetail(null);
    navigate(`/profile/${userId}`);
  }

  // Handle adding a newly saved scraped recipe to the state
  const handleRecipeSaved = (newRecipe) => {
    setScrapedRecipes((prev) => [newRecipe, ...prev]);
  };

  return (
    <div>
      <Header 
        isHome={false} 
        handleNavigateHome={handleNavigateHome} 
        handleNavigateProfile={handleNavigateProfile} 
      />
      
      {recipeDetail ? (
        <RecipeDetail recipe={recipeDetail} />
      ) : (
        <div className="profile-container">
          <User user={user} />
          
          <div className="recipe-tabs">
            <button 
              className={`tab-button ${activeTab === 'spoonacular' ? 'active' : ''}`}
              onClick={() => setActiveTab('spoonacular')}
            >
              Saved Recipes
            </button>
            <button 
              className={`tab-button ${activeTab === 'scraped' ? 'active' : ''}`}
              onClick={() => setActiveTab('scraped')}
            >
              My Scraped Recipes
            </button>
            <button 
              className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              Add Recipe from URL
            </button>
          </div>
          
          {activeTab === 'spoonacular' && (
            <>
              <h1 className="saved-recipes-text">Saved Recipes</h1>
              {loading ? (
                <div className="loading-spinner">Loading recipes...</div>
              ) : (
                <div className="profile-recipe-catalogue-container">
                  {spoonacularRecipes.length > 0 ? (
                    spoonacularRecipes.map((recipe, index) => (
                      <RecipeList
                        key={`spoonacular-${recipe.id}-${index}`}
                        recipe={recipe}
                        handleRecipeDetails={handleRecipeDetails}
                        isBookmarked={savedRecipes.includes(recipe.id)}
                        isHome={false}
                      />
                    ))
                  ) : (
                    <p className="no-recipes-message">No saved recipes yet. Save some recipes from the home page!</p>
                  )}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'scraped' && (
            <>
              <h1 className="saved-recipes-text">My Scraped Recipes</h1>
              {loading ? (
                <div className="loading-spinner">Loading recipes...</div>
              ) : (
                <div className="profile-recipe-catalogue-container">
                  {scrapedRecipes.length > 0 ? (
                    scrapedRecipes.map((recipe, index) => (
                      <RecipeList
                        key={`scraped-${recipe._id}-${index}`}
                        recipe={{
                          id: recipe._id,
                          title: recipe.title,
                          image: recipe.image,
                          summary: recipe.summary,
                          description: recipe.description,
                          sourceUrl: recipe.sourceUrl,
                          ingredients: recipe.ingredients,
                          instructions: recipe.instructions.map(i => i.step).join('<br><br>'),
                          readyInMinutes: recipe.cookTime,
                          totalTime: recipe.totalTime,
                          prepTime: recipe.prepTime,
                          extendedIngredients: recipe.ingredients.map(ing => ({ original: ing })),
                          analyzedInstructions: [{ 
                            steps: recipe.instructions.map(i => ({ 
                              number: i.number, 
                              step: i.step 
                            })) 
                          }]
                        }}
                        handleRecipeDetails={handleRecipeDetails}
                        isBookmarked={false}
                        isHome={false}
                        isScraped={true}
                      />
                    ))
                  ) : (
                    <p className="no-recipes-message">No scraped recipes yet. Add some recipes from the "Add Recipe from URL" tab!</p>
                  )}
                </div>
              )}
            </>
          )}
          
          {activeTab === 'add' && (
            <div className="add-recipe-container">
              <RecipeScraper 
                onRecipeScraped={() => {}} 
                onRecipeSaved={(newRecipe) => {
                  handleRecipeSaved(newRecipe);
                  setActiveTab('scraped');
                }} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
