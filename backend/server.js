const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quickway", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  mobile: { type: String, unique: true, required: true },
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: String,
  image: String,
  stock: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  total: { type: Number, required: true },
  address: {
    name: String,
    phone: String,
    line: String,
    city: String,
    pincode: String
  },
  status: { type: String, default: "Pending" },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      qty: Number
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);

const otpStore = {};
const sessions = {};

const generateToken = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

app.post("/api/auth/send-otp", (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !/^[6-9][0-9]{9}$/.test(mobile)) {
    return res.status(400).json({ message: "Valid mobile required" });
  }

  const code = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[mobile] = { code, expiresAt: Date.now() + 1000 * 60 * 5 };

  console.log(`(Mock) OTP for ${mobile}: ${code}`);
  res.json({ message: "OTP sent", otp: code });
});

app.post("/api/auth/verify-otp", async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    return res.status(400).json({ message: "Mobile and OTP required" });
  }

  const record = otpStore[mobile];
  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ message: "OTP expired or missing" });
  }
  if (record.code !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  delete otpStore[mobile];

  try {
    const user = await User.findOneAndUpdate(
      { mobile },
      { mobile },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const token = generateToken();
    sessions[token] = mobile;
    res.json({ token, mobile, user });
  } catch (err) {
    console.error("User save error:", err.message);
    res.status(500).json({ message: "Could not verify user" });
  }
});

app.get("/api/auth/profile", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  const mobile = sessions[token];
  if (!mobile) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ message: "Could not fetch profile" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Products fetch error:", err.message);
    res.status(500).json({ message: "Could not fetch products" });
  }
});

app.post("/api/products", async (req, res) => {
  const { name, price, category, image, stock } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  try {
    const product = await Product.create({
      name,
      price,
      category,
      image,
      stock: stock != null ? stock : 100
    });
    res.json(product);
  } catch (err) {
    console.error("Product creation error:", err.message);
    res.status(500).json({ message: "Could not create product" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Product delete error:", err.message);
    res.status(500).json({ message: "Could not delete product" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Orders fetch error:", err.message);
    res.status(500).json({ message: "Could not fetch orders" });
  }
});

app.post("/api/orders", async (req, res) => {
  const { items, total, address } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0 || total == null || !address) {
    return res.status(400).json({ message: "Order items, total, and address are required" });
  }

  try {
    for (const item of items) {
      if (!item.productId || !item.qty) {
        return res.status(400).json({ message: "Each order item must contain productId and qty" });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      product.stock -= item.qty;
      await product.save();
    }

    const order = await Order.create({
      total,
      address,
      items
    });

    res.json(order);
  } catch (err) {
    console.error("Order creation error:", err.message);
    res.status(500).json({ message: "Could not create order" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Users fetch error:", err.message);
    res.status(500).json({ message: "Could not fetch users" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
