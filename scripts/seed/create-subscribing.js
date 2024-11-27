/// each Consumer should be subscribed to a few tiers (1 to 5)
const User = require('../../models/user');
const Tier = require('../../models/tier');

const mongoose = require('mongoose');
const path = require('path');

const createSubscribing = async () => {
    let users = await User.find({ role: 'Consumer' });
    let tiers = await Tier.find();
    await User.updateMany({}, { $set: { subscribed: [] } });
    let promises = [];
    for (let i = 0; i < users.length; i++) {
        const subscribedTo = [];
        const tierIndexes = new Set();
        const subNo= Math.floor(Math.random() * 5) + 1;
        while (tierIndexes.size < subNo) {
            tierIndexes.add(Math.floor(Math.random() * tiers.length));
        }
        for (const index of tierIndexes) {
            subscribedTo.push(tiers[index]._id);
        }
        promises.push(User.updateOne({ _id: users[i]._id }, { $set: { subscribed:subscribedTo } }));
    }
    await Promise.all(promises);
    console.log('Subscribed to tiers');
}

async function main() {
    require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
    await mongoose.connect(process.env.DATABASE_URI);
    await createSubscribing();
    process.exit();
}

main();