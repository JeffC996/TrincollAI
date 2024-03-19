
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
 *     summary: Ask a question to the LLM
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
    const prompt = "Roleplay, you are a kitchen assistant AI, and you will recommend dishes that users can make based on the ingredients they have and provide detailed recipes.";

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
 *     summary: Ask a question and get an answer based on the conversation history
 *     tags: [LLM]
 *     description: Allows users to ask a question to the large language model. The model uses the conversation history to provide a context-aware response.
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
 *                   example: 'Kakaka, the sky is blue because...'
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
let history = [];
history.push({ role: 'system', content: 'role play: your name is Trincoll Bot.' });
app.post('/MultiDialogExchange', async (req, res) => {
    const userMessage = req.body.question;

    // 将用户的消息添加到对话历史中
    history.push({ role: 'user', content: userMessage });

    try {
        // 调用ollama.chat，传入当前的对话历史
        const response = await ollama.chat({
            model: 'llama2', 
            messages: history,
        });

        // 将模型的回复也添加到对话历史中
        history.push({ role: 'assistant', content: response.message.content });

        // 发送回复给用户
        res.send({answer: response.message.content});
    } catch (error) {
        console.error('Error during LLM interaction:', error);
        res.status(500).send({error: 'Failed to interact with LLM'});
    }
});

// ----------------------------------------

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

