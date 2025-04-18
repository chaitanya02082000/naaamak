// Simple test for Gemini API
import * as dotenv from 'dotenv';
import * as googleAI from '@google/generative-ai';

// Load environment variables
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
console.log('Using API key (first few chars):', API_KEY ? API_KEY.substring(0, 5) + '...' : 'NOT FOUND');

// Configure Gemini AI client
const genAI = new googleAI.GoogleGenerativeAI(API_KEY);

async function runTest() {
  try {
    console.log('Testing both gemini-1.5-pro and gemini-pro models...');
    
    // Test models in sequence
    await testModel('gemini-1.5-pro');
    await testModel('gemini-pro');
    
  } catch (error) {
    console.error('General error:', error);
  }
}

async function testModel(modelName) {
  console.log(`\nTesting model: ${modelName}`);
  try {
    // Initialize model
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100, // Keep it small for testing
      },
    });
    
    // Very simple prompt
    const prompt = 'Say hello';
    console.log('Sending prompt:', prompt);
    
    // Call API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Response:', text);
    console.log(`✅ ${modelName} test successful`);
    
  } catch (error) {
    console.error(`❌ ${modelName} test failed:`, error.message);
  }
}

runTest(); 