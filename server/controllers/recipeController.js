import { scrapeRecipe } from '../services/recipeScraper.js';
import Recipe from '../models/Recipe.js';
import mongoose from 'mongoose';
import User from "../models/User.js";
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as googleAI from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Load environment variables to ensure they're properly initialized
dotenv.config();

// Configure Gemini AI Client
// Ensure you have GEMINI_API_KEY in your .env file
const genAI = new googleAI.GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const scrapeRecipeController = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }
    
    const recipeData = await scrapeRecipe(url);
    
    res.status(200).json({
      success: true,
      data: recipeData
    });
  } catch (error) {
    console.error('Error in scrapeRecipe controller:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to scrape recipe'
    });
  }
};

export const saveScrapedRecipe = async (req, res) => {
  try {
    const { userId } = req.params;
    const recipeData = req.body;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid userId is required'
      });
    }
    
    if (!recipeData) {
      return res.status(400).json({
        success: false,
        message: 'Recipe data is required'
      });
    }
    
    console.log('Original recipe data:', JSON.stringify(recipeData, null, 2));
    
    // Process image if it's an object with a URL
    let imageUrl = '';
    if (typeof recipeData.image === 'object' && recipeData.image.url) {
      imageUrl = recipeData.image.url;
    } else if (typeof recipeData.image === 'object' && recipeData.image['@type'] === 'ImageObject' && recipeData.image.url) {
      imageUrl = recipeData.image.url;
    } else if (Array.isArray(recipeData.image) && recipeData.image.length > 0) {
      // If image is an array, use the first item
      const firstImage = recipeData.image[0];
      if (typeof firstImage === 'string') {
        imageUrl = firstImage;
      } else if (typeof firstImage === 'object' && firstImage.url) {
        imageUrl = firstImage.url;
      }
    } else if (typeof recipeData.image === 'string') {
      imageUrl = recipeData.image;
    }
    
    // Ensure we have a valid source URL
    let sourceUrl = '';
    if (recipeData.url && typeof recipeData.url === 'string') {
      sourceUrl = recipeData.url;
    } else if (recipeData.sourceUrl && typeof recipeData.sourceUrl === 'string') {
      sourceUrl = recipeData.sourceUrl;
    } else {
      // Default to a placeholder URL if none is provided
      sourceUrl = 'https://example.com/recipe';
    }
    
    // Process categories - ensure they're all primitive strings
    let categories = [];
    if (recipeData.categories) {
      if (Array.isArray(recipeData.categories)) {
        // Flatten the array and ensure all items are strings
        const flattenArray = (arr) => {
          return arr.reduce((acc, val) => {
            return acc.concat(
              Array.isArray(val) ? flattenArray(val) : String(val)
            );
          }, []);
        };
        
        categories = flattenArray(recipeData.categories)
          .filter(Boolean)
          .filter((item, index, self) => self.indexOf(item) === index); // Deduplicate
      } else if (typeof recipeData.categories === 'string') {
        categories = [recipeData.categories];
      }
    }
    
    // Add the main category if it's available and not already included
    if (recipeData.category && typeof recipeData.category === 'string' && !categories.includes(recipeData.category)) {
      categories.push(recipeData.category);
    }
    
    // Process cuisine
    let cuisine = '';
    if (recipeData.cuisine) {
      if (Array.isArray(recipeData.cuisine) && recipeData.cuisine.length > 0) {
        cuisine = String(recipeData.cuisine[0]);
      } else if (typeof recipeData.cuisine === 'string') {
        cuisine = recipeData.cuisine;
      } else {
        cuisine = String(recipeData.cuisine);
      }
    }
    
    // Process tags
    let tags = [];
    if (recipeData.tags) {
      if (Array.isArray(recipeData.tags)) {
        tags = recipeData.tags.map(tag => String(tag)).filter(Boolean);
      } else if (typeof recipeData.tags === 'string') {
        tags = [recipeData.tags];
      }
    }
    
    // Process ingredients
    let ingredients = [];
    if (recipeData.ingredients) {
      if (Array.isArray(recipeData.ingredients)) {
        ingredients = recipeData.ingredients.map(ing => String(ing)).filter(Boolean);
      } else if (typeof recipeData.ingredients === 'string') {
        ingredients = [recipeData.ingredients];
      }
    }
    
    // Process instructions
    let instructions = [];
    if (recipeData.instructions) {
      if (Array.isArray(recipeData.instructions)) {
        instructions = recipeData.instructions.map((instruction, index) => ({
          number: index + 1,
          step: typeof instruction === 'string' ? instruction : JSON.stringify(instruction)
        }));
      } else if (typeof recipeData.instructions === 'string') {
        instructions = [{
          number: 1,
          step: recipeData.instructions
        }];
      }
    }
    
    console.log('Processed categories:', categories);
    console.log('Processed sourceUrl:', sourceUrl);
    
    // Format the recipe data to match our schema
    const newRecipe = new Recipe({
      title: recipeData.name || '',
      description: recipeData.description || '',
      summary: recipeData.summary || '',
      image: imageUrl,
      prepTime: recipeData.prepTime || '',
      cookTime: recipeData.cookTime || '',
      totalTime: recipeData.totalTime || '',
      yield: recipeData.yield || '',
      ingredients: ingredients,
      instructions: instructions,
      tags: tags,
      categories: categories,
      cuisine: cuisine,
      notes: recipeData.notes || '',
      sourceUrl: sourceUrl,
      userId: userId
    });
    
    await newRecipe.save();
    
    res.status(201).json({
      success: true,
      data: newRecipe
    });
  } catch (error) {
    console.error('Error saving scraped recipe:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save scraped recipe'
    });
  }
};

export const getUserScrapedRecipes = async (req, res) => {
  try {
    const userId = req.params.userId;
    const recipes = await Recipe.find({ userId: userId });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching scraped recipes', error: error.message });
  }
};

export const askAboutRecipe = async (req, res) => {
  console.log('🚀 askAboutRecipe called - Request received:', { 
    recipeId: req.params.id,
    hasQuestion: !!req.body.question,
    hasRecipeData: !!req.body.recipeData,
    hasToken: !!req.headers.authorization,
    hasVerifiedUser: !!req.user,
    userInfo: req.user ? `User ID: ${req.user.id}` : 'No user info'
  });
  
  try {
    const recipeId = req.params.id;
    const { question, recipeData } = req.body;

    if (!question) {
      console.log('❌ Question is missing');
      return res.status(400).json({ message: "Question is required." });
    }

    // Variable to hold recipe data, either from DB or request
    let recipe;

    // Check if recipeId is a valid MongoDB ObjectId
    const isValidObjectId = recipeId && mongoose.Types.ObjectId.isValid(recipeId);
    const isNumericId = recipeId && !isNaN(recipeId) && recipeId.toString().length > 0;

    console.log('ID type check:', {
      recipeId,
      isValidObjectId,
      isNumericId,
      type: typeof recipeId
    });

    // First try to get recipe from DB if valid ID format
    if (isValidObjectId) {
      console.log('📥 Fetching recipe with ID from database:', recipeId);
      recipe = await Recipe.findById(recipeId);
    }
    
    // If recipe not found in DB but recipeData is provided in request, use that
    if (!recipe && recipeData) {
      console.log('📥 Using recipe data provided in request');
      recipe = recipeData;
    }
    
    if (!recipe) {
      console.log('❌ Recipe not found and no recipe data provided');
      return res.status(404).json({ message: "Recipe not found. Please try again with a different recipe." });
    }
    
    console.log('✅ Recipe data available:', { 
      id: recipe._id || recipe.id || 'No ID',
      title: recipe.title || recipe.name || 'Untitled',
      hasIngredients: !!recipe.ingredients,
      hasInstructions: !!recipe.instructions
    });

    // Validate that recipe has at least some content
    if ((!recipe.ingredients || (Array.isArray(recipe.ingredients) && recipe.ingredients.length === 0)) && 
        (!recipe.extendedIngredients || (Array.isArray(recipe.extendedIngredients) && recipe.extendedIngredients.length === 0))) {
      console.log('❌ Recipe has no ingredients');
      return res.status(400).json({ message: "Recipe has no ingredients data." });
    }

    // For text-only input, use the gemini-2.0-flash model
    console.log('🤖 Initializing Gemini model (gemini-2.0-flash)...');
    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('GEMINI_API_KEY first 10 chars:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT FOUND');

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",  // Changed from "gemini-1.5-pro" as requested
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,  // Allow longer responses
      },
    });

    // Process recipe data to handle different formats and missing fields
    const getIngredientsList = () => {
      // Handle Spoonacular API format
      if (recipe.extendedIngredients && recipe.extendedIngredients.length > 0) {
        return recipe.extendedIngredients.map(ing => 
          ing.original || ing.originalString || ing.name || JSON.stringify(ing)
        ).join(', ');
      }
      
      // Handle standard format
      if (!recipe.ingredients) return 'No ingredients provided';
      if (Array.isArray(recipe.ingredients)) {
        return recipe.ingredients.join(', ');
      }
      return String(recipe.ingredients);
    };

    const getInstructions = () => {
      // Handle Spoonacular API format
      if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
        const steps = recipe.analyzedInstructions[0].steps;
        if (steps && steps.length > 0) {
          return steps.map(step => `${step.number}. ${step.step}`).join('\n');
        }
      }
      
      // Handle standard format
      if (!recipe.instructions) return recipe.description || 'No instructions provided';
      if (Array.isArray(recipe.instructions)) {
        if (recipe.instructions.length > 0 && recipe.instructions[0].step) {
          return recipe.instructions.map(i => i.step).join('\n');
        }
        return recipe.instructions.join('\n');
      }
      return String(recipe.instructions);
    };

    console.log('📝 Creating prompt with recipe data and question:', question);
    const prompt = `
      Based on the following recipe:

      Title: ${recipe.title || recipe.name || 'Untitled Recipe'}
      Description: ${recipe.description || recipe.summary || 'No description provided'}
      Ingredients: ${getIngredientsList()}
      Instructions: ${getInstructions()}
      Cooking Time: ${recipe.cookTime || recipe.cookingMinutes || recipe.readyInMinutes || 'N/A'} minutes
      Servings: ${recipe.servings || recipe.yield || 'N/A'}
      Prep Time: ${recipe.prepTime || recipe.preparationMinutes || 'N/A'}
      Total Time: ${recipe.totalTime || recipe.readyInMinutes || 'N/A'}

      Please answer the following question:
      ${question}

      Only use the information provided in the recipe details above. If the answer cannot be found in the recipe details, please state that clearly. Do not make up information.
    `;

    console.log('🔄 Calling Gemini API...');
    try {
      const result = await model.generateContent(prompt);
      console.log('✅ Gemini API response received');
      const response = await result.response;
      const text = response.text();
      console.log('📤 Sending answer to client');
      res.status(200).json({ answer: text });
    } catch (geminiError) {
      console.error('❌ Gemini API error:', geminiError);
      // More detailed error information
      if (geminiError.message.includes('API key not valid')) {
        return res.status(401).json({ message: "AI service authentication failed. Please check API key." });
      } else if (geminiError.message.includes('404 Not Found')) {
        return res.status(500).json({ message: "AI model not found or not available. Please check model name and configuration." });
      } else if (geminiError.message.includes('429 Too Many Requests')) {
        return res.status(429).json({ message: "AI service rate limit reached. Please try again later." });
      } else {
        return res.status(500).json({ message: `Error from AI service: ${geminiError.message}` });
      }
    }
  } catch (error) {
    console.error("❌ General error in askAboutRecipe:", error);
    res.status(500).json({ message: "Error processing your question with the AI service." });
  }
}; 