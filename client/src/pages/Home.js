import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiCall } from '../utils/api';
import { getImageUrl } from '../utils/imageUtils';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiCall('/api/products?page=1&limit=10');
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    
    // تحديث تلقائي كل دقيقة للتأكد من تحديث الأسعار
    const interval = setInterval(fetchProducts, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      {/* رأس الصفحة */}
      <div className="home-header">
        <div className="home-header-content">
          <div>
            <h1 className="home-title">EvaNox</h1>
            <p className="home-subtitle">مجموعة فاخرة من المجوهرات الذهبية والماسية</p>
          </div>
          <div className="home-nav-buttons">
            <Link to="/login" className="home-nav-button">
              تسجيل الدخول
            </Link>
            <Link to="/register" className="home-nav-button secondary">
              إنشاء حساب
            </Link>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="home-main-content">
        <h2 className="products-title">منتجات المتجر</h2>
        {loading ? (
          <div className="loading-container">
            <div>
              <div className="loading-spinner"></div>
              <p>جاري تحميل المنتجات...</p>
            </div>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id || product.id} className="product-card">
                <div className="product-image-container">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={getImageUrl(product.images, 0)} 
                      alt={product.name} 
                      className="product-image"
                      onClick={() => window.open(getImageUrl(product.images, 0), '_blank')}
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      لا صورة متاحة
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-details">{product.productType} | {product.material}</p>
                  <p className="product-specs">العيار: {product.karat || product.carat} | الوزن: {product.weight}غ</p>
                  <div className="product-prices">
                    {product.totalPrice && product.totalPrice.usd !== undefined && (
                      <span className="price-badge usd">
                        {product.totalPrice.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                      </span>
                    )}
                    {product.totalPrice && product.totalPrice.syp !== undefined && (
                      <span className="price-badge syp">
                        {product.totalPrice.syp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SYP
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}          
          {/* رسالة إنشاء حساب */}
          <div className="register-message">
            <div className="register-message-content">
              <h3 className="register-message-title">اكتشف المزيد من منتجاتنا الفاخرة</h3>
              <p className="register-message-text">قم بإنشاء حساب لكي ترى المزيد من منتجاتنا المميزة</p>
              <Link to="/register" className="register-message-button">
                إنشاء حساب الآن
              </Link>
            </div>
          </div>
      
      </div>
    </div>
  );
};

export default Home;
