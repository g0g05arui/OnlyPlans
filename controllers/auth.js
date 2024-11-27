const express = require('express');
const router = express.Router();
const User = require('../models/user');
const md5 = require('md5');
const jwt = require('jsonwebtoken');

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {*} next 
 * @returns 
 * @openapi
 * '/api/login':
 *  post:
 *     tags:
 *     - Auth Controller
 *     summary: Login User
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                default: mock.user3@gmail.com
 *              password:
 *                type: string
 *                default: test
 *     responses:
 *      200:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *      401:
 *        description: Wrong email/password combination
 *      500:
 *        description: Server Error
 */
const login = async (req,res,next) => {
    try{
        let { email, password } = req.body;
        let user = await User.findOne({email}).select("+password");
        if(!user || md5(password) != user.password){
            res.status(401).json({message:'Wrong email/password combination'});
            return;
        }
        let payload = { userId: user._id.toString()};
        let token = jwt.sign(payload, process.env.JWT_SECRET,{expiresIn:"7d"});
        res.json({token:token});
    }catch(err){ next(err); }
}

router.post('/',login);

module.exports = router;