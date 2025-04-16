import express from 'express';
import { scrapeRecipeController } from '../controllers/recipeController.js';

const router = express.Router();

// Route for scraping recipes
router.post('/scrape', scrapeRecipeController);

export default router; 