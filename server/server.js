const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const excel = require("exceljs");
const fs = require("fs");

const app = express();
const port = 3001;
const JWT_SECRET = "your_jwt_secret"; // Replace with your own secret key

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ushnish004",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to database.");

  // Create database if not exists
  db.query("CREATE DATABASE IF NOT EXISTS weighbridge_test", (err) => {
    if (err) throw err;
    console.log("Database created or already exists.");

    // Use the database
    db.query("USE weighbridge_test", (err) => {
      if (err) throw err;

      // Create table if not exists
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          username VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          organization VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          reason TEXT NOT NULL,
          desired_role VARCHAR(255) NOT NULL,
          status ENUM('null', 'accepted', 'rejected','accepted as admin') DEFAULT 'null',
          password VARCHAR(255) NOT NULL
        )
      `;
      db.query(createTableQuery, (err) => {
        if (err) throw err;
        console.log("Table created or already exists.");
      });
    });
  });
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

app.get("/fetchBridges", (req, res) => {
  db.query(
    "SELECT DISTINCT bridge_id, bridge_name FROM vehicle_data",
    (err, results) => {
      if (err) {
        console.error("Error fetching bridges:", err);
        return res.status(500).send({ message: "Error fetching bridges" });
      }
      res.status(200).send(results);
    }
  );
});
app.get("/fetchStates", (req, res) => {
  db.query("SELECT DISTINCT state FROM vehicle_data", (err, results) => {
    if (err) {
      console.error("Error fetching states:", err);
      return res.status(500).send({ message: "Error fetching states" });
    }
    res.status(200).send(results);
  });
});
app.get("/download-reports", async (req, res) => {
  const { bridgeName, state } = req.query;

  // Create a new workbook and worksheet
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  // Add column headers
  worksheet.columns = [
    { header: "Timestamp", key: "timestamp", width: 20 },
    { header: "Bridge ID", key: "bridge_id", width: 15 },
    { header: "Bridge Name", key: "bridge_name", width: 20 },
    { header: "Weight", key: "weight", width: 15 },
    { header: "License Plate", key: "license_plate", width: 20 },
    { header: "State", key: "state", width: 15 },
    { header: "Vehicle Type", key: "vehicle_type", width: 20 },
    { header: "Overload Status", key: "overload_status", width: 20 },
  ];

  try {
    let query = "SELECT * FROM vehicle_data WHERE 1=1";
    const params = [];

    if (bridgeName) {
      if (bridgeName !== "") {
        query += " AND bridge_name = ?";
        params.push(bridgeName);
      }
    }

    if (state) {
      if (state !== "") {
        query += " AND state = ?";
        params.push(state);
      }
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching data for report:", err);
        return res
          .status(500)
          .send({ message: "Error fetching data for report" });
      }

      // Add rows to the worksheet
      results.forEach((row) => {
        worksheet.addRow(row);
      });

      // Set response headers for file download
      res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      // Write workbook to response
      workbook.xlsx
        .write(res)
        .then(() => {
          res.end();
        })
        .catch((error) => {
          console.error("Error writing Excel file:", error);
          res.status(500).send({ message: "Error generating report" });
        });
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).send({ message: "Error generating report" });
  }
});
// Fetch vehicle updates based on bridge_name
app.get("/fetchVehicleUpdates", (req, res) => {
  const { bridge_name } = req.query;

  if (!bridge_name) {
    return res.status(400).send({ message: "bridge_name is required" });
  }

  db.query(
    "SELECT * FROM vehicle_data WHERE bridge_name = ?",
    [bridge_name],
    (err, results) => {
      if (err) {
        console.error("Error fetching vehicle updates:", err);
        return res
          .status(500)
          .send({ message: "Error fetching vehicle updates" });
      }
      res.status(200).send(results);
    }
  );
});
// Fetch all user requests for admin panel
app.get("/admin/requests", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching requests:", err);
      return res.status(500).send({ message: "Error fetching requests" });
    }
    res.status(200).send(results);
  });
});
app.get("/admin/purchaseRequisitions", (req, res) => {
  const query = `
   SELECT 
  pr.requisition_id, 
  pr.name, 
  pr.username, 
  pr.email, 
  pr.selected_vendor, 
  pr.status,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'name', ri.item_name,
      'quantity', ri.quantity,
      'cost', ri.estimated_cost
    )
  ) AS items
FROM 
  purchaseRequisitions pr
LEFT JOIN 
  requisition_items ri ON pr.requisition_id = ri.requisition_id
GROUP BY 
  pr.requisition_id, pr.name, pr.username, pr.email, pr.selected_vendor, pr.status

  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching Purchase Requisitions:", err);
      return res
        .status(500)
        .send({ message: "Error fetching Purchase Requisitions" });
    }
    res.status(200).send(results);
  });
});

// Update status of a user request
app.put("/admin/requests/:id", (req, res) => {
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
