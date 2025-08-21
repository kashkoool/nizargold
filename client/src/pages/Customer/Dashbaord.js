import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Sun, Moon, Heart, ShoppingCart, User, Search, Menu, X, MessageCircle, Instagram, XCircle } from 'lucide-react';
import './styles/Dashboard.css';
import './styles/Common.css';
import { apiCall, apiCallWithRefresh } from '../../utils/api';
import { logout, useAutoLogout } from '../../utils/auth';
import { getImageUrl } from '../../utils/imageUtils';


const featuredTabs = [
  { label: 'جديد', value: 'NEW', color: 'text-orange-600 border-orange-600' },
  { label: 'جميع المنتجات', value: 'ALL PRODUCTS', color: 'text-gray-600 border-gray-600' },
  { label: 'الأكثر مشاهدة', value: 'MOST VIEWED', color: 'text-blue-600 border-blue-600' },
  { label: 'شائع', value: 'POPULAR', color: 'text-blue-600 border-blue-600' },
];

const collections = [
  { name: 'Swarovski Crystals', img: 'https://via.placeholder.com/300x180?text=Swarovski+Crystals' },
  { name: 'Fast Supply', img: 'https://via.placeholder.com/300x180?text=Fast+Supply' },
  { name: 'Cup Chains by Meter', img: 'https://via.placeholder.com/300x180?text=Cup+Chains+by+Meter' },
  { name: 'Charms', img: 'https://via.placeholder.com/300x180?text=Charms' },
  { name: 'Almost Finished Bracelets', img: 'https://via.placeholder.com/300x180?text=Almost+Finished+Bracelets' },
  { name: 'Earrings Bases', img: 'https://via.placeholder.com/300x180?text=Earrings+Bases' },
];

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

const Dashbaord = () => {
  const navigate = useNavigate();
  
  // Debug logging removed for cleaner console
  
  useAutoLogout(INACTIVITY_TIMEOUT);
  

  const [activeTab, setActiveTab] = useState('NEW');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState({});
  const [commentModal, setCommentModal] = useState({ open: false, product: null, view: false });
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [highlightedProductId, setHighlightedProductId] = useState(null);
  const productsGridRef = useRef(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const [imageIndexes, setImageIndexes] = useState({});
  const slideshowIntervals = useRef({});
  const [productViews, setProductViews] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('productViews') || '{}');
    } catch {
      return {};
    }
  });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, commentId: null });
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [contactModal, setContactModal] = useState(false);

  const [showAllProducts, setShowAllProducts] = useState(false);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Apply theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  // Persist productViews to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('productViews', JSON.stringify(productViews));
  }, [productViews]);

  // Helper: fetch with auto-refresh on 401
  async function fetchWithRefresh(url, options = {}, retry = true) {
    return await apiCallWithRefresh(url, options);
  }

  // Debug: Test token validity


  useEffect(() => {
    
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        const res = await fetchWithRefresh('/api/products?page=1&limit=24');
        
        if (res.ok) {
          const data = await res.json();
          const userId = user && user._id ? user._id : (user && user.id ? user.id : null);
          
          // Set 'liked' property for each product
          const productsWithLiked = (data.products || []).map(p => ({
            ...p,
            likes: Array.isArray(p.likes) ? p.likes.length : (typeof p.likes === 'number' ? p.likes : 0),
            liked: Array.isArray(p.likes) && userId ? p.likes.some(id => id === userId || id._id === userId) : false
          }));
          setProducts(productsWithLiked);
        } else {
          }
      } catch (error) {
        }
      
      setLoading(false);
    };

    const fetchFavoriteCount = async () => {
      try {
        const res = await fetchWithRefresh('/api/products/favorites/count');
        
        if (res.ok) {
          const data = await res.json();
          setFavoriteCount(data.count || 0);
        }
      } catch (error) {
        }
    };

    fetchProducts();
    fetchFavoriteCount();
    
    // تحديث تلقائي كل 30 ثانية للتأكد من تحديث الأسعار
    const interval = setInterval(() => {
      fetchProducts();
      fetchFavoriteCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-slideshow for product images
  useEffect(() => {
    products.forEach(product => {
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
  }, [products]);

  const handleLike = async (productId) => {
    setLikeLoading(prev => ({ ...prev, [productId]: true }));
    try {
      const res = await fetchWithRefresh(`/api/products/${productId}/like`, {
        method: 'POST'
      });
      
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => prev.map(p =>
          p._id === productId ? { ...p, likes: data.likes, liked: data.liked } : p
        ));
        
        // Update favorite count
        const currentProduct = products.find(p => p._id === productId);
        if (currentProduct) {
          if (currentProduct.liked && !data.liked) {
            // Product was unliked
            setFavoriteCount(prev => Math.max(0, prev - 1));
          } else if (!currentProduct.liked && data.liked) {
            // Product was liked
            setFavoriteCount(prev => prev + 1);
          }
        }
      }
    } catch (error) {
      } finally {
      setLikeLoading(prev => ({ ...prev, [productId]: false }));
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
    const token = localStorage.getItem('token');
    const res = await fetchWithRefresh(`/api/comments?product=${productId}`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
    setCommentsLoading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await fetchWithRefresh('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ product: commentModal.product._id, content: commentText })
    });
    if (res.ok) {
      setCommentText('');
      if (commentModal.view) fetchComments(commentModal.product._id);
      else closeCommentModal();
    }
  };

  // When user clicks 'عرض التفاصيل', increment view count
  const handleViewProduct = (product) => {
    const id = product._id || product.id;
    setProductViews(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    setViewProduct(product);
  };

  // Edit comment handler
  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.content);
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    if (!editCommentText.trim()) return;
    const res = await fetchWithRefresh(`/api/comments/${editingCommentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content: editCommentText })
    });
    if (res.ok) {
      setEditingCommentId(null);
      setEditCommentText('');
      fetchComments(commentModal.product._id);
    }
  };

  const handleDeleteComment = (commentId) => {
    setDeleteConfirm({ open: true, commentId });
  };

  const confirmDeleteComment = async () => {
    const commentId = deleteConfirm.commentId;
    const res = await fetchWithRefresh(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchComments(commentModal.product._id);
    }
    setDeleteConfirm({ open: false, commentId: null });
  };

  const cancelDeleteComment = () => {
    setDeleteConfirm({ open: false, commentId: null });
  };

  // دالة البحث
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    // إضافة تأخير صغير لمحاكاة البحث
    setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      
      let results = products.filter(product => {
        const name = (product.name || '').toLowerCase();
        const material = (product.material || '').toLowerCase();
        const productType = (product.productType || '').toLowerCase();
        const karat = (product.karat || product.carat || '').toString().toLowerCase();
        const description = (product.description || '').toLowerCase();
        const weight = (product.weight || '').toString().toLowerCase();
        
        return name.includes(query) || 
               material.includes(query) || 
               productType.includes(query) || 
               karat.includes(query) ||
               description.includes(query) ||
               weight.includes(query);
      });
      

      
      setSearchResults(results);
      setIsSearching(false);
    }, 300); // تأخير 300 مللي ثانية
  };

  // البحث التلقائي عند تغيير النص أو الفئة
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);

  // Filtered products based on active tab, search, and category
  let filteredProducts = products;
  

  
  // الاحتفاظ بنسخة من المنتجات المفلترة حسب الفئة فقط (لزر عرض جميع المنتجات)
  const categoryFilteredProducts = [...filteredProducts];
  
  // ثانياً: تطبيق البحث أو التبويبات
  if (searchQuery.trim()) {
    // إذا كان هناك بحث، استخدم نتائج البحث مع تطبيق تصفية الفئة
    filteredProducts = searchResults;
  } else {
    // إذا لم يكن هناك بحث، طبق التبويبات
    if (activeTab === 'NEW') {
      // المنتجات الجديدة - الأحدث أولاً
      filteredProducts = [...filteredProducts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8); // عرض 8 منتجات جديدة فقط
    } else if (activeTab === 'ALL PRODUCTS') {
      // جميع المنتجات - عرض جميع المنتجات المفلترة حسب الفئة
      filteredProducts = [...filteredProducts];
    } else if (activeTab === 'MOST VIEWED') {
      // الأكثر مشاهدة - حسب عدد المشاهدات
      filteredProducts = [...filteredProducts]
        .sort((a, b) => (productViews[b._id || b.id] || 0) - (productViews[a._id || a.id] || 0))
        .slice(0, 12); // عرض 12 منتج الأكثر مشاهدة
    } else if (activeTab === 'POPULAR') {
      // المنتجات الشائعة - حسب عدد الإعجابات
      filteredProducts = [...filteredProducts]
        .filter(p => p.likes && p.likes > 0)
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 12); // عرض 12 منتج شائع
    }
  }
  
  // تحديد المنتجات المعروضة في قسم "منتجات المتجر"
  // عندما يكون showAllProducts مفعلاً، نعرض جميع المنتجات المفلترة حسب الفئة
  // عندما لا يكون مفعلاً، نعرض أول 10 منتجات من المنتجات المفلترة حسب الفئة
  const displayedProducts = showAllProducts ? categoryFilteredProducts : categoryFilteredProducts.slice(0, 10);

  // Scroll and highlight product in main grid
  const handleSeeProduct = (productId) => {
    // Scroll to products grid
    if (productsGridRef.current) {
      productsGridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    // Highlight the product
    setHighlightedProductId(productId);
    setTimeout(() => setHighlightedProductId(null), 1000);
  };

  const openContactModal = () => {
    setContactModal(true);
  };

  const closeContactModal = () => {
    setContactModal(false);
  };

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <div className="customer-dashboard-container">
      {/* Main Navbar */}
      <nav className="customer-navbar">
        <div className="customer-navbar-content">
          {/* Right Side - Brand Name Only */}
          <div className="navbar-right">
            <div className="customer-brand">
              <span className="brand-text">مجوهرات نزار</span>
            </div>
          </div>
          
          {/* Center - Search Bar */}
          <div className="navbar-center">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="ابحث عن المنتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              {searchQuery.trim() && (
                <button
                  className="clear-search-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearching(false);
                  }}
                  title="مسح البحث"
                >
                  <XCircle className="clear-search-icon" />
                </button>
              )}
            </div>
          </div>
          
          {/* Left Side - Actions */}
          <div className="navbar-left">
            <div className="customer-nav-actions">
              <button 
                className="customer-favorites-btn"
                onClick={() => window.location.href = '/customer/favorites'}
              >
                <Heart className="favorites-icon" />
                <span className="customer-favorites-count">{favoriteCount}</span>
              </button>
              
              <button 
                className="customer-profile-btn"
                onClick={() => navigate('/customer/profile')}
                title="الملف الشخصي"
              >
                <User className="profile-icon" />
              </button>
              
              <button 
                className="customer-theme-toggle-button"
                onClick={toggleTheme}
                title={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
              >
                {isDarkMode ? <Sun className="customer-theme-icon" /> : <Moon className="customer-theme-icon" />}
              </button>
              

              
              <button
                className="customer-logout-btn"
                onClick={handleLogout}
              >
                تسجيل الخروج
              </button>
              

              
              {/* Mobile Menu Button */}
              <button 
                className="customer-mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="mobile-icon" /> : <Menu className="mobile-icon" />}
              </button>
            </div>
          </div>
        </div>
        

      </nav>



      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-images">
            <img src="https://i.imgur.com/1Q9Z1Zm.jpg" alt="مجوهرات 1" className="hero-image" />
            <img src="https://i.imgur.com/2nCt3Sbl.jpg" alt="مجوهرات 2" className="hero-image" />
          </div>
          <div className="hero-text">
            <h1 className="hero-title">مجوهرات نزار الفاخرة</h1>
            <p className="hero-subtitle">اكتشف مجموعتنا المميزة من المجوهرات الذهبية والماسية</p>
            <button className="hero-cta-btn" onClick={openContactModal}>تواصل معنا</button>
          </div>
        </div>
      </section>

      {/* Featured Tabs */}
      <section className="featured-section">
        <div className="featured-tabs">
          {featuredTabs.map(tab => (
            <button
              key={tab.label}
              className={`featured-tab ${activeTab === tab.value ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Filtered Products */}
        <div className="featured-products-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-products-message">لا توجد منتجات</div>
          ) : (
            filteredProducts.map(product => (
              <div key={product._id || product.id} className="featured-product-card">
                <div className="product-image-container">
                  <img 
                    src={getImageUrl(product.images, 0)} 
                    alt={product.name} 
                    className="product-image" 
                  />
                  {product.images && product.images.length > 1 && (
                    <div className="image-indicators">
                      {product.images.map((img, idx) => (
                        <span key={idx} className={`indicator ${idx === 0 ? 'active' : ''}`}></span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <div className="product-price">
                    {product.totalPrice && product.totalPrice.usd !== undefined
                      ? `$${Number(product.totalPrice.usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : ''}
                  </div>
                  <button 
                    className="btn-primary"
                    onClick={() => handleSeeProduct(product._id || product.id)}
                  >
                    عرض المنتج
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* عرض المزيد من المنتجات الجديدة - يظهر فقط في تبويب جديد */}
        {activeTab === 'NEW' && filteredProducts.length > 0 && (
          <div className="show-more-products">
            <button 
              className="show-more-btn show-more-new-btn"
              onClick={() => {
                // الانتقال إلى صفحة المنتجات الجديدة
                navigate('/customer/new-products');
              }}
            >
              عرض المزيد من المنتجات الجديدة
            </button>
          </div>
        )}
      </section>

      {/* Top Collections */}
      <section className="collections-section">
        <h2 className="section-title">المجموعات المميزة</h2>
        <div className="collections-grid">
          {products.filter(p => p.pinned).length === 0 ? (
            <div className="no-products-message">لا توجد منتجات مثبتة</div>
          ) : (
            products.filter(p => p.pinned).map(product => (
              <div key={product._id || product.id} className="collection-card">
                <div className="product-image-container">
                  <img 
                    src={getImageUrl(product.images, 0)} 
                    alt={product.name} 
                    className="product-image" 
                  />
                  {product.images && product.images.length > 1 && (
                    <div className="image-indicators">
                      {product.images.map((img, idx) => (
                        <span key={idx} className={`indicator ${idx === 0 ? 'active' : ''}`}></span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <div className="product-price">
                    {product.totalPrice && product.totalPrice.usd !== undefined
                      ? `$${Number(product.totalPrice.usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : ''}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section ref={productsGridRef} className="products-section">
        <h2 className="section-title">
          {searchQuery.trim() ? 
            `نتائج البحث: "${searchQuery}" (${filteredProducts.length} منتج)` : 
            'منتجات المتجر'
          }
        </h2>
        {loading || isSearching ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            {isSearching && <p>جاري البحث...</p>}
          </div>
        ) : (
          <div className="products-grid">
            {searchQuery.trim() && searchResults.length === 0 && !isSearching ? (
              <div className="no-search-results">
                <p>لم يتم العثور على منتجات تطابق البحث: "{searchQuery}"</p>
                <p>جرب البحث بكلمات مختلفة أو تصفح جميع المنتجات</p>
              </div>
            ) : (
              (searchQuery.trim() ? filteredProducts : displayedProducts).map(product => {
                const id = product._id || product.id;
                const currentIndex = imageIndexes[id] || 0;
                return (
                  <div
                    key={id}
                    className={`product-card ${highlightedProductId === id ? 'highlighted' : ''}`}
                  >
                    <div className="product-image-container">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={getImageUrl(product.images, currentIndex)} 
                          alt={product.name} 
                          className="product-image" 
                        />
                      ) : (
                        <div className="no-image-placeholder">لا صورة</div>
                      )}
                      {product.images && product.images.length > 1 && (
                        <div className="image-indicators">
                          {product.images.map((img, idx) => (
                            <span key={idx} className={`indicator ${idx === currentIndex ? 'active' : ''}`}></span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="product-content">
                      <h3 className="product-title">{product.name}</h3>
                      <div className="product-details">
                        {product.productType} | {product.material}
                      </div>
                      
                      <div className="price-badges">
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
                      
                      <button 
                        className="view-details-btn"
                        onClick={() => handleViewProduct(product)}
                      >
                        <Eye className="eye-icon" />
                        <span>عرض التفاصيل</span>
                      </button>
                    </div>
                    
                    <div className="product-actions">
                      <button
                        className={`like-btn ${product.liked ? 'liked' : ''}`}
                        disabled={likeLoading[product._id]}
                        onClick={() => handleLike(product._id)}
                        title={product.liked ? 'إلغاء الإعجاب' : 'إعجاب'}
                      >
                        <Heart className="heart-icon" />
                        <span className="likes-count">{product.likes || 0}</span>
                      </button>
                      
                      <button
                        className="btn-secondary"
                        onClick={() => openCommentModal(product, false)}
                      >
                        أضف تعليق
                      </button>
                      
                      <button
                        className="btn-primary"
                        onClick={() => openCommentModal(product, true)}
                      >
                        عرض التعليقات
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
        )}
        
          {categoryFilteredProducts.length > 10 && (
            <div className="show-all-products-section">
              <button 
                className="show-all-products-btn"
                onClick={() => {
                  // الانتقال إلى صفحة جميع المنتجات
                  navigate('/customer/all-products');
                }}
              >
                عرض جميع المنتجات ({categoryFilteredProducts.length})
              </button>
            </div>
          )}
        
      </section>



      {/* Footer */}
      <footer className="customer-footer">
        <div className="footer-content">
          <div className="footer-section social-section">
            <h4 className="footer-title">تواصل معنا</h4>
            <p className="social-subtitle">تابعنا على وسائل التواصل الاجتماعي</p>
            <div className="social-links">
              <a 
                href="https://wa.me/963933336562" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link whatsapp-link"
                title="تواصل معنا عبر واتساب"
              >
                <MessageCircle className="social-icon" />
                <span>واتساب</span>
              </a>
              
              <a 
                href="https://instagram.com/nizar_jewelry" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link instagram-link"
                title="تابعنا على انستاغرام"
              >
                <Instagram className="social-icon" />
                <span>انستا</span>
              </a>
            </div>
          </div>
          
          <div className="footer-section contact-section">
            <h4 className="footer-title">معلومات التواصل</h4>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-label">الهاتف:</span>
                <span className="contact-value">62 65 3333 09</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">العنوان:</span>
                <span className="contact-value">دمشق سوريا، شارع الباكستان مقابل عصير ابو عبدو</span>
              </div>
            </div>
          </div>
          
          <div className="footer-section hours-section">
            <h4 className="footer-title">ساعات العمل</h4>
            <div className="working-hours">
              <div className="hours-item">
                <span className="day">السبت - الخميس:</span>
                <span className="time">11:00 ص - 8:00 م</span>
              </div>
              <div className="hours-item">
                <span className="day">الجمعة:</span>
                <span className="time">مغلق</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copyright">
            <span className="copyright-text">جميع الحقوق محفوظة لدى مجوهرات نزار © 2025</span>
            <div className="footer-decoration">
              <span className="decoration-dot">✦</span>
              <span className="decoration-dot">✦</span>
              <span className="decoration-dot">✦</span>
            </div>
            <a 
              href="https://evanox.net" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="developer-link"
            >
              تم تطويره بواسطة <span className="evanox-text">Evanox</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Comment Modal */}
      {commentModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-btn"
              onClick={closeCommentModal}
            >
              &times;
            </button>
            {commentModal.view ? (
              <>
                <h3 className="modal-title">كل التعليقات</h3>
                {commentsLoading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                  </div>
                ) : (
                  <div className="comments-list">
                    {comments.length === 0 ? (
                      <div className="no-comments-message">لا توجد تعليقات بعد.</div>
                    ) : (
                      comments.map((c) => (
                        <div key={c._id} className="comment-item">
                          <div className="comment-header">
                            <span className="comment-author">{c.user?.username || 'مستخدم'}</span>
                            {user && (user._id === c.user?._id || user.id === c.user?._id) && (
                              <div className="comment-actions">
                                <button 
                                  className="edit-btn"
                                  onClick={() => handleEditComment(c)}
                                >
                                  تعديل
                                </button>
                                <button 
                                  className="delete-btn"
                                  onClick={() => handleDeleteComment(c._id)}
                                >
                                  حذف
                                </button>
                              </div>
                            )}
                          </div>
                          {editingCommentId === c._id ? (
                            <form className="edit-comment-form" onSubmit={handleUpdateComment}>
                              <input
                                type="text"
                                className="edit-comment-input"
                                value={editCommentText}
                                onChange={e => setEditCommentText(e.target.value)}
                              />
                              <button
                                type="submit"
                                className="btn-primary"
                                disabled={!editCommentText.trim()}
                              >
                                حفظ
                              </button>
                              <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => { setEditingCommentId(null); setEditCommentText(''); }}
                              >
                                إلغاء
                              </button>
                            </form>
                          ) : (
                            <>
                              <div className="comment-content">{c.content}</div>
                              <div className="comment-date">{new Date(c.createdAt).toLocaleString('en-US')}</div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
                <form className="add-comment-form" onSubmit={handleAddComment}>
                  <input
                    type="text"
                    className="comment-input"
                    placeholder="أضف تعليقًا..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!commentText.trim()}
                  >
                    إرسال
                  </button>
                </form>
              </>
            ) : (
              <>
                <h3 className="modal-title">أضف تعليق</h3>
                <form className="add-comment-form" onSubmit={handleAddComment}>
                  <textarea
                    className="comment-textarea"
                    rows={4}
                    placeholder="اكتب تعليقك هنا..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                  />
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={closeCommentModal}
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={!commentText.trim()}
                    >
                      إرسال
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Product Details Modal */}
      {viewProduct && (
        <div className="modal-overlay">
          <div className="product-modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setViewProduct(null)}
            >
              &times;
            </button>
            <h2 className="modal-title">تفاصيل المنتج</h2>
            <div className="product-modal-grid">
              {/* Images slideshow */}
              <div className="product-images-section">
                {viewProduct.images && viewProduct.images.length > 0 ? (
                  <img
                    src={getImageUrl(viewProduct.images, lightbox.index || 0)}
                    alt={viewProduct.name}
                    className="main-product-image"
                    onClick={() => setLightbox({ open: true, images: viewProduct.images, index: lightbox.index || 0 })}
                  />
                ) : (
                  <div className="no-image-placeholder">لا صورة</div>
                )}
                {viewProduct.images && viewProduct.images.length > 1 && (
                  <div className="product-thumbnails">
                    {viewProduct.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={getImageUrl(viewProduct.images, idx)}
                        alt={`صورة ${idx + 1}`}
                        className={`thumbnail ${lightbox.index === idx ? 'active' : ''}`}
                        onClick={() => setLightbox({ open: true, images: viewProduct.images, index: idx })}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Details */}
              <div className="product-details-section">
                <h3 className="product-modal-title">{viewProduct.name}</h3>
                
                <div className="product-tags">
                  <span className="product-tag">{viewProduct.material}</span>
                  <span className="product-tag">{viewProduct.productType}</span>
                  <span className="product-tag">{viewProduct.karat || viewProduct.carat} عيار</span>
                  <span className="product-tag">{viewProduct.weight} غرام</span>
                </div>
                
                <div className="price-section">
                  {viewProduct.gramPrice && viewProduct.gramPrice.usd !== undefined && (
                    <span className="gram-price usd">سعر الغرام: {viewProduct.gramPrice.usd} USD</span>
                  )}
                  {viewProduct.gramPrice && viewProduct.gramPrice.syp !== undefined && (
                    <span className="gram-price syp">سعر الغرام: {viewProduct.gramPrice.syp} SYP</span>
                  )}
                </div>
                
                <div className="total-price-section">
                  {viewProduct.totalPrice && viewProduct.totalPrice.usd !== undefined && (
                    <span className="total-price usd">السعر الكلي: {viewProduct.totalPrice.usd} USD</span>
                  )}
                  {viewProduct.totalPrice && viewProduct.totalPrice.syp !== undefined && (
                    <span className="total-price syp">السعر الكلي: {viewProduct.totalPrice.syp} SYP</span>
                  )}
                </div>
                
                <div className="product-info-list">
                  <div className="info-item">
                    <span className="info-label">أجار الغرام:</span>
                    <span className="info-value">{viewProduct.gramWage}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">الوصف:</span>
                    <span className="info-value">{viewProduct.description}</span>
                  </div>
                </div>
                
                {viewProduct.stones && viewProduct.stones.length > 0 && (
                  <div className="stones-section">
                    <h4 className="stones-title">الأحجار:</h4>
                    <ul className="stones-list">
                      {viewProduct.stones.map((stone, idx) => (
                        <li key={idx} className="stone-item">
                          النوع: {stone.type}, اللون: {stone.color}, العدد: {stone.count}, 
                          سعر القيراط: {stone.caratPrice && stone.caratPrice.usd} USD, 
                          السعر الكلي: {stone.totalPrice && stone.totalPrice.usd} USD, 
                          الوزن الكلي: {stone.totalWeight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {viewProduct.ringSizes && viewProduct.ringSizes.length > 0 && (
                  <div className="ring-sizes-section">
                    <span className="info-label">قياسات المحبس:</span>
                    <span className="info-value">{viewProduct.ringSizes.join(', ')}</span>
                  </div>
                )}
                
                {viewProduct.setAccessories && viewProduct.setAccessories.length > 0 && (
                  <div className="accessories-section">
                    <span className="info-label">ملحقات الطقم:</span>
                    <span className="info-value">{viewProduct.setAccessories.join(', ')}</span>
                  </div>
                )}
                
                <div className="product-meta">
                  <div className="meta-item">
                    <span className="meta-label">مثبت:</span>
                    <span className="meta-value">{viewProduct.pinned ? 'نعم' : 'لا'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">تاريخ الإضافة:</span>
                    <span className="meta-value">
                      {viewProduct.createdAt && new Date(viewProduct.createdAt).toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lightbox for product images */}
          {lightbox.open && (
            <div className="lightbox-overlay">
              <button
                className="lightbox-close-btn"
                onClick={() => setLightbox({ ...lightbox, open: false })}
              >
                &times;
              </button>
              <button
                className="lightbox-nav-btn prev"
                onClick={() => setLightbox(l => ({ ...l, index: (l.index - 1 + l.images.length) % l.images.length }))}
              >
                &#8592;
              </button>
              <img
                src={lightbox.images[lightbox.index]}
                alt={`صورة ${lightbox.index + 1}`}
                className="lightbox-image"
              />
              <button
                className="lightbox-nav-btn next"
                onClick={() => setLightbox(l => ({ ...l, index: (l.index + 1) % l.images.length }))}
              >
                &#8594;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contact Modal */}
      {contactModal && (
        <div className="modal-overlay">
          <div className="contact-modal-content">
            <button
              className="modal-close-btn"
              onClick={closeContactModal}
            >
              &times;
            </button>
            <h3 className="contact-modal-title">تواصل معنا</h3>
            <div className="contact-options">
              <div className="contact-option">
                <div className="contact-icon">📱</div>
                <div className="contact-info">
                  <h4 className="contact-label">الجوال</h4>
                  <a 
                    href="tel:+963933336562" 
                    className="contact-number"
                    onClick={closeContactModal}
                  >
                    +963 933 336 562
                  </a>
                </div>
              </div>
              
              <div className="contact-option">
                <div className="contact-icon">☎️</div>
                <div className="contact-info">
                  <h4 className="contact-label">الأرضي</h4>
                  <a 
                    href="tel:0114437270" 
                    className="contact-number"
                    onClick={closeContactModal}
                  >
                    011 443 7270
                  </a>
                </div>
              </div>
            </div>
            <div className="contact-actions">
              <button
                className="btn-secondary"
                onClick={closeContactModal}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.open && (
        <div className="modal-overlay">
          <div className="confirm-modal-content">
            <h3 className="confirm-modal-title">تأكيد حذف التعليق</h3>
            <p className="confirm-modal-message">
              هل أنت متأكد أنك تريد حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="confirm-modal-actions">
              <button
                className="btn-secondary"
                onClick={cancelDeleteComment}
              >
                إلغاء
              </button>
              <button
                className="btn-danger"
                onClick={confirmDeleteComment}
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashbaord;
