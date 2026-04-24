const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quickway", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const Product = mongoose.model("Product", {
    name: String,
    price: Number,
    category: String,
    image: String,
    stock: { type: Number, default: 100 }
  });

  const products = [
    { name: "Apple", price: 50, category: "Fruits", image: "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1024-1024,pr-true,f-auto,q-40,dpr-2/cms/product_variant/8a384aa4-c0e5-4009-b589-6a67ca31137d/Avocado-Indian-Premium-Semi-Ripe.jpeg", stock: 100 },
    { name: "Banana", price: 30, category: "Fruits", image: "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/9c470ed5-1723-4f8b-96a7-6f869dc1fa5b/Banana.png", stock: 150 },
    { name: "Orange", price: 40, category: "Fruits", image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400", stock: 120 },
    { name: "Grapes", price: 60, category: "Fruits", image: "https://images.unsplash.com/photo-1537640538966-79f36943f303?w=400", stock: 80 },
    { name: "Mango", price: 70, category: "Fruits", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400", stock: 90 },
    { name: "Pineapple", price: 55, category: "Fruits", image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400", stock: 70 },
    { name: "Strawberry", price: 80, category: "Fruits", image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400", stock: 60 },
    { name: "Watermelon", price: 25, category: "Fruits", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400", stock: 50 },
    { name: "Kiwi", price: 90, category: "Fruits", image: "https://images.unsplash.com/photo-1610917040803-1fccf8728a4c?w=400", stock: 40 },
    { name: "Papaya", price: 35, category: "Fruits", image: "https://images.unsplash.com/photo-1526318472351-c95bdb050a49?w=400", stock: 75 },
    { name: "Tomato", price: 20, category: "Vegetables", image: "https://images.unsplash.com/photo-1546470427-e262c9bf6e8f?w=400", stock: 200 },
    { name: "Potato", price: 15, category: "Vegetables", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400", stock: 300 },
    { name: "Onion", price: 18, category: "Vegetables", image: "https://images.unsplash.com/photo-1618512496248-a01a9a7b1b8e?w=400", stock: 250 },
    { name: "Carrot", price: 25, category: "Vegetables", image: "https://images.unsplash.com/photo-1582515073490-39981397c445?w=400", stock: 180 },
    { name: "Spinach", price: 12, category: "Vegetables", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400", stock: 150 },
    { name: "Broccoli", price: 45, category: "Vegetables", image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400", stock: 100 },
    { name: "Cucumber", price: 22, category: "Vegetables", image: "https://images.unsplash.com/photo-1604977042946-1eecc30f30d3?w=400", stock: 120 },
    { name: "Bell Pepper", price: 35, category: "Vegetables", image: "https://images.unsplash.com/photo-1561136594-7f684f60a911?w=400", stock: 90 },
    { name: "Eggplant", price: 28, category: "Vegetables", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400", stock: 110 },
    { name: "Cauliflower", price: 30, category: "Vegetables", image: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400", stock: 85 },
    { name: "Milk", price: 60, category: "Dairy", image: "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/8d80a394-1cd3-4be4-9fff-abeaeea7a9a6/Mother-Dairy-Full-Cream-Milk.png", stock: 50 },
    { name: "Cheese", price: 120, category: "Dairy", image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400", stock: 30 },
    { name: "Butter", price: 80, category: "Dairy", image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400", stock: 40 },
    { name: "Yogurt", price: 25, category: "Dairy", image: "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400", stock: 60 },
    { name: "Cream", price: 90, category: "Dairy", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400", stock: 25 },
    { name: "Paneer", price: 100, category: "Dairy", image: "https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=400", stock: 35 },
    { name: "Bread", price: 40, category: "Bakery", image: "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/4f44eb8d-9ca5-4282-90aa-0916c7980b8c/Harvest-Gold-White-Bread.png", stock: 80 },
    { name: "Croissant", price: 50, category: "Bakery", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400", stock: 60 },
    { name: "Muffin", price: 30, category: "Bakery", image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400", stock: 70 },
    { name: "Cake", price: 150, category: "Bakery", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400", stock: 20 },
    { name: "Cookie", price: 20, category: "Bakery", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400", stock: 100 },
    { name: "Rice", price: 80, category: "Grains", image: "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/bf4f32ed-f962-498e-80ff-948405d833af/Daily-Good-Sona-Masoori-Raw-Rice.jpeg", stock: 200 },
    { name: "Wheat Flour", price: 45, category: "Grains", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400", stock: 150 },
    { name: "Oats", price: 65, category: "Grains", image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400", stock: 100 },
    { name: "Quinoa", price: 120, category: "Grains", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400", stock: 50 },
    { name: "Barley", price: 55, category: "Grains", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", stock: 80 },
    { name: "Chicken", price: 200, category: "Meat", image: "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/eac15f0f-0a34-46dc-a94b-87cadd0b2121/Fresh-Chicken.png", stock: 40 },
    { name: "Beef", price: 250, category: "Meat", image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400", stock: 30 },
    { name: "Fish", price: 180, category: "Meat", image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400", stock: 35 },
    { name: "Pork", price: 220, category: "Meat", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400", stock: 25 },
    { name: "Lamb", price: 280, category: "Meat", image: "https://images.unsplash.com/photo-1544378730-6f3c834d9b2d?w=400", stock: 20 },
    { name: "Chips", price: 25, category: "Snacks", image: "https://images.unsplash.com/photo-1566479179818-1a3a6b4b5b5b?w=400", stock: 150 },
    { name: "Chocolate", price: 40, category: "Snacks", image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400", stock: 120 },
    { name: "Nuts", price: 150, category: "Snacks", image: "https://images.unsplash.com/photo-1567721913486-6585f069b332?w=400", stock: 80 },
    { name: "Popcorn", price: 30, category: "Snacks", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", stock: 100 },
    { name: "Candy", price: 15, category: "Snacks", image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400", stock: 200 },
    { name: "Soda", price: 20, category: "Beverages", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", stock: 300 },
    { name: "Juice", price: 35, category: "Beverages", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400", stock: 150 },
    { name: "Tea", price: 50, category: "Beverages", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400", stock: 100 },
    { name: "Coffee", price: 60, category: "Beverages", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400", stock: 90 }
  ];

  await Product.deleteMany({});
  await Product.insertMany(products);

  console.log("Seeded");
  mongoose.connection.close();
}).catch(err => {
  console.error("MongoDB connection error:", err.message);
  process.exit(1);
});
