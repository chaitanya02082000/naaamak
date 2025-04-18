import { RecipeModel } from "../models/Recipes.js";
import { UserModel } from "../models/Users.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

// Load environment variables to ensure they're properly initialized
dotenv.config();

// Configure Gemini AI Client
// Ensure you have GEMINI_API_KEY in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to get saved recipes by user ID
export const getSavedRecipes = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userID);
    const savedRecipes = await RecipeModel.find({
      _id: { $in: user.savedRecipes },
    });

    console.log(savedRecipes);
    res.status(200).json({ savedRecipes });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

// Function to handle asking Gemini about a recipe
export const askAboutRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required." });
    }

    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Based on the following recipe:

      Title: ${recipe.name}
      Description: ${recipe.description}
      Ingredients: ${recipe.ingredients.join(', ')}
      Instructions: ${recipe.instructions}
      Cooking Time: ${recipe.cookingTime} minutes

      Please answer the following question:
      ${question}

      Only use the information provided in the recipe details above. If the answer cannot be found in the recipe details, please state that clearly. Do not make up information.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ answer: text });

  } catch (error) {
    console.error("Error in askAboutRecipe:", error);
    // Provide a more specific error message if possible
    if (error.message.includes('API key not valid')) {
       return res.status(401).json({ message: "AI service authentication failed. Please check API key." });
    }
     // Add more specific checks if needed (e.g., rate limits)
    res.status(500).json({ message: "Error processing your question with the AI service." });
  }
}; 