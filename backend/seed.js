const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/zepto");

const Product = mongoose.model("Product", {
  name: String,
  price: Number,
  category: String,
  image: String
});

const products = [
  { name: "Apple", price: 50, category: "Fruits", image: "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1024-1024,pr-true,f-auto,q-40,dpr-2/cms/product_variant/8a384aa4-c0e5-4009-b589-6a67ca31137d/Avocado-Indian-Premium-Semi-Ripe.jpeg" },
  { name: "Banana", price: 30, category: "Fruits", image: "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/9c470ed5-1723-4f8b-96a7-6f869dc1fa5b/Banana.png" },
  { name: "Milk", price: 60, category: "Dairy", image: "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/8d80a394-1cd3-4be4-9fff-abeaeea7a9a6/Mother-Dairy-Full-Cream-Milk.png" },
  { name: "Bread", price: 40, category: "Bakery", image: "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/4f44eb8d-9ca5-4282-90aa-0916c7980b8c/Harvest-Gold-White-Bread.png" },
  { name: "Rice", price: 80, category: "Grains", image: "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/bf4f32ed-f962-498e-80ff-948405d833af/Daily-Good-Sona-Masoori-Raw-Rice.jpeg" },
  { name: "Chicken", price: 200, category: "Meat", image: "https://cdn.zeptonow.com/production/ik-seo/tr:w-470,ar-1200-1200,pr-true,f-auto,q-40,dpr-2/cms/product_variant/eac15f0f-0a34-46dc-a94b-87cadd0b2121/Fresh-Chicken.png" }
];

Product.deleteMany({}).then(() => {
  Product.insertMany(products).then(() => {
    console.log("Seeded");
    mongoose.connection.close();
  });
});