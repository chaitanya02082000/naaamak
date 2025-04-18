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
    
    // Test 1: Substitution Question
    console.log('----- Test 1: Substitution Question -----');
    
    // Create a prompt similar to what we'd use in the actual application
    const substitutionPrompt = `
      You are a helpful cooking assistant for an online recipe book application. Your goal is to provide detailed, accurate answers about recipes and offer helpful substitutions and cooking tips.
      
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
    
    console.log('Sending substitution question prompt...');
    
    // Call API
    const subResult = await model.generateContent(substitutionPrompt);
    const subResponse = await subResult.response;
    const subText = subResponse.text();
    
    console.log('\nGemini Response for Substitution:');
    console.log(subText);
    
    // Test 2: Side Dish Question
    console.log('\n----- Test 2: Side Dish Question -----');
    
    const sideDishPrompt = `
      You are a helpful cooking assistant for an online recipe book application. Your goal is to provide detailed, accurate answers about recipes and offer helpful substitutions and cooking tips.
      
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
      What side dishes would pair well with this recipe?

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
    
    console.log('Sending side dish question prompt...');
    
    // Call API for side dish question
    const sideResult = await model.generateContent(sideDishPrompt);
    const sideResponse = await sideResult.response;
    const sideText = sideResponse.text();
    
    console.log('\nGemini Response for Side Dish Question:');
    console.log(sideText);
    
    console.log('\n✅ Recipe question tests successful');
    
  } catch (error) {
    console.error('\n❌ Recipe question test failed:', error.message);
    console.error('Full error:', error);
  }
}

testRecipeQuestion(); 