
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Ollama } from 'ollama'; 
import axios from 'axios';


const app = express();
const port = 2001;

//change the host to the address of Ollama in K8s
const ollama = new Ollama({
    host: 'http://ollama.default.svc.cluster.local:11434' //
    // host: 'http://10.101.165.41:11434'
  });

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Recommend-Recipe-Microservice',
            version: '1.0.0',
            description: 'This Microservice gets the stock of the user from Microservice 1 and sends it to LLM llama 2 with a prompt, getting a recipe recommend back which only uses stuff in the stock.',
        }
    },
    apis: ['./app.js'],
}

const specs = swaggerJsdoc(options)
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());


//----------------------

/**
 * @swagger
 * /kitchenAssistant1:
 *   post:
 *     summary: Retrieve a recipe based on kitchen inventory
 *     tags: [Production API]
 *     description: This endpoint retrieves kitchen inventory items from Microservice 1 and uses them to request a recipe recommendation from the Ollama language model.
 *     responses:
 *       200:
 *         description: Successfully retrieved a recipe recommendation based on the current kitchen inventory.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   description: Recipe recommendation based on the kitchen inventory data retrieved.
 *                   example: "Recommended dish: Fried Eggs; Time required: 5 minutes; Ingredients needed: two eggs."
 *       400:
 *         description: Bad request, for example, if the kitchen inventory data is incomplete or missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the request could not be processed due to missing or incomplete data.
 *                   example: "Invalid data from kitchen inventory service"
 *       500:
 *         description: Internal server error, typically when there is a failure in interacting with the Ollama language model or the microservice.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating there was an issue processing the request.
 *                   example: "Failed to interact with LLM or retrieve data from microservice"
 */

app.post('/kitchenAssistant1', async (req, res) => {
    const ms1Url = 'http://kitchen-inventory-ms-service.krx-kitchen-inventory-ms.svc.cluster.local:8080/kitchenItems';
    try {
        const ms1Response = await axios.get(ms1Url);
        const kitchenItems = JSON.stringify(ms1Response.data); // 将获取的数据转换成字符串


      
        const response = await ollama.chat({
            model: 'llama2', 
            messages: [
                { 
                    role: 'system', 
                    content: 'Role: AI Chef. Traits: Recommend recipe that can be cooked according to the ingredients the user has. Scenario: Given the following list of ingredients available in an inventory, recommend a single dish that can be prepared using these items. Provide a detailed, step-by-step recipe for creating the dish, ensuring that each instruction is clear and thorough for someone who might be a beginner in the kitchen.' 
                },
                {
                    role: 'user', 
                    content: kitchenItems // 将食材描述发送到OLLAMA
                }
            ],
        });
        res.send({answer: response.message.content});
    } catch (error) {
        console.error('Error during network or LLM interaction:', error);
        res.status(500).send({error: 'Failed to interact with LLM or fetch data'});
    }
});

//----------------------
/**
 * @swagger
 * /getRandomRecipes:
 *   post:
 *     summary: Get a random recipe from the Spoonacular API
 *     tags: [Production API]
 *     description: Get a random recipe based on fixed parameters.
 *     responses:
 *       200:
 *         description: Successfully retrieved a random recipe.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recipes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SimplifiedRecipe'
 *       500:
 *         description: Internal server error
 * components:
 *   schemas:
 *     SimplifiedRecipe:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Name of recipe
 *         image:
 *           type: string
 *           description: The URL of the recipe image
 *         servings:
 *           type: integer
 *           description: Number of servings the recipe yields
 *         readyInMinutes:
 *           type: integer
 *           description: Time required to prepare the recipe in minutes
 *         summary:
 *           type: string
 *           description: A brief summary of the recipe
 *         ingredients:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SimplifiedIngredient'
 *           description: An array of simplified ingredient objects
 *         instructions:
 *           type: string
 *           description: The recipe instructions in HTML format
 *     SimplifiedIngredient:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The ingredient name
 *         amount:
 *           type: number
 *           description: The ingredient amount
 *         unit:
 *           type: string
 *           description: The ingredient unit
 */
const API_KEY = '87047dd829384f268646bb188a73ccb7';

app.post('/getRandomRecipes', async (req, res) => {
  try {
    const apiResponse = await getRandomRecipes();
    res.json(apiResponse);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error'});
  }
});

async function getRandomRecipes() {
  const apiUrl = `https://api.spoonacular.com/recipes/random?apiKey=${API_KEY}`;
  
  try {
    const response = await axios.get(apiUrl, {
      params: {
        number: 1
      }
    });

    // Only keep apart of the return
    const recipe = response.data.recipes[0];
    const simplifiedRecipe = {
      summary: recipe.summary,
      title: recipe.title,
      image: recipe.image,
      servings: recipe.servings,
      readyInMinutes: recipe.readyInMinutes,
      ingredients: recipe.extendedIngredients.map(ingredient => ({
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit
      })),
      instructions: recipe.instructions
    };

    return {
      recipes: [simplifiedRecipe]
    };
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
// ---------------------------------------- For Testing purpose
/**
 * @swagger
 * /KitchenAssistant:
 *   post:
 *     summary: single dialogue with LLM
 *     tags: [Testing API]
 *     description: API for getting recipe recommendations based on provided ingredients by input.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 example: 'I have two eggs'
 *                 description: Ingredients info.
 *     responses:
 *       200:
 *         description: Successfully received an answer from the large language model.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   example: 'I would recommend XXX... '
 *                   description: The recipe recommendations generated by LLM
 *       400:
 *         description: Bad request, such as when the required "question" field is missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Question is required'
 *                   description: Error message indicating the nature of the request error.
 *       500:
 *         description: Internal server error, for example, when there is a failure in interacting with the large language model.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Failed to interact with LLM'
 *                   description: Error message indicating there was an issue processing the request.
 */
app.post('/KitchenAssistant', async (req, res) => {
    const question = req.body.question; // This line was missing, which is necessary to read the question from the request body

    if (!question) {
        return res.status(400).send({error: 'Question is required'});
    }

    try {
        const response = await ollama.chat({
            model: 'llama2', 
            messages: [
                { 
                    role: 'system', 
                    content: 'Role: kitchen assistant AI. Traits: Recommend recipe that can be cooked according to the ingredients the user has. Scenario: Recommend recipe on an online forum. Example dialogue: User: I have two eggs. kitchen assistant AI: Recommended dish: Fried Eggs; Time required: 5 minus; Ingredients: one or more eggs. Directions: Step 1: In a small nonstick over medium heat, melt butter (or heat oil). Crack egg into pan. Cook 3 minutes, or until white is set. Step 2: Flip and cook 2 to 3 minutes more, until yolk is completely set' 
                },
                {
                    role: 'user', 
                    content: question // Fixed the typo here
                }
            ],
        });
        res.send({answer: response.message.content});
    } catch (error) {
        console.error('Error during LLM interaction:', error);
        res.status(500).send({error: 'Failed to interact with LLM'});
    }
});


// ----------------------------------------
/**
 * @swagger
 * /MS1Response:
 *   post:
 *     summary: Get kitchen items from MS1 service
 *     tags: [Testing API]
 *     description: Retrieve kitchen items from MS1 service and send the data as JSON response
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the kitchen item
 *                   quantity:
 *                     type: number
 *                     description: The quantity of the kitchen item
 *                   unit:
 *                     type: string
 *                     description: The unit of measurement of the kitchen item
 *       '500':
 *         description: Failed to interact with MS1
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to interact with MS1"
 */

app.post('/MS1Response', async (req, res) => {
    const ms1Url = 'http://kitchen-inventory-ms-service.krx-kitchen-inventory-ms.svc.cluster.local:8080/kitchenItems';
    try {
        const ms1Response = await axios.get(ms1Url);
        res.send(ms1Response.data); // 直接将获取的数据作为响应发送给客户端
    } catch (error) {
        console.error('Error', error);
        res.status(500).send({error: 'Failed to interact with MS1'});
    }
});


//--------------
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

