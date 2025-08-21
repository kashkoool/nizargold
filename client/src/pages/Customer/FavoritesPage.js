import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, MessageCircle, ArrowLeft, Trash2, Share2, ShoppingBag, Sun, Moon } from 'lucide-react';
import { apiCall, apiCallWithRefresh } from '../../utils/api';
import { logout, useAutoLogout } from '../../utils/auth';
import { getImageUrl } from '../../utils/imageUtils';
import './styles/FavoritesPage.css';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

const FavoritesPage = () => {
  useAutoLogout(INACTIVITY_TIMEOUT);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Apply theme on mount and theme change
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const theme = savedTheme || (isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }, [isDarkMode]);

  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState({});
  const [commentModal, setCommentModal] = useState({ open: false, product: null, view: false });
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [imageIndexes, setImageIndexes] = useState({});
  const slideshowIntervals = useRef({});
  const [showRemoveConfirm, setShowRemoveConfirm] = useState({ open: false, productId: null });
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  // Helper: fetch with auto-refresh on 401
  async function fetchWithRefresh(url, options = {}, retry = true) {
    return await apiCallWithRefresh(url, options);
  }

  // Fetch favorite products
  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      setLoading(true);
            try {
        const res = await fetchWithRefresh('/api/products/favorites/user');
        
        if (res.ok) {
          const data = await res.json();
          setFavoriteProducts(data.products || []);
        } else {
          const errorText = await res.text();
          }
      } catch (error) {
        }
      setLoading(false);
    };
    fetchFavoriteProducts();
  }, []);

  // Auto-slideshow for product images
  useEffect(() => {
    favoriteProducts.forEach(product => {
      const id = product._id || product.id;
      if (product.images && product.images.length > 1 && !slideshowIntervals.current[id]) {
        slideshowIntervals.current[id] = setInterval(() => {
          setImageIndexes(prev => ({
            ...prev,
            [id]: ((prev[id] || 0) + 1) % product.images.length
          }));
        }, 2500);
      }
    });
    return () => {
      Object.values(slideshowIntervals.current).forEach(clearInterval);
      slideshowIntervals.current = {};
    };
  }, [favoriteProducts]);

  const handleLike = async (productId) => {
    setLikeLoading(prev => ({ ...prev, [productId]: true }));
    try {
      const res = await fetchWithRefresh(`/api/products/${productId}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        // Remove product from favorites if unliked
        if (!data.liked) {
          setFavoriteProducts(prev => prev.filter(p => p._id !== productId));
        } else {
          setFavoriteProducts(prev => prev.map(p =>
            p._id === productId ? { ...p, likes: data.likes, liked: data.liked } : p
          ));
        }
      }
    } catch (error) {
      }
    setLikeLoading(prev => ({ ...prev, [productId]: false }));
  };

  const confirmRemoveFromFavorites = (productId) => {
    setShowRemoveConfirm({ open: true, productId });
  };

  const handleRemoveFromFavorites = async () => {
    if (showRemoveConfirm.productId) {
      await handleLike(showRemoveConfirm.productId);
      setShowRemoveConfirm({ open: false, productId: null });
    }
  };

  const cancelRemoveFromFavorites = () => {
    setShowRemoveConfirm({ open: false, productId: null });
  };

  const handleClearAllFavorites = async () => {
    try {
      // Remove all favorites one by one
      for (const product of favoriteProducts) {
        await handleLike(product._id);
      }
      setShowClearAllConfirm(false);
    } catch (error) {
      }
  };

  const openCommentModal = (product, view = false) => {
    setCommentModal({ open: true, product, view });
    setCommentText('');
    setComments([]);
    if (view) fetchComments(product._id);
  };

  const closeCommentModal = () => {
    setCommentModal({ open: false, product: null, view: false });
    setCommentText('');
    setComments([]);
  };

  const fetchComments = async (productId) => {
    setCommentsLoading(true);
    try {
      const res = await fetchWithRefresh(`/api/comments?product=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data || []);
      }
    } catch (error) {
      }
    setCommentsLoading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetchWithRefresh('/api/comments', {
        method: 'POST',
        body: JSON.stringify({ 
          product: commentModal.product._id, 
          content: commentText 
        }),
      });
      if (res.ok) {
        setCommentText('');
        fetchComments(commentModal.product._id);
      }
    } catch (error) {
      }
  };

  const handleLogout = () => {
    logout(navigate);
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading-favorites">
          <div className="loading-spinner"></div>
          <p>جاري تحميل المنتجات المفضلة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      {/* Header */}
      <div className="favorites-header">
        <div className="header-content">
          <button
            onClick={() => window.location.href = '/customer/dashboard'}
            className="back-button"
            title="العودة إلى لوحة التحكم"
          >
            <ArrowLeft className="back-icon" />
            <span>رجوع</span>
          </button>
          
          <div className="header-main">
            <div className="title-section">
              <Heart className="title-icon" />
              <h1 className="favorites-title">المنتجات المفضلة</h1>
            </div>
            <p className="favorites-subtitle">مجموعة منتجاتك المفضلة المختارة بعناية</p>
          </div>
          
          <div className="header-actions">
            <button 
              className="favorites-theme-toggle-button"
              onClick={toggleTheme}
              title={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
            >
              {isDarkMode ? <Sun className="favorites-theme-icon" /> : <Moon className="favorites-theme-icon" />}
            </button>
            
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="تسجيل الخروج"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="favorites-main-content">
        {/* Quick Actions */}
        {favoriteProducts.length > 0 && (
          <div className="quick-actions">
            <h3 className="quick-actions-title">إجراءات سريعة</h3>
            <div className="quick-actions-buttons">
              <button
                onClick={() => setShowClearAllConfirm(true)}
                className="clear-all-btn"
              >
                <Trash2 className="btn-icon" />
                مسح الكل
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'منتجاتي المفضلة',
                      text: `لدي ${favoriteProducts.length} منتج مفضل في متجر نزار للمجوهرات`,
                      url: window.location.href
                    });
                  }
                }}
                className="share-favorites-btn"
              >
                <Share2 className="btn-icon" />
                مشاركة
              </button>
              <button
                onClick={() => window.location.href = '/customer/dashboard'}
                className="browse-more-btn"
              >
                <ShoppingBag className="btn-icon" />
                تصفح المزيد
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {favoriteProducts.length === 0 ? (
          <div className="empty-favorites">
            <Heart className="empty-favorites-icon" />
            <h3 className="empty-favorites-title">لا توجد منتجات مفضلة</h3>
            <p className="empty-favorites-text">
              لم تقم بإضافة أي منتجات إلى المفضلة بعد. ابدأ بتصفح مجموعتنا الرائعة من المجوهرات الفاخرة
            </p>
            <button
              onClick={() => window.location.href = '/customer/dashboard'}
              className="back-to-shop-btn"
            >
              تصفح المنتجات
            </button>
            <div className="tip-text">
              💡 نصيحة: انقر على أيقونة القلب بجانب أي منتج لإضافته إلى المفضلة
            </div>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoriteProducts.map(product => {
              const id = product._id || product.id;
              const currentImageIndex = imageIndexes[id] || 0;
              const currentImage = getImageUrl(product.images, currentImageIndex);

              return (
                <div key={id} className="favorite-card">
                  {/* Remove Button */}
                  <button
                    className="remove-favorite-btn"
                    onClick={() => confirmRemoveFromFavorites(product._id)}
                    title="إزالة من المفضلة"
                  >
                    <Heart className="remove-icon" />
                  </button>

                  {/* Product Image */}
                  <div className="image-container">
                    {currentImage && currentImage !== 'https://via.placeholder.com/300x300?text=Product' ? (
                      <img
                        src={currentImage}
                        alt={product.name}
                        className="favorite-product-image"
                        onClick={() => window.open(currentImage, '_blank')}
                      />
                    ) : (
                      <div className="no-image-placeholder">
                        <Eye className="placeholder-icon" />
                        <span>لا توجد صورة</span>
                      </div>
                    )}
                    
                    {/* Image Navigation Dots */}
                    {product.images && product.images.length > 1 && (
                      <div className="image-dots">
                        {product.images.map((_, index) => (
                          <div
                            key={index}
                            className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="favorite-product-info">
                    <h3 className="favorite-product-title">{product.name}</h3>
                    
                    {product.material && (
                      <p className="favorite-product-description">
                        المادة: {product.material}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="favorite-product-actions">
                      <button
                        className="favorite-btn-primary"
                        onClick={() => openCommentModal(product, true)}
                        title="عرض التعليقات"
                      >
                        <MessageCircle className="btn-icon" />
                        التعليقات
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comment Modal */}
      {commentModal.open && (
        <div className="modal-overlay">
          <div className="comment-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {commentModal.view ? 'التعليقات' : 'إضافة تعليق'}
              </h3>
              <button
                onClick={closeCommentModal}
                className="close-modal-btn"
              >
                ✕
              </button>
            </div>
            {commentModal.product && (
              <p className="modal-subtitle">{commentModal.product.name}</p>
            )}

            <div className="modal-content">
              {commentModal.view ? (
                <div className="comments-section">
                  {commentsLoading ? (
                    <div className="loading-comments">
                      <div className="loading-spinner"></div>
                      <p>جاري تحميل التعليقات...</p>
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="comments-list">
                      {comments.map(comment => (
                        <div key={comment._id} className="comment-item">
                          <div className="comment-header">
                            <span className="comment-author">
                              {comment.user?.username || 'مستخدم'}
                            </span>
                            <span className="comment-date">
                              {new Date(comment.createdAt).toLocaleDateString('en-US')}
                            </span>
                          </div>
                          <p className="comment-content">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-comments">
                      <MessageCircle className="no-comments-icon" />
                      <p>لا توجد تعليقات بعد</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleAddComment} className="comment-form">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="comment-textarea"
                    rows="4"
                    placeholder="اكتب تعليقك هنا..."
                  />
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="submit-comment-btn"
                    >
                      إضافة تعليق
                    </button>
                    <button
                      type="button"
                      onClick={closeCommentModal}
                      className="cancel-comment-btn"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove from Favorites Confirmation Modal */}
      {showRemoveConfirm.open && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon">
              <Heart className="confirm-heart-icon" />
            </div>
            <h3 className="confirm-title">إلغاء الإعجاب</h3>
            <p className="confirm-message">
              هل أنت متأكد من إلغاء الإعجاب من هذا المنتج؟
            </p>
            <div className="confirm-actions">
              <button
                onClick={handleRemoveFromFavorites}
                className="confirm-btn confirm-remove"
              >
                إلغاء الإعجاب
              </button>
              <button
                onClick={cancelRemoveFromFavorites}
                className="confirm-btn confirm-cancel"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearAllConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon">
              <Trash2 className="confirm-trash-icon" />
            </div>
            <h3 className="confirm-title">مسح جميع المفضلة</h3>
            <p className="confirm-message">
              هل أنت متأكد من مسح جميع المنتجات من المفضلة؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="confirm-actions">
              <button
                onClick={handleClearAllFavorites}
                className="confirm-btn confirm-remove"
              >
                مسح الكل
              </button>
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="confirm-btn confirm-cancel"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage; 