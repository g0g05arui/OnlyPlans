const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const md5 = require('md5');
const validateEmail = email => {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};   
// Note: all mongoose schemas have _id by default
//TODO: Add meal Plans and OfferedTiers, And Change Subscribed

const UserSchema = new Schema({
    email: {
        type: String,
        trim: true,
        lowercase: true,
        index: { unique: true },
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    bio:{
        type:String,
        default:""
    },
    password: {
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    verified:{
        type: Boolean,
        default:false
    },
    subscribedToNewsletter:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        enum:['Admin','Creator','Specialist','Consumer'],
        default: 'Consumer'
    },
    following:[{type:ObjectId,ref:'User'}],
    subscribed:[{type:ObjectId,ref:'Tier'}],
    followersCount:{
        type:Number,
        default:0
    },
    verified:{
        type:Boolean,
        default:false
    },
    profilePicture:{
        type:String,
        default:""   
    },
    handle:{
        type:String,
        index: { unique: true },
        required:true
    },
    professionProof:{
        type:String,
        default:""
    },
    proffesionVerified:{
        type:Boolean,
        default:false
    },
    },
    {
        versionKey:false,
        toJSON: {
            transform: function(doc,ret,options){
                delete ret.password;
                ret.id=ret._id;
                delete ret._id;
                return ret;
            }
        }
    }
);


const User = mongoose.model('User', UserSchema);


module.exports = User;