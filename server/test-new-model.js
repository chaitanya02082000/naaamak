// Test for gemini-2.0-flash model
import * as dotenv from 'dotenv';
import * as googleAI from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Configure Gemini AI client
const genAI = new googleAI.GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testNewModel() {
  try {
    console.log('Testing gemini-2.0-flash model...');
    
    // Initialize model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    });
    
    // Simple prompt
    const prompt = 'Give me a quick recipe for pancakes';
    console.log('Sending prompt:', prompt);
    
    // Call API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('\nGemini Response:');
    console.log(text);
    console.log('\n✅ gemini-2.0-flash test successful');
    
  } catch (error) {
    console.error('\n❌ gemini-2.0-flash test failed:', error.message);
    console.error('Full error:', error);
  }
}

testNewModel(); 