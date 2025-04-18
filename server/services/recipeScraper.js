import * as cheerio from 'cheerio';
import tinyduration from 'tinyduration';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function findLDJSON(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const jdjson = $("script[type='application/ld+json']");
    
    if (jdjson.length === 0) return null;
    
    const content = JSON.parse(jdjson[0].children[0].data);
    
    if (Array.isArray(content)) return content[0];
    else {
      if (content['@graph'] && Array.isArray(content['@graph'])) {
        for (let t of content['@graph']) {
          if (t['@type'] === 'Recipe') return t;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding LDJSON:', error);
    return null;
  }
}

function durationToStr(d) {
  if (!d) return '';
  const parsed = tinyduration.parse(d);
  const result = [];
  
  if (parsed.hours) {
    result.push(`${parsed.hours} hours`);
  }
  if (parsed.minutes) {
    result.push(`${parsed.minutes} minutes`);
  }
  if (parsed.seconds) {
    result.push(`${parsed.seconds} seconds`);
  }
  
  const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
  return formatter.format(result);
}

function parseInstructions(instructions) {
  const result = [];
  for (let instruction of instructions) {
    if (typeof instruction === 'string') {
      result.push(instruction);
    } else {
      if (instruction['@type'] === 'HowToStep') {
        result.push(instruction.text);
      }
    }
  }
  return result;
}

function findRecipe(jdjson) {
  if (!jdjson || !jdjson['@type'] || jdjson['@type'].indexOf('Recipe') === -1) return null;
  
  const result = {
    name: jdjson['name'],
    image: jdjson['image'],
    description: jdjson['description'],
    cookTime: durationToStr(jdjson['cookTime']),
    prepTime: durationToStr(jdjson['prepTime']),
    totalTime: durationToStr(jdjson['totalTime']),
    category: jdjson['recipeCategory'] ?? '',
    cuisine: jdjson['recipeCuisine'] ?? '',
    ingredients: jdjson['recipeIngredient'],
    instructions: parseInstructions(jdjson['recipeInstructions']),
    yield: jdjson['recipeYield']?.[0] ?? '',
    url: jdjson['url'] ?? ''
  };
  
  return result;
}

async function processWithGemini(recipeData) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });
    
    const prompt = `Given this recipe data, create a well-structured recipe card with appropriate tags, categories, and visual formatting.
    Recipe data: ${JSON.stringify(recipeData)}
    
    Please provide:
    1. A list of relevant tags (e.g., vegetarian, gluten-free, quick-meals)
    2. A list of categories (e.g., breakfast, lunch, dinner, dessert)
    3. A brief summary of the recipe that describes its key features in an engaging way
    4. Any additional notes or suggestions for serving, storage, or variations
    5. For recipe alternatives or substitutions, structure them as follows:
       - Use clear section headers with bold formatting ("**Section Title:**")
       - For lists of alternatives, use bullet points with item names in bold
       - Organize pros and cons in a tabular style when applicable
       - Keep paragraphs short and use line breaks for readability
    
    Format the response as JSON with the following structure:
    {
      "tags": [],
      "categories": [],
      "summary": "",
      "notes": "",
      "alternatives": {
        "formatted": true,
        "content": ""
      }
    }`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response and combine with original recipe data
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*}/);
      const jsonString = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : text;
      
      // Parse the JSON data
      const geminiData = JSON.parse(jsonString);
      
      // Format and process the data for better visualization
      if (geminiData.tags && Array.isArray(geminiData.tags)) {
        geminiData.tags = geminiData.tags.map(tag => tag.trim().toLowerCase());
      } else {
        geminiData.tags = [];
      }
      
      if (geminiData.categories && Array.isArray(geminiData.categories)) {
        geminiData.categories = geminiData.categories.map(category => category.trim());
      } else {
        geminiData.categories = [];
      }
      
      // Format the summary with paragraph breaks
      if (geminiData.summary) {
        geminiData.summary = geminiData.summary.trim();
      }
      
      // Format notes with bullet points if needed
      if (geminiData.notes) {
        geminiData.notes = geminiData.notes.trim();
      }
      
      // Initialize alternatives if not present
      if (!geminiData.alternatives) {
        geminiData.alternatives = {
          formatted: true,
          content: ""
        };
      }
      
      return {
        ...recipeData,
        ...geminiData
      };
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return {
        ...recipeData,
        tags: [],
        categories: [recipeData.category].filter(Boolean),
        summary: recipeData.description || '',
        notes: '',
        alternatives: {
          formatted: false,
          content: ''
        }
      };
    }
  } catch (error) {
    console.error('Error processing with Gemini:', error);
    return {
      ...recipeData,
      tags: [],
      categories: [recipeData.category].filter(Boolean),
      summary: recipeData.description || '',
      notes: '',
      alternatives: {
        formatted: false,
        content: ''
      }
    };
  }
}

async function scrapeRecipe(url) {
  try {
    const ldjson = await findLDJSON(url);
    if (!ldjson) {
      throw new Error('No recipe data found on the page');
    }
    
    const recipeData = findRecipe(ldjson);
    if (!recipeData) {
      throw new Error('Could not parse recipe data');
    }
    
    // Add default tags and categories if none exist
    if (!recipeData.tags) {
      recipeData.tags = [];
    }
    if (!recipeData.categories) {
      recipeData.categories = [recipeData.category].filter(Boolean);
    }
    if (!recipeData.summary) {
      recipeData.summary = recipeData.description || '';
    }
    if (!recipeData.notes) {
      recipeData.notes = '';
    }
    
    return recipeData;
  } catch (error) {
    console.error('Error scraping recipe:', error);
    throw error;
  }
}

export { scrapeRecipe }; 