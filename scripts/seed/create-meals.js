
const User = require('../../models/user');
const Post = require('../../models/post');
const mongoose = require('mongoose');
const path = require('path');
const Like = require('../../models/like');
const Meal = require('../../models/meal');
const Tier = require('../../models/tier');
const dataImg = require('./data/imgs');
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

const createPosts = async () => {
    let users = await User.find({ role: { $in: ['Specialist', 'Creator'] }});
    await Meal.deleteMany({});

    let promises = [];
    for(let i=0;i<users.length;i++){
        const postNo =  Math.floor(Math.random() * 2) ;
        const tiers = await Tier.find({creator:users[i]._id});
        for(let j=0;j<postNo;j++){
            let tierId=null;
            if(Math.random() > 0.5 && tiers.length > 0){
                tierId = tiers[Math.floor(Math.random() * tiers.length)]._id;
            }
            let meal = new Meal({
                title:"Lorem ipsum dolor sit amet",
                description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                mealType:mealTypes[Math.floor(Math.random() * mealTypes.length)],
                dietaryOptions:[],
                mealPrep:mealPrep[Math.floor(Math.random() * mealPrep.length)],
                timeToMake:timeToMake[Math.floor(Math.random() * timeToMake.length)],
                ingredients:[
                    {
                        name:[
                            "Avocado",
                            "Banana",
                            "Apple",
                            "Orange",
                            "Pineapple",
                            "Strawberry",
                            "Chicken",
                            "Beef",
                            "Pork",
                            "Fish",
                            "Lamb",
                            "Turkey",
                            "Water"
                        ][Math.floor(Math.random() * 13)],
                        unit:servingSizes[Math.floor(Math.random() * servingSizes.length)],
                        count:1+Math.floor(Math.random() * 10)
                    }
                ],
                servingSize:1+Math.floor(Math.random() * 10),
                servingUnit:servingSizes[Math.floor(Math.random() * servingSizes.length)],
                notes:["Lorem ipsum dolor sit amet"],
                macros:[
                ],
                ratingSum:0,
                ratingCount:0,
                creator:users[i]._id,
            });
            // add a few macros
            // add KCAL and KJ
            meal.kCal=1+Math.floor(Math.random() * 100);
            meal.protein=1+Math.floor(Math.random() * 50);
            meal.fats=1+Math.floor(Math.random() * 50);
            meal.carbs=1+Math.floor(Math.random() * 50);

            for(let k=0;k<Math.floor(Math.random() * 5);k++){
                meal.macros.push({
                    name:nutrients[Math.floor(Math.random() * nutrients.length)],
                    quantity:1+Math.floor(Math.random() * 100),
                    unit:nutrientsUnit[Math.floor(Math.random() * nutrientsUnit.length)]
                });
            }
            // add a few categories
            for(let k=0;k<Math.floor(Math.random() * 5);k++){
                meal.dietaryOptions.push(dietaryOptions[Math.floor(Math.random() * dietaryOptions.length)]);
            }
            meal.dietaryOptions = [...new Set(meal.dietaryOptions)];
            // add a few steps
            for(let k=0;k<2+Math.floor(Math.random() * 5);k++){
                meal.steps.push({
                    title:"Lorem ipsum dolor sit amet",
                    descript:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                });
                if(Math.random() > 0.5){
                    meal.steps[meal.steps.length-1].media.push(dataImg.getRandomImage());
                }
            }

            await meal.save();
            
            let post = new Post({
                creator:users[i]._id,
                type: 'Meal',
                meal:meal._id,
                description: "LorLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.ulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.em ",
                tier:tierId,
                title:"Title of the post",
                media:[dataImg.getRandomImage()],
            });
            const newMediaSize = Math.floor(Math.random() * 15);
            for(let k=0;k<newMediaSize;k++){
                post.media.push(dataImg.getRandomImage());
            }
            promises.push(post.save());
            
        }
    }
    await Promise.all(promises);
    console.log(`Meals ${ await Meal.countDocuments()}created`);
}

async function main() {
    require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
    await mongoose.connect(process.env.DATABASE_URI);
    await createPosts();
    process.exit();
}

main();