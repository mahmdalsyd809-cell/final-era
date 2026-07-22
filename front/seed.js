import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin123';

const productsToSeed = [
  {
    name: "Tailored Wool Blend Overcoat",
    price: 450,
    category: "Outerwear",
    description: "A classic tailored wool blend overcoat perfect for formal occasions.",
    imagePath: "src/assets/coat.png",
    sizes: ["M", "L", "XL"],
    colors: ["Dark Green", "Black"],
    stockCount: 20,
    isFeatured: true
  },
  {
    name: "Elegant Formal Dress",
    price: 350,
    category: "Suits",
    subcategory: "Dresses",
    description: "An elegant, modern women's formal evening dress.",
    imagePath: "src/assets/formal_dress.png",
    sizes: ["S", "M", "L"],
    colors: ["Navy Blue", "Black"],
    stockCount: 15,
    isFeatured: true
  },
  {
    name: "Relaxed Pleated Trousers",
    price: 180,
    category: "Suits",
    subcategory: "Pants",
    description: "Comfortable and stylish relaxed pleated trousers.",
    imagePath: "src/assets/grey_pants.png",
    sizes: ["30", "32", "34", "36"],
    colors: ["Grey", "Black"],
    stockCount: 30,
    isFeatured: true
  },
  {
    name: "Classic Formal Suit",
    price: 550,
    category: "Suits",
    description: "A high-quality classic formal suit for men.",
    imagePath: "src/assets/formal_suit.png",
    sizes: ["38R", "40R", "42R"],
    colors: ["Navy Blue", "Charcoal"],
    stockCount: 10,
    isFeatured: true
  }
];

async function seed() {
  try {
    // 1. Login
    console.log('Logging in as admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    // The backend might return token in { token } or { data: { token } }
    const token = loginRes.data.token || loginRes.data.data?.token;
    if (!token) throw new Error('No token received');
    console.log('Logged in successfully.');

    const headers = { Authorization: `Bearer ${token}` };

    for (const prod of productsToSeed) {
      console.log(`Processing: ${prod.name}`);
      
      // 2. Upload Image
      const form = new FormData();
      const imageFullPath = path.resolve(prod.imagePath);
      
      if (!fs.existsSync(imageFullPath)) {
        console.error(`Image not found: ${imageFullPath}`);
        continue;
      }
      
      form.append('image', fs.createReadStream(imageFullPath));
      
      const uploadRes = await axios.post(`${API_URL}/upload/image`, form, {
        headers: {
          ...headers,
          ...form.getHeaders()
        }
      });
      
      // The backend returns { url: '/uploads/xxx.png' }
      const uploadedImageUrl = uploadRes.data.url || uploadRes.data.data?.url || uploadRes.data;
      console.log(`Uploaded image to: ${uploadedImageUrl}`);

      // 3. Create Product
      const newProduct = {
        name: prod.name,
        price: prod.price,
        category: prod.category,
        subcategory: prod.subcategory,
        description: prod.description,
        image: uploadedImageUrl,
        sizes: prod.sizes,
        colors: prod.colors,
        stockCount: prod.stockCount,
        isFeatured: prod.isFeatured
      };

      const createRes = await axios.post(`${API_URL}/admin/products`, newProduct, { headers });
      console.log(`Created product: ${prod.name} with ID: ${createRes.data._id || createRes.data.data?._id}`);
    }
    
    console.log('Seeding completed!');
  } catch (err) {
    console.error('Error seeding:', err.response?.data || err.message);
  }
}

seed();
