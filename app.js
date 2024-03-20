
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import ollama from 'ollama';

const app = express();
const port = 2001;
//const prompt = ({ prompt: "Roleplay, you are a student at Trinity College. Your name is Universal." })

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Trincoll Bot',
            version: '1.0.0',
            description: 'Try to interact with large language models: 1',
        }
    },
    apis: ['./app.js'],
}

const specs = swaggerJsdoc(options)
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs))

app.use(express.json())


// ----------------------------------------
/**
 * @swagger
 * /SingleDialogExchange:
 *   post:
 *     summary: Single conversation with LLM
 *     tags: [LLM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question to ask the LLM.
 *     responses:
 *       200:
 *         description: LLM response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   description: The LLM's answer to the question.
 *       500:
 *         description: Error message
 */
app.post('/SingleDialogExchange', async (req, res) => {
    const question = req.body.question;
    const prompt = "Role: kitchen assistant AI. Traits: Recommend recipe that can be cooked according to the ingredients the user has. Style: Succinct, detailed, formal. Scenario: Recommend recipe on an online forum. Example dialogue: User: I have two eggs. kitchen assistant AI: Great!  With two eggs, there are plenty of delicious dishes you can create.  Here are some recommendations:\n\n1.  Scrambled Eggs: This classic breakfast option is easy to make and can be customized with your choice of seasonings and toppings.  Simply crack the eggs into a bowl, beat them together with a fork or whisk, and heat them in a pan over medium heat until they're cooked to your desired doneness.  Serve with toast, hash browns, or your favorite breakfast meats.\n2.  Fried Eggs: If you want to add a crispy, golden-brown element to your breakfast, try frying the eggs in a pan with some oil or butter.  Crack the eggs into the pan and cook them until the whites are set and the yolks are cooked to your desired doneness.  Serve with toast or hash browns.\n3.  Egg Salad: If you want a dish that can be prepared ahead of time, try making an egg salad.  Chop the eggs into small pieces and mix them with mayonnaise, mustard, and any other desired seasonings.  Serve on bread, crackers, or as a topping for a salad.\n4.  Omelette: An omelette is a versatile dish that can be filled with almost any ingredient you like.  Beat the eggs together with salt, pepper, and any other desired seasonings, then add your choice of fillings (such as cheese, vegetables, or meats) to one half of the egg.  Fold the other half over the filling to create a half-circle shape, and cook until the eggs are set. \n\nI hope these recommendations help inspire you to create a delicious dish with your two eggs!";

    //"Roleplay, you are a kitchen assistant AI, and you will recommend dishes that users can make based on the ingredients they have and provide detailed recipes."
    if (!question) {
        return res.status(400).send({error: 'Question is required'});
    }

    try {
        const fullPrompt = prompt + question;
        const response = await ollama.chat({
            model: 'llama2', 
            messages: [{role: 'user', content: fullPrompt}],
        });
        res.send({answer: response.message.content});
    } catch (error) {
        console.error('Error during LLM interaction:', error);
        res.status(500).send({error: 'Failed to interact with LLM'});
    }
});


/**
 * @swagger
 * /generate:
 *   post:
 *     summary: Generate text based on a prompt
 *     tags: [LLM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt to generate text from.
 *     responses:
 *       200:
 *         description: Generated text
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: The generated text.
 *       500:
 *         description: Error message
 */
app.post('/generate', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).send({ error: 'Prompt is required' });
    }

    try {
        const response = await ollama.generate({
            model: 'llama2',
            prompt: prompt,
            // Include any other optional parameters as needed
        });

        // Check if the Ollama response has the 'response' field and 'done' is true
        if (response && response.response && response.done) {
            res.status(200).json({ text: response.response });
        } else {
            // Handle cases where the response may not include the expected fields
            res.status(500).json({ error: 'Failed to generate text', details: 'Incomplete or unexpected response structure from Ollama' });
        }
    } catch (error) {
        console.error('Error generating text with Ollama:', error);
        // Improved error handling to provide more insights
        res.status(500).json({ error: 'Failed to generate text', details: error.message || 'Error interacting with Ollama API' });
    }
});



//---------------------------------chat with history

/**
 * @swagger
 * /MultiDialogExchange:
 *   post:
 *     summary: Continuous dialogue with LLM
 *     tags: [LLM]
 *     description: Allows users to ask a question to the large language model. The model uses the conversation history(user-side only) to provide a context-aware response.
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
 *                 example: 'What is your name?'
 *                 description: User's question to the large language model.
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
 *                   example: 'The sky is blue because...'
 *                   description: The answer generated by the large language model, based on the conversation history and the current question.
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
let history_a = [];
let history = [];
history.push({ role: 'system', content: 'role play: your name is Trincoll Bot.' });
app.post('/MultiDialogExchange', async (req, res) => {
    const userMessage = req.body.question;

    // 将用户的消息添加到对话历史中
    history.push({ role: 'user', content: userMessage });
    history_a.push({ role: 'user', content: userMessage });

    try {
        // 调用ollama.chat，传入当前的对话历史
        const response = await ollama.chat({
            model: 'llama2', 
            messages: history,
        });

        // 将模型的回复也添加到对话历史中
        //history.push({ role: 'assistant', content: response.message.content });
        history_a.push({ role: 'assistant', content: response.message.content });

        // 发送回复给用户
        res.send({answer: response.message.content});
    } catch (error) {
        console.error('Error during LLM interaction:', error);
        res.status(500).send({error: 'Failed to interact with LLM'});
    }
});

// ---------------------------------------- print history

/**
 * @swagger
 * /getHistory:
 *   get:
 *     summary: Print the user-side dialogue history
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: A list of all messages in the dialogue history.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   role:
 *                     type: string
 *                     description: The role of the message sender.
 *                   content:
 *                     type: string
 *                     description: The content of the message.
 */

app.get('/getHistory', (req, res) => {
    res.json(history);
});




// ---------------------------------------- print history_a

/**
 * @swagger
 * /getHistory_a:
 *   get:
 *     summary: Print the whole dialogue history
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: A list of all messages in the dialogue history.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   role:
 *                     type: string
 *                     description: The role of the message sender.
 *                   content:
 *                     type: string
 *                     description: The content of the message.
 */

app.get('/getHistory_a', (req, res) => {
    res.json(history_a);
});
// ----------------------------------------
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

