require("dotenv").config();
const express = require("express");
const oracledb = require("oracledb");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure multer storage for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const dbConfig = {
    user: "system",
    password: "amju",
    connectString: "localhost:1521/XEPDB1"
};

// POST route to add product
app.post("/product", upload.single("productImage"), async (req, res) => {
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    const { P_Name, Price, Stock, Category, SupplierID } = req.body;
    const ProductImage = req.file ? req.file.buffer : null; // Image buffer from the uploaded file
    let connection;

    if (!P_Name || !Price || !Stock || !Category || !SupplierID) {
        return res.status(400).json({ success: false, message: "All fields must be filled in." });
    }

    try {
        connection = await oracledb.getConnection(dbConfig);

        // Insert product into database
        const result = await connection.execute(
            "INSERT INTO Products (P_Name, Price, Stock, Category, SupplierID, ProductImage) VALUES (:P_Name, :Price, :Stock, :Category, :SupplierID, :ProductImage)",
            { P_Name, Price, Stock, Category, SupplierID, ProductImage }
        );

        await connection.commit();

        res.status(201).json({ success: true, message: "Product added successfully" });
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ success: false, message: "Server error while adding product" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// GET route to fetch all products
app.get("/products", async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            "SELECT * FROM Products ORDER BY Category", 
            [], 
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({ success: true, products: result.rows });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ success: false, message: "Server error while fetching products" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// GET route to fetch products by category
app.get("/products/category/:category", async (req, res) => {
    const { category } = req.params;
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            "SELECT * FROM Products WHERE Category = :category ORDER BY P_Name",
            [category],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length > 0) {
            res.json({ success: true, products: result.rows });
        } else {
            res.status(404).json({ success: false, message: "No products found in this category" });
        }
    } catch (err) {
        console.error("Error fetching products by category:", err);
        res.status(500).json({ success: false, message: "Server error while fetching products by category" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// PUT route to update product details by ID
app.put("/product/:id", upload.single("productImage"), async (req, res) => {
    const productId = req.params.id;
    const { P_Name, Price, Stock, Category, SupplierID } = req.body;
    const ProductImage = req.file ? req.file.buffer : null;
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `UPDATE Products 
             SET P_Name = :P_Name, Price = :Price, Stock = :Stock, Category = :Category, SupplierID = :SupplierID, ProductImage = :ProductImage 
             WHERE ProductID = :id`,
            { P_Name, Price, Stock, Category, SupplierID, ProductImage, id: productId }
        );

        await connection.commit();

        if (result.rowsAffected > 0) {
            res.json({ success: true, message: "Product updated successfully" });
        } else {
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ success: false, message: "Server error while updating product" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// DELETE route to remove a product by ID
app.delete("/product/:id", async (req, res) => {
    const productId = req.params.id;
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            "DELETE FROM Products WHERE ProductID = :id",
            [productId]
        );

        await connection.commit();

        if (result.rowsAffected > 0) {
            res.json({ success: true, message: "Product deleted successfully" });
        } else {
            res.status(404).json({ success: false, message: "Product not found" });
        }
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ success: false, message: "Server error while deleting product" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});






app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let connection;

    try {
        console.log(`Received login request for: ${username}`);

        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Username and password are required" });
        }

        if (username.toLowerCase() === "admins" && password === "admin1234") {
            console.log("Admin login successful");
            return res.json({ success: true, message: "Admin login successful", role: "admin" });
        }

        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT * FROM users WHERE LOWER(username) = LOWER(:username) AND password = :password`,
            [username, password],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        console.log("Query Result:", result);

        if (result.rows.length > 0) {
            console.log("User login successful");
            return res.json({ success: true, message: "Login successful", role: "user" });
        } else {
            console.log("Invalid username or password");
            return res.status(401).json({ success: false, message: "Invalid username or password" });
        }
    } catch (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

app.post("/register", async (req, res) => {
    const { fullName, username, email, contact, password } = req.body;
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const checkUsernameResult = await connection.execute(
            "SELECT 1 FROM users WHERE LOWER(username) = LOWER(:username)",
            { username },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (checkUsernameResult.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }

        const checkEmailResult = await connection.execute(
            "SELECT 1 FROM users WHERE LOWER(email) = LOWER(:email)",
            { email },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (checkEmailResult.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        await connection.execute(
            "INSERT INTO users (full_name, username, email, contact, password) VALUES (:fullName, :username, :email, :contact, :password)",
            { fullName, username, email, contact, password }
        );

        await connection.commit();

        res.status(201).json({ success: true, message: "Registration successful" });

    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).json({ success: false, message: "Server error" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});



app.post("/supplier", async (req, res) => {
    const { sup_name, contact, email, address } = req.body;
    let connection;

    if (!sup_name || !contact || !email || !address) {
        return res.status(400).json({ success: false, message: "All fields must be filled in." });
    }

    try {
        connection = await oracledb.getConnection(dbConfig);

        // Insert supplier data into database
        const result = await connection.execute(
            `INSERT INTO Suppliers (SupplierID, sup_name, Contact, email, address) 
             VALUES (suppliers_seq.NEXTVAL, :sup_name, :contact, :email, :address)`,
            { sup_name, contact, email, address },
            { autoCommit: true }
        );

        res.status(201).json({ success: true, message: "Supplier added successfully" });
    } catch (err) {
        console.error("Error adding supplier:", err);
        res.status(500).json({ success: false, message: "Server error while adding supplier" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

app.get("/suppliers", async (req, res) => {
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            "SELECT * FROM Suppliers ORDER BY sup_name", 
            [], 
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({ success: true, suppliers: result.rows });
    } catch (err) {
        console.error("Error fetching suppliers:", err);
        res.status(500).json({ success: false, message: "Server error while fetching suppliers" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

app.put("/supplier/:id", async (req, res) => {
    const supplierId = req.params.id;
    const { sup_name, contact, email, address } = req.body;
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `UPDATE Suppliers 
             SET sup_name = :sup_name, contact = :contact, email = :email, address = :address 
             WHERE SupplierID = :id`,
            { sup_name, contact, email, address, id: supplierId }
        );

        await connection.commit();

        if (result.rowsAffected > 0) {
            res.json({ success: true, message: "Supplier updated successfully" });
        } else {
            res.status(404).json({ success: false, message: "Supplier not found" });
        }
    } catch (err) {
        console.error("Error updating supplier:", err);
        res.status(500).json({ success: false, message: "Server error while updating supplier" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

app.delete("/supplier/:id", async (req, res) => {
    const supplierId = req.params.id;
    let connection;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            "DELETE FROM Suppliers WHERE SupplierID = :id",
            [supplierId]
        );

        await connection.commit();

        if (result.rowsAffected > 0) {
            res.json({ success: true, message: "Supplier deleted successfully" });
        } else {
            res.status(404).json({ success: false, message: "Supplier not found" });
        }
    } catch (err) {
        console.error("Error deleting supplier:", err);
        res.status(500).json({ success: false, message: "Server error while deleting supplier" });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});