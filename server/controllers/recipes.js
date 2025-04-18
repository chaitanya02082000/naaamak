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
      You are a helpful cooking assistant for an online recipe book application. Your goal is to provide detailed, accurate answers about recipes and offer helpful substitutions and cooking tips.
      
      Based on the following recipe:

      Title: ${recipe.name}
      Description: ${recipe.description}
      Ingredients: ${recipe.ingredients.join(', ')}
      Instructions: ${recipe.instructions}
      Cooking Time: ${recipe.cookingTime} minutes

      Please answer the following question:
      ${question}

      IMPORTANT GUIDELINES:
      1. NEVER respond with statements like "I cannot determine..." or "The recipe does not provide...". Instead, use your cooking knowledge to offer suggestions.
      
      2. For substitution questions:
         - Explain why certain substitutions work or don't work
         - Always suggest multiple alternatives with pros/cons
         - Consider texture, flavor, and cooking properties
      
      3. For questions about side dishes or pairings:
         - Based on the recipe's cuisine, ingredients, and flavors, suggest at least 3 appropriate side dishes
         - For main dishes, consider complementary flavors, textures, and colors
         - Include at least one vegetable option and one starch option when appropriate
      
      4. For dietary adaptation questions (vegan, gluten-free, etc.):
         - Provide detailed substitutions for each relevant ingredient
         - Mention any cooking technique adjustments needed
      
      5. For storage or make-ahead questions:
         - Provide specific storage methods, containers, and timeframes
         - Include reheating instructions
      
      6. ALWAYS provide a helpful, detailed response even if the information is not explicitly in the recipe.
      7. Clearly preface suggestions with phrases like "While not specified in the recipe, I recommend..." or "Based on culinary principles..."
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Process the response to provide better answers when needed
    const processedResponse = processAIResponse(text, question, recipe);

    res.status(200).json({ answer: processedResponse });

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

// Helper function to process and enhance AI responses
const processAIResponse = (response, question, recipe) => {
  // Don't process empty responses
  if (!response || response.trim() === '') {
    return "I couldn't generate a response for this question. Please try asking something else about the recipe.";
  }
  
  const questionLower = question.toLowerCase();
  const responseLower = response.toLowerCase();
  
  // Check for non-helpful "cannot determine" or "does not provide" responses
  const unhelpfulPhrases = [
    "cannot determine", 
    "does not provide", 
    "not mentioned",
    "no specific", 
    "doesn't mention",
    "not specified"
  ];
  
  // Check if the response contains unhelpful phrases and doesn't provide alternatives
  const isUnhelpfulResponse = unhelpfulPhrases.some(phrase => 
    responseLower.includes(phrase) && 
    !responseLower.includes("however") && 
    !responseLower.includes("instead") &&
    !responseLower.includes("recommend") &&
    !responseLower.includes("suggest")
  );
  
  if (isUnhelpfulResponse) {
    const recipeName = recipe?.name || "this recipe";
    
    // Handle side dish questions
    if (questionLower.includes("side dish") || 
        questionLower.includes("pair with") || 
        questionLower.includes("serve with") ||
        questionLower.includes("accompaniment") ||
        questionLower.includes("go with")) {
      
      return `While not explicitly mentioned in the recipe, here are some side dish recommendations for ${recipeName}:

1. Vegetable options: 
   - A simple green salad with a light vinaigrette
   - Roasted seasonal vegetables (broccoli, cauliflower, carrots)
   - Sautéed green beans with garlic and lemon

2. Starch options:
   - Fluffy white or brown rice
   - Crusty bread or dinner rolls
   - Roasted or mashed potatoes

3. Additional complementary sides:
   - Fresh cucumber and tomato salad
   - Steamed vegetables with herbs
   - Light fruit salad (especially good with spicy dishes)

These recommendations are based on culinary principles of balancing flavors, textures, and providing nutritional variety.`;
    }
    
    // Default enhancement for other unhelpful responses
    return `While the recipe doesn't explicitly address this, here are some helpful suggestions based on culinary principles: 

${response}

Remember that cooking is flexible and you can adapt recipes based on your preferences and available ingredients.`;
  }
  
  return response;
}; 