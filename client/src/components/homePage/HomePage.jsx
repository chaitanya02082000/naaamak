// Importing React and other required modules
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import "../homePage/HomePage.scss";
import Header from "../header/Header";
import RecipeList from "../recipeList/RecipeList";
import RecipeDetail from "../recipeDetail/RecipeDetail";
import { setSavedRecipes } from "../../state";
import { useNavigate } from "react-router-dom";

// HomePage component
const HomePage = () => {
  const navigate = useNavigate();
  // Using useDispatch and useSelector hooks
  const dispatch = useDispatch();
  const { user, savedRecipes, token } = useSelector((state) => state);

  // State for recipe detail, random recipes and searched recipes
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [searchedRecipes, setSearchedRecipes] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Categories for filtering recipes
  const categories = [
    { id: "all", name: "All" },
    { id: "main course", name: "Main Course" },
    { id: "side dish", name: "Side Dish" },
    { id: "dessert", name: "Dessert" },
    { id: "appetizer", name: "Appetizer" },
    { id: "salad", name: "Salad" },
    { id: "bread", name: "Bread" },
    { id: "breakfast", name: "Breakfast" },
    { id: "soup", name: "Soup" },
    { id: "beverage", name: "Beverage" },
    { id: "sauce", name: "Sauce" },
    { id: "marinade", name: "Marinade" },
    { id: "fingerfood", name: "Finger Food" },
    { id: "snack", name: "Snack" },
    { id: "drink", name: "Drink" }
  ];

  // API Key and URLs for Spoonacular API
  const API_KEY = process.env.REACT_APP_RECIPE_APP_API_KEY;
  const SEARCH_RECIPE_URL = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&number=12`;
  const RANDOM_RECIPE_URL = `https://api.spoonacular.com/recipes/random?apiKey=${API_KEY}&number=12`;

  // Function to handle Bookmark click
  const handleBookmarkClick = async (recipeId) => {
    const response = await axios.put(
      `https://naaamak.onrender.com/users/${user._id}/savedRecipe`,
      { recipeId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const savedRecipesData = response.data;
    if (savedRecipesData) {
      dispatch(
        setSavedRecipes({
          savedRecipes: savedRecipesData,
        })
      );
    }
  };

  // Random Recipes
  
  // Function to get random recipes
  const getRandom = async () => {
    try {
      const api = await axios.get(RANDOM_RECIPE_URL);
      setRandomRecipes(api.data.recipes);
    } catch (error) {
      console.error('Error fetching random recipes:', error);
      // You could set a default state or show an error message to the user
      setRandomRecipes([]);
    }
  };
  useEffect(() => {
    getRandom();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

   // Function to set recipe detail state
  const handleRecipeDetails = async (check, recipeDetail) => {
    if(check){
      const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeDetail}/information?apiKey=${API_KEY}`);
      const data =  response.data;
      console.log(data)
      setRecipeDetail(data);
    }
    else{
      setRecipeDetail(recipeDetail);
    }
  }

  // Function to search recipes using Spoonacular API
  const searchRecipes = async (query) => {
    setSearchQuery(query);
    let params = {
      query: query,
      number: 12
    };

    // Add type parameter only if a specific category is selected
    if (selectedCategory !== "all") {
      params.type = selectedCategory;
    }

    try {
      const response = await axios.get(SEARCH_RECIPE_URL, { params });
      setSearchedRecipes(response.data.results);
    } catch (error) {
      console.error('Error searching recipes:', error);
      // You could set a default state or show an error message to the user
      setSearchedRecipes([]);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // If there's a search query, perform a new search with the selected category
    if (searchQuery) {
      searchRecipes(searchQuery);
    } else {
      // If no search query, get random recipes filtered by category
      getRandomRecipesByCategory(category);
    }
  };

  // New function to get random recipes by category
  const getRandomRecipesByCategory = async (category) => {
    let params = {
      number: 12
    };

    // Add tags parameter for category filtering
    if (category !== "all") {
      params.tags = category;
    }

    try {
      const response = await axios.get(RANDOM_RECIPE_URL, { params });
      setRandomRecipes(response.data.recipes);
    } catch (error) {
      console.error('Error fetching recipes by category:', error);
      // You could set a default state or show an error message to the user
      setRandomRecipes([]);
    }
  };

  // Update the useEffect for random recipes
  useEffect(() => {
    getRandomRecipesByCategory(selectedCategory);
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to navigate to Home Page 
  function handleNavigateHome(){
    setRecipeDetail(null);
    navigate('/home');
  }

  // Function to navigate to Profile Page 
  function handleNavigateProfile(userId){
    setRecipeDetail(null);
    navigate(`/profile/${userId}`)
  }

  return (
    <div className="home-page-container">
      {/* Renders the header component with the search bar and profile icon */}
      <Header searchRecipes={searchRecipes} isHome={true} handleNavigateHome = {handleNavigateHome} handleNavigateProfile = {handleNavigateProfile}/>

      {/* Renders the recipe list or the recipe detail component */}
      {recipeDetail ? <RecipeDetail recipe = {recipeDetail}/>
      :
      <>
        <div className="hero-section">
          <div className="hero-content">
            <h1>Discover Delicious Recipes</h1>
            <p>Find the perfect recipe for any occasion</p>
          </div>
        </div>

        <div className="categories-container">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="recipe-catalogue-container">
          {searchedRecipes ? 
           searchedRecipes &&
           searchedRecipes.map((recipe, index) => {
             return (
               <RecipeList key={index} recipe={recipe} recipeType = "searchedRecipe" handleRecipeDetails = {handleRecipeDetails} onBookmarkClick={handleBookmarkClick} isBookmarked={savedRecipes.includes(recipe.id) } isHome = {true} />
             );
           }) 
           :
          randomRecipes &&
            randomRecipes.map((recipe, index) => {
              return (
                <RecipeList key={index}  recipe={recipe}  recipeType = "randomRecipe" handleRecipeDetails = {handleRecipeDetails} onBookmarkClick={handleBookmarkClick} isBookmarked={savedRecipes.includes(recipe.id)} isHome = {true} />
              );
            })  
            }
        </div>
      </>}
    </div>
  );
};

export default HomePage;
