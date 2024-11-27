const User = require('../models/user');
const jwt = require('jsonwebtoken');

/**
 * 
 * @param {Array<String>} roles 
 */

const requireRoles =  roles =>{
    return async (req,res,next) => {
        if(!req.user)
            res.status(401).json({message:"Unauthorized"});
        else if(roles.includes(req.user.role))
            next();
        else res.status(401).json({message:"Unauthorized"});
    }
}
/**
 * 
 * @param {Array<String>} roles 
 */
const exceptRoles = roles =>{
    return async (req,res,next) => {
        if(!req.user)
            res.status(401).json({message:"Unauthorized"});
        else if(!roles.includes(req.user.role))
            next();
        else res.status(401).json({message:"Unauthorized"});
    }
}



module.exports = {
    exceptRoles,
    requireRoles
};