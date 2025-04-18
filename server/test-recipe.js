// Recipe question test for Gemini API
import * as dotenv from 'dotenv';
import * as googleAI from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Configure Gemini AI client
const genAI = new googleAI.GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testRecipeQuestion() {
  try {
    console.log('Testing a recipe question...');
    
    // Initialize model - use only gemini-1.5-pro since we know it works
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });
    
    // Sample recipe data
    const sampleRecipe = {
      title: 'Spaghetti Carbonara',
      description: 'A classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
      ingredients: ['400g spaghetti', '200g pancetta or guanciale', '4 large eggs', '50g pecorino cheese', '50g parmesan cheese', 'Freshly ground black pepper', 'Salt'],
      instructions: 'Cook pasta until al dente. Fry pancetta until crispy. Beat eggs with cheese. Drain pasta, mix with pancetta, then quickly stir in egg mixture. Season with pepper.',
      cookTime: '15',
      prepTime: '10',
      totalTime: '25',
      yield: '4 servings'
    };
    
    // Create a prompt similar to what we'd use in the actual application
    const prompt = `
      Based on the following recipe:

      Title: ${sampleRecipe.title}
      Description: ${sampleRecipe.description}
      Ingredients: ${sampleRecipe.ingredients.join(', ')}
      Instructions: ${sampleRecipe.instructions}
      Cooking Time: ${sampleRecipe.cookTime} minutes
      Prep Time: ${sampleRecipe.prepTime} minutes
      Total Time: ${sampleRecipe.totalTime} minutes
      Yield: ${sampleRecipe.yield}

      Please answer the following question:
      Can I substitute bacon for pancetta?

      Only use the information provided in the recipe details above. If the answer cannot be found in the recipe details, please state that clearly. Do not make up information.
    `;
    
    console.log('Sending recipe question prompt...');
    
    // Call API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\nGemini Response:');
    console.log(text);
    console.log('\n✅ Recipe question test successful');
    
  } catch (error) {
    console.error('\n❌ Recipe question test failed:', error.message);
    console.error('Full error:', error);
  }
}

testRecipeQuestion(); 