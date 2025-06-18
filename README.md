# Urban Food – E-Commerce System

**Urban Food** is a full-featured e-commerce web application for online food ordering. It utilizes standard web technologies (HTML, CSS, JavaScript, PHP), with **Oracle Database** managing the main business logic and **MongoDB** handling user-generated reviews.

---

## 🔹 Key Features

### 👤 User Panel

* User registration and login
* Browse products by category
* Product search and filtering
* Add to cart and checkout
* View order history and status
* Submit and read product reviews (stored in MongoDB)

### 🔐 Admin Panel

* Secure admin login
* Add, edit, or remove products
* View and manage customer orders
* Manage product categories and users

---

## 🔧 Technologies Used

* **Frontend**: HTML, CSS, JavaScript
* **Backend**: PHP
* **Databases**:

  * **Oracle 12c** – Core transactional data (users, products, orders)
  * **MongoDB** – Product reviews
* **Server Environment**: Apache (via XAMPP)
* **Editor**: Visual Studio Code

---

## 🗂️ Database Setup

Oracle SQL scripts for table creation and sample data are located in:

```
/database/
```

Use **Oracle SQL Developer** or **SQL\*Plus** to execute the scripts.

---

## 🧩 MongoDB Integration

MongoDB stores product reviews dynamically. Ensure:

* MongoDB server is running (locally or remotely)
* PHP MongoDB extension is installed and enabled

---

## ⚙️ Installation Guide

### 1. Install Required Software

* XAMPP (Apache + PHP)
* Oracle Database 12c or Oracle XE
* Oracle SQL Developer
* MongoDB Community Server
* Visual Studio Code
* PHP MongoDB Extension

### 2. Enable PHP Extensions

Edit `php.ini` and ensure the following lines are active:

```ini
extension=oci8_12c     ; Oracle support
extension=mongodb      ; MongoDB support
```

Restart Apache after saving changes.

---

## 🚀 Running the Application

1. Clone or download the project to your web server directory (e.g., `htdocs` in XAMPP)
2. Import Oracle scripts using SQL Developer
3. Configure Oracle & MongoDB credentials in PHP config files
4. Start Apache, Oracle DB, and MongoDB services
5. Open browser and go to:

**[http://localhost/urban-food/](http://localhost/urban-food/)**

---

## 📜 License

This project is developed for academic or client purposes. Redistribution or commercial use is not permitted without prior authorization.

---

Let me know if you'd like a version formatted for PDF, GitHub README, or printed documentation.

