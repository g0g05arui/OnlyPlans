const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const LikeSchema = new Schema({
    likedBy:{
        type:ObjectId,
        ref:'User',
        required:true
    },
    postId:{
        type:ObjectId,
        ref:'Post',
        required:true
    }
},{
    versionKey:false,
    toJSON:{
        transform: function(doc,ret,opt) {

            return ret;
        }
    }
});

const Like = mongoose.model('Like', LikeSchema);


module.exports = Like;