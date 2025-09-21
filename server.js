// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

// --- Initialize Gemini API ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY is not set in your .env file.");
    console.error("Please get one from Google AI Studio (https://aistudio.google.com/) and add it to .env.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoint for Generating Recipes ---
app.post('/api/generate-recipe', async (req, res) => {
    const { ingredients, cuisine, mealType, difficulty, course } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: 'Please provide at least one ingredient.' });
    }

    const ingredientsList = ingredients.join(', ');

    // --- REFINED PROMPT: More specific and restrictive instructions ---
    let coursePreference = '';
    // Conditional logic to handle the "Side Dish" request specifically
    if (course && course.toLowerCase() === 'side dish') {
        coursePreference = 'Generate a curry, chutney that can be served as a side dish.';
    } else if (course) {
        coursePreference = `Course preference: ${course}`;
    }

    const prompt = `
        You are a highly skilled culinary assistant. Generate an array of 3 distinct recipe JSON objects based on the following ingredients and preferences.
        
        Ingredients available: ${ingredientsList}
        
        STRICTLY USE ONLY THE INGREDIENTS FROM THE PROVIDED LIST. DO NOT ADD ANY MAJOR INGREDIENTS THAT ARE NOT LISTED, such as rice, pasta, bread, or tortillas. You may assume minor ingredients like salt, pepper, oil, and water are available.

        Assume the user has common minor ingredients like **salt, pepper, oil, water** .

        ${cuisine ? `Cuisine preference: ${cuisine}` : ''}
        ${mealType ? `Meal type preference: ${mealType}` : ''}
        ${coursePreference}
        ${difficulty ? `Desired difficulty: ${difficulty}` : ''}

        Return the recipes as a JSON array with each object having the following structure. Ensure all fields are populated accurately. If you cannot generate a suitable value, use "N/A" for strings.
        [
            {
                "id": "generate_a_unique_id_like_a_timestamp",
                "name": "Recipe Name (e.g., Simple Chicken Stir-fry)",
                "description": "A short, appealing description of the dish, highlighting its taste and appeal.",
                "image_url": "/images/placeholder-food.jpg",
                "cuisine": "Cuisine Type (e.g., Indian, Italian, Mexican)",
                "course": "Course (e.g., Main Dish, Appetizer)",
                "diet": "Dietary (e.g., Vegetarian, Non-Vegetarian)",
                "prep_time": "Preparation time (e.g., 15 minutes)",
                "cook_time": "Cooking time (e.g., 20 minutes)",
                "difficulty": "Difficulty level (e.g., Easy, Medium)",
                "servings": "Number of servings (e.g., 2)",
                "ingredients": [
                    "Ingredient 1 (e.g., 1 cup flour)",
                    "Ingredient 2 (e.g., 2 large eggs)"
                ],
                "instructions": "Step 1. Clearly describe the first step.\\nStep 2. Move to the next step, using '\\n' for new lines.\\nStep 3. Provide all necessary details logically...."
            },
            {...},
            {...}
        ]
        
        Make sure the 'ingredients' field is strictly a list of strings, and 'instructions' is a single string with clear steps and these steps should be understood for anyone.
        The steps should be easily understandable and begineer friendly. A begineer can make that recipe easily. the steps should be separated by newline characters ('\\n').
        Ensure the generated JSON is valid and complete, with no surrounding text or markdown unless necessary.
    `;

    try {
        console.log(`Generating recipes for: ${ingredientsList}...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let recipeContent = response.text();

        let generatedRecipes = [];
        try {
            generatedRecipes = JSON.parse(recipeContent);
        } catch (parseError) {
            console.warn("Failed to parse Gemini response as JSON array directly. Trying markdown block extraction:", parseError);
            const jsonMatch = recipeContent.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                try {
                    generatedRecipes = JSON.parse(jsonMatch[1]);
                    console.log("Successfully parsed JSON array from markdown block.");
                } catch (fallbackParseError) {
                    console.error("Fallback JSON array parsing failed:", fallbackParseError);
                    return res.status(500).json({ error: "Could not parse recipes from AI response's markdown block." });
                }
            } else {
                console.error("No JSON markdown block found. Final attempt to parse raw content as JSON array.");
                try {
                    generatedRecipes = JSON.parse(recipeContent.trim());
                } catch (finalParseError) {
                    console.error("Final attempt to parse JSON array failed:", finalParseError);
                    return res.status(500).json({ error: "Could not retrieve a valid recipe array from AI response." });
                }
            }
        }

        const processedRecipes = generatedRecipes.map(recipe => {
            if (!recipe.id) {
                recipe.id = `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            }
            if (Array.isArray(recipe.instructions)) {
                recipe.instructions = recipe.instructions.join('\n');
            } else if (typeof recipe.instructions !== 'string') {
                recipe.instructions = "Instructions not available.";
            }
            if (!Array.isArray(recipe.ingredients)) {
                recipe.ingredients = ["Ingredients not specified."];
            } else {
                recipe.ingredients = recipe.ingredients.map(ing => ing.replace(/[\d\.\/]+\s*(cup|tsp|tbsp|g|ml|oz|lb|pc|clove|stalk)s?\s*/i, '').trim()).filter(ing => ing.length > 2);
            }
            return recipe;
        });

        res.json({ results: processedRecipes, stats: { totalGenerated: processedRecipes.length } });

    } catch (error) {
        console.error('Error in /api/generate-recipe:', error);
        res.status(500).json({ error: `Failed to generate recipes. Server error: ${error.message}` });
    }
});

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Frontend accessible at http://localhost:${port}`);
});