const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

// ── بيانات المنتجات ───────────────────────────────────────
const products = [
  {
    name: 'Striped Wool Overcoat',
    description: 'A premium striped wool overcoat crafted for the modern gentleman. Perfect for cold seasons.',
    price: 320,
    originalPrice: 450,
    category: 'outerwear',
    subcategory: 'coats',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600',
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600',
      'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=600'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#1a1a1a', '#4a3728', '#6b7280'],
    inStock: true,
    stockCount: 15,
    rating: 4.8,
    numReviews: 124,
    isNew: false,
    isSale: true,
    isFeatured: true
  },
  {
    name: 'Classic Slim Fit Suit',
    description: 'Timeless elegance meets modern tailoring. This slim-fit suit is perfect for any formal occasion.',
    price: 580,
    originalPrice: null,
    category: 'men',
    subcategory: 'suits',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600'
    ],
    sizes: ['48', '50', '52', '54', '56'],
    colors: ['#1a1a2e', '#2d4a22', '#4a3728'],
    inStock: true,
    stockCount: 8,
    rating: 4.9,
    numReviews: 87,
    isNew: true,
    isSale: false,
    isFeatured: true
  },
  {
    name: 'Leather Derby Shoes',
    description: 'Handcrafted genuine leather derby shoes. A staple piece for every wardrobe.',
    price: 195,
    originalPrice: 250,
    category: 'footwear',
    subcategory: 'shoes',
    image: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600',
    images: [
      'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600'
    ],
    sizes: ['40', '41', '42', '43', '44', '45'],
    colors: ['#1a1a1a', '#4a3728'],
    inStock: true,
    stockCount: 22,
    rating: 4.7,
    numReviews: 63,
    isNew: false,
    isSale: true,
    isFeatured: false
  },
  {
    name: 'Structured Leather Handbag',
    description: 'A sophisticated structured handbag in genuine Italian leather. Versatile and luxurious.',
    price: 280,
    originalPrice: null,
    category: 'accessories',
    subcategory: 'bags',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600'
    ],
    sizes: [],
    colors: ['#1a1a1a', '#8B4513', '#2F4F4F'],
    inStock: true,
    stockCount: 12,
    rating: 4.6,
    numReviews: 45,
    isNew: true,
    isSale: false,
    isFeatured: true
  },
  {
    name: 'Merino Wool Turtleneck',
    description: 'Ultra-soft merino wool turtleneck. Lightweight yet warm, ideal for layering.',
    price: 145,
    originalPrice: null,
    category: 'men',
    subcategory: 'knitwear',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#2d4a22', '#1a1a1a', '#D4C5A9', '#8B7355'],
    inStock: true,
    stockCount: 30,
    rating: 4.5,
    numReviews: 92,
    isNew: false,
    isSale: false,
    isFeatured: true
  },
  {
    name: 'Wide-Leg Linen Trousers',
    description: 'Effortlessly chic wide-leg trousers in breathable linen. Perfect for warm seasons.',
    price: 125,
    originalPrice: 160,
    category: 'women',
    subcategory: 'trousers',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['#F5F0E8', '#D4C5A9', '#1a1a1a'],
    inStock: true,
    stockCount: 18,
    rating: 4.4,
    numReviews: 38,
    isNew: true,
    isSale: true,
    isFeatured: false
  },
  {
    name: 'Cashmere Blend Scarf',
    description: 'Luxuriously soft cashmere blend scarf. An elegant finishing touch to any outfit.',
    price: 95,
    originalPrice: null,
    category: 'accessories',
    subcategory: 'scarves',
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600',
    images: [
      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600'
    ],
    sizes: [],
    colors: ['#D4C5A9', '#8B4513', '#1a1a1a', '#2d4a22'],
    inStock: true,
    stockCount: 40,
    rating: 4.7,
    numReviews: 55,
    isNew: false,
    isSale: false,
    isFeatured: false
  },
  {
    name: 'Double-Breasted Blazer',
    description: 'Sharp double-breasted blazer with gold-tone buttons. A statement piece for any occasion.',
    price: 390,
    originalPrice: null,
    category: 'women',
    subcategory: 'blazers',
    image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600',
    images: [
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['#1a1a1a', '#2d4a22'],
    inStock: true,
    stockCount: 10,
    rating: 4.8,
    numReviews: 72,
    isNew: true,
    isSale: false,
    isFeatured: true
  },
  {
    name: 'Slim Chino Trousers',
    description: 'Versatile slim-fit chino trousers. Smart casual essential for every wardrobe.',
    price: 98,
    originalPrice: null,
    category: 'men',
    subcategory: 'trousers',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600'
    ],
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['#D4C5A9', '#1a1a1a', '#2d4a22', '#8B7355'],
    inStock: true,
    stockCount: 25,
    rating: 4.3,
    numReviews: 110,
    isNew: false,
    isSale: false,
    isFeatured: false
  },
  {
    name: 'Silk Evening Dress',
    description: 'Flowing silk evening dress with a timeless silhouette. Understated luxury for special occasions.',
    price: 460,
    originalPrice: 600,
    category: 'women',
    subcategory: 'dresses',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['#1a1a1a', '#2C3E50', '#8B7355'],
    inStock: true,
    stockCount: 7,
    rating: 4.9,
    numReviews: 34,
    isNew: false,
    isSale: true,
    isFeatured: true
  },
  {
    name: 'Suede Chelsea Boots',
    description: 'Premium suede Chelsea boots with elastic side panels. A timeless silhouette for any season.',
    price: 220,
    originalPrice: null,
    category: 'footwear',
    subcategory: 'boots',
    image: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600',
    images: [
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600'
    ],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['#8B4513', '#1a1a1a'],
    inStock: true,
    stockCount: 14,
    rating: 4.6,
    numReviews: 48,
    isNew: true,
    isSale: false,
    isFeatured: true
  },
  {
    name: 'Linen Relaxed Shirt',
    description: 'Easy-wearing linen shirt with a relaxed fit. Breathable and stylish for warm weather.',
    price: 85,
    originalPrice: null,
    category: 'men',
    subcategory: 'shirts',
    image: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600',
    images: [
      'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#F5F0E8', '#D4C5A9', '#2d4a22', '#1a4a6b'],
    inStock: true,
    stockCount: 35,
    rating: 4.4,
    numReviews: 76,
    isNew: false,
    isSale: false,
    isFeatured: false
  }
];

// ── بيانات المستخدمين ─────────────────────────────────────
const users = [
  {
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin123',
    isAdmin: true,
    phone: '+1-555-0100',
    address: '123 Admin Street, New York, NY 10001',
    isActive: true
  }
];

// ── دالة توليد طلبات عشوائية ──────────────────────────────
function generateOrders(productIds) {
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentMethods = ['cod', 'card'];
  const customerNames = ['Sarah Johnson', 'Michael Chen', 'Emma Williams', 'James Brown', 'Lena Park', 'Omar Hassan'];
  const customerEmails = ['sarah@example.com', 'michael@example.com', 'emma@example.com', 'james@example.com', 'lena@example.com', 'omar@example.com'];

  const orders = [];

  for (let i = 0; i < 15; i++) {
    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const productIndex = Math.floor(Math.random() * productIds.length);
      const price = products[productIndex % products.length]?.price || 100;
      const qty = Math.floor(Math.random() * 2) + 1;
      subtotal += price * qty;

      items.push({
        product: productIds[productIndex % productIds.length],
        productName: products[productIndex % products.length]?.name || 'Product',
        productImage: products[productIndex % products.length]?.image || '',
        quantity: qty,
        size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
        color: '#1a1a1a',
        price
      });
    }

    const shippingCost = subtotal > 200 ? 0 : 15;
    const custIdx = i % customerNames.length;
    const statusIdx = i % statuses.length;

    orders.push({
      customer: {
        name: customerNames[custIdx],
        email: customerEmails[custIdx],
        phone: `+1-555-01${String(custIdx).padStart(2, '0')}`,
        address: `${100 + i} Fashion Street, New York, NY 1000${i}`
      },
      items,
      subtotal,
      shippingCost,
      totalAmount: subtotal + shippingCost,
      status: statuses[statusIdx],
      paymentMethod: paymentMethods[i % 2],
      isPaid: statuses[statusIdx] === 'delivered',
      notes: i % 3 === 0 ? 'Please gift wrap the order.' : '',
      createdAt: new Date(Date.now() - i * 86400000 * 2) // كل طلب قبل يومين من السابق
    });
  }

  return orders;
}

// ── مستخدمون للتعليقات ─────────────────────────────────────
const reviewerUsers = [
  { name: 'Sarah Johnson', email: 'sarah@example.com', password: 'Password123', phone: '+1-555-0101', address: '456 Fashion Ave, LA' },
  { name: 'Michael Chen', email: 'michael@example.com', password: 'Password123', phone: '+1-555-0102', address: '789 Style St, NYC' },
  { name: 'Emma Williams', email: 'emma@example.com', password: 'Password123', phone: '+1-555-0103', address: '321 Trend Blvd, Chicago' },
  { name: 'Omar Hassan', email: 'omar@example.com', password: 'Password123', phone: '+1-555-0104', address: '654 Elegance Rd, Dubai' },
  { name: 'Lena Park', email: 'lena@example.com', password: 'Password123', phone: '+1-555-0105', address: '987 Chic Lane, Seoul' },
  { name: 'James Brown', email: 'james@example.com', password: 'Password123', phone: '+1-555-0106', address: '147 Classic Dr, London' }
];

// ── تعليقات جاهزة لكل تقييم ───────────────────────────────
const reviewTemplates = {
  5: [
    { title: 'Absolutely stunning!', comment: 'Exceeded all my expectations. The quality is top-notch and the fit is perfect. Will definitely buy again!' },
    { title: 'Best purchase ever', comment: 'I\'ve been looking for something like this for months. The material feels premium and looks even better in person.' },
    { title: 'Highly recommend', comment: 'Amazing craftsmanship. Every detail is perfect. Got so many compliments already!' },
    { title: 'Worth every penny', comment: 'Fantastic quality for the price. The stitching is flawless and the fabric is luxurious.' }
  ],
  4: [
    { title: 'Great quality', comment: 'Really happy with this purchase. Fits well and looks great. Minor color difference from the photo but still love it.' },
    { title: 'Very satisfied', comment: 'Good quality and comfortable to wear. Shipping was fast too. Would recommend to friends.' },
    { title: 'Nice piece', comment: 'Solid construction and nice design. The sizing runs a bit small so consider going one size up.' },
    { title: 'Love it!', comment: 'Beautiful design and great material. Only giving 4 stars because delivery took a bit longer than expected.' }
  ],
  3: [
    { title: 'Decent product', comment: 'It\'s okay for the price. The quality is average and the fit could be better. Not bad overall.' },
    { title: 'Average quality', comment: 'The product looks nice but the material isn\'t as premium as I expected from the description.' }
  ],
  2: [
    { title: 'Could be better', comment: 'The sizing is way off and the material feels cheaper than expected. Not sure I\'d buy again.' }
  ]
};

// ── توليد تعليقات عامة (بدون ربط بمنتج) ────────────────────
function generateReviews(userDocs) {
  const reviews = [];
  const ratings = [5, 5, 4, 4, 5, 3]; // توزيع واقعي

  userDocs.forEach((u, i) => {
    const rating = ratings[i % ratings.length];
    const templates = reviewTemplates[rating] || reviewTemplates[3];
    const template = templates[Math.floor(Math.random() * templates.length)];

    reviews.push({
      user: u.id,
      userName: u.name,
      rating,
      title: template.title,
      comment: template.comment,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000)
    });
  });

  return reviews;
}

// ── الدالة الرئيسية للـ Seeding ───────────────────────────
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clothes-store');
    console.log('✅ Connected to MongoDB');

    // حذف البيانات القديمة
    await Promise.all([
      Product.deleteMany({}),
      User.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({})
    ]);
    console.log('🗑️  Cleared old data');

    // إدراج المنتجات
    const insertedProducts = await Product.insertMany(products);
    console.log(`📦 Inserted ${insertedProducts.length} products`);

    // إدراج المستخدمين (الأدمن)
    const insertedUsers = [];
    for (const u of users) {
      const user = new User(u);
      await user.save();
      insertedUsers.push(user);
    }

    // إدراج مستخدمي التعليقات
    const reviewerUserDocs = [];
    for (const u of reviewerUsers) {
      const user = new User(u);
      await user.save();
      reviewerUserDocs.push({ id: user._id, name: user.name });
    }
    console.log(`👥 Inserted ${insertedUsers.length + reviewerUserDocs.length} users`);

    // إدراج الطلبات
    const productIds = insertedProducts.map(p => p._id);
    const ordersData = generateOrders(productIds);
    const insertedOrders = await Order.insertMany(ordersData);
    console.log(`📋 Inserted ${insertedOrders.length} orders`);

    // إدراج التعليقات العامة (كل مستخدم تعليق واحد)
    const reviewsData = generateReviews(reviewerUserDocs);
    const insertedReviews = await Review.insertMany(reviewsData);
    console.log(`⭐ Inserted ${insertedReviews.length} reviews`);

    console.log('\n🎉 ========== Seed Complete! ==========');
    console.log('📧 Admin Login:');
    console.log('   Email:    admin@admin.com');
    console.log('   Password: admin123');
    console.log('📧 Test User Login:');
    console.log('   Email:    sarah@example.com');
    console.log('   Password: Password123');
    console.log('======================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
