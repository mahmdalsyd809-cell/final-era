const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clothes-store';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    
    const newProducts = [
      {
        name: 'Classic Black Jacket (جديد)',
        description: 'A stylish and modern classic black jacket suitable for all seasons.',
        price: 250,
        category: 'Outerwear',
        subcategory: 'Jackets',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black'],
        stockCount: 50,
        isNew: true,
        isFeatured: true
      },
      {
        name: 'Summer Denim Shorts (جديد)',
        description: 'Comfortable denim shorts for summer days.',
        price: 80,
        category: 'Pants',
        subcategory: 'Shorts',
        image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        sizes: ['30', '32', '34', '36'],
        colors: ['Blue'],
        stockCount: 30,
        isNew: true,
        isFeatured: true
      },
      {
        name: 'Cotton White T-Shirt (جديد)',
        description: 'Premium quality 100% cotton white t-shirt.',
        price: 45,
        category: 'Shirts',
        subcategory: 'T-Shirts',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        sizes: ['S', 'M', 'L'],
        colors: ['White'],
        stockCount: 100,
        isNew: true,
        isFeatured: true
      },
      {
        name: 'Elegant Red Dress (جديد)',
        description: 'An elegant red dress for special occasions.',
        price: 320,
        category: 'Dresses',
        subcategory: 'Evening',
        image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        sizes: ['S', 'M'],
        colors: ['Red'],
        stockCount: 15,
        isNew: true,
        isFeatured: true
      }
    ];

    try {
      const inserted = await Product.insertMany(newProducts);
      console.log('Inserted Products:', inserted.map(p => p.name));
    } catch (e) {
      console.error('Error inserting:', e);
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('DB Connection error:', err);
  });
