import React, { useState } from 'react';
import '../login/Login.css';
import logo from '../logo.svg';
import { FaExchangeAlt } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../utils/api';

const CustomerIcon = ({ animating }) => (
  <svg className={`login-user-icon${animating ? ' icon-bounce' : ''}`} width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Customer Icon">
    <circle cx="28" cy="28" r="28" fill="#61dafb"/>
    <circle cx="28" cy="22" r="8" fill="#23272f"/>
    <ellipse cx="28" cy="40" rx="14" ry="8" fill="#23272f"/>
  </svg>
);

const OwnerIcon = ({ animating }) => (
  <svg className={`login-user-icon${animating ? ' icon-bounce' : ''}`} width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Owner Icon">
    <circle cx="28" cy="28" r="28" fill="#fbbf24"/>
    <circle cx="28" cy="22" r="8" fill="#23272f"/>
    <ellipse cx="28" cy="40" rx="14" ry="8" fill="#23272f"/>
    <rect x="18" y="44" width="20" height="4" rx="2" fill="#fff3cd"/>
  </svg>
);

function Login() {
  const [userType, setUserType] = useState('customer');
  const [animating, setAnimating] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSwap = () => {
    setAnimating(true);
    setTimeout(() => {
      setUserType(userType === 'customer' ? 'owner' : 'customer');
      setAnimating(false);
      setError('');
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
          try {
        const payload = usernameOrEmail.includes('@')
          ? { email: usernameOrEmail, password }
          : { username: usernameOrEmail, password };
      
      const res = await apiCall('/api/users/login', {
        method: 'POST',
        body: JSON.stringify(payload),
              });
        
        const responseText = await res.text();
        
        // Try to parse as JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          setError('Server returned invalid response. Please try again.');
          return;
        }
        
        if (!res.ok) {
          setError(data.message || 'فشل تسجيل الدخول');
          return;
        }
        
        // Check role matches selected type
        if (data.user.role !== userType) {
          setError('نوع الحساب غير صحيح لهذا الدخول');
          return;
        }
        
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Also store refresh token if provided
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        

       
        // Redirect
      if (data.user.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
         } catch (err) {
       setError('حدث خطأ أثناء تسجيل الدخول');
     }
  };

  return (
    <div className={`login-container ${userType} ${animating ? 'animating' : ''}`}>
      <div className={`login-box ${animating ? 'box-animating' : ''}`}>
        <div className="login-icon-wrapper">
          {userType === 'customer' ? <CustomerIcon animating={animating} /> : <OwnerIcon animating={animating} />}
        </div>
        <h2>{userType === 'customer' ? 'تسجيل دخول العميل' : 'تسجيل دخول المالك'}</h2>
        <form autoComplete="on" onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="البريد الإلكتروني أو اسم المستخدم"
            autoComplete="username"
            value={usernameOrEmail}
            onChange={e => setUsernameOrEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit">تسجيل الدخول</button>
        </form>
        {error && <div className="login-error">{error}</div>}
        {userType === 'customer' && (
          <div className="login-register-link">
            <Link to="/register" className="login-register-button">
              إنشاء حساب جديد
            </Link>
          </div>
        )}
        <button
          className={`swap-btn-icon ${userType}`}
          onClick={handleSwap}
          disabled={animating}
          aria-label={userType === 'customer' ? 'Switch to Owner' : 'Switch to Customer'}
          title={userType === 'customer' ? 'Switch to Owner' : 'Switch to Customer'}
        >
          <FaExchangeAlt size={28} />
        </button>
      </div>
    </div>
  );
}

export default React.memo(Login); 