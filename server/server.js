const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const excel = require("exceljs");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware

// prod cors cfg

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// dev cors cfg
// app.use(cors());

app.use(bodyParser.json());

// prod mysql cfg
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// dev mysql cfg
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   database: "POS_NSHM",
// });

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to database.");

  // Create database if not exists
  // db.query("CREATE DATABASE IF NOT EXISTS POS_NSHM", (err) => {
  //   if (err) throw err;
  //   console.log("Database created or already exists.");

  //   // Use the database
  //   db.query("USE POS_NSHM", (err) => {
  //     if (err) throw err;

  //     // Create table if not exists
  //     const createTableQuery = `
  //       CREATE TABLE IF NOT EXISTS users (
  //         id INT AUTO_INCREMENT PRIMARY KEY,
  //         name VARCHAR(255) NOT NULL,
  //         username VARCHAR(255) NOT NULL UNIQUE,
  //         email VARCHAR(255) NOT NULL UNIQUE,
  //         organization VARCHAR(255) NOT NULL,
  //         location VARCHAR(255) NOT NULL,
  //         reason TEXT NOT NULL,
  //         desired_role VARCHAR(255) NOT NULL,
  //         status ENUM('null', 'accepted', 'rejected','accepted as admin') DEFAULT 'null',
  //         password VARCHAR(255) NOT NULL
  //       )
  //     `;
  //     db.query(createTableQuery, (err) => {
  //       if (err) throw err;
  //       console.log("Table created or already exists.");
  //     });
  //   });
  // });
});

// Register endpoint
app.post("/register", (req, res) => {
  const {
    name,
    username,
    email,
    organization,
    location,
    reason,
    desiredRole,
    password,
  } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.query(
    "INSERT INTO users (name, username, email, organization, location, reason, desired_role, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      username,
      email,
      organization,
      location,
      reason,
      desiredRole,
      hashedPassword,
    ],
    (err, result) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(500).send({
          message: "Either an error occurred or user is already registered",
        });
      }
      res.status(201).send({ message: "User registered" });
    }
  );
});

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        return res.status(500).send({ message: "Error logging in" });
      }
      if (results.length === 0) {
        return res.status(404).send({ message: "User not found" });
      }

      const user = results[0];
      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).send({ message: "Invalid password" });
      }

      if (!user.status.includes("accepted")) {
        return res.status(403).send({ message: "User not accepted" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).send({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          organization: user.organization,
        },
        token: token,
      });
    }
  );
});
// Submit Issue endpoint
app.post("/submitIssue", (req, res) => {
  const { username, name, email, organization, issue } = req.body;
  db.query(
    `CREATE TABLE IF NOT EXISTS ISSUES(
      id INT AUTO_INCREMENT PRIMARY KEY,
      username varchar(255),
      name varchar(255),
      email varchar(255),
      issue varchar(255)
    );`,
    (err) => {
      if (err) throw err;
      console.log("Table created or already exists.");
    }
  );
  db.query(
    `INSERT INTO ISSUES (username, name, email, issue) VALUES (?, ?, ?, ?)`
  ),
    [username, name, email, issue],
    (err, result) => {
      if (err) {
        console.log("Error submitting issue");
        return res.status(500).send({
          message: "Error submitting issue",
        });
      }
    };
});
// Admin login endpoint
app.post("/adminLogin", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        return res.status(500).send({ message: "Error logging in" });
      }
      if (results.length === 0) {
        return res.status(404).send({ message: "User not found" });
      }

      const user = results[0];
      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).send({ message: "Invalid password" });
      }

      if (!user.status.includes("accepted as admin")) {
        return res.status(403).send({ message: "User not accepted as admin" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).send({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          location: user.location,
        },
        token: token,
      });
    }
  );
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).send({ message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    req.userId = decoded.id;
    next();
  });
};

// Dashboard endpoint
app.get("/dashboard", verifyToken, (req, res) => {
  res.status(200).send({ message: "success" });
});

app.get("/admin/requests", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching requests:", err);
      return res.status(500).send({ message: "Error fetching requests" });
    }
    res.status(200).send(results);
  });
});

app.get("/admin/itemCategories", verifyToken, (req, res) => {
  const query = `
  SELECT * from item_categories
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log("Error fetching categories", err);
      res.status(500).send({ message: "Error fetching categories" });
    }
    res.status(200).send(results);
  });
});

app.get("/admin/vendors", verifyToken, (req, res) => {
  const query = `
  SELECT * from requisition_vendors
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log("Error fetching vendors", err);
      res.status(500).send({ message: "Error fetching vendors" });
    }
    res.status(200).send(results);
  });
});
app.get("/admin/departments", verifyToken, (req, res) => {
  const query = `
  SELECT * from departments
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log("Error fetching departments", err);
      res.status(500).send({ message: "Error fetching departments" });
    }
    res.status(200).send(results);
  });
});

app.get("/admin/purchaseRequisitions", verifyToken, (req, res) => {
  const requisitionsQuery = `
    SELECT requisition_id, name, username, email, selected_vendor, department, status, required_on, required_by, created_at
    FROM purchaseRequisitions;
  `;

  db.query(requisitionsQuery, (err, requisitions) => {
    if (err) {
      console.error("Error fetching requisitions:", err);
      return res.status(500).send({ message: "Error fetching requisitions" });
    }

    if (requisitions.length === 0) {
      return res.status(200).send([]); // Return empty array if no requisitions exist
    }

    // Fetch items separately
    const itemsQuery = `
      SELECT requisition_id, item_id, item_name, quantity, estimated_cost, category, specification
      FROM requisition_items;
    `;

    db.query(itemsQuery, (err, items) => {
      if (err) {
        console.error("Error fetching requisition items:", err);
        return res
          .status(500)
          .send({ message: "Error fetching requisition items" });
      }

      // Map items to their respective requisition_id
      const itemsMap = {};
      items.forEach((item) => {
        if (!itemsMap[item.requisition_id]) {
          itemsMap[item.requisition_id] = [];
        }
        itemsMap[item.requisition_id].push({
          id: item.item_id,
          name: item.item_name,
          quantity: item.quantity,
          cost: item.estimated_cost,
          category: item.category,
          specification: item.specification,
        });
      });

      // Attach items to requisitions
      requisitions.forEach((req) => {
        req.items = itemsMap[req.requisition_id] || [];
      });

      res.status(200).send(requisitions);
    });
  });
});

// Update status of a user request
app.put("/admin/requests/:id", verifyToken, (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  db.query(
    "UPDATE users SET status = ? WHERE id = ?",
    [status, requestId],
    (err, result) => {
      if (err) {
        console.error("Error updating request:", err);
        return res.status(500).send({ message: "Error updating request" });
      }
      res.status(200).send({ message: "Request updated" });
    }
  );
});
app.put("/admin/requisitions/:id", verifyToken, (req, res) => {
  const requisitionId = req.params.id;
  const { status } = req.body;

  db.query(
    "UPDATE purchaseRequisitions SET status = ? WHERE requisition_id = ?",
    [status, requisitionId],
    (err, result) => {
      if (err) {
        console.error("Error updating requisition status:", err);
        return res
          .status(500)
          .send({ message: "Error updating requisition status" });
      }
      res.status(200).send({ message: "Requisition status updated" });
    }
  );
});

// Add Category

app.post("/addCategory", verifyToken, (req, res) => {
  const { cat_name, description } = req.body;

  // Input validation
  if (!cat_name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  const query =
    "INSERT INTO item_categories (category_name, description) VALUES (?, ?)";
  const values = [cat_name, description || ""];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting category:", err);
      return res.status(500).json({ error: "Failed to add category." });
    }

    res.status(201).json({
      message: "category added successfully.",
      departmentId: result.insertId,
    });
  });
});

// Get vendor by name

app.get("/vendor/:selectedVendor", verifyToken, (req, res) => {
  const { selectedVendor } = req.params;

  const query = "SELECT * FROM requisition_vendors WHERE vendor_name = ?";

  db.query(query, [selectedVendor], (err, results) => {
    if (err) {
      console.error("Error fetching vendor data:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      res.json({ vendor: results[0] });
    } else {
      res.status(404).json({ error: "Vendor not found" });
    }
  });
});

// Add vendor
app.post("/addVendor", verifyToken, (req, res) => {
  const {
    vendor_name,
    vendor_contact_person,
    vendor_email_id,
    vendor_address,
    vendor_GSTIN,
    vendor_contact,
    vendor_TIN,
    vendor_VAT,
  } = req.body;

  // Input validation
  if (!vendor_name || !vendor_contact || !vendor_email_id) {
    return res
      .status(400)
      .json({ error: "Vendor name, contact, and email are required." });
  }

  // You can add more validation for fields like email, GSTIN, etc., if needed
  const emailPattern = /\S+@\S+\.\S+/;
  if (vendor_email_id && !emailPattern.test(vendor_email_id)) {
    return res.status(400).json({ error: "Invalid email address format." });
  }

  const query =
    "INSERT INTO requisition_vendors (vendor_name, vendor_contact_person, vendor_email_id, vendor_address, vendor_GSTIN, vendor_contact, vendor_TIN, vendor_VAT) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [
    vendor_name,
    vendor_contact_person || "",
    vendor_email_id || "",
    vendor_address || "",
    vendor_GSTIN || "",
    vendor_contact,
    vendor_TIN || "",
    vendor_VAT || "",
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting vendor:", err);
      return res.status(500).json({ error: "Failed to add vendor." });
    }

    res.status(201).json({
      message: "Vendor added successfully.",
      vendorId: result.insertId,
    });
  });
});

// Add department
app.post("/addDepartment", verifyToken, (req, res) => {
  const { dept_name, description } = req.body;

  // Input validation
  if (!dept_name) {
    return res
      .status(400)
      .json({ error: "Both dept_name and description are required." });
  }

  const query =
    "INSERT INTO departments (dept_name, description) VALUES (?, ?)";
  const values = [dept_name, description || ""];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting department:", err);
      return res.status(500).json({ error: "Failed to add department." });
    }

    res.status(201).json({
      message: "Department added successfully.",
      departmentId: result.insertId,
    });
  });
});

// Delete Department

app.delete("/departments/:id", verifyToken, (req, res) => {
  const departmentId = req.params.id;

  const sqlQuery = "DELETE FROM departments WHERE dept_id = ?";

  db.query(sqlQuery, [departmentId], (err, result) => {
    if (err) {
      console.error("Error deleting department:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete department" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Department deleted successfully" });
  });
});

// Delete Vendor

app.delete("/vendors/:id", verifyToken, (req, res) => {
  const vendorId = req.params.id;

  const sqlQuery = "DELETE FROM requisition_vendors WHERE vendor_id = ?";

  db.query(sqlQuery, [vendorId], (err, result) => {
    if (err) {
      console.error("Error deleting vendor:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete vendor" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Vendor deleted successfully" });
  });
});

// Delete Category

app.delete("/categories/:id", verifyToken, (req, res) => {
  const categoryId = req.params.id;

  const sqlQuery = "DELETE FROM item_categories WHERE category_id = ?";

  db.query(sqlQuery, [categoryId], (err, result) => {
    if (err) {
      console.error("Error deleting category:", err);
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete category" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "category not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "category deleted successfully" });
  });
});

// Add Requisition endpoint
app.post("/addRequisitions", verifyToken, (req, res) => {
  const {
    user_id,
    name,
    username,
    email,
    department,
    selected_vendor,
    status,
    items, // Array of items
    required_on, // New field
    required_by, // New field
  } = req.body;

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).send({ message: "Transaction error" });
    }

    const insertRequisitionQuery = `
      INSERT INTO purchaseRequisitions (user_id, name, username, email, department, selected_vendor, status, required_on, required_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertRequisitionQuery,
      [
        user_id,
        name,
        username,
        email,
        department,
        selected_vendor,
        status,
        required_on !== "" || required_on ? required_on : null,
        required_by !== "" || required_by ? required_by : null,
      ],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error adding requisition:", err);
            res.status(500).send({ message: "Error adding requisition" });
          });
        }

        const requisitionId = result.insertId;
        const insertItemsQuery = `
          INSERT INTO requisition_items (requisition_id, item_name, quantity, estimated_cost, category, specification)
          VALUES ?
        `;

        const itemsValues = items.map((item) => [
          requisitionId,
          item.item_name,
          item.quantity,
          item.estimated_cost,
          item.category,
          item.specification,
        ]);

        db.query(insertItemsQuery, [itemsValues], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error adding items:", err);
              res.status(500).send({ message: "Error adding items" });
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error committing transaction:", err);
                res
                  .status(500)
                  .send({ message: "Error committing transaction" });
              });
            }

            res.status(201).send({ message: "Requisition added successfully" });
          });
        });
      }
    );
  });
});

// Update requisition endpoint
app.put("/editRequisition", verifyToken, (req, res) => {
  const {
    requisition_id,
    user_id,
    name,
    username,
    email,
    department,
    selected_vendor,
    status,
    items, // Array of items
    required_on, // New field
    required_by, // New field
  } = req.body;

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).send({ message: "Transaction error" });
    }

    const updateRequisitionQuery = `
      UPDATE purchaseRequisitions
      SET selected_vendor = ?, status = ?, department = ?, required_on = ?, required_by = ?
      WHERE requisition_id = ?
    `;

    db.query(
      updateRequisitionQuery,
      [
        selected_vendor,
        status,
        department,
        required_on !== "" || required_on ? required_on : null,
        required_by !== "" || required_by ? required_by : null,
        requisition_id,
      ],
      (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error updating requisition:", err);
            res.status(500).send({ message: "Error updating requisition" });
          });
        }

        const deleteItemsQuery = `DELETE FROM requisition_items WHERE requisition_id = ?`;
        db.query(deleteItemsQuery, [requisition_id], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error deleting old items:", err);
              res.status(500).send({ message: "Error deleting old items" });
            });
          }

          const insertItemsQuery = `
            INSERT INTO requisition_items (requisition_id, item_name, quantity, estimated_cost, category, specification)
            VALUES ?
          `;

          const itemsValues = items.map((item) => [
            requisition_id,
            item.item_name,
            item.quantity,
            item.estimated_cost,
            item.category,
            item.specification,
          ]);

          db.query(insertItemsQuery, [itemsValues], (err) => {
            if (err) {
              return db.rollback(() => {
                console.error("Error adding new items:", err);
                res.status(500).send({ message: "Error adding new items" });
              });
            }

            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("Error committing transaction:", err);
                  res
                    .status(500)
                    .send({ message: "Error committing transaction" });
                });
              }

              res
                .status(200)
                .send({ message: "Requisition updated successfully" });
            });
          });
        });
      }
    );
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("Server is alive");
});

function keepAlive() {
  setInterval(async () => {
    try {
      const res = await axios.get(`${process.env.SERVER_URl}/health`);
      console.log(`Keep-alive ping successful: ${res.status}`);
    } catch (error) {
      console.error("Keep-alive failed:", error.message);
    }
  }, 10 * 60 * 1000);
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  keepAlive();
});
