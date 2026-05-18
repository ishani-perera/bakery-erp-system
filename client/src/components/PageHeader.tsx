import { NavLink } from 'react-router-dom';
import styles from './PageHeader.module.css';

const NAV = [
  { to: '/', label: 'Dashboard', end: true as const },
  { to: '/products', label: 'Products', end: false as const },
  { to: '/orders', label: 'Orders', end: false as const },
  { to: '/inventory', label: 'Inventory', end: false as const },
];

export interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  showNav?: boolean;
}

export default function PageHeader({
  icon,
  title,
  subtitle,
  badge,
  actions,
  showNav = true,
}: PageHeaderProps) {
  const hasMeta = Boolean(badge || subtitle);

  return (
    <header className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.leading}>
          {icon ? <div className={styles.iconWrap}>{icon}</div> : null}
          <div className={styles.titles}>
            <h1 className={styles.title}>{title}</h1>
            {hasMeta ? (
              <div className={styles.meta}>
                {badge}
                {typeof subtitle === 'string' ? (
                  subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null
                ) : (
                  subtitle
                )}
              </div>
            ) : null}
          </div>
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {showNav ? (
        <nav className={styles.nav} aria-label="Main sections">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
