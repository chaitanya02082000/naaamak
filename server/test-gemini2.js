// Test Gemini API key directly
import * as dotenv from 'dotenv';
import * as googleAI from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Get API key from environment
const API_KEY = process.env.GEMINI_API_KEY;
console.log('API key first 10 chars:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT FOUND');

// Test function
async function testApiKey() {
  try {
    console.log('Testing API key with gemini-2.0-flash model...');
    
    // Initialize Gemini client
    const genAI = new googleAI.GoogleGenerativeAI(API_KEY);
    
    // Initialize model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 50,
      },
    });
    
    // Simple prompt
    const prompt = 'Hello, are you working?';
    console.log('Sending test prompt...');
    
    // Call API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Response:', text);
    console.log('✅ API key is working correctly!');
    
  } catch (error) {
    console.error('❌ API key test failed:', error.message);
    console.log('Possible causes:');
    console.log('1. The API key may be invalid or expired');
    console.log('2. The Gemini API might be having issues');
    console.log('3. You might not have access to the requested model');
    console.log('\nFull error details:');
    console.error(error);
  }
}

// Run the test
testApiKey(); 