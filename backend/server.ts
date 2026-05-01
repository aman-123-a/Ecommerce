import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import { db } from "./db/index.js";
import { users, products, orders } from "./db/schema.js";
import { eq, desc } from "drizzle-orm";

const app = express();
app.use(cors());
app.use(express.json());

const otpStore: Record<string, { code: string, expiresAt: number }> = {};
const sessions: Record<string, string> = {};

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
    let userRecord = await db.select().from(users).where(eq(users.mobile, mobile)).limit(1);
    let user = userRecord[0];
    
    if (!user) {
      const inserted = await db.insert(users).values({ mobile }).returning();
      user = inserted[0];
    }

    const token = generateToken();
    sessions[token] = mobile;
    res.json({ token, mobile, user });
  } catch (err: any) {
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
    const userRecord = await db.select().from(users).where(eq(users.mobile, mobile)).limit(1);
    const user = userRecord[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err: any) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ message: "Could not fetch profile" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
    res.json(allProducts);
  } catch (err: any) {
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
    const [product] = await db.insert(products).values({
      name,
      price,
      category,
      image,
      stock: stock != null ? stock : 100
    }).returning();
    res.json(product);
  } catch (err: any) {
    console.error("Product creation error:", err.message);
    res.status(500).json({ message: "Could not create product" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await db.delete(products).where(eq(products.id, parseInt(req.params.id)));
    res.json({ message: "Deleted" });
  } catch (err: any) {
    console.error("Product delete error:", err.message);
    res.status(500).json({ message: "Could not delete product" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    res.json(allOrders);
  } catch (err: any) {
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

      const productRecords = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      const product = productRecords[0];
      
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      if (product.stock == null || product.stock < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      await db.update(products).set({ stock: product.stock - item.qty }).where(eq(products.id, product.id));
    }

    const [order] = await db.insert(orders).values({
      total,
      address,
      items
    }).returning();

    res.json(order);
  } catch (err: any) {
    console.error("Order creation error:", err.message);
    res.status(500).json({ message: "Could not create order" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json(allUsers);
  } catch (err: any) {
    console.error("Users fetch error:", err.message);
    res.status(500).json({ message: "Could not fetch users" });
  }
});

export const handler = serverless(app, { basePath: '/.netlify/functions/server' });
