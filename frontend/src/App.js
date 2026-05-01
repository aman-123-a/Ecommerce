import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const CartIcon = () => (
    <svg className="cart-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 4H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 4L5 13H19L21 6H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 19C16.5523 19 17 18.5523 17 18C17 17.4477 16.5523 17 16 17C15.4477 17 15 17.4477 15 18C15 18.5523 15.4477 19 16 19Z" fill="currentColor" />
      <path d="M8 19C8.55228 19 9 18.5523 9 18C9 17.4477 8.55228 17 8 17C7.44772 17 7 17.4477 7 18C7 18.5523 7.44772 19 8 19Z" fill="currentColor" />
    </svg>
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [location, setLocation] = useState("Delhi");
  const [page, setPage] = useState("home");
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", image: "" });
  const [address, setAddress] = useState({ name: "", phone: "", line: "", city: "Delhi", pincode: "" });

  const cartQuantity = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const getCartKey = (item) => item._id || item.name;
  const updateCart = (updater) => {
    setCart((prev) => {
      const next = updater(prev);
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  const addToCart = (product) => {
    updateCart((prev) => {
      const key = getCartKey(product);
      const exists = prev.find((item) => getCartKey(item) === key);
      if (exists) {
        return prev.map((item) =>
          getCartKey(item) === key ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const decreaseFromCart = (product) => {
    updateCart((prev) => {
      const key = getCartKey(product);
      return prev.flatMap((item) => {
        if (getCartKey(item) !== key) return item;
        if (item.qty > 1) return { ...item, qty: item.qty - 1 };
        return [];
      });
    });
  };

  const removeFromCart = (product) => {
    updateCart((prev) => prev.filter((item) => getCartKey(item) !== getCartKey(product)));
  };

  const [user, setUser] = useState(null);
  const [mobileInput, setMobileInput] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      axios.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUser({ mobile: res.data.mobile, token }))
      .catch(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userMobile");
        setUser(null);
      });
    }

    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse stored cart", e);
      }
    }

    axios.get("/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));

    axios.get("/api/orders")
      .then(res => setOrders(res.data))
      .catch(err => console.log(err));
  }, []);

  const saveProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Please provide name and price");
      return;
    }

    try {
      const response = await axios.post("/api/products", {
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
    if (cartQuantity === 0) {
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
      const res = await axios.post("/api/orders", { items, total, address });
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
    setIsLoading(true);
    setOtpError("");
    try {
      const response = await axios.post("/api/auth/send-otp", { mobile: mobileInput });
      setOtpSent(true);
      setOtpError("");
      alert(`OTP sent! Use code: ${response.data.otp}`);
    } catch (error) {
      setOtpError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setOtpError("Please enter the OTP");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/verify-otp", { mobile: mobileInput, otp });
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
    } finally {
      setIsLoading(false);
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

  // Login UI
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <div className="logo">🛒 Quickway</div>
            <h2>Welcome Back</h2>
            <p>Sign in to continue shopping</p>
          </div>

          <div className="auth-form">
            <div className="input-group">
              <label>Mobile Number</label>
              <div className="phone-input">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value)}
                  maxLength="10"
                  disabled={otpSent}
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                className="auth-btn primary"
                onClick={sendOtp}
                disabled={isLoading || !mobileInput}
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <>
                <div className="input-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    placeholder="Enter 4-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="4"
                  />
                </div>

                <button
                  className="auth-btn primary"
                  onClick={verifyOtp}
                  disabled={isLoading || !otp}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  className="auth-btn secondary"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setOtpError("");
                  }}
                  disabled={isLoading}
                >
                  Change Number
                </button>
              </>
            )}

            {otpError && <p className="error-message">{otpError}</p>}
          </div>

          <div className="auth-footer">
            <p>By continuing, you agree to our Terms & Privacy Policy</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="modern-header">
        <div className="header-container">
          <div className="header-brand">
            <div className="logo">🛒 Quickway</div>
          </div>
          
          <div className="header-search">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>
          </div>

          <div className="header-actions">
            <div className="location-selector">
              <button className="action-btn location-btn">
                <span>📍</span>
                <span className="location-text">{location}</span>
              </button>
            </div>

            <div className="user-account">
              <button className="action-btn user-btn">
                <span>👤</span>
                <span className="account-text">{user && user.mobile ? `+91 ${user.mobile.slice(-4)}` : "Sign In"}</span>
              </button>
              {user && (
                <button className="action-btn logout-btn" onClick={logout}>
                  <span>🚪</span>
                  <span className="logout-text">Logout</span>
                </button>
              )}
            </div>

                <button className="action-btn cart-btn" onClick={goToAddress}>
              <CartIcon />
              {cartQuantity > 0 && <span className="cart-badge">{cartQuantity}</span>}
            </button>
          </div>
        </div>
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
            {cartQuantity === 0 ? (
              <p>Cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={getCartKey(item)} className="cart-item-row">
                  <div>
                    {item.name} x{item.qty} - ₹{item.price * item.qty}
                  </div>
                  <div className="qty-controls">
                    <button onClick={() => decreaseFromCart(item)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => addToCart(item)}>+</button>
                    <button className="remove-btn" onClick={() => removeFromCart(item)}>Remove</button>
                  </div>
                </div>
              ))
            )}
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
          <p>Total: ₹{cartTotal}</p>
          <button onClick={completeOrder}>Confirm Payment</button>
        </div>
      )}

      {page === "orders" && (
        <div className="orders-page">
          <h2>Order History</h2>
          {orders.length === 0 ? <p>No orders yet.</p> : orders.map(o => (
            <div key={o._id} className="order-card">
              <p><strong>Order #</strong> {o._id && typeof o._id === 'string' ? o._id.slice(-6) : 'N/A'} – {o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'}</p>
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
              filteredProducts.map((p) => {
                const cartItem = cart.find((item) => getCartKey(item) === getCartKey(p));
                return (
                  <div key={getCartKey(p)} className="product-card">
                    <img src={p.image || "https://via.placeholder.com/150"} alt={p.name} />
                    <h3>{p.name}</h3>
                    <p>₹{p.price}</p>
                    {cartItem ? (
                      <div className="product-qty-controls">
                        <button onClick={() => decreaseFromCart(p)}>-</button>
                        <span>{cartItem.qty}</span>
                        <button onClick={() => addToCart(p)}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)}>Add to Cart</button>
                    )}
                  </div>
                );
              })
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