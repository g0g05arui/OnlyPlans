const User = require('../../models/user');
const Post = require('../../models/post');
const Like = require('../../models/like');
const mongoose = require('mongoose');
const path = require('path');

const createLikes = async () => {
    let users = await User.find();
    let posts = await Post.find();
    let count = 0;
    await Like.deleteMany({});
    let promises = [];
    for(let i=0;i<posts.length;i++){
        for(let j=0;j<users.length;j++){
            if(Math.random() > 0.5){
                let like = new Like({
                    postId:posts[i]._id,
                    likedBy:users[j]._id,
                })
                promises.push(like.save());
                posts[i].likedCount++;
                count++;
            }
        }
    }
    await Promise.all(promises);
    await Promise.all(posts.map( p => p.save() ));
    console.log(`Likes ${count} created`);
}

async function main() {
    require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
    await mongoose.connect(process.env.DATABASE_URI);
    await createLikes();
    process.exit();
}

main();