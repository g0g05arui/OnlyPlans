/// Create tiers for the users with role 'Specialist' or 'Creator'
const User = require('../../models/user');
const Tier = require('../../models/tier');
const mongoose = require('mongoose');
const path = require('path');

const createTiers = async () => {
    let users = await User.find({ role: { $in: ['Specialist', 'Creator'] } });
    await Tier.deleteMany({});
    let promises = [];
    for (let i = 0; i < users.length; i++) {
        const tierNo =  Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < tierNo; j++) {
            let tier = new Tier({
                creator: users[i]._id,
                price: 1+Math.floor(Math.random() * 100),
                title: 'Tier ' + (j + 1),
                level: j + 1,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
            });
            promises.push(tier.save());
        }
    }
    await Promise.all(promises);
    console.log(`Created ${await Tier.countDocuments({})} tiers`);
}

async function main() {
    require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
    await mongoose.connect(process.env.DATABASE_URI);
    await createTiers();
    process.exit();
}

main();
