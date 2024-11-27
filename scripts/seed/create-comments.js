const User = require('../../models/user');
const Post = require('../../models/post');
const Like = require('../../models/like');
const Comment = require('../../models/comment');
const mongoose = require('mongoose');
const path = require('path');

const createComments = async () => {
    let users = await User.find();
    let posts = await Post.find();
    let count = 0;
    await Comment.deleteMany({});
    let promises = [];
    for(let i=0;i<posts.length;i++){
        let commN = 1000 + Math.floor(Math.random() * 1000);
        for(let j=0;j<users.length;j++){
            for(let k=0;k<100 && posts[i].commentCount<commN;k++)
                if(Math.random() > 0.5){
                    let comment = new Comment({
                        postId: posts[i]._id,
                        userId: users[j]._id,
                        message: `Comment ${count} Test`,

                    })
                    posts[i].commentCount++;
                    count++;
                    promises.push(comment);
                }
            
        }
    }
    await Comment.insertMany(promises);
    await Post.bulkSave(posts);
    console.log(`Comments ${count} created`);
    // add replies
    let comments = await Comment.find();
    count = 0;
    promises = [];
    for(let i=0;i<comments.length;i++){
        let commN = 1 + Math.floor(Math.random() * 2);
        let count = 0;
        for(let j=0;j<users.length && count<commN;j++){
                if(Math.random() > 0.5){
                    let comment = new Comment({
                        postId: comments[i].postId,
                        userId: users[j]._id,
                        message: `Reply ${count} Test`,
                        repliedTo: comments[i]._id
                    })
                    comments[i].replyCount++;
                    count++;
                    promises.push(comment);
                }
            
        }
    }
    await Comment.bulkSave(comments);
    await Comment.insertMany(promises);
    console.log(`Replies ${promises.length} created`);
}

async function main() {
    require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
    await mongoose.connect(process.env.DATABASE_URI);
    await createComments();
    process.exit();
}

main();