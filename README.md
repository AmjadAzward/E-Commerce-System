
# Urban Food – E-Commerce System

**Urban Food** is a comprehensive e-commerce web application designed to facilitate online food ordering. It is built using standard web technologies such as HTML, CSS, JavaScript, and PHP, with Oracle Database handling core transactions and MongoDB managing product reviews.

---

## Features

### User Panel

- User registration and login
- Browse products by category
- Product search and filtering options
- Add products to cart and complete checkout
- View past orders and order status
- Write and view product reviews (stored in MongoDB)

### Admin Panel

- Admin login authentication
- Add, edit, or delete products
- View and manage customer orders
- Manage product categories and registered users

---

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: PHP  
- **Databases**:
  - **Oracle 12c** – Manages users, products, and orders
  - **MongoDB** – Stores customer product reviews
- **Web Server**: Apache (via XAMPP)
- **Development Tool**: Visual Studio Code

---

## Database Schema

All Oracle SQL scripts required for creating tables and inserting sample data are included in the project under:

```

/database/

````

These can be executed using Oracle SQL Developer or SQL*Plus.


## MongoDB Integration

MongoDB is used to store and retrieve product reviews dynamically. Ensure your MongoDB server is running (locally or remotely) and the required PHP extension is installed and enabled.

---

## Installation and Setup

### Step 1: Install Required Software

- XAMPP (includes Apache and PHP)
- Oracle Database 12c or Oracle XE
- Oracle SQL Developer
- MongoDB Community Server
- Visual Studio Code
- PHP MongoDB Extension

### Step 2: Enable PHP Extensions

Edit your `php.ini` file and ensure the following extensions are enabled:

```ini
extension=oci8_12c     ; Oracle database support
extension=mongodb      ; MongoDB support
````

Restart Apache after making changes.

---

## Usage

1. Clone or download the project into your local web server directory (e.g., `htdocs` for XAMPP).
2. Import Oracle SQL scripts using SQL Developer.
3. Configure Oracle and MongoDB connection settings in the PHP config files.
4. Start Apache, Oracle DB, and MongoDB services.
5. Open a web browser and visit:

http://localhost/urban-food/

## License

This system is developed as an academic or client project. It is not licensed for public redistribution or commercial use without permission.
