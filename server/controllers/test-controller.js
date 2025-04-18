// Direct test of the askAboutRecipe controller functionality
import * as dotenv from 'dotenv';
import * as googleAI from '@google/generative-ai';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Get Gemini API key from environment
const API_KEY = process.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY exists:', !!API_KEY);
console.log('GEMINI_API_KEY first 10 chars:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT FOUND');

// Initialize Gemini client - exactly as done in the controller
const genAI = new googleAI.GoogleGenerativeAI(API_KEY);

// Test function mimicking the controller, but without Express
async function testAskAboutRecipe() {
  try {
    console.log('Testing askAboutRecipe controller functionality...');
    
    // Sample recipe data (similar format to what would be in the database or request)
    const sampleRecipe = {
      title: 'Chocolate Chip Cookies',
      description: 'Classic homemade chocolate chip cookies that are soft and chewy.',
      ingredients: [
        '2 1/4 cups all-purpose flour', 
        '1 teaspoon baking soda', 
        '1 teaspoon salt', 
        '1 cup butter, softened',
        '3/4 cup granulated sugar',
        '3/4 cup packed brown sugar',
        '2 large eggs',
        '2 teaspoons vanilla extract',
        '2 cups semi-sweet chocolate chips'
      ],
      instructions: 'Preheat oven to 375°F. Mix flour, baking soda, and salt. In another bowl, cream butter and sugars. Beat in eggs and vanilla. Gradually add flour mixture. Stir in chocolate chips. Drop by rounded tablespoons onto ungreased baking sheets. Bake for 9-11 minutes.',
      cookTime: '10',
      prepTime: '15',
      totalTime: '25'
    };
    
    // Sample question a user might ask
    const question = 'Can I use margarine instead of butter?';
    
    // For text-only input, use gemini-2.0-flash model (same as controller)
    console.log('🤖 Initializing Gemini model (gemini-2.0-flash)...');
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1024,
      },
    });
    
    // Create prompt - similar to what the controller does
    const prompt = `
      You are a helpful cooking assistant for an online recipe book application. Your goal is to provide detailed, accurate answers about recipes and offer helpful substitutions and cooking tips.
      
      Based on the following recipe:

      Title: ${sampleRecipe.title}
      Description: ${sampleRecipe.description}
      Ingredients: ${sampleRecipe.ingredients.join(', ')}
      Instructions: ${sampleRecipe.instructions}
      Cooking Time: ${sampleRecipe.cookTime} minutes
      Prep Time: ${sampleRecipe.prepTime} minutes
      Total Time: ${sampleRecipe.totalTime} minutes

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
    
    console.log('📝 Created prompt for question:', question);
    console.log('🔄 Calling Gemini API...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\n✅ Gemini API Response:');
    console.log(text);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('Full error details:');
    console.error(error);
  }
}

// Run the test
testAskAboutRecipe(); 