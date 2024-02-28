const express = require('express')
const app = express()
const port = 3000
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: '熊爱小猪！',
            version: '1.0.0',
            description: '小猪是世界上最好的小猪！',
        }
    },
    apis: ['./app.js'],
}

const specs = swaggerJsdoc(options)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

app.use(express.json())


cars = ['toyota', 'honda', 'ford']

/**
 * @swagger
 * components:
 *   schemas:
 *     Car:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the car
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Returns a welcome message
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Welcome back to TrincollBot
 */
app.get('/', (req, res) => {
    res.send('Welcome back to TrincollBot!')
})


/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Returns a list of cars
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: A list of cars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
app.get('/cars', (req, res) => {
    res.send(cars)
})


/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     summary: Get a car by its index
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A car
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       404:
 *         description: Car not found
 */
app.get('/cars/:id', (req, res) => {
    var id = req.params.id
    var car = cars[id]
    if (!car) {
        res.status(404).send('car not found')
        return
    }
    res.send(car)
})


/**
 * @swagger
 * /cars:
 *   post:
 *     summary: Add a new car
 *     tags: [Cars]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       201:
 *         description: Car created
 *       400:
 *         description: Car name is required
 */
app.post('/cars', (req, res) => {
    // create a car
    var car = req.body.name
    if (car) {
        cars.push(car)
        res.status(201).send('car created')
    } else {
        res.status(400).send('car name is required')
    }
})


/**
 * @swagger
 * /cars/{id}:
 *   put:
 *     summary: Update a car by its index
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Car'
 *     responses:
 *       200:
 *         description: Car updated
 *       400:
 *         description: Car name is required
 */
app.put('/cars/:id', (req, res) => {
    var id = req.params.id
    var car = req.body.name
    if (car) {
        cars[id] = car
        res.status(200).send('car updated')
    } else {
        res.status(400).send('car name is required')
    }
})

/**
 * @swagger
 * /cars/{id}:
 *   delete:
 *     summary: Delete a car by its index
 *     tags: [Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Car deleted
 *       404:
 *         description: Car not found
 */
app.delete('/cars/:id', (req, res) => {
    var id = req.params.id
    if (!cars[id]) {
        res.status(404).send('car not found')
        return
    }
    cars.splice(id, 1)
    res.status(200).send('car deleted')
})





// ----------------------------------------

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})