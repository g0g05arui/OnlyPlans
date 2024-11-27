const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const mongoose = require('mongoose');
const { requireToken } = require('../middleware/token');
const Like = require('../models/like');
const Comment = require('../models/comment');
const { exceptRoles } = require('../middleware/roles');

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @openapi
 * '/api/posts':
 *  post:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - Post Controller
 *     summary: Create Post
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *          schema:
 *           $ref: '#/components/schemas/Post'
 *     responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Server Error
 */
const createPost = async (req,res) => {
    const post = new Post({...req.body });
    post.likedCount = 0;
    post.commentCount = 0;
    post.creator = req.user._id;
    post.date = new Date();
    try{
        await post.save();
        res.json(post);
    }catch(err){
        res.status(500).json({err});
    }
}

 /**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @openapi
 * '/api/posts/{id}':
 *  get:
 *     tags:
 *     - Post Controller
 *     summary: Get Post By ID !! The meal / meanPlan are populated, not referenced by id
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
 *              $ref: '#/components/schemas/Post'
 *      401:
 *        description: Unauthorized
 *      500:
 *       description: Server Error
*/

const getPostById = async (req,res,next) => {
    try{
        let post = await Post.findById(req.params.id).populate('meal').populate('mealPlan');
    
        if(post){
            if(post.tier && !req.user){
                meal = post.meal.toObject();
                meal = {
                    ...meal,
                    ingredients:[],
                    steps:[]
                }
                post = {
                    ...post.toObject(),
                    meal
                }
            }
            res.json(post);
        }
        else res.status(404).json({err:"Post not found"});
    }catch(err){
        console.log(err);
        next(err);
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @openapi
 * '/api/posts/{id}':
 *  put:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - Post Controller
 *     summary: Update Post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *          schema:
 *           $ref: '#/components/schemas/Post'
 *     responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Post'
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Server Error
 */
const updatePost = async (req,res,next) => {
    try{
        let body = req.body;
        let newPost = new Post(body).toObject();
        delete newPost.creator;
        delete newPost._id;
        delete newPost.date;
        delete newPost.commentCount;
        delete newPost.likedCount;
        let post = await Post.findOneAndUpdate({creator:req.user._id,_id:req.params.id} ,newPost,{returnOriginal:false,runValidators:true});
        if(!post)
            res.status(500).json({err:"Post not found / Unauthorized"});
        else
            res.json(post);    
    }catch(err){ 
        next(err); 
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @openapi
 * '/api/posts/{id}/like':
 *  post:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - Post Controller
 *     summary: Like Post
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
 *            $ref: '#/components/schemas/Post'
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Server Error
 */
const likePost = async (req,res,next) => {
    try{
        let post = await Post.findById(req.params.id);
        if(!post){
            res.status(404).json({err:"Post not found"});
            return;
        }
        let like = await Like.findOne({postId:req.params.id,likedBy:req.user._id});
        if(!like){
            like = new Like({postId:req.params.id,likedBy:req.user._id});
            await like.save();
            post.likedCount++;
        }
        await post.save();
        res.json(post);
    }catch(err){
        next(err);
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @openapi
 * '/api/posts/{id}/unlike':
 *  post:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - Post Controller
 *     summary: Unike Post
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
 *              $ref: '#/components/schemas/Post'
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Server Error
 */

const unlikePost = async (req,res,next) => {
    try{
        let post = await Post.findById(req.params.id);
        if(!post){
            res.status(404).json({err:"Post not found"});
            return;
        }
        let like = await Like.findOne({postId:req.params.id,likedBy:req.user._id});
        if(like){
            await Like.deleteOne({_id:like._id});
            post.likedCount--;
        }
        await post.save();
        res.json(post);
    }catch(err){
        next(err);
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res
 * @openapi
 * '/api/posts/{id}/comment':
 *   post:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - Post Controller
 *     summary: Create Comment
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: repliedTo
 *         required: false
 *         schema:
 *           type: string
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *          schema:
 *           $ref: '#/components/schemas/Comment'
 *     responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Comment'
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Server Error
 */
const createComment = async (req,res,next) => {
    try{
        let post = await Post.findById(req.params.id);
        if(!post){
            res.status(404).json({err:"Post not found"});
            return;
        }
        let repliedTo = req.query.repliedTo || undefined;
        let rplyComment = await Comment.findById(repliedTo);
        if((repliedTo && !rplyComment) || (repliedTo && rplyComment.postId.equals(req.params.id) === false)){
            res.status(404).json({err:"Comment not found"});
            return;
        }
        let comment = new Comment({...req.body,
                                    repliedTo:repliedTo,
                                    postId:req.params.id
                                    ,userId:req.user._id,
                                    replyCount:0
                                });
        
        await comment.save();
        post.commentCount++;
        await post.save();
        res.json(comment);
        if(repliedTo){
            rplyComment.replyCount++;
            await rplyComment.save();
        }
    }catch(err){
        console.log(err);
        next(err);
    }
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {*} next
 * @openapi
 * '/api/posts/liked-posts':
 *  get:
 *     security:
 *     - Authorization: []
 *     tags:
 *     - Post Controller
 *     summary: Get Liked Posts
 *     responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: string
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Server Error 
 */
const getLikedPosts = async (req,res,next) => {
    try{
        let likedPosts = (await Like.find({likedBy:req.user._id})).map( x => x.postId);
        res.json(likedPosts);
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
 * '/api/posts/feed':
 *  get:
 *
 *    tags:
 *    - Post Controller
 *    summary: Get Feed
 *    parameters:
 *      - in: query
 *        name: limit
 *        required: false
 *        schema:
 *          type: number
 *          default: 25
 *      - in: query
 *        name: skip
 *        required: false
 *        schema:
 *          type: number
 *          default: 0
 *  
 *    responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  post:
 *                    type: object
 *                    $ref: '#/components/schemas/Post'
 *                  locked:
 *                    type: boolean
 *                  userHandle:
 *                    type: string
 *                  userProfilePicture:
 *                    type: string
 *                  userRole:
 *                    type: string
 *
 *      500:
 *        description: Server Error
 */
const getFeed = async (req,res,next) => {
    try{
        let posts = [];
        let limit = req.query.limit || 25;
        let skip = req.query.skip || 0;
        if(!req.user){
            posts = [
                ...await Post.find({tier:null}).sort({date:-1}).limit(limit/2 + limit%2).skip(skip/2 + skip%2).populate('creator'),
                ...await Post.find({tier:{$ne:null}}).sort({date:-1}).limit(limit/2 + limit%2).skip(skip/2 + skip%2).populate('creator')
            ];
            posts = posts.map(post => post.toObject()).map(post => {
                let ret = post;
                let user = post.creator;
                post.creator = user._id; 
                console.log(user,post.creator);
                return {post:ret, locked:!!post.tier,userHandle:user.handle,userProfilePicture:user.profilePicture,userRole:user.role};
            });

        }
        else{
            posts = [
                ...await Post.find({tier:null}).sort({date:-1}).limit(limit/2 + limit%2).skip(skip/2 + skip%2).populate('creator'),
                ...await Post.find({tier:{$ne:null}}).sort({date:-1}).limit(limit/2 + limit%2).skip(skip/2 + skip%2).populate('creator')
            ];
            posts = posts.map(post => post.toObject()).map(post => {
                let ret = post;
                let user = post.creator;
                post.creator = user._id; 
                console.log(user,post.creator);
                return {post:ret, locked:!!post.tier,userHandle:user.handle,userProfilePicture:user.profilePicture,userRole:user.role};
            });
        }
        res.json(posts);
    }catch(err){
        console.log(err);
        next(err);
    }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {*} next
 * @openapi
 * '/api/posts/{id}/comments':
 *  get:
 *     tags:
 *     - Post Controller
 *     summary: Get Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in : query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 25
 *       - in : query
 *         name: skip
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  comment:
 *                    type: object
 *                    $ref: '#/components/schemas/Comment'
 *                  userHandle:
 *                    type: string
 *                  userProfilePicture:
 *                    type: string
 *                  userRole:
 *                    type: string
 */
const getComments = async (req,res,next) => {
    try{
        let skip = req.query.skip || 0;
        let limit = req.query.limit || 25;
        let comments = await Comment.find({postId:req.params.id,repliedTo:{$eq:null}}).limit(limit).skip(skip).populate('userId');
        comments = comments.map(comment => comment.toObject()).map(comment => {
            let ret = comment;
            let user = comment.userId;
            comment.userId = user._id;
            return {comment:ret,userHandle:user.handle,userProfilePicture:user.profilePicture,userRole:user.role};
        });
        res.json(comments);
    }catch(err){
        console.log(err);
        next(err);
    }
}

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {*} next
 * @openapi
 * '/api/posts/{id}/comments/{commId}/replies':
 *  get:
 *     tags:
 *     - Post Controller
 *     summary: Get Replies
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commId
 *         required: true
 *         schema:
 *           type: string
 *       - in : query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           default: 25
 *       - in : query
 *         name: skip
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *      200:
 *        description: Ok
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  comment:
 *                    type: object
 *                    $ref: '#/components/schemas/Comment'
 *                  userHandle:
 *                    type: string
 *                  userProfilePicture:
 *                    type: string
 *                  userRole:
 *                    type: string
 */
const getReplies = async (req,res,next) => {
    try{
        let skip = req.query.skip || 0;
        let limit = req.query.limit || 25;
        let comments = await Comment.find({repliedTo:req.params.commId}).skip(skip).limit(limit).populate('userId');

        comments = comments.map(comment => comment.toObject()).map(comment => {
            let ret = comment;
            let user = comment.userId;
            comment.userId = user._id;
            return {comment:ret,userHandle:user.handle,userProfilePicture:user.profilePicture,userRole:user.role};
        });
        res.json(comments);
    }catch(err){
        next(err);
    }
}

router.get('/feed',getFeed);
router.post('/',requireToken,exceptRoles(['Consumer']),createPost);
router.get('/liked-posts',requireToken,getLikedPosts);
router.get('/:id',getPostById);
router.put('/:id',requireToken,updatePost);
router.post('/:id/like',requireToken,likePost);
router.post('/:id/unlike',requireToken,unlikePost);
router.post('/:id/comment',requireToken,createComment);
router.get('/:id/comments',getComments);
router.get('/:id/comments/:commId/replies',getReplies);

module.exports = router;