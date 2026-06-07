import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../utils/api';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await adminLogin(password);
      localStorage.setItem('admin_token', data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__icon">
          <FiLock />
        </div>
        <h1 className="admin-login__title">Admin Access</h1>
        <p className="admin-login__subtitle">#NIRA Dashboard</p>

        <form onSubmit={handleSubmit} className="admin-login__form">
          <div className="admin-login__input-wrapper">
            <input
              type={showPass ? 'text' : 'password'}
              className="admin-login__input"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              autoFocus
            />
            <button
              type="button"
              className="admin-login__toggle"
              onClick={() => setShowPass(!showPass)}
              tabIndex={-1}
            >
              {showPass ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {error && <p className="admin-login__error">{error}</p>}

          <button
            type="submit"
            className="admin-login__submit"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <button
          className="admin-login__back"
          onClick={() => navigate('/')}
        >
          ← Back to Wedding Site
        </button>
      </div>

      <style>{`
        .admin-login {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f0f14;
          padding: var(--space-xl);
        }

        .admin-login__card {
          width: 100%;
          max-width: 400px;
          background: #1a1a24;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-xl);
          padding: var(--space-3xl);
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .admin-login__icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-xl);
          font-size: 1.5rem;
          color: white;
        }

        .admin-login__title {
          font-family: var(--font-body);
          font-size: 1.5rem;
          font-weight: 600;
          color: #f0f0f5;
          margin-bottom: var(--space-xs);
        }

        .admin-login__subtitle {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: #6b6b80;
          margin-bottom: var(--space-2xl);
        }

        .admin-login__form {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .admin-login__input-wrapper {
          position: relative;
        }

        .admin-login__input {
          width: 100%;
          padding: 14px 50px 14px 16px;
          background: #12121a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          color: #f0f0f5;
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        .admin-login__input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .admin-login__input::placeholder {
          color: #4a4a5a;
        }

        .admin-login__toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b6b80;
          cursor: pointer;
          padding: 4px;
          font-size: 1.1rem;
          display: flex;
        }

        .admin-login__toggle:hover {
          color: #9b9bb0;
        }

        .admin-login__error {
          font-size: 0.85rem;
          color: #f87171;
          text-align: left;
          padding: 8px 12px;
          background: rgba(248, 113, 113, 0.08);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(248, 113, 113, 0.15);
        }

        .admin-login__submit {
          padding: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.03em;
        }

        .admin-login__submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
        }

        .admin-login__submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .admin-login__back {
          display: inline-block;
          margin-top: var(--space-xl);
          font-size: 0.85rem;
          color: #6b6b80;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }

        .admin-login__back:hover {
          color: #9b9bb0;
        }
      `}</style>
    </div>
  );
}
