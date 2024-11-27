const User = require('../../models/user');
const mongoose = require('mongoose');
const path = require('path');

const createFollowing = async () => {
    let users = await User.find();
    let count = 0;
    for(let i=0;i<users.length;i++){
        let following = [];
        for(let j=0;j<users.length;j++){
            if(Math.random() > 0.7 && i!==j){
                users[j].followersCount++;
                following.push(users[j]._id);
                count++;
            }
        }
        users[i].following = following;
    }
    await Promise.all(users.map( u => u.save() ));
    console.log(`Following relationships ${count} created`);
}

async function main() {
    require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
    await mongoose.connect(process.env.DATABASE_URI);
    await createFollowing();
    process.exit();
}

main();