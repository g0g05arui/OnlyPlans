const User = require('../../models/user');
const Post = require('../../models/post');
const mongoose = require('mongoose');
const path = require('path');
const Like = require('../../models/like');
const dataImg = require('./data/imgs');

const createPosts = async () => {
    let users = await User.find({ role: { $in: ['Specialist', 'Creator'] }});
    await Post.deleteMany({});
    await Like.deleteMany({});

    let promises = [];
    for(let i=0;i<users.length;i++){
        const postNo =  Math.floor(Math.random() * 2) ;
        for(let j=0;j<postNo;j++){
            if(users[i].role!= 'Consumer'){
                let post = new Post({
                    title:"Lorem ipsum dolor sit amet",
                    creator:users[i]._id,
                    description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                    type: 'Normal',
                    media:[]
                });
                if(Math.random() > 0.2){
                
                    post.media.push(
                        dataImg.getRandomImage()
                    );
        
                }
                const newMediaSize = Math.floor(Math.random() * 15);
                for(let k=0;k<newMediaSize;k++){
                    post.media.push(dataImg.getRandomImage());
                }
       
                promises.push(post.save());
            }
        }
    }
    await Promise.all(promises);
    console.log(`Posts ${ await Post.countDocuments()}created`);
}

async function main() {
    require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
    await mongoose.connect(process.env.DATABASE_URI);
    await createPosts();
    process.exit();
}

main();