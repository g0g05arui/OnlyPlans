const express = require('express');
const router = express.Router();
const User = require('../models/user');
const md5 = require('md5');
const mongoose = require('mongoose');
const { requireToken } = require('../middleware/token');
const bucket = require('../storage/bucket');
const crypto = require("crypto");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Tier = require('../models/tier');
// add JSDoc for autocompletion for express objects. Maybe should just use TS but do I rlly need it tho??

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @openapi
* '/api/users':
 *  post:
 *     tags:
 *     - User Controller
 *     summary: Create User
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *      200:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      401:
 *        description: Wrong email/password combination
 *      500:
 *        description: Server Error
 */
const createUser = async (req,res) => {
    const user = new User(req.body);
    user.verified = false;
    user.proffesionVerified = false;
    try{
        user.password = md5(user.password);
        await user.save();
        res.json(user);
    }catch(err){
        res.status(500).json({err});
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @openapi
 * '/api/users/{id}':
 *  get:
 *     tags:
 *     - User Controller
 *     summary: Find User By ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      401:
 *       description: Unathorized
 *      500:
 *       description: Server Error
 * 
 */
const getUserById = async (req,res,next) => {
    try{
        let post = await User.findById(req.params.id);
        if(post)
            res.json(post);
        else res.status(404).json({message:"User not found"});
    }catch(err){
        next(err);
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @openapi
* '/api/users':
 *  put:
 *     tags:
 *     - User Controller
 *     security:
 *     - Authorization: []
 *     summary: Update User | User Must Be Logged In
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *      200:
 *        description: Created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      401:
 *       description: Unathorized
 *      500:
 *       description: Server Error
 *  
 */
const updateUser = async (req,res,next) => {
    try{
        let body = req.body;
        let newUser = new User(body).toObject();
        delete newUser.password;
        delete newUser.email;
        delete newUser._id;
        delete newUser.verified;
        delete newUser.proffesionVerified;
        delete newUser.role;
        delete newUser.followersCount;
        delete newUser.subscribersCount;
        delete newUser.profilePicture;
        let user = await User.findByIdAndUpdate(req.user._id ,newUser,{returnOriginal:false,runValidators:true});
        res.json(user);  
    }catch(err){ 
        next(err); 
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const resetPassword = async(req,res,next) => {
    let { oldPassword,newPassword } = req.body;
    if(req.user.password == md5(oldPassword)){
        let user = await User.findByIdAndUpdate(req.user._id ,{password:md5(newPassword) },{returnOriginal:false});
        res.json(user); 
    }else res.status(401).json({message:"Wrong password"});
}

/**
 * 
 * @param {express.Request} req
 * @param {express.Response} res
 * @openapi
* '/api/users/profile':
 *  get:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - User Controller
 *     summary: Gets Profile User
 *     responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      401:
 *       description: Unathorized
 *      500:
 *       description: Server Error
 *  
 */

const getProfile = async (req,res,next) => {
    res.json(req.user);
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @openapi
 * '/api/users/{id}/follow':
 *  post:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - User Controller
 *     summary: Follow User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: Ok
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *      401:
 *       description: Unathorized
 *      404:
 *       description: Not found
 *      500:
 *       description: Server Error
 *  
 */
const followUser = async (req,res,next) => {
    try{
        let fId = req.params.id;
        if(!await User.exists({_id:fId})){
            res.status(404).json({err:"Not found"});
            return;
        }
        const newUser = await User.findByIdAndUpdate(req.user._id,{$addToSet:{following:fId}},{returnOriginal:false,runValidators:true});
        if(req.user.following.length != newUser.following.length)
            await User.findByIdAndUpdate(fId, {$inc:{followersCount:1}});
        res.json(newUser);
    }catch(err){
        next(err);
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 /**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @openapi
 * '/api/users/{id}/unfollow':
 *  post:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - User Controller
 *     summary: Unfollow User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: Ok
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *      401:
 *       description: Unathorized
 *      404:
 *       description: Not found
 *      500:
 *       description: Server Error
 *  
 */
const unfollowUser = async (req,res,next) => {
    try{
        let fId = req.params.id;
        const newUser = await User.findByIdAndUpdate(req.user._id,{$pull:{following:fId}},{returnOriginal:false,runValidators:true});
        if(req.user.following.length != newUser.following.length)
            await User.findByIdAndUpdate(fId, {$inc:{followersCount:-1}});
        res.json(newUser);
    }catch(err){
        next(err);
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @openapi
 * '/api/users':
 *  get:
 *    tags:
 *      - User Controller
 *    summary: Search Users
 *    parameters:
 *     - in: query
 *       name: query
 *       required: false
 *     - in: query
 *       name: limit
 *       required: false
 *       default: 25 
 *     - in: query
 *       name: skip
 *       required: false
 *       default: 0
 *    responses:
 *     200:
 *      description: Ok
 *      content:
 *        application/json:
 *          schema:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/User'
 *     500:
 *      description: Server Error
 */
const searchUsers = async (req,res,next) => {
    try{
        let { query } = req.query || null;
        let reg = new RegExp(query,'i');
        let limit = parseInt(req.query.limit) || 25;
        let skip = parseInt(req.query.skip) || 0;
        let users = await User.find({$or:[{firstName:reg},{lastName:reg},{handle:reg},{email:reg}]})
                              .limit(limit).skip(skip);
        res.json(users);
    }catch(err){
        next(err);
    }
}


/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {*} next 
 * @openapi
 * '/api/users/change-profilepic':
 *  post:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - User Controller
 *     summary: Change Profile Picture
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *           schema:
 *            type: object
 *            properties:
 *              image:
 *                type: string
 *                format: binary
 *     responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      401:
 *       description: Unathorized
 *      500:
 *       description: Server Error
 */
const updateProfilePicture = async (req,res,next) => {
    try{
        const uuid = crypto.randomUUID();
        if(!req.files){
            res.status(400).json({message:"No file uploaded"});
            return;
        }
        bucket.file(uuid).createWriteStream().end(req.files.image.data);
        req.user.profilePicture = `https://storage.googleapis.com/${bucket.name}/${uuid}`;
        await req.user.save();
        res.json(req.user);
    }catch(err){
        next(err);
    }
}

/** 
    *
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {*} next
    * @openapi
    * '/api/users/{id}/tiers':
    *  get:
    *     tags:
    *     - User Controller
    *     summary: Get User Tiers
    *     parameters:
    *       - in: path
    *         name: id
    *         required: true
    *         schema:
    *           type: string
    *     responses:
    *      200:
    *       description: Ok
    *       content:
    *         application/json:
    *           schema:
    *             type: array
    *             items:
    *               $ref: '#/components/schemas/Tier'
    *      404:
    *        description: Not found
    *      500:
    *       description: Server Error
    *
    * 
    * 
 */
const getUserTiers = async (req,res,next) => {
    try{
        let tiers = await Tier.find({creator:req.params.id});
        res.json(tiers);
    }catch(err){
        next(err);
    }
}

router.get('/',searchUsers);
router.post('/:id/follow',requireToken,followUser);
router.get('/:id/tiers',getUserTiers);
router.post('/:id/unfollow',requireToken,unfollowUser);
router.post('/',createUser);
router.get('/profile',requireToken,getProfile);
router.get('/:id',getUserById);
router.put('/',requireToken,updateUser);
router.post('/reset-password',requireToken,resetPassword);
router.post('/change-profilepic',requireToken,updateProfilePicture);

module.exports = router;