const User = require('../../models/user');
const mongoose = require('mongoose');
const path = require('path');
const md5 = require('md5');
const dataImg = require('./data/imgs');
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main(){
    let promises = [];
    let firstNames = [ "Mihai","Paul","Stefan","Andrei Radu","Dinu","Andrei","Tudor"];
    let secondNames = [ "Indreias", "Stan", "Bud", "Vasile", "Cocianu", "Ionescu", "Ivan"];
    require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
    await mongoose.connect(process.env.DATABASE_URI);
    await User.deleteMany({});

    console.log('Deleted all user entries');

    for(let i=0;i<=100;i++){
        let fN = firstNames[ Math.floor(Math.random() * firstNames.length) ];
        let sN = secondNames[ Math.floor(Math.random() * secondNames.length)]; 
        let user = new User( 
            {
                email: `mock.user${i}@gmail.com` ,
                firstName:fN,
                lastName:sN,
                password: md5("test"),
                verified: true,
                role: ['Consumer','Creator','Specialist'][Math.floor(Math.random() * 4)],
                handle: `${fN}${sN}${i}`,
                bio: `I am ${fN} ${sN} and I am a ${['Consumer','Creator','Specialist'][Math.floor(Math.random() * 4)]}`,
                profilePicture: dataImg.getRandomImage(),
            }
        )
        promises.push(user);
    }
    
    await Promise.all( promises.map( p => p.save() ));
    console.log(`Sucessfully create ${await User.countDocuments({})} users`);
    process.exit();
}

main();