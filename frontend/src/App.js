import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [location, setLocation] = useState("Delhi");
  const [page, setPage] = useState("home");
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", image: "" });
  const [address, setAddress] = useState({ name: "", phone: "", line: "", city: "Delhi", pincode: "" });

  const [user, setUser] = useState(null);
  const [mobileInput, setMobileInput] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    // Commenting out login: set user to dummy to bypass auth
    setUser({ mobile: "dummy", token: "dummy" });

    const token = localStorage.getItem("authToken");
    if (token) {
      axios.get("http://localhost:5001/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUser({ mobile: res.data.mobile, token }))
      .catch(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userMobile");
        setUser(null);
      });
    }

    axios.get("http://localhost:5001/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));

    axios.get("http://localhost:5001/api/orders")
      .then(res => setOrders(res.data))
      .catch(err => console.log(err));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const saveProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Please provide name and price");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/api/products", {
        ...newProduct,
        price: Number(newProduct.price)
      });
      setProducts([...products, response.data]);
      setNewProduct({ name: "", price: "", category: "", image: "" });
      setPage("home");
    } catch (err) {
      console.error(err);
      alert("Failed to add product");
    }
  };

  const goToAddress = () => {
    if (cart.length === 0) {
      alert("Please add at least one item to cart first.");
      return;
    }
    setPage("address");
  };

  const goToPayment = () => {
    if (!address.name || !address.phone || !address.line || !address.pincode) {
      alert("Please complete address details.");
      return;
    }
    setPage("payment");
  };

  const [orders, setOrders] = useState([]);

  const completeOrder = async () => {
    const grouped = cart.reduce((acc, item) => {
      const key = item._id || item.name;
      if (!acc[key]) acc[key] = { ...item, qty: 0 };
      acc[key].qty += 1;
      return acc;
    }, {});

    const items = Object.values(grouped).map(i => ({
      productId: i._id,
      name: i.name,
      price: i.price,
      qty: i.qty
    }));

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    try {
      const res = await axios.post("http://localhost:5001/api/orders", { items, total, address });
      setOrders([res.data, ...orders]);
      alert(`Order placed! Total amount ₹${total}`);
      setCart([]);
      setPage("home");
    } catch (err) {
      console.error(err);
      alert("Order failed, please try again.");
    }
  };

  const sendOtp = async () => {
    if (!/^[6-9][0-9]{9}$/.test(mobileInput)) {
      setOtpError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5001/api/auth/send-otp", { mobile: mobileInput });
      setOtpSent(true);
      setOtpError("");
      alert(`OTP sent (a mock) - use code: ${response.data.otp}`);
    } catch (error) {
      setOtpError(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post("http://localhost:5001/api/auth/verify-otp", { mobile: mobileInput, otp });
      const { token, mobile } = response.data;
      setUser({ mobile, token });
      localStorage.setItem("authToken", token);
      localStorage.setItem("userMobile", mobile);
      setOtp("");
      setMobileInput("");
      setOtpSent(false);
      setOtpError("");
      setPage("home");
    } catch (error) {
      setOtpError(error.response?.data?.message || "OTP verification failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userMobile");
    setUser(null);
    setPage("home");
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "All" || product.category === selectedCategory)
  );

  const categories = ["All", ...new Set(products.map(p => p.category))];

  {/* Commented out login with phone code
  if (!user) {
    return (
      <div className="auth-page">
        <h2>Login with Mobile OTP</h2>
        <input
          type="text"
          placeholder="Enter mobile number"
          value={mobileInput}
          onChange={(e) => setMobileInput(e.target.value)}
        />
        <button onClick={sendOtp}>Send OTP</button>
        {otpSent && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOtp}>Verify OTP</button>
          </>
        )}
        {otpError && <p className="otp-error">{otpError}</p>}
      </div>
    );
  }
  */}

  return (
    <div className="app">
      <header className="header">
        <div className="location">
          📍 {location}
          <button className="location-btn" onClick={() => setLocation("Delhi")}>Change to Delhi</button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="user-block">
          <span>{user ? `Hi, +91 ${user.mobile}` : "Guest"}</span>
          {/* <button onClick={logout}>Logout</button> */}
        </div>
        <div className="cart-icon" onClick={goToAddress} style={{ cursor: "pointer" }}>🛒 ({cart.length})</div>
      </header>

      <div className="navigation">
        <button onClick={() => setPage("home")}>Shop</button>
        <button onClick={() => setPage("create")}>Create Product</button>
        <button onClick={goToAddress}>Checkout</button>
        <button onClick={() => setPage("orders")}>Orders</button>
      </div>

      {page === "create" && (
        <div className="create-page">
          <h2>Create New Product</h2>
          <input
            placeholder="Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            placeholder="Category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          />
          <input
            placeholder="Image URL"
            value={newProduct.image}
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
          />
          <button onClick={saveProduct}>Add Product</button>
        </div>
      )}

      {page === "address" && (
        <div className="address-page">
          <h2>Delivery Address</h2>
          <div className="cart-preview">
            {cart.length === 0 ? <p>Cart is empty</p> : cart.map((item, idx) => (
              <div key={idx}>{item.name} - ₹{item.price} <button onClick={() => removeFromCart(idx)}>Remove</button></div>
            ))}
          </div>
          <input
            placeholder="Name"
            value={address.name}
            onChange={(e) => setAddress({ ...address, name: e.target.value })}
          />
          <input
            placeholder="Phone"
            value={address.phone}
            onChange={(e) => setAddress({ ...address, phone: e.target.value })}
          />
          <input
            placeholder="Address Line"
            value={address.line}
            onChange={(e) => setAddress({ ...address, line: e.target.value })}
          />
          <input
            placeholder="Pincode"
            value={address.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
          />
          <button onClick={goToPayment}>Proceed to Payment</button>
        </div>
      )}

      {page === "payment" && (
        <div className="payment-page">
          <h2>Payment</h2>
          <p>Delivering to: {address.name}, {address.line}, {address.city} {address.pincode}</p>
          <p>Total: ₹{cart.reduce((sum, p) => sum + p.price, 0)}</p>
          <button onClick={completeOrder}>Confirm Payment</button>
        </div>
      )}

      {page === "orders" && (
        <div className="orders-page">
          <h2>Order History</h2>
          {orders.length === 0 ? <p>No orders yet.</p> : orders.map(o => (
            <div key={o._id} className="order-card">
              <p><strong>Order #</strong> {o._id.slice(-6)} – {new Date(o.createdAt).toLocaleString()}</p>
              <p><strong>Total</strong>: ₹{o.total}</p>
              <p><strong>Status</strong>: {o.status}</p>
              <div>
                {o.items.map(item => (
                  <p key={`${o._id}-${item.productId}`}>{item.name} x{item.qty} = ₹{item.price * item.qty}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {page === "home" && (
        <>
          <div className="categories">
            {categories.map(cat => (
              <button
                key={cat}
                className={selectedCategory === cat ? "active" : ""}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="products">
            {filteredProducts.length === 0 ? (
              <p>No products found</p>
            ) : (
              filteredProducts.map((p) => (
                <div key={p._id || p.name} className="product-card">
                  <img src={p.image || "https://via.placeholder.com/150"} alt={p.name} />
                  <h3>{p.name}</h3>
                  <p>₹{p.price}</p>
                  <button onClick={() => addToCart(p)}>Add to Cart</button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <footer className="footer">
        <div>Home</div>
        <div>Categories</div>
        <div>Cart ({cart.length})</div>
        <div>Account</div>
      </footer>
    </div>
  );
}

export default App;