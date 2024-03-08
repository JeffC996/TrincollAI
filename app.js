
import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import ollama from 'ollama';

const app = express();
const port = 2001;
const prompt = "Trincoll has 122222 buildings."

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
 * /ask:
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
app.post('/ask', async (req, res) => {
    const question = req.body.question;
    if (!question) {
        return res.status(400).send({error: 'Question is required'});
    }

    try {
        const response = await ollama.chat({
            model: 'llama2', 
            messages: [{role: 'user', content: question}],
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
    const prompt = req.body.prompt;
  
    try {
      const response = await ollama.generate({
        model: 'llama2',
        prompt: prompt,
      });
  
      res.status(200).json({ text: response.text });
    } catch (error) {
      console.error('Error generating text:', error);
      res.status(500).json({ error: 'Failed to generate text' });
    }
  });

// ----------------------------------------

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

