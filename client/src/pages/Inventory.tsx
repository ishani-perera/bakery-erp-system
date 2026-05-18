import { useState, useEffect } from 'react';
import { FiPlus, FiCheck, FiAlertCircle, FiTrash2, FiDatabase } from 'react-icons/fi';
import { inventoryAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import headerStyles from '../components/PageHeader.module.css';
import styles from './Inventory.module.css';

interface InventoryItem {
  id: number;
  ingredient: string;
  unit: string;
  quantity: number;
  min_level: number;
}

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Toggle for the add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ ingredient: '', unit: 'kg', quantity: '', min_level: '' });

  // Store local input values for each row to allow typing before saving
  const [updateValues, setUpdateValues] = useState<Record<number, string>>({});
  // Custom delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryAPI.getAll();
      setItems(response.data || []);
      
      // Initialize update values
      const initialVals: Record<number, string> = {};
      (response.data || []).forEach((item: InventoryItem) => {
        initialVals[item.id] = item.quantity.toString();
      });
      setUpdateValues(initialVals);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the inventory database. Please ensure node index.js is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    
    // Auto-refresh every 20 seconds to update inventory levels
    const refreshInterval = setInterval(() => {
      fetchInventory();
    }, 20000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  const handleUpdateChange = (id: number, val: string) => {
    setUpdateValues({ ...updateValues, [id]: val });
  };

  const saveInvQty = async (id: number) => {
    const newQty = parseFloat(updateValues[id]);
    if (isNaN(newQty)) return;
    try {
      await inventoryAPI.updateQty(id, newQty);
      fetchInventory();
      showToast('Quantity updated successfully!');
    } catch (err) {
      console.error(err);
      showToast('Error updating quantity', 'error');
    }
  };

  const deleteInvItem = (id: number, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDeleteAction = async () => {
    if (!deleteConfirm) return;
    try {
      await inventoryAPI.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchInventory();
      showToast('Ingredient removed successfully!');
    } catch (err) {
      console.error(err);
      showToast('Error deleting ingredient', 'error');
    }
  };

  const toggleAddIng = () => {
    setShowAddForm(!showAddForm);
  };

  const addIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ingredient.trim()) return;
    
    try {
      await inventoryAPI.create({
        ingredient: formData.ingredient,
        unit: formData.unit,
        quantity: parseFloat(formData.quantity) || 0,
        min_level: parseFloat(formData.min_level) || 0
      });
      setFormData({ ingredient: '', unit: 'kg', quantity: '', min_level: '' });
      fetchInventory();
      setShowAddForm(false);
      showToast('Ingredient added successfully!');
    } catch (err) {
      console.error(err);
      showToast('Error adding ingredient', 'error');
    }
  };

  if (loading && items.length === 0) return <div className={styles.loading}>Loading Inventory...</div>;

  const lowStockCount = items.filter(item => item.quantity < item.min_level).length;

  return (
    <div className={`${styles.container} page-entry`}>
      <PageHeader
        icon={<FiDatabase />}
        title="Inventory"
        badge={
          <span className={headerStyles.badge}>
            {lowStockCount} low-stock {lowStockCount === 1 ? 'item' : 'items'}
          </span>
        }
        subtitle="Track ingredients, par levels, and quantity updates in one place."
        actions={
          <button type="button" className={styles.primaryBtn} onClick={toggleAddIng}>
            <FiPlus /> Add ingredient
          </button>
        }
      />

      {error && (
        <div className={styles.errorBanner}>
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* 2. Add Ingredient Panel (Hidden by default) */}
      {showAddForm && (
        <div className={styles.addPanel}>
          <form onSubmit={addIngredient} className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Ingredient</label>
              <input 
                required 
                placeholder="e.g. Wheat Flour" 
                value={formData.ingredient} 
                onChange={e => setFormData({...formData, ingredient: e.target.value})} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Unit</label>
              <input 
                required 
                placeholder="kg / L / pcs" 
                value={formData.unit} 
                onChange={e => setFormData({...formData, unit: e.target.value})} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Quantity</label>
              <input 
                required 
                type="number" 
                step="0.01" 
                placeholder="0"
                value={formData.quantity} 
                onChange={e => setFormData({...formData, quantity: e.target.value})} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Min level</label>
              <input 
                required 
                type="number" 
                step="0.01" 
                placeholder="5"
                value={formData.min_level} 
                onChange={e => setFormData({...formData, min_level: e.target.value})} 
              />
            </div>
            <div className={styles.formAction}>
              <button type="submit" className={styles.primaryBtn}>
                <FiPlus /> Add ingredient
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Inventory Table */}
      <div className={`${styles.tableWrapper} table-responsive`}>
        <table className={styles.invTable}>
          <thead>
            <tr>
              <th>INGREDIENT</th>
              <th>UNIT</th>
              <th>STOCK LEVEL</th>
              <th>MIN LEVEL</th>
              <th>STATUS</th>
              <th>UPDATE QUANTITY</th>
              <th>REMOVE</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const isLow = item.quantity < item.min_level;
              // Calculate width % capped at 100%
              let pct = (item.quantity / item.min_level) * 100;
              if (pct > 100) pct = 100;
              if (pct < 0) pct = 0;

              return (
                <tr key={item.id}>
                  <td className={styles.cellIngredient}>{item.ingredient}</td>
                  <td className={styles.cellUnit}>{item.unit}</td>
                  <td className={styles.cellStockLevel}>
                    <div className={styles.barBg}>
                      <div 
                        className={`${styles.barFill} ${isLow ? styles.barRed : styles.barGreen}`}
                        style={{ '--w': `${pct}%` } as React.CSSProperties}
                      ></div>
                    </div>
                  </td>
                  <td className={styles.cellMin}>{item.min_level}</td>
                  <td className={styles.cellStatus}>
                    <span className={`${styles.badge} ${isLow ? styles.badgeLow : styles.badgeOk}`}>
                      {isLow ? 'Low stock' : 'OK'}
                    </span>
                  </td>
                  <td className={styles.cellUpdate}>
                    <div className={styles.updateWrapper}>
                      <input 
                        type="number" 
                        step="0.01"
                        className={styles.qtyInput}
                        value={updateValues[item.id] !== undefined ? updateValues[item.id] : item.quantity}
                        onChange={(e) => handleUpdateChange(item.id, e.target.value)}
                      />
                      <button className={styles.saveBtn} onClick={() => saveInvQty(item.id)}>
                        Update
                      </button>
                    </div>
                  </td>
                  <td className={styles.cellRemove}>
                    <button className={styles.removeBtn} onClick={() => deleteInvItem(item.id, item.ingredient)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.emptyState}>No inventory items found. Add your first ingredient!</td>
              </tr>
            )}
          </tbody>
        </table>
    </div>

      {/* 4. Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-icon">
              <FiAlertCircle size={48} color="#e11d48" />
            </div>
            <h2>Remove Ingredient?</h2>
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