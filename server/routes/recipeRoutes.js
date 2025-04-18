import express from 'express';
import { 
  scrapeRecipeController, 
  saveScrapedRecipe, 
  getUserScrapedRecipes,
  askAboutRecipe
} from '../controllers/recipeController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Route for scraping recipes
router.post('/scrape', scrapeRecipeController);

// Route for saving scraped recipes (protected)
router.post('/:userId/save', verifyToken, saveScrapedRecipe);

// Route for getting user's scraped recipes (protected)
router.get('/:userId', verifyToken, getUserScrapedRecipes);

// Route to ask Gemini about a specific recipe (temporarily removing auth check for testing)
router.post('/:id/ask', askAboutRecipe); // Removed verifyToken middleware for testing

export default router; 