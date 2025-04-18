// Test file for using the Gemini API
import * as dotenv from 'dotenv';
import * as googleAI from '@google/generative-ai';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not defined in .env file');
  process.exit(1);
}

// Configure Gemini AI client
const genAI = new googleAI.GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// List available models
async function listModels() {
  try {
    console.log('Listing available models...');
    const result = await genAI.listModels();
    console.log('Available models:', result);
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

// Simple test function
async function testGemini() {
  try {
    console.log('Testing Gemini API...');
    
    // Try with updated model name
    // Models might include: gemini-1.5-pro, gemini-1.0-pro, etc.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });
    
    // A simple prompt
    const prompt = `Tell me a simple recipe for chocolate chip cookies.`;
    
    console.log('Sending prompt to Gemini API:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Response from Gemini API:');
    console.log(text);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error testing Gemini API:', error);
  }
}

// Run the tests inside an async IIFE
(async () => {
  // First try listing models
  console.log('Attempting to list available models...');
  await listModels();
  
  // Then run the test
  console.log('\nAttempting to use the Gemini API...');
  await testGemini();
})(); 