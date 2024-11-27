const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const nutrients = [
    'KJ',
    'Fiber',
    'Sugar',
    'Sat. Fat',
    'TransFat',
    'Sodium',
    'Pottasium',
    'VitC',
    'VitA',
    'VitE',
    'VitB12',
    'Iron',
    'Calcium'
];

const nutrientsUnit = [
    'g',
    'mg',
    'mcg',
    'IU',
    'ng',
];

const servingSizes = [
    'ml',
    'g',
    'cups',
    'tablespoons',
    'pinch',
    'unit'
]

const dietaryOptions = [
    'Vegan',
    'Vegetarian',
    'Pescatarian',
    'Paleo',
    'Keto' ,
    'Kosher',
    'Low Sugar',
    'No added Sugar',
    'Low Carb',
    'High Protein',
    'Dairy Free',
    'Gluten Free',
    'Nut Free',
    'Soy Free',
    'Corn Free',
    'Egg Free'
]

const mealTypes = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snack',
]

const mealPrep = [
    'No-Bake',
    'One-Pan / One-Bowl',
    'One-Sheet Pan',
    'Few Ingredients',
    'Party Size',
    'Easy to make'
]

const timeToMake = [
    'Under 15 minutes',
    'Under 30 minutes',
    'Under 45 minutes',
    'Under 1 hour',
    'Over 1 hour'
]

const MealSchema = new Schema({
    creator:{
        type:ObjectId,
        ref:'User',
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    media:[{type:String}],
    steps:[
        {
            media:[{type:String}],
            title:{
                type:String,
                required:true,
            },
            descript:{
                type:String,
                required:true,
            }
        }
    ],
    mealType:{
        type:String,
        enum:mealTypes,
        required:true
    },
    dietaryOptions:[{
        type:String,
        enum:dietaryOptions
    }],
    mealPrep:{
        type:String,
        enum:mealPrep,
        required:true
    },
    ingredients:[
        {
            name:{
                type:String,
                required:true,
            },
            unit:{
                type:String,
                enum:servingSizes,
                required:true,
            },
            count:{
                type:Number,
                validate:[ count => {return count > 0 }, "Count Invalid"],
                required:true,
            }
        }
    ],
    servingSize:{
        type:Number,
        validate:[ count => {return count > 0 }, "Count Invalid"]
    },
    servingUnit:{
        type:String,
        enum:servingSizes
    },
    notes:[{type:String}],
    macros:[
        {
            name:{
                type:String,
                enum:nutrients,
                required:true
            },
            quantity:{
                type:Number,
                validate:[ count => {return count > 0 }, "quantity Invalid"],
                required:true
            },
            unit:{
                type:String,
                enum:nutrientsUnit,
                required:true
            }
        }
    ],
    ratingSum:{
        type:Number,
        default:0
    },
    ratingCount:{
        type:Number,
        default:0
    },
    timeToMake:{
        type:String,
        enum:timeToMake,
        required:true
    },
    kCal:{
        type:Number,
        validate:[ count => {return count > 0 }, "quantity Invalid"],
        required:true
    },
    fats:{
        type:Number,
        validate:[ count => {return count > 0 }, "quantity Invalid"],
        required:true
    },
    carbs:{
        type:Number,
        validate:[ count => {return count > 0 }, "quantity Invalid"],
        required:true
    },
    protein:{
        type:Number,
        validate:[ count => {return count > 0 }, "quantity Invalid"],
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

MealSchema.pre("save", async function(next){
    const bucketName = process.env.GCLOUD_STORAGE_BUCKET;
    if(this.media.some( media => !media.startsWith(`https://storage.googleapis.com/${bucketName}`)) ||
        this.steps.some( step => step.media.some( media => !media.startsWith(`https://storage.googleapis.com/${bucketName}`))))
        throw new Error("Invalid Media URL");
    next();
});


const Meal = mongoose.model('Meal', MealSchema);




module.exports = Meal;
