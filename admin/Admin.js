import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });

  useEffect(() => {
    axios.get("/api/products")
      .then(res => setProducts(res.data));
  }, []);

  return (
    <div>
      <h1>Admin Panel</h1>
      <input placeholder="Name" onChange={e => setForm({...form, name:e.target.value})}/>
      <input placeholder="Price" onChange={e => setForm({...form, price:e.target.value})}/>
      <button onClick={() => axios.post("/api/products", form)}>Add</button>

      {products.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
