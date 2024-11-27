const swaggerJSDoc = require('swagger-jsdoc');
const mongoose = require('mongoose');
const m2s = require('mongoose-to-swagger');
const User = require('./models/user');
const Tier = require('./models/tier');
const Post = require('./models/post');
const Meal = require('./models/meal');
const MealPlan = require('./models/mealPlan');
const Comment = require('./models/comment');
const Like = require('./models/like');



const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'My API',
        version: '1.0.0',
        description: 'My API Description',
    },
};

const options = {
    swaggerDefinition,
    apis: ['./controllers/*.js','./models/*.js'], // Path to the API routes in your Node.js application,
};

const swaggerSpec = swaggerJSDoc(options);
swaggerSpec.components = {
    schemas: {
        Tier: m2s(Tier),
        User: m2s(User),
        Post: m2s(Post),
        Meal: m2s(Meal),
        MealPlan: m2s(MealPlan),
        Comment: m2s(Comment),
        Like: m2s(Like),
    },
    securitySchemes: {
        Authorization: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            value: "JWT <JWT token here>"
        }
    }
};

module.exports = swaggerSpec;