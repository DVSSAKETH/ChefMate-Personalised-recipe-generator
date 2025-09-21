# ChefMate AI: Personalized Recipe Generator

**ChefMate AI** is a full-stack web application that leverages the power of generative AI to create unique recipes tailored to a user's available ingredients and preferences. Instead of searching a static database, the app dynamically generates culinary ideas on demand, offering a truly personalized cooking experience.

##  Features

  - **AI-Powered Recipe Generation:** Dynamically generates unique recipes using the Google Gemini API.
  - **Personalized Inputs:** Users can specify ingredients, cuisine, meal type, course, and difficulty to get highly relevant suggestions.
  - **Dynamic Pantry:** An interactive "pantry" list allows users to add and remove ingredients one by one.
  - **Multiple Recipe Options:** Generates three distinct recipe variations for each set of inputs, giving the user more choices.
  - **Intuitive UI:** A clean and responsive two-column layout ensures a smooth user experience on any device.
  - **Detailed Instructions:** Recipes include step-by-step instructions, viewable in a clean modal window.
  - **Assumed Minor Ingredients:** Automatically assumes common ingredients like salt, pepper, oil, and water to simplify user input.

## 💻 Tech Stack

  - **Frontend:** HTML5, CSS3, Vanilla JavaScript
  - **Backend:** Node.js, Express.js
  - **AI Integration:** Google Gemini API
  - **Tooling:** npm, dotenv

## 🏛️ Architecture

The application is built on a **three-tier architecture** to ensure a clear separation of concerns:

  - **1. Presentation Layer (Frontend):** The user's web browser, built with HTML, CSS, and JavaScript, handles all user interaction and displays the generated content.
  - **2. Application Layer (Backend):** A Node.js/Express server that acts as the "brain." It processes user requests, crafts prompts, communicates with the Gemini API, and serves the static frontend files.
  - **3. Service Layer (AI Service):** The Google Gemini API, an external service that performs the generative AI task of creating recipes.

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

  - Node.js and npm installed on your system.
  - A free API key from Google AI Studio.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/ChefMate-Personalised-recipe-generator.git
    cd ChefMate-Personalised-recipe-generator

    ```

2.  **Install backend dependencies:**

    ```bash
    npm install
    ```

3.  **Set up your environment variables:**

      * Create a file named `.env` in the root directory of the project.
      * Add your Gemini API key to this file:

    <!-- end list -->

    ```bash
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

      * **Note:** Replace `YOUR_API_KEY_HERE` with the key you obtained from Google AI Studio.

### Running the Application

1.  **Start the backend server:**

    ```bash
    node server.js
    ```

    The server will start on `http://localhost:3000`.

2.  **Access the frontend:**
    Open your web browser and navigate to:

    ```bash
    http://localhost:3000
    ```

    You can now add ingredients and generate recipes\!

## 🛣️ Future Enhancements

  - **Save/Favorite Recipes:** Implement a feature to save favorite recipes to a local database.
  - **Ingredient Exclusion:** Add an option to specify ingredients to avoid.
  - **Nutritional Information:** Integrate a feature to provide estimated nutritional data for each recipe.
  - **Image Generation:** Explore using a generative AI image model to create a visual for each recipe.
