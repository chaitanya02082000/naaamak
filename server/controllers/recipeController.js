import { scrapeRecipe } from '../services/recipeScraper.js';
import Recipe from '../models/Recipe.js';
import mongoose from 'mongoose';

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
    const { userId } = req.params;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid userId is required'
      });
    }
    
    const recipes = await Recipe.find({ userId });
    
    res.status(200).json({
      success: true,
      data: recipes
    });
  } catch (error) {
    console.error('Error getting user scraped recipes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user scraped recipes'
    });
  }
}; 