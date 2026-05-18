import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiShoppingCart, FiPackage, FiDatabase, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || '{"username": "Admin", "role": "Administrator"}');

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      <button
        type="button"
        className={styles.menuToggle}
        aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>
      {mobileOpen && (
        <button
          type="button"
          className={styles.sidebarBackdrop}
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.topSection}>
          <div className={styles.logo}>
            <img src="/logo.png" alt="Bakery ERP Logo" className={styles.logoIcon} />
            <div className={styles.logoText}>
              <h1>BakeryERP</h1>
              <span>Management System</span>
            </div>
          </div>

          <nav className={styles.navMenu} aria-label="Main navigation">
            <p className={styles.navLabel}>OVERVIEW</p>
            <Link to="/" className={`${styles.navLink} ${isActive("/") ? styles.active : ""}`}>
              <FiHome size={20} />
              <span>Dashboard</span>
            </Link>

            <p className={styles.navLabel}>OPERATIONS</p>
            <Link to="/products" className={`${styles.navLink} ${isActive("/products") ? styles.active : ""}`}>
              <FiShoppingCart size={20} />
              <span>Products</span>
            </Link>
            <Link to="/orders" className={`${styles.navLink} ${isActive("/orders") ? styles.active : ""}`}>
              <FiPackage size={20} />
              <span>Orders</span>
            </Link>

            <p className={styles.navLabel}>STOCK</p>
            <Link to="/inventory" className={`${styles.navLink} ${isActive("/inventory") ? styles.active : ""}`}>
              <FiDatabase size={20} />
              <span>Inventory</span>
            </Link>
          </nav>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user.username}</p>
              <p className={styles.userRole}>{user.role}</p>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
