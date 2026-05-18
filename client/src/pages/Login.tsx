import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isRegistering) {
        response = await authAPI.register({ username, password, email });
        setError('');
        alert('Registration successful! Please login.');
        setIsRegistering(false);
        setUsername('');
        setPassword('');
        setEmail('');
      } else {
        response = await authAPI.login({ username, password });
        const { token, user } = response.data;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>🍞 Bakery ERP</h1>
          <p className={styles.subtitle}>Admin & Staff Operations System</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={`${styles.alert} ${styles.alertDanger}`}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {isRegistering && (
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Loading...' : isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <div className={styles.toggleAuth}>
          <p>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
            >
              {isRegistering ? 'Login here' : 'Register here'}
            </button>
          </p>
        </div>

        <div className={styles.demoCredentials}>
          <p className={styles.demoTitle}>Demo Credentials:</p>
          <p>Username: <code>admin</code></p>
          <p>Password: <code>password123</code></p>
        </div>
      </div>
    </div>
  );
}