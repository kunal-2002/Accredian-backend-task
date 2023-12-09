const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors(), bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: "b6ykj5ymzb7zdbgdqjxm-mysql.services.clever-cloud.com",
  user: "utd1yi25tlziis7z",
  password: "KQhcRQHiTLImBqpRteGs",
  database: "b6ykj5ymzb7zdbgdqjxm",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// User Registration
app.post("/signup", async (req, res) => {
  const { username, email, gender, phoneNumber, password, confirmPassword } =
    req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into the database
  db.query(
    "INSERT INTO users (username, email, gender, phoneNumber, password) VALUES (?, ?, ?, ?, ?)",
    [username, email, gender, phoneNumber, hashedPassword],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ error: "Username or email already exists" });
        }
        return res.status(500).json({ error: "User registration failed" });
      }
      return res.status(201).json({ message: "User registered successfully" });
    }
  );
});

// User Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Fetch user from the database
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      // Check if user exists
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check password
      const match = await bcrypt.compare(password, results[0].password);
      if (match) {
        return res.status(200).json({ message: "Login successful" });
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
