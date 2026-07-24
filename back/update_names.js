const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clothes-store';

mongoose.connect(MONGO_URI).then(async () => {
    try {
        const products = await Product.find({ name: / \(جديد\)$/ });
        for (let p of products) {
            p.name = p.name.replace(' (جديد)', '');
            await p.save();
        }
        console.log(`Updated ${products.length} products`);
    } catch(e) { console.log(e); }
    mongoose.disconnect();
});
