const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const CommentSchema = new Schema({
    postId:{
        type:ObjectId,
        ref:'Post',
        required:true
    },
    userId:{
        type:ObjectId,
        ref:'User',
        required:true
    },
    repliedTo:{
        type:ObjectId,
        ref:'Comment',
        default:null
    },
    message:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
    replyCount:{
        type:Number,
        default:0
    },

},{
    versionKey:false,
    toJSON:{
        transform: function(doc,ret,opt) {

            return ret;
        }
    }
});

const Comment = mongoose.model('Comment', CommentSchema);


module.exports = Comment;