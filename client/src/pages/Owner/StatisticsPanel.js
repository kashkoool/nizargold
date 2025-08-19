import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, TrendingUp, Eye, Star, X, BarChart3, Moon, Sun } from 'lucide-react';
import './styles/StatisticsPanel.css';

const StatisticsPanel = ({ onBack }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/statistics/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Statistics data:', data);
        setStatistics(data);
      } else {
        const errorData = await res.json();
        console.error('Failed to fetch statistics:', errorData);
        setStatistics(null);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
      setStatistics(null);
    }
    setLoading(false);
  };

  const fetchProductDetails = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/statistics/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setDetailedStats(data);
        setShowDetails(true);
      }
    } catch (err) {
      console.error('Failed to fetch product details:', err);
    }
  };

  const getMaterialColor = (material) => {
    switch (material) {
      case 'ذهب':
      case 'gold':
        return 'text-yellow-600 bg-yellow-100';
      case 'فضة':
      case 'silver':
        return 'text-gray-600 bg-gray-100';
      case 'ألماس':
      case 'diamond':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMaterialIcon = (material) => {
    switch (material) {
      case 'ذهب':
      case 'gold':
        return '🟡';
      case 'فضة':
      case 'silver':
        return '⚪';
      case 'ألماس':
      case 'diamond':
        return '💎';
      default:
        return '📦';
    }
  };

  if (loading) {
    return (
      <div className="statistics-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="statistics-container">
        <div className="statistics-header">
          <div className="statistics-title-section">
            <div className="statistics-icon">
              <BarChart3 className="h-6 w-6 text-black" />
            </div>
            <h2 className="statistics-title">إحصائيات المنتجات</h2>
          </div>
          <div className="statistics-actions">
            <button
              onClick={onBack}
              className="statistics-action-button back"
            >
              <X className="h-4 w-4" />
              العودة
            </button>
          </div>
        </div>
        <div className="error-container">
          <div className="error-icon">
            <BarChart3 className="h-12 w-12" />
          </div>
          <h3 className="error-title">فشل في تحميل الإحصائيات</h3>
          <p className="error-message">حدث خطأ أثناء تحميل البيانات</p>
          <button
            onClick={fetchStatistics}
            className="retry-button"
          >
            <BarChart3 className="h-4 w-4" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      {/* Header */}
      <div className="statistics-header">
        <div className="statistics-title-section">
          <div className="statistics-icon">
            <BarChart3 className="h-6 w-6 text-black" />
          </div>
          <h2 className="statistics-title">إحصائيات المنتجات</h2>
        </div>
        <div className="statistics-actions">
          <button
       
            onClick={onBack}
            className="statistics-action-button back"
          >
            <X className="h-4 w-4" />
            العودة
          </button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="overall-stats-grid">
        <div className="stat-card total-products">
          <div className="stat-card-content">
            <div className="stat-card-info">
              <h3>إجمالي المنتجات</h3>
              <div className="stat-value">{statistics.overallStats.totalProducts}</div>
            </div>
            <div className="stat-card-icon">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="stat-card total-likes">
          <div className="stat-card-content">
            <div className="stat-card-info">
              <h3>إجمالي الإعجابات</h3>
              <div className="stat-value">{statistics.overallStats.totalLikes}</div>
            </div>
            <div className="stat-card-icon">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="stat-card total-comments">
          <div className="stat-card-content">
            <div className="stat-card-info">
              <h3>إجمالي التعليقات</h3>
              <div className="stat-value">{statistics.overallStats.totalComments}</div>
            </div>
            <div className="stat-card-icon">
              <MessageCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="stat-card pinned-products">
          <div className="stat-card-content">
            <div className="stat-card-info">
              <h3>المنتجات المثبتة</h3>
              <div className="stat-value">{statistics.overallStats.pinnedProducts}</div>
            </div>
            <div className="stat-card-icon">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <h3 className="recent-activity-title">النشاط الأخير (7 أيام)</h3>
        <div className="recent-activity-grid">
          <div className="recent-activity-item">
            <div className="recent-activity-value">{statistics.overallStats.recentProducts}</div>
            <div className="recent-activity-label">منتجات جديدة</div>
          </div>
          <div className="recent-activity-item">
            <div className="recent-activity-value">{statistics.overallStats.recentLikes}</div>
            <div className="recent-activity-label">إعجابات جديدة</div>
          </div>
          <div className="recent-activity-item">
            <div className="recent-activity-value">{statistics.overallStats.recentComments}</div>
            <div className="recent-activity-label">تعليقات جديدة</div>
          </div>
        </div>
      </div>



      {/* Material Statistics */}
      <div className="products-section">
        <h3 className="products-section-title">
          <div className="section-icon">
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
          إحصائيات المواد
        </h3>
        <div className="material-stats-grid">
          {statistics.materialStats && Object.keys(statistics.materialStats).length > 0 ? (
            Object.entries(statistics.materialStats).map(([material, stats]) => (
            <div key={material} className="material-stat-card">
              <div className="material-stat-header">
                <span className="material-stat-icon">{getMaterialIcon(material)}</span>
                <h4 className="material-stat-name">{material}</h4>
              </div>
              
              <div className="material-stat-details">
                <div className="material-stat-item">
                  <span className="material-stat-label">المنتجات:</span>
                  <span className="material-stat-value products">{stats.count}</span>
                </div>
                <div className="material-stat-item">
                  <span className="material-stat-label">الإعجابات:</span>
                  <span className="material-stat-value likes">{stats.likes}</span>
                </div>
                <div className="material-stat-item">
                  <span className="material-stat-label">التعليقات:</span>
                  <span className="material-stat-value comments">{stats.comments}</span>
                </div>
              </div>
            </div>
           ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <BarChart3 className="h-12 w-12" />
              </div>
              <p className="empty-message">لا توجد إحصائيات للمواد بعد</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      {showDetails && detailedStats && (
        <div className="product-details-modal">
          <div className="product-details-content">
            <div className="product-details-header">
              <h3 className="product-details-title">تفاصيل المنتج</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="product-details-close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="product-info-card">
                <h4 className="product-info-name">{detailedStats.product.name}</h4>
                <div className="product-info-details">
                  <div className="product-info-item">
                    <span className="product-info-label">المادة:</span>
                    <span className="product-info-value">{detailedStats.product.material}</span>
                  </div>
                  <div className="product-info-item">
                    <span className="product-info-label">السعر:</span>
                    <span className="product-info-value">
                      ${detailedStats.product.totalPrice?.usd || 0} / {detailedStats.product.totalPrice?.syp || 0} ل.س
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="product-stats-grid">
                <div className="product-stat-card likes">
                  <div className="product-stat-header">
                    <div className="product-stat-icon likes">
                      <Heart className="h-5 w-5" />
                    </div>
                    <span className="product-stat-title">الإعجابات</span>
                  </div>
                  <div className="product-stat-value likes">{detailedStats.stats.totalLikes}</div>
                  <div className="product-stat-subtitle">آخر 30 يوم: {detailedStats.stats.recentLikes}</div>
                </div>
                
                <div className="product-stat-card comments">
                  <div className="product-stat-header">
                    <div className="product-stat-icon comments">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <span className="product-stat-title">التعليقات</span>
                  </div>
                  <div className="product-stat-value comments">{detailedStats.stats.totalComments}</div>
                  <div className="product-stat-subtitle">آخر 30 يوم: {detailedStats.stats.recentComments}</div>
                </div>
              </div>
              
              {detailedStats.comments.length > 0 && (
                <div className="comments-section">
                  <h4 className="comments-title">آخر التعليقات</h4>
                  <div className="comments-list">
                    {detailedStats.comments.map((comment) => (
                      <div key={comment._id} className="comment-item">
                        <div className="comment-header">
                          <span className="comment-author">{comment.user?.username || 'مستخدم'}</span>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString('en-US')}
                          </span>
                        </div>
                        <p className="comment-content">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPanel; 