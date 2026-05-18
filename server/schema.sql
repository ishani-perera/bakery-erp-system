-- Create Database
CREATE DATABASE IF NOT EXISTS bakery_erp;
USE bakery_erp;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role ENUM('admin', 'staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items (Line Items)
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Inventory Table (Ingredients)
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ingredient VARCHAR(100) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 0,
  min_level DECIMAL(10, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initial Admin User (password: password123)
-- Hash generated for 'password123' using bcrypt
INSERT IGNORE INTO users (username, password, role) 
VALUES ('admin', '$2b$10$EpjXOuXwjL.gWqL1O05LPe/V7UjR6tVfP0H1.6tXJ0r5/Ff8tP6C.', 'admin');

-- Initial Demo Products
INSERT IGNORE INTO products (name, category, price, stock) VALUES
('Chocolate Cake', 'Cake', 1500.00, 10),
('French Baguette', 'Bread', 150.00, 25),
('Butter Croissant', 'Pastry', 120.00, 15);
