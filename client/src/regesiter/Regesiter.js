import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../utils/api';
import './Regesiter.css';

const Regesiter = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const res = await apiCall('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, role: 'customer' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'فشل إنشاء الحساب');
        return;
      }
      setSuccess('تم إنشاء الحساب بنجاح! سيتم تحويلك لصفحة تسجيل الدخول...');
      setUsername('');
      setEmail('');
      setPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError('حدث خطأ أثناء إنشاء الحساب');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">إنشاء حساب جديد</h2>
        <div className="register-welcome">
          <p className="register-welcome-text">كن جزء من عائلتنا</p>
        </div>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="register-input"
          />
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="register-input"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="register-input"
          />
          <button type="submit" className="register-button">
            إنشاء حساب
          </button>
        </form>
        
        {success && <div className="register-message success">{success}</div>}
        {error && <div className="register-message error">{error}</div>}
        
        <div className="register-login-link">
          <p className="register-login-text">لديك حساب بالفعل؟</p>
          <Link to="/login" className="register-login-button">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Regesiter;
