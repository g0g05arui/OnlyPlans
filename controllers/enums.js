const Post = require('../models/post');
const User = require('../models/user');
const Like = require('../models/like');
const mongoose = require('mongoose');
const Meal = require('../models/meal');
const Tier = require('../models/tier');

const router = require('express').Router();
/**
 * 
 * @param {express.Request} req
 * @param {express.Response} res
 * @openapi
 * '/api/enums':
 *  get:
 *     tags:
 *     - Enum Controller
 *     summary: Get enum values
 *     responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 */
const getEnums = (req,res) => {
    res.json({
        post:{
            type:Post.schema.path('type').enumValues,
            aspectRatio:Post.schema.path('aspectRatio').enumValues
        },
        user:{
            roles:User.schema.path('role').enumValues
        },
        meal:{
            mealType:Meal.schema.path('mealType').enumValues,
            dietaryOptions:Meal.schema.path('dietaryOptions').options.type[0].enum,
            mealPrep:Meal.schema.path('mealPrep').enumValues,
            macros:Meal.schema.path('macros.name').enumValues,
            servingUnit:Meal.schema.path('servingUnit').enumValues,
            timeToMake:Meal.schema.path('timeToMake').enumValues,
        },
        tier:{
            currency:Tier.schema.path('currency').enumValues,
            goal:Tier.schema.path('goal').enumValues,
        },
    });
}

router.get('/',getEnums);

module.exports = router;