const express = require("express");
const path = require("path");
const connection = require("./database");
const app = express();
const port = 3007;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from 'public' folder

// Endpoint to get all products
app.get("/products", (req, res) => {
  const query = "SELECT DISTINCT product_name FROM pricefull";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Error fetching products" });
      return;
    }
    res.json(results);
  });
});

// Endpoint to get product specifications
app.get("/product-specifications", (req, res) => {
  const productName = req.query.productName;
  console.log("Product Name received:", productName); // Log for debugging
  const query =
    "SELECT DISTINCT product_specification FROM pricefull WHERE product_name = ?";
  connection.query(query, [productName], (err, results) => {
    if (err) {
      console.error("Error fetching product specifications:", err);
      res.status(500).json({ error: "Error fetching product specifications" });
      return;
    }
    console.log("Specifications fetched:", results); // Log for debugging
    res.json(results);
  });
});

// Endpoint to get product price based on product name and specification
app.get("/product-price", (req, res) => {
  const { productName, productSpecification } = req.query;
  const query = `
    SELECT price_perm2
    FROM pricefull
    WHERE product_name = ? AND product_specification = ?
  `;
  connection.query(
    query,
    [productName, productSpecification],
    (err, results) => {
      if (err) {
        console.error("Error fetching product price:", err);
        res.status(500).json({ error: "Error fetching product price" });
        return;
      }
      if (results.length === 0) {
        res.status(404).json({ error: "Product price not found" });
        return;
      }
      res.json(results[0]);
    }
  );
});

// Endpoint to handle sign-up form submission
app.post("/signup", (req, res) => {
  const { fullname, email, password } = req.body;

  // Check if the user already exists
  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  connection.query(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.error("Error checking user:", err);
      res.status(500).json({ error: "Server error" });
      return;
    }

    if (results.length > 0) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    // Insert new user into the database
    const insertUserQuery =
      "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)";
    connection.query(
      insertUserQuery,
      [fullname, email, password],
      (err, result) => {
        if (err) {
          console.error("Error inserting user:", err);
          res.status(500).json({ error: "Server error" });
          return;
        }
        res.json({ message: "User registered successfully" });
      }
    );
  });
});

// Endpoint to create a new order
app.post("/create-order", (req, res) => {
  const orderData = req.body;
  console.log("Received order data:", orderData); // Log received data

  const sql = `INSERT INTO customer_order 
               (staff_name, designer, customer_name, phone_no, payment_method, delivery_method, discount, amount_to_pay, note) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    orderData.staffName,
    orderData.designer,
    orderData.customerName,
    orderData.phoneNo,
    orderData.paymentMethod,
    orderData.deliveryMethod,
    orderData.discount,
    orderData.amountToPay,
    orderData.note,
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting order:", err);
      res.status(500).json({ error: "Error inserting order" });
      return;
    }
    res.json({ order_id: result.insertId }); // Ensure this is a JSON response
  });
});

// Endpoint to add a cart item
app.post("/add-cart-item", (req, res) => {
  const cartItemData = req.body;
  console.log("Received cart item data:", cartItemData); // Log received data

  const sql = `INSERT INTO cart_items 
               (product_name, product_specification, total_money, note, order_id) 
               VALUES (?, ?, ?, ?, ?)`;

  const values = [
    cartItemData.productName,
    cartItemData.productSpecification,
    cartItemData.totalMoney,
    cartItemData.note,
    cartItemData.orderId,
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting cart item:", err);
      res.status(500).json({ error: "Error inserting cart item" });
      return;
    }
    res.json({ message: "Cart item added successfully" }); // Ensure this is a JSON response
  });
});

// Serve the sign-up page
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "HTML", "signup.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
