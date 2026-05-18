// index file
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDb, query, run } = require('./db');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Initialize database
const db = { query, run };

// Start server with database initialization
const startServer = async () => {
  try {
    await initDb();
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'bakery_secret_key_2024';

// 1. Connection Test Route
// Visit http://localhost:5000/test in your browser to check if server is alive
app.get('/test', (req, res) => {
  res.json({ message: "Server is reachable!", time: new Date().toLocaleString() });
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const rows = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    // Changed 404 to 401 to prevent browser "URL Not Found" errors
    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = rows[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(400).json({ message: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, 'staff']);

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PRODUCTS ROUTES ---
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    await db.run('INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)', [name, category, price, stock]);
    res.status(201).json({ message: 'Product created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    await db.run('UPDATE products SET name=?, category=?, price=?, stock=? WHERE id=?', [name, category, price, stock, req.params.id]);
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ORDERS ROUTES ---
app.get('/api/orders/stats', authenticateToken, async (req, res) => {
  try {
    const todaysOrders = await db.query("SELECT COUNT(*) as count FROM orders WHERE date(created_at) = date('now')");
    const dailyRevenue = await db.query("SELECT SUM(total) as sum FROM orders WHERE date(created_at) = date('now')");
    const lowStock = await db.query('SELECT COUNT(*) as count FROM inventory WHERE quantity < min_level');

    const activeProducts = await db.query('SELECT COUNT(*) as count FROM products WHERE stock > 0');
    const outOfStock = await db.query('SELECT COUNT(*) as count FROM products WHERE stock = 0');

    res.json({
      todaysOrders: todaysOrders[0]?.count || 0,
      dailyRevenue: dailyRevenue[0]?.sum || 0,
      lowStockCount: lowStock[0]?.count || 0,
      activeProducts: activeProducts[0]?.count || 0,
      outOfStockCount: outOfStock[0]?.count || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/orders/weekly', authenticateToken, async (req, res) => {
  try {
    // Generate last 7 days including today
    const days = [];
    const dateNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // SQLite uses YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      const iso = `${year}-${month}-${date}`;
      
      days.push({
        fullDate: iso,
        day: dateNames[d.getDay()],
        revenue: 0
      });
    }

    const rows = await db.query(`
      SELECT strftime('%Y-%m-%d', created_at) as date, SUM(total) as revenue 
      FROM orders 
      WHERE created_at >= date('now', '-7 days')
      GROUP BY date
    `);

    rows.forEach(row => {
      const dayIndex = days.findIndex(d => d.fullDate === row.date);
      if (dayIndex !== -1) days[dayIndex].revenue = row.revenue;
    });

    const totalRevenue = days.reduce((sum, d) => sum + d.revenue, 0);

    // If no orders yet, return realistic demo data as per your design requirement
    if (totalRevenue === 0) {
      return res.json([
        { day: 'Mon', revenue: 22000 },
        { day: 'Tue', revenue: 28000 },
        { day: 'Wed', revenue: 25000 },
        { day: 'Thu', revenue: 38000 },
        { day: 'Fri', revenue: 32000 },
        { day: 'Sat', revenue: 35000 },
        { day: 'Sun', revenue: 30000 },
      ]);
    }

    res.json(days.map(d => ({ day: d.day, revenue: d.revenue })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await db.query(`
        SELECT oi.id, oi.product_id, oi.quantity, oi.unit_price, p.name, p.category
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      return { ...order, items };
    }));
    
    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { customer, phone, notes, items } = req.body;
    const finalName = customer || 'Walk-in Customer';

    let total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    total = Math.round(total);

    const orderResult = await db.run(
      'INSERT INTO orders (customer, phone, notes, total, status) VALUES (?, ?, ?, ?, ?)',
      [finalName, phone, notes, total, 'pending']
    );

    // Ensure lastID is captured correctly based on your db.js wrapper
    const orderId = orderResult.id || orderResult.lastID;

    for (const item of items) {
      await db.run(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.unit_price]
      );
      await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    await db.run('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    // Delete items first
    await db.run('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
    // Then delete order
    await db.run('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- INVENTORY ROUTES ---
app.get('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM inventory');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/inventory', authenticateToken, async (req, res) => {
  try {
    const { ingredient, unit, quantity, min_level } = req.body;
    await db.run('INSERT INTO inventory (ingredient, unit, quantity, min_level) VALUES (?, ?, ?, ?)', [ingredient, unit, quantity, min_level]);
    res.status(201).json({ message: 'Inventory item added' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/inventory/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity, min_level } = req.body;
    if (min_level !== undefined) {
      await db.run('UPDATE inventory SET quantity=?, min_level=? WHERE id=?', [quantity, min_level, req.params.id]);
    } else {
      await db.run('UPDATE inventory SET quantity=? WHERE id=?', [quantity, req.params.id]);
    }
    res.json({ message: 'Inventory updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/inventory/:id', authenticateToken, async (req, res) => {
  try {
    await db.run('DELETE FROM inventory WHERE id = ?', [req.params.id]);
    res.json({ message: 'Inventory item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- START SERVER ---
startServer().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📂 Database: bakery.db (sql.js - Pure JavaScript SQLite)`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
}); 
