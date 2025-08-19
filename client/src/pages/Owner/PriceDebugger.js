import React, { useState, useEffect } from 'react';
import { Bug, RefreshCw, Eye, X } from 'lucide-react';
import './styles/PriceDebugger.css';

const PriceDebugger = ({ onBack }) => {
  const [materialPrices, setMaterialPrices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch material prices
      const pricesRes = await fetch('/api/material-prices', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (pricesRes.ok) {
        const prices = await pricesRes.json();
        setMaterialPrices(prices);
        console.log('📊 Material Prices:', prices);
      }
      
      // Fetch products
      const productsRes = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
        console.log('📦 Products:', data.products);
      }
    } catch (err) {
      console.error('❌ Error fetching data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="price-debugger-container">
      <div className="price-debugger-header">
        <div className="price-debugger-title-section">
          <div className="price-debugger-icon">
            <Bug className="h-6 w-6 text-white" />
          </div>
          <h2 className="price-debugger-title">مصحح الأسعار - للاختبار</h2>
        </div>
        <div className="price-debugger-actions">
          <button
            onClick={fetchData}
            disabled={loading}
            className="debugger-action-button primary"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </button>
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                window.history.back();
              }
            }}
            className="debugger-action-button back"
          >
            <X className="h-4 w-4" />
            العودة
          </button>
        </div>
      </div>

      {/* Material Prices */}
      <div className="material-prices-section">
        <h3 className="material-prices-title">أسعار المواد الأساسية</h3>
        <div className="material-prices-grid">
          {materialPrices.map((price) => (
            <div key={price.material} className="material-price-card">
              <h4 className="material-price-title">{price.material}</h4>
              <div className="material-price-details">
                <div className="material-price-item">
                  <span className="material-price-label">USD:</span>
                  <span className="material-price-value">{price.pricePerGram.usd}</span>
                </div>
                <div className="material-price-item">
                  <span className="material-price-label">SYP:</span>
                  <span className="material-price-value">{price.pricePerGram.syp}</span>
                </div>
                <div className="material-price-update">
                  آخر تحديث: {new Date(price.lastUpdated).toLocaleString('ar-EG')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="products-section">
        <h3 className="products-title">المنتجات وأسعارها</h3>
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>اسم المنتج</th>
                <th>المادة</th>
                <th>الوزن</th>
                <th>سعر الغرام USD</th>
                <th>سعر الغرام SYP</th>
                <th>السعر الكلي USD</th>
                <th>السعر الكلي SYP</th>
                <th>أجار الصياغة</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.material}</td>
                  <td>{product.weight}g</td>
                  <td>
                    {product.gramPrice?.usd || 'غير محدد'}
                  </td>
                  <td>
                    {product.gramPrice?.syp || 'غير محدد'}
                  </td>
                  <td>
                    {product.totalPrice?.usd || 'غير محدد'}
                  </td>
                  <td>
                    {product.totalPrice?.syp || 'غير محدد'}
                  </td>
                  <td>
                    {product.gramWage || 'غير محدد'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions-section">
        <h4 className="instructions-title">تعليمات الاختبار:</h4>
        <ul className="instructions-list">
          <li>افتح Developer Tools (F12) لرؤية الـ console logs</li>
          <li>قم بتحديث سعر مادة في صفحة إدارة الأسعار</li>
          <li>اضغط "تحديث المنتجات"</li>
          <li>عد إلى هذه الصفحة واضغط "تحديث البيانات"</li>
          <li>تحقق من الـ console لرؤية تفاصيل الحسابات</li>
        </ul>
      </div>
    </div>
  );
};

export default PriceDebugger; 