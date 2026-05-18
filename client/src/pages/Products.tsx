import { useState, useEffect } from 'react';
import { FiTrash2, FiEdit2, FiAlertCircle, FiPlus, FiCheck, FiChevronDown, FiChevronUp, FiShoppingBag } from 'react-icons/fi';
import { productsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import styles from './Products.module.css';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ id: null as number | null, name: '', category: 'Bread', price: '', stock: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getAll();
      setProducts(response.data || []);
    } catch (err) {
      console.error(err);
      setError('Could not load products. Please check if the backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && formData.id) {
        await productsAPI.update(formData.id, {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        });
      } else {
        await productsAPI.create({
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        });
      }
      fetchProducts();
      resetForm();
      showToast(isEditing ? '✅ Product updated!' : '✅ Product added!');
    } catch (err) {
      showToast('❌ Error saving product', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', category: 'Bread', price: '', stock: '' });
    setIsEditing(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDeleteAction = async () => {
    if (!deleteConfirm) return;
    try {
      await productsAPI.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchProducts();
      showToast('✅ Product removed!');
    } catch (err) {
      showToast('❌ Error deleting product', 'error');
    }
  };

  const getStockLabel = (stock: number) => {
    if (stock === 0) return { text: 'Out of stock', class: styles.outOfStock };
    if (stock < 10) return { text: `${stock} left`, class: styles.lowStock };
    return { text: `${stock} in stock`, class: styles.inStock };
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['Bread', 'Savoury', 'Cake', 'Pastry', 'Beverage'];
  const [expandedCats, setExpandedCats] = useState<string[]>(['Bread']); // Bread open by default

  const toggleCat = (cat: string) => {
    if (expandedCats.includes(cat)) {
      setExpandedCats(expandedCats.filter(c => c !== cat));
    } else {
      setExpandedCats([...expandedCats, cat]);
    }
  };

  const groupedProducts = categories.reduce((acc, cat) => {
    acc[cat] = filtered.filter(p => p.category === cat);
    return acc;
  }, {} as Record<string, Product[]>);

  const getCategoryEmoji = (cat: string) => {
    const emojiMap: Record<string, string> = {
      'Bread': '🍞',
      'Savoury': '🥪',
      'Cake': '🎂',
      'Pastry': '🥐',
      'Beverage': '☕'
    };
    return emojiMap[cat] || '📦';
  };

  if (loading && products.length === 0) return <div className={styles.loading}>🍞 Loading Products...</div>;

  return (
    <div className={`${styles.container} page-entry`}>
      <PageHeader
        icon={<FiShoppingBag />}
        title="Products"
        subtitle="Manage your bakery items and inventory"
      />

      {error && (
        <div className={styles.errorBanner}>
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* Form */}
      <div className={styles.formCard}>
        <h3 className={styles.cardTitle}>{isEditing ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>NAME</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Chocolate Cake" />
          </div>
          <div className={styles.inputGroup}>
            <label>CATEGORY</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option>Bread</option><option>Savoury</option><option>Cake</option><option>Pastry</option><option>Beverage</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>PRICE (Rs.)</label>
            <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="150.00" />
          </div>
          <div className={styles.inputGroup}>
            <label>STOCK</label>
            <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="10" />
          </div>
          <div className={styles.formActions}>
            {isEditing && <button type="button" onClick={resetForm} className={styles.cancelBtn}>Cancel</button>}
            <button type="submit" className={styles.addBtn}><FiPlus size={18} /> {isEditing ? 'Update Product' : 'Add Product'}</button>
          </div>
        </form>
      </div>

      <div className={styles.searchSection}>
        <input placeholder="🔍 Search products..." className={styles.searchInput} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className={styles.categoryGroups}>
        {categories.map(cat => {
          const catProducts = groupedProducts[cat];
          if (catProducts.length === 0 && !searchTerm) return null; // Hide empty cats if not searching

          const isExpanded = expandedCats.includes(cat);

          return (
            <div key={cat} className={`${styles.categoryBox} ${styles['box' + cat]} ${isExpanded ? styles.expanded : ''}`}>
              <div className={styles.categoryHeader} onClick={() => toggleCat(cat)} style={{ cursor: 'pointer' }}>
                <div className={styles.headerLeft}>
                  {isExpanded ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                  <h2 className={styles.categoryTitle}>{getCategoryEmoji(cat)} {cat}</h2>
                </div>
                <span className={styles.categoryCount}>{catProducts.length} items</span>
              </div>
              
              {isExpanded && (
                <div className={styles.productList}>
                  <div className={styles.listHeader}>
                    <span className={styles.colName}>NAME</span>
                    <span className={styles.colPrice}>PRICE</span>
                    <span className={styles.colStock}>STOCK</span>
                    <span className={styles.colActions}>ACTIONS</span>
                  </div>
                  {catProducts.map(product => {
                    const stock = getStockLabel(product.stock);
                    return (
                      <div key={product.id} className={styles.productRow}>
                        <span className={styles.rowName}>{product.name}</span>
                        <span className={styles.rowPrice}>Rs. {product.price.toLocaleString()}</span>
                        <span className={`${styles.rowStock} ${stock.class}`}>{stock.text}</span>
                        <div className={styles.rowActions}>
                          <button onClick={() => handleEdit(product)} className={styles.editBtn} title="Edit"><FiEdit2 /></button>
                          <button onClick={() => handleDelete(product.id, product.name)} className={styles.removeBtn} title="Delete"><FiTrash2 /></button>
                        </div>
                      </div>
                    );
                  })}
                  {catProducts.length === 0 && searchTerm && (
                    <div className={styles.noResults}>No matches in {cat}.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        {!loading && filtered.length === 0 && (
          <div className={styles.emptyState}>📦 No products found. Add your first product above!</div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-icon">
              <FiAlertCircle size={48} color="#e11d48" />
            </div>
            <h2>Remove Product?</h2>
            <p>Are you sure you want to remove <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="modal-btn-cancel" 
                onClick={() => setDeleteConfirm(null)}
              >
                Keep it
              </button>
              <button 
                className="modal-btn-confirm" 
                onClick={confirmDeleteAction}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {notification.show && (
        <div className={`toast-container toast-${notification.type}`}>
          {notification.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}