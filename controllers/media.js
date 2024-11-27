const router = require('express').Router();
const { requireToken } = require('../middleware/token');
const bucket = require('../storage/bucket');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns
 * @openapi
 * '/api/media/upload':
 *  post:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - Media Controller
 *     summary: Upload File
 *     requestBody:
 *      required: true
 *      content:
 *       multipart/form-data:
 *          schema:
 *           type: object
 *           properties:
 *            image:
 *              type: string
 *              format: binary
 *     responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                uri:
 *                  type: string
 *      400:
 *        description: No file uploaded
 *      500:
 *        description: Server Error 
 */
const uploadFile = (req , res,next) => {
    try{
    const uuid = crypto.randomUUID();
    if(!req.files){
        res.status(400).json({message:"No file uploaded"});
        return;
    }
    bucket.file(uuid).createWriteStream().end(req.files.image.data);
    res.json({uri: `https://storage.googleapis.com/${bucket.name}/${uuid}`});
    }catch(err){
        console.log(err);       
        next(err);
    
    }
}

router.post('/upload',requireToken,uploadFile);

module.exports = router;