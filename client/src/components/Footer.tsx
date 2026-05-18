import { useState } from "react";
import { FiHeart, FiGithub, FiMail, FiPhone, FiMapPin, FiExternalLink, FiChevronUp } from "react-icons/fi";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Decorative top border */}
      <div className={styles.footerTopBorder} />

      <div className={styles.footerInner}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <div className={styles.brandLogo}>
            <img src="/logo.png" alt="BakeryERP" className={styles.logoImg} />
            <div>
              <h3 className={styles.brandName}>BakeryERP</h3>
              <span className={styles.brandTagline}>Management System</span>
            </div>
          </div>
          <p className={styles.brandDesc}>
            A complete enterprise resource planning solution built for modern bakeries. Manage products, track orders, and monitor inventory — all in one place.
          </p>
          <div className={styles.socialRow}>
            <a
              href="mailto:support@bakeryerp.com"
              className={styles.socialChip}
              title="Email Support"
              onMouseEnter={() => setHoveredLink("email")}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <FiMail size={14} />
              <span className={hoveredLink === "email" ? styles.chipLabelVisible : styles.chipLabel}>Email Us</span>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className={styles.socialChip}
              title="GitHub"
              onMouseEnter={() => setHoveredLink("github")}
              onMouseLeave={() => setHoveredLink(null)}
            >
              <FiGithub size={14} />
              <span className={hoveredLink === "github" ? styles.chipLabelVisible : styles.chipLabel}>GitHub</span>
            </a>
          </div>
        </div>

        {/* Navigation Column */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Navigation</h4>
          <ul className={styles.linkList}>
            {[
              { label: "Dashboard", href: "/" },
              { label: "Products", href: "/products" },
              { label: "Orders", href: "/orders" },
              { label: "Inventory", href: "/inventory" },
            ].map((link) => (
              <li key={link.label}>
                <Link to={link.href} className={styles.footerLink}>
                  <span className={styles.linkDot} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Column */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Contact</h4>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <FiMapPin size={13} className={styles.contactIcon} />
              <span>123 Baker Street, Colombo, LK</span>
            </li>
            <li className={styles.contactItem}>
              <FiPhone size={13} className={styles.contactIcon} />
              <span>+94 11 234 5678</span>
            </li>
            <li className={styles.contactItem}>
              <FiMail size={13} className={styles.contactIcon} />
              <span>support@bakeryerp.com</span>
            </li>
          </ul>
        </div>

        {/* System Column */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>System</h4>
          <ul className={styles.linkList}>
            {[
              { label: "Documentation", href: "/documentation" },
              { label: "API Reference", href: "/api-reference" },
              { label: "Changelog", href: "/changelog" },
              { label: "Privacy Policy", href: "/privacy-policy" },
            ].map((link) => (
              <li key={link.label}>
                <Link to={link.href} className={styles.footerLink}>
                  <span className={styles.linkDot} />
                  {link.label}
                  <FiExternalLink size={10} className={styles.extIcon} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.footerBottom}>
        <div className={styles.footerBottomInner}>
          <span className={styles.copyright}>
            © {currentYear} BakeryERP. Crafted with{" "}
            <FiHeart size={11} className={styles.heartIcon} /> for artisan bakers.
            {/* මෙන්න මෙතනට තමයි egotechworld.com ලින්ක් එක දැම්මේ */}
            <span style={{ marginLeft: "8px", borderLeft: "1px solid #555", paddingLeft: "8px" }}>
              Developed by{" "}
              <a
                href="https://egotechworld.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#d97706", textDecoration: "none", fontWeight: "600" }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
              >
                egotechworld.com
              </a>
            </span>
          </span>
          <div className={styles.bottomRight}>
            <span className={styles.versionBadge}>v1.0.0</span>
            <button
              className={styles.scrollTopBtn}
              onClick={scrollToTop}
              title="Back to top"
              aria-label="Scroll to top"
            >
              <FiChevronUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}