import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FiHome, FiRefreshCw } from 'react-icons/fi';
import { ordersAPI, inventoryAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import headerStyles from '../components/PageHeader.module.css';
import styles from './Dashboard.module.css';

interface KPIData {
  todaysOrders: number;
  dailyRevenue: number;
  lowStockCount: number;
  activeProducts: number;
  outOfStockCount: number;
}

interface WeeklyData {
  day: string;
  revenue: number;
}

interface RecentOrder {
  id: number;
  customer: string;
  total: number;
  status: string;
  created_at: string;
}

interface InventoryItem {
  id: number;
  ingredient: string;
  unit: string;
  quantity: number;
  min_level: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [kpiData, setKPIData] = useState<KPIData>({
    todaysOrders: 0,
    dailyRevenue: 0,
    lowStockCount: 0,
    activeProducts: 0,
    outOfStockCount: 0,
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      else if (kpiData.todaysOrders === 0) setLoading(true);
      
      setError(null);
      const [statsRes, weeklyRes, ordersRes, invRes] = await Promise.all([
        ordersAPI.getStats(),
        ordersAPI.getWeekly(),
        ordersAPI.getAll(),
        inventoryAPI.getAll(),
      ]);

      if (statsRes.data) setKPIData(statsRes.data);
      if (weeklyRes.data) setWeeklyData(weeklyRes.data);
      if (ordersRes.data) setRecentOrders(ordersRes.data.slice(0, 5));
      
      if (invRes.data) {
        const lowStock = invRes.data.filter((item: InventoryItem) => item.quantity < item.min_level);
        setLowStockItems(lowStock);
      }
    } catch (err) {
      console.error('Dashboard Load Error:', err);
      setError('Could not connect to the backend server. Please ensure node index.js is running!');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const formatCurrency = (value: number) => {
    return `Rs. ${(value || 0).toLocaleString()}`;
  };

  if (loading && kpiData.todaysOrders === 0) return <div className={styles.loading}>🍞 Loading Bakery Dashboard...</div>;

  if (error && kpiData.todaysOrders === 0) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h2>⚠️ Connection Error</h2>
          <p>{error}</p>
          <button onClick={() => fetchDashboardData()} className={styles.retryBtn}>🔄 Retry Connection</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} page-entry`}>
      <PageHeader
        icon={<FiHome />}
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        badge={
          <span className={headerStyles.badge}>
            {kpiData.lowStockCount} low-stock {kpiData.lowStockCount === 1 ? 'item' : 'items'}
          </span>
        }
        actions={
          <button 
            className={`${styles.retryBtn} ${refreshing ? styles.refreshing : ''}`} 
            onClick={() => fetchDashboardData(true)} 
            disabled={refreshing}
            style={{ margin: 0, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiRefreshCw className={refreshing ? styles.spin : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiInteractive} ${styles.cardOrders}`} onClick={() => navigate('/orders')}>
          <p className={styles.kpiLabel}>📋 Today's Orders</p>
          <h2 className={styles.kpiValue}>{kpiData.todaysOrders}</h2>
          <p className={styles.kpiTrendSuccess}>↑ +6 from yesterday</p>
        </div>
        <div className={`${styles.kpiCard} ${styles.cardRevenue}`}>
          <p className={styles.kpiLabel}>💰 Daily Revenue</p>
          <h2 className={`${styles.kpiValue} ${styles.kpiValueLong}`}>{formatCurrency(kpiData.dailyRevenue)}</h2>
          <p className={styles.kpiTrendSuccess}>↑ +23% vs yesterday</p>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiInteractive} ${styles.cardStock}`} onClick={() => navigate('/inventory')}>
          <p className={styles.kpiLabel}>📦 Low Stock</p>
          <h2 className={styles.kpiValue}>{kpiData.lowStockCount}</h2>
          <p className={styles.kpiTrendDanger}>⚡ Needs restocking</p>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiInteractive} ${styles.cardProducts}`} onClick={() => navigate('/products')}>
          <p className={styles.kpiLabel}>🎂 Active Products</p>
          <h2 className={styles.kpiValue}>{kpiData.activeProducts}</h2>
          <p className={styles.kpiTrendInfo}>🔴 {kpiData.outOfStockCount} out of stock</p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Sales Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.cardTitle}>📊 7-Day Sales Revenue</h3>
          <p className={styles.cardUnit}>Amount in thousands</p>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eee" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#8d7b68', fontSize: 12}} 
                  dy={10} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'rgba(212, 163, 115, 0.1)'}} 
                  contentStyle={{
                    borderRadius: '12px', 
                    border: '2px solid rgba(175, 143, 111, 0.3)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    padding: '12px 16px'
                  }}
                  labelStyle={{color: '#2c1a0e', fontWeight: 700}}
                />
                <Bar 
                  dataKey="revenue" 
                  radius={[4, 4, 0, 0]} 
                  barSize={60} 
                  isAnimationActive={false}
                  activeBar={{ filter: 'brightness(1.1) drop-shadow(0 0 8px rgba(175, 143, 111, 0.3))' }}
                >
                  {weeklyData.map((entry, index) => {
                    const maxRevenue = Math.max(...weeklyData.map(d => d.revenue));
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.revenue === maxRevenue && maxRevenue > 0 ? '#AF8F6F' : '#D7C0AE'} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotPrimary}`}></span>
                <span>Highest Sales</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotSecondary}`}></span>
                <span>Daily Revenue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className={styles.alertsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>🛠️ Inventory Status</h3>
            <button className={styles.linkBtn} onClick={() => navigate('/inventory')}>Manage stock →</button>
          </div>
          <div className={styles.alertList}>
            {lowStockItems.length > 0 ? lowStockItems.map(item => (
              <div key={item.id} className={styles.alertItem}>
                <div className={styles.alertInfo}>
                  <span>{item.ingredient}</span>
                  <span className={styles.alertQty}>{item.quantity} {item.unit}</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ 
                      width: `${Math.min((item.quantity / item.min_level) * 100, 100)}%`,
                      backgroundColor: item.quantity === 0 ? '#b71c1c' : '#e11d48'
                    }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className={styles.emptyAlerts}>
                <p>No low stock alerts! All ingredients are above minimum levels.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.recentOrdersSection}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>📋 Recent Orders</h3>
          <button className={styles.linkBtn} onClick={() => navigate('/orders')}>View all orders →</button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr><th>ORDER</th><th>CUSTOMER</th><th>ITEMS</th><th>TOTAL</th><th>STATUS</th></tr>
          </thead>
          <tbody>
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <tr key={order.id}>
                <td className={styles.orderId}>#{order.id}</td>
                <td>{order.customer}</td>
                <td className={styles.mutedText}>—</td>
                <td className={styles.totalText}>{formatCurrency(order.total)}</td>
                <td><span className={`${styles.statusBadge} ${styles[order.status]}`}>{order.status}</span></td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '2rem', color: '#999'}}>No orders found. Create your first order!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}