const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/zepto");

const Product = mongoose.model("Product", {
  name: String,
  price: Number,
  category: String,
  image: String,
  stock: { type: Number, default: 100 }
});

const Order = mongoose.model("Order", {
  items: [{ productId: mongoose.Schema.Types.ObjectId, name: String, price: Number, qty: Number }],
  total: Number,
  address: {
    name: String,
    phone: String,
    line: String,
    city: String,
    pincode: String
  },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

const otpStore = {}; // { mobile: { code, expiresAt } }
const sessions = {}; // token => mobile

const generateToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);


app.post("/api/auth/send-otp", async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !/^[6-9][0-9]{9}$/.test(mobile)) {
    return res.status(400).json({ message: "Valid mobile required" });
  }
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[mobile] = { code, expiresAt: Date.now() + 1000 * 60 * 5 };

  try {
    if (twilioClient && process.env.TWILIO_FROM_NUMBER) {
      await twilioClient.messages.create({
        body: `Your Zepto OTP code is ${code}. Use this to login.`,
        from: process.env.TWILIO_FROM_NUMBER,
        to: `+91${mobile}`
      });
    } else {
      console.log(`(Mock) OTP for ${mobile}: ${code}`);
    }
    res.json({ message: "OTP sent", otp: twilioClient ? undefined : code });
  } catch (err) {
    console.error("Twilio OTP error", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

app.post("/api/auth/verify-otp", (req, res) => {
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
  const token = generateToken();
  sessions[token] = mobile;
  return res.json({ token, mobile });
});

app.get("/api/auth/profile", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = auth.split(" ")[1];
  const mobile = sessions[token];
  if (!mobile) {
    return res.status(401).json({ message: "Invalid token" });
  }
  return res.json({ mobile });
});

app.get("/api/products", async (req, res) => {
  res.json(await Product.find());
});

app.get("/api/orders", async (req, res) => {
  res.json(await Order.find().sort({ createdAt: -1 }));
});

app.post("/api/orders", async (req, res) => {
  const { items, total, address } = req.body;
  const order = await Order.create({ items, total, address });
  // reduce stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } });
  }
  res.json(order);
});

app.post("/api/products", async (req, res) => {
  res.json(await Product.create(req.body));
});

app.delete("/api/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(5001, () => console.log("Backend running on 5001"));
