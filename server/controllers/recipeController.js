import { scrapeRecipe } from '../services/recipeScraper.js';

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