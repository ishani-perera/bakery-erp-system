import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiMenu } from 'react-icons/fi';
import styles from './Navbar.module.css';

interface NavbarProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function Navbar({ title = 'Bakery ERP', onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          {onMenuClick && (
            <button className={styles.menuButton} onClick={onMenuClick}>
              <FiMenu size={24} />
            </button>
          )}
          <img src="/logo.png" alt="Bakery ERP Logo" className={styles.logo} />
          <h2 className={styles.title}>{title}</h2>
        </div>
        
        <div className={styles.rightSection}>
          {user.username && (
            <div className={styles.userInfo}>
              <span className={styles.username}>{user.username}</span>
              <span className={styles.role}>{user.role || 'staff'}</span>
            </div>
          )}
          <button 
            className={styles.logoutButton} 
            onClick={handleLogout}
            title="Logout"
          >
            <FiLogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
