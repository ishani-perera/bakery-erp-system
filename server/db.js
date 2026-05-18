const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'bakery.db');
const db = new sqlite3.Database(dbPath);

// Helper to run queries with Promises
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Initialize Database Schema
const initDb = async () => {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'staff'
  )`);

  await run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0
  )`);

  await run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT NOT NULL,
    phone TEXT,
    notes TEXT,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    unit_price REAL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity REAL DEFAULT 0,
    min_level REAL DEFAULT 0
  )`);

  // Create default admin
  const users = await query('SELECT * FROM users WHERE username = ?', ['admin']);
  if (users.length === 0) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin']);
  }

  // Populate Full Bakery Product List (Sri Lankan Prices)
  const existingProducts = await query('SELECT COUNT(*) as count FROM products');
  if (existingProducts[0].count < 10) {
    // Clear existing to ensure clean list
    await run('DELETE FROM products');
    
    const bakeryProducts = [
      ['Bread', 'Bread', 180], ['Sandwich Bread', 'Bread', 250], ['Garlic Bread', 'Bread', 350],
      ['Bun', 'Savoury', 80], ['Fish Bun', 'Savoury', 120], ['Egg Bun', 'Savoury', 120],
      ['Sausage Bun', 'Savoury', 180], ['Burger Bun', 'Savoury', 150], ['Rolls', 'Savoury', 100],
      ['Patties', 'Savoury', 100], ['Cutlets', 'Savoury', 100], ['Samosa', 'Savoury', 100],
      ['Sandwich', 'Snack', 350], ['Pizza Slice', 'Snack', 450], ['Doughnut', 'Sweet', 250],
      ['Muffin', 'Sweet', 250], ['Cupcake', 'Sweet', 150], ['Cookies', 'Sweet', 50],
      ['Brownies', 'Sweet', 350], ['Eclairs', 'Sweet', 250], ['Butter Cake', 'Cake', 1500],
      ['Chocolate Cake', 'Cake', 2000], ['Ribbon Cake', 'Cake', 2500], ['Fruit Cake', 'Cake', 2200],
      ['Birthday Cake', 'Cake', 3500], ['Cheesecake', 'Cake', 4500], ['Pastry', 'Savoury', 180],
      ['Croissant', 'Pastry', 350], ['Danish Pastry', 'Pastry', 380], ['Biscuit', 'Sweet', 50],
      ['Toast', 'Bread', 150], ['Chicken Pie', 'Savoury', 350], ['Vegetable Pie', 'Savoury', 280],
      ['Milk Tea', 'Beverage', 150], ['Coffee', 'Beverage', 350], ['Fresh Juice', 'Beverage', 450],
      ['Soft Drinks', 'Beverage', 150], ['Water Bottle', 'Beverage', 100]
    ];

    for (const p of bakeryProducts) {
      await run('INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)', [p[0], p[1], p[2], 100]);
    }
  }

  // Ensure inventory is populated
  const inventory = await query('SELECT * FROM inventory');
  if (inventory.length === 0) {
    const defaultInventory = [
      ['Wheat Flour', 'kg', 18, 5],
      ['Sugar', 'kg', 22, 5],
      ['Butter', 'kg', 2.1, 5],
      ['Eggs', 'pcs', 12, 20],
      ['Milk', 'L', 6.5, 4],
      ['Yeast', 'kg', 0.3, 2]
    ];
    for (const item of defaultInventory) {
      await run('INSERT INTO inventory (ingredient, unit, quantity, min_level) VALUES (?, ?, ?, ?)', item);
    }
  }

  // Seed some recent orders if none exist
  const existingOrders = await query('SELECT COUNT(*) as count FROM orders');
  if (existingOrders[0].count === 0) {
    const products = await query('SELECT id, price FROM products LIMIT 5');
    if (products.length > 0) {
      const customers = ['Walk-in Customer', 'Perera Bakers', 'Ishani P.', 'Coffee House'];
      for (let i = 0; i < 5; i++) {
        const total = products[0].price * 2;
        const res = await run(
          "INSERT INTO orders (customer, phone, notes, total, status, created_at) VALUES (?, ?, ?, ?, ?, datetime('now', ?))",
          [customers[i % customers.length], '0771234567', 'Regular delivery', total, 'completed', `-${i} days`]
        );
        const orderId = res.id;
        await run(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [orderId, products[0].id, 2, products[0].price]
        );
      }
    }
  }
};

initDb().then(() => console.log('✅ Bakery Database Ready!'));

module.exports = { query, run };
