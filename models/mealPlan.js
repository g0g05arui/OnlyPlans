const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const MealPlanSchema = new Schema({
    meals:[{type:ObjectId,ref:'Meal'}],
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    mealFrequency:{
        type:Number,
        default:0
    },
    notes:[{type:String}]
},
{
    versionKey:false,
    toJSON:{
        transform: function(doc,ret,opt) {

            return ret;
        }
    }
});

const MealPlan = mongoose.model('MealPlan', MealPlanSchema);


module.exports = MealPlan;