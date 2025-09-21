document.addEventListener('DOMContentLoaded', () => {
    // New element references for the interactive pantry
    const newIngredientInput = document.getElementById('newIngredientInput');
    const addIngredientBtn = document.getElementById('addIngredientBtn');
    const pantryList = document.getElementById('pantryList');
    const clearPantryBtn = document.getElementById('clearPantryBtn');

    // Retained element references for preferences and results
    const cuisineSelect = document.getElementById('cuisineSelect');
    const mealTypeSelect = document.getElementById('mealTypeSelect');
    const courseSelect = document.getElementById('courseSelect');
    const difficultySelect = document.getElementById('difficultySelect');
    const searchBtn = document.getElementById('searchBtn');
    const recipeResultsDiv = document.getElementById('recipeResults');
    const generatedRecipeHeading = document.getElementById('generatedRecipeHeading');
    const loadingScreen = document.getElementById('loadingScreen');

    const API_BASE_URL = 'http://localhost:3000';

    // A JavaScript array to hold our ingredients, syncing with the UI
    let pantryIngredients = [];

    // Function to scroll to recipe section
    function scrollToRecipes() {
        const recipeSection = document.querySelector('.results-section');
        if (recipeSection) {
            recipeSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // --- Core Logic for the Interactive Pantry ---

    // Function to render the pantry list to the UI
    function renderPantry() {
        pantryList.innerHTML = '';
        if (pantryIngredients.length === 0) {
            pantryList.innerHTML = '<li style="background:transparent;box-shadow:none;color:#8A8A8A;">Your pantry is empty. Add some ingredients!</li>';
            return;
        }
        
        pantryIngredients.forEach((ingredient, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${ingredient}</span>
                <button class="remove-ingredient" data-index="${index}">&times;</button>
            `;
            pantryList.appendChild(li);
        });
    }

    // Function to add a new ingredient
    function addIngredient() {
        const newIngredient = newIngredientInput.value.trim();
        if (newIngredient && !pantryIngredients.includes(newIngredient)) {
            pantryIngredients.push(newIngredient);
            newIngredientInput.value = '';
            renderPantry();
        }
    }

    // Event listener to add ingredients with button click or Enter key
    addIngredientBtn.addEventListener('click', addIngredient);
    newIngredientInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addIngredient();
        }
    });

    // Event listener to remove an ingredient
    pantryList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-ingredient')) {
            const indexToRemove = event.target.dataset.index;
            pantryIngredients.splice(indexToRemove, 1);
            renderPantry();
        }
    });

    // Event listener to clear all ingredients
    clearPantryBtn.addEventListener('click', () => {
        pantryIngredients = [];
        renderPantry();
    });

    // --- General UI Logic (mostly unchanged, but adapted for the new flow) ---

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

    function displayRecipes(recipes) {
        recipeResultsDiv.innerHTML = '';
        
        if (!Array.isArray(recipes) || recipes.length === 0) {
            displayMessage('The AI could not generate any recipes with your inputs. Please try different ingredients or preferences.', 'info');
            return;
        }

        generatedRecipeHeading.classList.remove('hidden');

        recipes.forEach(recipe => {
            if (!recipe || !recipe.name || !recipe.instructions) {
                console.warn("Skipping an invalid recipe object from the AI response.");
                return; 
            }

            const recipeCard = document.createElement('div');
            recipeCard.id = recipe.id;
            recipeCard.classList.add('recipe-card');
            
            const difficultyClass = recipe.difficulty ? `difficulty-${recipe.difficulty.toLowerCase()}` : '';

            recipeCard.innerHTML = `
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.name || 'Untitled Recipe'}</h3>
                    <div class="recipe-meta">
                        <span class="difficulty-badge ${difficultyClass}">${recipe.difficulty ? recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1) : 'N/A'}</span>
                        <span><i class="fas fa-clock"></i> Prep: ${recipe.prep_time || 'N/A'}</span>
                        <span><i class="fas fa-fire"></i> Cook: ${recipe.cook_time || 'N/A'}</span>
                        <span><i class="fas fa-globe"></i> ${recipe.cuisine || 'N/A'}</span>
                        <span><i class="fas fa-list"></i> ${recipe.course || 'N/A'}</span>
                    </div>
                    <p class="recipe-description">${recipe.description || 'No description available.'}</p>
                    
                    <p class="recipe-ingredients-list">
                        <strong><i class="fas fa-carrot"></i> Ingredients:</strong> ${recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients.join(', ') : 'Not specified.'}
                    </p>
                    <button class="view-instructions-btn" data-recipe='${JSON.stringify(recipe)}'><i class="fas fa-book-open"></i> View Full Recipe</button>
                </div>
            `;
            recipeResultsDiv.appendChild(recipeCard);
        });

        document.querySelectorAll('.view-instructions-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const recipeData = JSON.parse(event.target.dataset.recipe);
                showInstructionsModal(recipeData);
            });
        });
    }

    function showInstructionsModal(recipe) {
        const overlay = document.createElement('div');
        overlay.classList.add('instructions-overlay');

        overlay.innerHTML = `
            <div class="instructions-content">
                <button class="close-btn">&times;</button>
                <h3>${recipe.name || 'Recipe Instructions'}</h3>
                <p><strong><i class="fas fa-globe"></i> Cuisine:</strong> ${recipe.cuisine || 'N/A'} | <strong><i class="fas fa-list"></i> Course:</strong> ${recipe.course || 'N/A'} | <strong><i class="fas fa-apple-alt"></i> Diet:</strong> ${recipe.diet || 'N/A'}</p>
                <p><strong><i class="fas fa-clock"></i> Prep Time:</strong> ${recipe.prep_time || 'N/A'} | <strong><i class="fas fa-fire"></i> Cook Time:</strong> ${recipe.cook_time || 'N/A'} | <strong><i class="fas fa-tachometer-alt"></i> Difficulty:</strong> ${recipe.difficulty || 'N/A'}</p>
                <h4><i class="fas fa-carrot"></i> Ingredients:</h4>
                <p>${recipe.ingredients ? recipe.ingredients.join(', ') : 'N/A'}</p>
                <h4><i class="fas fa-list-ol"></i> Instructions:</h4>
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
        const ingredientsArray = pantryIngredients;
        const cuisineVal = cuisineSelect.value.trim();
        const mealTypeVal = mealTypeSelect.value.trim();
        const courseVal = courseSelect.value.trim();
        const difficultyVal = difficultySelect.value;

        // Show loading screen
        loadingScreen.classList.remove('hidden');
        
        // Prevent body scrolling while loading
        document.body.style.overflow = 'hidden';

        generatedRecipeHeading.classList.add('hidden');
        displayMessage('Generating delicious recipes for you...', 'loading');

        if (ingredientsArray.length === 0) {
            displayMessage('Please add at least one ingredient to your pantry to generate a recipe.', 'error');
            
            // Hide loading screen if there's an error
            loadingScreen.classList.add('hidden');
            document.body.style.overflow = 'auto';
            
            return;
        }

        try {
            // --- CRITICAL FIX: Re-enabling the real fetch call ---
            const response = await fetch(`${API_BASE_URL}/api/generate-recipe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ingredients: ingredientsArray,
                    cuisine: cuisineVal,
                    mealType: mealTypeVal,
                    course: courseVal,
                    difficulty: difficultyVal
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown server error.' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            displayRecipes(data.results);
            
            // Hide loading screen
            loadingScreen.classList.add('hidden');
            document.body.style.overflow = 'auto';

            // Scroll to recipe section after displaying results
            setTimeout(() => {
                scrollToRecipes();
            }, 300); // Small delay to ensure DOM is updated
            
        } catch (error) {
            console.error('Error generating recipe:', error);
            displayMessage(`Failed to generate recipe: ${error.message}. Please try again.`, 'error');
            
            // Hide loading screen if there's an error
            loadingScreen.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    // --- Event listeners are now on the new buttons ---
    searchBtn.addEventListener('click', generateRecipe);

    // Initial state setup:
    renderPantry();
    displayMessage('Add ingredients to your pantry to get started!', 'info');
    generatedRecipeHeading.classList.add('hidden');
    
    // Make sure loading screen is hidden on initial load
    loadingScreen.classList.add('hidden');
});