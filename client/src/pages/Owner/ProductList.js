import React, { useEffect, useRef, useState } from 'react';
import { Edit, Trash2, Pin, PinOff, Diamond, Star, Eye } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import './styles/ProductList.css';

const ProductList = ({
  products,
  onEdit,
  onDelete,
  onTogglePin,
  onView,
  loadingMore = false,
}) => {
  const getMaterialIcon = (material) => {
    switch (material) {
      case 'ألماس':
        return <Diamond className="h-5 w-5" style={{ color: '#D4AF37' }} />;
      case 'ذهب':
        return <Star className="h-5 w-5" style={{ color: '#D4AF37' }} />;
      case 'فضة':
        return <div className="h-5 w-5 bg-gray-400 rounded-full" />;
      default:
        return null;
    }
  };

  const getMaterialLabel = (material) => {
    switch (material) {
      case 'diamond':
        return 'ألماس';
      case 'gold':
        return 'ذهب';
      case 'silver':
        return 'فضة';
      default:
        return material;
    }
  };

  const getProductTypeLabel = (type) => {
    const types = {
      'ring': 'خاتم',
      'sized-ring': 'محبس',
      'necklace': 'أسم',
      'earring': 'حلق',
      'bracelet': 'اسوارة',
      'collar': 'طوق',
      'set': 'طقم',
      'anklet': 'خلخال',
      'lira': 'ليرة',
      'half-lira': 'نصف ليرة',
      'quarter-lira': 'ربع ليرة',
      'ounce': 'أونصة',
    };
    return types[type] || type;
  };

  // Helper for image slideshow per product
  const [imageIndexes, setImageIndexes] = useState({});
  const intervalRefs = useRef({});

  useEffect(() => {
    // Start interval for each product with multiple images
    products.forEach(product => {
      if (product.images && product.images.length > 1 && !intervalRefs.current[product.id || product._id]) {
        intervalRefs.current[product.id || product._id] = setInterval(() => {
          setImageIndexes(prev => ({
            ...prev,
            [product.id || product._id]: ((prev[product.id || product._id] || 0) + 1) % product.images.length
          }));
        }, 3000);
      }
    });
    // Cleanup on unmount
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
      intervalRefs.current = {};
    };
  }, [products]);

  // Animation: only animate new products when scrolling down
  const [shown, setShown] = useState([]);
  const prevLength = useRef(0);
  useEffect(() => {
    // Only animate new products (not on initial load)
    if (products.length > prevLength.current) {
      let i = prevLength.current;
      const animateNew = () => {
        setShown(prev => {
          const next = products[i]?.id || products[i]?._id;
          if (next && !prev.includes(next)) {
            return [...prev, next];
          }
          return prev;
        });
        i++;
        if (i < products.length) {
          setTimeout(animateNew, 80);
        }
      };
      animateNew();
    }
    prevLength.current = products.length;
  }, [products]);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg mb-4" style={{ color: '#B0B0B0' }}>لا توجد منتجات</div>
        <p style={{ color: '#666666' }}>ابدأ بإضافة منتج جديد</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product, idx) => {
        const currentIndex = imageIndexes[product.id || product._id] || 0;
        // Only animate if this product was newly loaded (not on initial load)
        const isAnimated = shown.includes(product.id || product._id);
        return (
          <div
            key={product._id || product.id}
            className={`product-card ${product.pinned ? 'pinned' : ''} ${isAnimated ? 'animated' : ''}`}
            style={{ 
              transitionDelay: isAnimated ? `${(idx - prevLength.current) * 60}ms` : '0ms'
            }}
          >
            {/* Product Image Slideshow */}
            <div className="product-image-container">
              {product.images && product.images.length > 0 ? (
                <img
                  src={getImageUrl(product.images, currentIndex)}
                  alt={product.name}
                  className="product-image"
                />
              ) : (
                <div className="product-image-placeholder">
                  {getMaterialIcon(product.material)}
                </div>
              )}
              {product.pinned && (
                <div className="pinned-badge">
                  مثبت
                </div>
              )}
            </div>

            {/* Product Info - Redesigned */}
            <div className="product-content">
              {/* Name and Material */}
              <div className="product-header">
                <h3 className="product-title">{product.name}</h3>
                <div className="product-material">
                  {getMaterialIcon(product.material)}
                  <span className="material-label">{getMaterialLabel(product.material)}</span>
                </div>
              </div>

              {/* Type, Karat, Weight */}
              <div className="product-details">
                <div className="detail-item">
                  <span className="detail-label">النوع:</span> 
                  <span className="detail-value">{getProductTypeLabel(product.productType)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">العيار:</span> 
                  <span className="detail-value">{product.karat || product.carat}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">الوزن:</span> 
                  <span className="detail-value">{product.weight}غ</span>
                </div>
              </div>

              {/* Price */}
              <div className="product-price">
                <span className="price-label">السعر:</span>
                <div className="price-values">
                  {product.totalPrice && product.totalPrice.usd !== undefined && (
                    <span className="price-usd">
                      {product.totalPrice.usd.toFixed(2)} <span className="currency">USD</span>
                    </span>
                  )}
                  {product.totalPrice && product.totalPrice.syp !== undefined && (
                    <span className="price-syp">
                      {product.totalPrice.syp.toFixed(2)} <span className="currency">SYP</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <p className="product-description">{product.description}</p>
              )}

              {/* Actions */}
              <div className="product-actions">
                <div className="action-buttons">
                  <button
                    onClick={() => onEdit(product)}
                    className="action-button edit"
                    title="تعديل"
                  >
                    <Edit className="action-icon" />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="action-button delete"
                    title="حذف"
                  >
                    <Trash2 className="action-icon" />
                  </button>
                  <button
                    onClick={() => onView(product)}
                    className="action-button view"
                    title="عرض التفاصيل"
                  >
                    <Eye className="action-icon" />
                  </button>
                  <button
                    onClick={() => {
                      onTogglePin(product._id || product.id);
                    }}
                    className={`action-button pin ${product.pinned ? 'pinned' : ''}`}
                    title={product.pinned ? 'إلغاء التثبيت' : 'تثبيت'}
                  >
                    {product.pinned ? (
                      <PinOff className="action-icon" />
                    ) : (
                      <Pin className="action-icon" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {loadingMore && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default ProductList; 