import express from 'express';
import axios from 'axios';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();

/**
 * @swagger
 * components:
 *   schemas:
 *     Ingredient:
 *       type: object
 *       required:
 *         - name
 *         - amount
 *         - unit
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the ingredient.
 *         amount:
 *           type: number
 *           description: The amount of the ingredient needed.
 *         unit:
 *           type: string
 *           description: The unit of measurement for the amount.
 *       example:
 *         name: Tomato
 *         amount: 2
 *         unit: pieces
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: A message describing the error.
 *       example:
 *         error: An unexpected error occurred
 * 
 * @swagger
 * tags:
 *   - name: Shopping List
 *     description: Shopping list operations
 * 
 * @swagger
 * /send-to-api:
 *   post:
 *     summary: Sends data to the external API
 *     tags: [Shopping List]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Ingredient'
 *     responses:
 *       200:
 *         description: A shopping list generated from the external API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 aisles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       aisle:
 *                         type: string
 *                         description: The aisle in which the items are found.
 *                       items:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Ingredient'
 *       500:
 *         description: An error occurred processing the request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

app.use(express.json());

// Swagger definitions
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Generating-Shopping-List-Microservice',
      description: 'This API interacts with an external API to generate a shopping list based on provided ingredients.',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:2002',
        description: 'Development server',
      },
    ],
  },
  apis: ['./app.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

// Swagger-ui-express 
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.post('/send-to-api', async (req, res) => {
  try {
    const inputData = req.body;
    const apiResponse = await sendToExternalAPI(inputData);
    res.json(apiResponse);
  } catch (error) {
    console.error('错误:', error);
    res.status(500).json({ error: 'Error' });
  }
});


// Function to send data to the external API
async function sendToExternalAPI(data) {
    const apiKey = '87047dd829384f268646bb188a73ccb7'; // API key
    const apiUrl = `https://api.spoonacular.com/mealplanner/shopping-list/compute?apiKey=${apiKey}`;
    // format
    const requestData = {
      items: data.map(item => `${item.amount} ${item.unit} ${item.name}`)
    };
    const response = await axios.post(apiUrl, requestData);
    return response.data;
  }
  

const PORT = process.env.PORT || 2002;
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
});
