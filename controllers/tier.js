const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Tier = require('../models/tier');
const mongoose = require('mongoose');
const { requireToken } = require('../middleware/token');
const { requireRoles, exceptRoles } = require('../middleware/roles');

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @openapi
 * '/api/tiers':
 *  post:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - Tier Controller
 *     summary: Create Tier
 *     description: User must not be a Consumer
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *          schema:
 *           $ref: '#/components/schemas/Tier'
 *     responses:
 *      200:
 *        description: Ok
 *        content:
    *          application/json:
    *            schema:
    *              $ref: '#/components/schemas/Tier'
    *
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Server Error
 *
 */
const createTier = async (req,res) => {
    const tier = new Tier({...req.body,creator:req.user._id});
    try{
        await tier.save();
        res.json(tier);
    }catch(err){
        res.status(500).json({err});
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 *
 * @openapi
 * '/api/tiers/{id}':
 *  get:
 *     tags:
 *     - Tier Controller
 *     summary: Get Tier By ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tier'
 *      401:
 *       description: Unauthorized
 *      404:
 *       description: Not Found
 *      500:
 *        description: Server Error
 */

const getTierById = async (req,res,next) => {
    try{
        let tier = await Tier.findById(req.params.id);
        if(tier)
            res.json(tier);
        else res.status(404).json({err:"Tier not found"});
    }catch(err){
        next(err);
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res
 * @openapi 
 * '/api/tiers':
 *  put:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - Tier Controller
 *     summary: Update Tier
 *     description: User must not be a Consumer
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *          schema:
 *           $ref: '#/components/schemas/Tier'
 *     responses:
 *      200:
 *        description: Ok
 *        content:
    *          application/json:
    *            schema:
    *              $ref: '#/components/schemas/Tier'
    *
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Server Error
 *
 */
const updateTier = async (req,res,next) => {
    try{
        let body = req.body;
        let newTier = new Tier(body).toObject();
        delete newTier.creator;
        delete newTier._id;
        let tier = await Tier.findOneAndUpdate({creator:req.user._id,_id:req.params.id} ,newTier,{returnOriginal:false,runValidators:true});
        if(!tier)
            res.status(500).json({err:"Tier not found / Unauthorized"});
        else
            res.json(tier);    
    }catch(err){ 
        next(err); 
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 *
 * @openapi
 * '/api/tiers/{id}/subscribe':
 *  post:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - Tier Controller
 *     summary: Subscribe To Tier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: Ok, responds with the updated user
 *      content:
    *          application/json:
    *            schema:
    *              $ref: '#/components/schemas/User'
    *
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not Found
 *     500:
 *        description: Server Error
 */
const subscribeToTier = async (req,res,next) => {
    try{
        let tierId = req.params.id;
        const newUser = await User.findByIdAndUpdate(req.user._id,{$addToSet:{subscribed:tierId}},{returnOriginal:false,runValidators:true});
        if(!await Tier.exists({_id:tierId})){
            res.status(404).json({err:"Not found"});
            return;
        }
        res.json(newUser);
    }catch(err){
        next(err);
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @openapi
 * '/api/tiers/{id}/unsubscribe':
 *  post:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - Tier Controller
 *     summary: Unsubscribe From Tier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: Ok, responds with the updated user
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not Found
 *     500:
 *        description: Server Error
 */
const unsubscribeFromTier = async (req,res,next) => {
    try{
        let tierId = req.params.id;
        const newUser = await User.findByIdAndUpdate(req.user._id,{$pull:{subscribed:tierId}},{returnOriginal:false,runValidators:true});
        res.json(newUser);
    }catch(err){
        next(err);
    }
}


router.post('/:id/subscribe',requireToken,subscribeToTier);
router.post('/:id/unsubscribe',requireToken,unsubscribeFromTier);
router.post('/',requireToken,exceptRoles(['Consumer']),createTier);
router.get('/:id',getTierById);
router.put('/:id',requireToken,exceptRoles(['Consumer']),updateTier);

module.exports = router;