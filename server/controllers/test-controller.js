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

      Only use the information provided in the recipe details above. If the answer cannot be found in the recipe details, please state that clearly. Do not make up information.
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