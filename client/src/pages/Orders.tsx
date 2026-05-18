import React, { useState, useEffect } from 'react';
import { FiTrash2, FiPlus, FiX, FiCheck, FiInfo, FiAlertCircle, FiPackage } from 'react-icons/fi';
import { ordersAPI, productsAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import styles from './Orders.module.css';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: number;
  customer: string;
  phone: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  items?: Array<{
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    name: string;
    category: string;
  }>;
}

interface Notification {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: '',
    type: 'success',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; customer: string } | null>(null);

  const [formData, setFormData] = useState({
    customer: '',
    phone: '',
    notes: '',
    items: [] as OrderItem[],
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      console.log('Orders fetched:', response.data);
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const handleStatusChange = async (id: number, newStatus: any) => {
    try {
      await ordersAPI.updateStatus(id, newStatus);
      fetchOrders();
      showToast('Status updated successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = (id: number, customer: string) => {
    setDeleteConfirm({ id, customer });
  };

  const confirmDeleteAction = async () => {
    if (!deleteConfirm) return;

    try {
      await ordersAPI.delete(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchOrders();
      showToast('Order deleted successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete order', 'error');
    }
  };

  const addItem = () => {
    if (products.length === 0) {
      showToast('Loading products...', 'error');
      return;
    }

    const firstProd = products[0];

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: firstProd.id,
          quantity: 1,
          unit_price: firstProd.price,
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };

    if (field === 'product_id') {
      const selectedProd = products.find((p) => p.id === parseInt(value));
      if (selectedProd) {
        item.product_id = selectedProd.id;
        item.unit_price = selectedProd.price;
      }
    } else {
      item[field] = parseFloat(value) || 0;
    }

    newItems[index] = item;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  };

  const total = calculateTotal();

  const stats = {
    total: orders.length,
    completed: orders.filter((o) => o.status === 'completed').length,
    pending: orders.filter((o) => o.status === 'pending').length,
    revenue: orders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0),
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      showToast('Please add at least one item', 'error');
      return;
    }

    setLoading(true);

    try {
      await ordersAPI.create({
        customer: formData.customer || 'Walk-in Customer',
        phone: formData.phone,
        notes: formData.notes,
        items: formData.items,
      });

      setShowModal(false);
      setFormData({ customer: '', phone: '', notes: '', items: [] });
      fetchOrders();
      showToast('✅ Order saved successfully!');
    } catch (err: any) {
      showToast('Error: ' + (err.response?.data?.message || 'Server error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container} page-entry`}>
      {notification.show && (
        <div className={`toast-container toast-${notification.type}`}>
          {notification.type === 'success' ? <FiCheck /> : <FiInfo />}
          <span>{notification.message}</span>
        </div>
      )}

      <PageHeader
        icon={<FiPackage />}
        title="Orders"
        subtitle={new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
        actions={
          <button type="button" className={styles.newOrderBtn} onClick={() => setShowModal(true)}>
            <FiPlus size={18} />
            <span>New order</span>
          </button>
        }
      />

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.total}</span>
          <span className={styles.statLabel}>Total orders</span>
        </div>

        <div className={styles.statCard}>
          <span className={`${styles.statValue} ${styles.valGreen}`}>{stats.completed}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>

        <div className={styles.statCard}>
          <span className={`${styles.statValue} ${styles.valOrange}`}>{stats.pending}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statValue}>Rs. {stats.revenue.toLocaleString()}</span>
          <span className={styles.statLabel}>Total revenue</span>
        </div>
      </div>

      <div className={styles.mainCard}>
        <div className={styles.tableFilters}>
          <div className={styles.searchWrapper}>
            <input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className={`${styles.tableWrapper} table-responsive`}>
          <table className={styles.orderTable}>
            <thead>
              <tr>
                <th></th>
                <th>ORDER #</th>
                <th>CUSTOMER</th>
                <th>PHONE</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>UPDATE</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className={expandedOrderId === order.id ? styles.expandedRow : ''} 
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      style={{ cursor: 'pointer' }}>
                    <td className={styles.expandIcon}>
                      <span>{expandedOrderId === order.id ? '▼' : '▶'}</span>
                    </td>
                    <td className={styles.orderId}>#{order.id}</td>
                    <td className={styles.customerName}>{order.customer}</td>
                    <td className={styles.phoneNum}>{order.phone || '—'}</td>
                    <td className={styles.totalVal}>
                      Rs. {Math.round(order.total).toLocaleString()}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.statusAction}>
                        <select
                          className={styles.actionSelect}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className={styles.actionCell}>
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order.id, order.customer);
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                  
                  {expandedOrderId === order.id && (
                    <tr className={styles.itemsExpandRow}>
                      <td colSpan={8}>
                        <div className={styles.itemsContainer}>
                          <h4 className={styles.itemsTitle}>Order Items</h4>
                          {order.items && order.items.length > 0 ? (
                            <div className={styles.itemsList}>
                              {order.items.map((item, idx) => (
                                <div key={idx} className={styles.itemRow}>
                                  <div className={styles.itemInfo}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemCategory}>{item.category}</span>
                                  </div>
                                  <div className={styles.itemQty}>Qty: {item.quantity}</div>
                                  <div className={styles.itemPrice}>
                                    Rs. {(item.quantity * item.unit_price).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className={styles.noItemsMessage}>No items found for this order</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`${styles.modalOverlay} ${showModal ? styles.modalOverlayOpen : ''}`}
        aria-hidden={!showModal}
        onClick={() => !loading && setShowModal(false)}
      >
        <div
          className={styles.modal}
          role="dialog"
          aria-modal={showModal ? true : undefined}
          aria-labelledby="order-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
            <div className={styles.modalHeader}>
              <h3 id="order-modal-title" className={styles.modalTitle}>
                Create New Order
              </h3>
              <button type="button" className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label>CUSTOMER NAME</label>
                  <input
                    placeholder="Walk-in Customer"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>PHONE NUMBER</label>
                  <input
                    placeholder="e.g. 0771234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>NOTES</label>
                <textarea
                  className={styles.notesArea}
                  placeholder="Any special instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className={styles.itemsSection}>
                <div className={styles.itemsHeader}>
                  <label>ORDER ITEMS</label>
                  <button type="button" className={styles.addItemBtn} onClick={addItem}>
                    <FiPlus /> Add Item
                  </button>
                </div>

                <div className={styles.itemsList}>
                  {formData.items.length === 0 && (
                    <p className={styles.emptyItemsHint}>
                      No line items yet. Use <strong>Add item</strong> to include products from your catalogue.
                    </p>
                  )}
                  {formData.items.map((item, index) => (
                    <div key={index} className={styles.itemRow}>
                      <select
                        value={item.product_id}
                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Rs. {p.price})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />

                      <span className={styles.rowPrice}>
                        Rs. {(item.quantity * item.unit_price).toLocaleString()}
                      </span>

                      <button
                        type="button"
                        className={styles.removeRowBtn}
                        onClick={() => removeItem(index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.sumBox}>
                <h4 className={styles.sumBoxTitle}>Order summary</h4>
                <div className={styles.sumBoxRow}>
                  <span>Items</span>
                  <span>{formData.items.length}</span>
                </div>
                <div className={`${styles.sumBoxRow} ${styles.sumBoxTotal}`}>
                  <span>Grand total</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Discard
                </button>

                <button type="submit" className={styles.createBtn} disabled={loading}>
                  {loading ? (
                    'Saving...'
                  ) : (
                    <>
                      <FiCheck style={{ marginRight: '8px' }} /> Save order
                    </>
                  )}
                </button>
              </div>
            </form>
        </div>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-icon">
              <FiAlertCircle size={48} color="#e11d48" />
            </div>

            <h2>Remove Order?</h2>

            <p>
              Are you sure you want to remove order <strong>#{deleteConfirm.id}</strong> for{' '}
              <strong>{deleteConfirm.customer}</strong>? This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Keep it
              </button>

              <button className="modal-btn-confirm" onClick={confirmDeleteAction}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}