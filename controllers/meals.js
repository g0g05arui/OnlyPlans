const router = require('express').Router();
const { requireRoles, exceptRoles } = require('../middleware/roles');
const { requireToken } = require('../middleware/token');
const Meal = require('../models/meal');

/**
 *  
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {*} next
 * @returns
 * @openapi
 * '/api/meals':
 *  post:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - Meal Controller
 *     summary: Create Meal
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *          schema:
 *           $ref: '#/components/schemas/Meal'
 *     responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Meal'
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Server Error
 */
const createMeal = async (req,res,next) => {
    console.log(req.body);
    try{
        let meal = new Meal(req.body);
        meal.creator= req.user._id;

        meal = await meal.save();
        res.json(meal);
    }catch(err){
        console.log(err);
        res.status(500).json({message:'Server Error'});
    }
}

router.post('/',requireToken,exceptRoles('Consumer'),createMeal);

module.exports = router;