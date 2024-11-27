const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const axios = require('axios');
const sharp = require('sharp');

const PostSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    creator:{
        type:ObjectId,
        ref:'User',
        required:true
    },
    tier:{
        type:ObjectId,
        ref:'Tier',
        default:null
    },
    description:{
        type:String,
        required:true
    },
    media:[{type:String}],
    documents:[{type:String}],
    likedCount:{
        type:Number,
        default:0,
    },
    commentCount:{
        type:Number,
        default:0,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    type:{
        type:String,
        enum:['Normal','Meal','MealPlan','Workout'],
        default:'Normal',
    },
    meal:{
        type:ObjectId,
        ref:'Meal',
        default:null
    },
    mealPlan:{
        type:ObjectId,
        ref:'MealPlan',
        default:null
    },
    aspectRatio:{
        type:String,
        enum:['square','landscape','portrait'],
    }
    
},
{
    versionKey:false,
    toJSON:{
        transform: function(doc,ret,opt) {

            return ret;
        }
    }
});

// before inserting a post and before updating create a function that will update the aspectRatio

PostSchema.pre("save", async function(next){
    let obj = this.media[0];
    if (!(this.isModified && this.isModified("media")))
        return next();
    if(!obj){
        this.aspectRatio = 'square';
        return next();
    }
    const response = await axios.get(obj, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    console.log('media update',obj);

        // Use sharp to get the metadata
    const metadata = await sharp(imageBuffer).metadata();
    if(metadata.width > metadata.height)
        this.aspectRatio = 'landscape';
    else if(metadata.height > metadata.width)
        this.aspectRatio = 'portrait';
    else
        this.aspectRatio = 'square';
    next();
   
});



const Post = mongoose.model('Post', PostSchema);


module.exports = Post;