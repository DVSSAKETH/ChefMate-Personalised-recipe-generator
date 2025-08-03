document.addEventListener('DOMContentLoaded', () => {
    const ingredientInput = document.getElementById('ingredientInput');
    const cuisineInput = document.getElementById('cuisineInput');
    const mealTypeInput = document.getElementById('mealTypeInput');
    const difficultySelect = document.getElementById('difficultySelect');
    const searchBtn = document.getElementById('searchBtn');
    const recipeResultsDiv = document.getElementById('recipeResults');
    const generatedRecipeHeading = document.getElementById('generatedRecipeHeading');

    const API_BASE_URL = 'http://localhost:3000'; // Match your backend port

    function displayMessage(message, type = 'info') {
        recipeResultsDiv.innerHTML = '';
        generatedRecipeHeading.classList.add('hidden');

        const p = document.createElement('p');
        p.textContent = message;
        p.className = '';
        if (type === 'error') {
            p.classList.add('error-message');
        } else if (type === 'loading') {
            p.classList.add('loading-message');
        } else {
            p.classList.add('info-message');
        }
        recipeResultsDiv.appendChild(p);
    }

    // --- NEW: Function to display an array of recipes ---
    function displayRecipes(recipes) {
        recipeResultsDiv.innerHTML = '';
        
        // Basic validation for a valid recipe array
        if (!Array.isArray(recipes) || recipes.length === 0) {
            displayMessage('The AI could not generate any recipes with your inputs. Please try different ingredients or preferences.', 'info');
            return;
        }

        generatedRecipeHeading.classList.remove('hidden'); // Show heading when recipes are displayed

        recipes.forEach(recipe => {
            // Check if the recipe object itself is valid before displaying
            if (!recipe || !recipe.name || !recipe.instructions) {
                // Skip invalid recipes in the array
                console.warn("Skipping an invalid recipe object from the AI response.");
                return; 
            }

            const recipeCard = document.createElement('div');
            // The key for each card should be a unique ID
            recipeCard.id = recipe.id;
            recipeCard.classList.add('recipe-card');
            
            const difficultyClass = recipe.difficulty ? `difficulty-${recipe.difficulty.toLowerCase()}` : '';

            recipeCard.innerHTML = `
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name || 'Untitled Recipe'}</h3>
                    <div class="recipe-meta">
                        <span class="difficulty-badge ${difficultyClass}">${recipe.difficulty ? recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1) : 'N/A'}</span>
                        <span><strong>Prep:</strong> ${recipe.prep_time || 'N/A'}</span>
                        <span><strong>Cook:</strong> ${recipe.cook_time || 'N/A'}</span>
                        <span><strong>Cuisine:</strong> ${recipe.cuisine || 'N/A'}</span>
                        <span><strong>Course:</strong> ${recipe.course || 'N/A'}</span>
                        <span><strong>Diet:</strong> ${recipe.diet || 'N/A'}</span>
                    </div>
                    <p class="recipe-description">${recipe.description || 'No description available.'}</p>
                    
                    <p class="recipe-ingredients-list">
                        <strong>Ingredients:</strong> ${recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients.join(', ') : 'Not specified.'}
                    </p>
                    <button class="view-instructions-btn" data-recipe='${JSON.stringify(recipe)}'>View Full Recipe</button>
                </div>
            `;
            recipeResultsDiv.appendChild(recipeCard);
        });

        // Add event listeners to all newly created "View Full Recipe" buttons
        document.querySelectorAll('.view-instructions-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const recipeData = JSON.parse(event.target.dataset.recipe);
                showInstructionsModal(recipeData);
            });
        });
    }
    // --- END OF NEW FUNCTION ---

    function showInstructionsModal(recipe) {
        const overlay = document.createElement('div');
        overlay.classList.add('instructions-overlay');

        overlay.innerHTML = `
            <div class="instructions-content">
                <button class="close-btn">&times;</button>
                <h3>${recipe.name || 'Recipe Instructions'}</h3>
                <p><strong>Cuisine:</strong> ${recipe.cuisine || 'N/A'} | <strong>Course:</strong> ${recipe.course || 'N/A'} | <strong>Diet:</strong> ${recipe.diet || 'N/A'}</p>
                <p><strong>Prep Time:</strong> ${recipe.prep_time || 'N/A'} | <strong>Cook Time:</strong> ${recipe.cook_time || 'N/A'} | <strong>Difficulty:</strong> ${recipe.difficulty || 'N/A'}</p>
                <p><strong>Ingredients:</strong> ${recipe.ingredients ? recipe.ingredients.join(', ') : 'N/A'}</p>
                <h4>Instructions:</h4>
                <pre>${recipe.instructions || 'No instructions available.'}</pre>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    async function generateRecipe() {
        const ingredientsInputVal = ingredientInput.value.trim();
        const ingredientsArray = ingredientsInputVal.split(',').map(item => item.trim()).filter(item => item !== '');

        const cuisineVal = cuisineInput.value.trim();
        const mealTypeVal = mealTypeInput.value.trim();
        const difficultyVal = difficultySelect.value;

        generatedRecipeHeading.classList.add('hidden');
        displayMessage('Generating delicious recipes for you...', 'loading');

        if (ingredientsArray.length === 0) {
            displayMessage('Please enter at least one ingredient to generate a recipe.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/generate-recipe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ingredients: ingredientsArray,
                    cuisine: cuisineVal,
                    mealType: mealTypeVal,
                    difficulty: difficultyVal
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown server error.' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // --- CRITICAL CHANGE: Call the new displayRecipes function with the array ---
            displayRecipes(data.results);

        } catch (error) {
            console.error('Error generating recipe:', error);
            displayMessage(`Failed to generate recipe: ${error.message}. Please try again.`, 'error');
        }
    }

    searchBtn.addEventListener('click', generateRecipe);
    ingredientInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            generateRecipe();
        }
    });

    displayMessage('Enter ingredients and click \'Generate Recipe\' to get started!', 'info');
    generatedRecipeHeading.classList.add('hidden');
});