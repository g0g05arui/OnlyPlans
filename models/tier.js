const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const TierSchema = new Schema({
    price:{
        type:Number,
        required:true,
        default:0,
        validate : [(price) => {return price > 0} , 'Invalid Price'] 
    },
    currency:{
        type:String,
        enum:['EUR','GBP','USD','RON','CHF'],
        default:'EUR'
    },
    goal:{
        type:String,
        enum:['Fat Loss','Muscle Gain']
    },
    creator:{
        type:ObjectId,
        ref:'User',
        required:true
    },
    level:{
        type:Number,
        default:1,
        validate:[(level) => {return 1<=level && level<=4 && Math.floor(level) == level;} , "Invalid Tier Number"]
    },
    description:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    covorPhoto:String
},{
    versionKey:false,
    toJSON:{
        transform: function(doc,ret,opt) {

            return ret;
        }
    }
});

const Tier = mongoose.model('Tier', TierSchema);


module.exports = Tier;