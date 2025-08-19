import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, User, Moon, Sun, Search, ShoppingCart } from 'lucide-react';
import './styles/NewProductsPage.css';

const NewProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState({});
  const [commentModal, setCommentModal] = useState({ open: false, product: null, view: false });
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const [imageIndexes, setImageIndexes] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

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

  // Fetch products added in the last week
  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?limit=1000', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // API returns { products, hasMore }, so we need to access data.products
          const allProducts = data.products || data;
          
          // Filter products added in the last 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          sevenDaysAgo.setHours(0, 0, 0, 0); // بداية اليوم
          
          const currentDate = new Date();
          currentDate.setHours(23, 59, 59, 999); // نهاية اليوم الحالي
          
          console.log('All products fetched:', allProducts.length);
          console.log('Date range:', sevenDaysAgo.toLocaleDateString('en-US'), 'to', currentDate.toLocaleDateString('en-US'));
          
          const newProducts = allProducts.filter(product => {
            if (!product.createdAt) {
              console.log(`Product ${product.name} has no createdAt field`);
              return false;
            }
            
            const productDate = new Date(product.createdAt);
            if (isNaN(productDate.getTime())) {
              console.log(`Product ${product.name} has invalid createdAt: ${product.createdAt}`);
              return false;
            }
            
            const isInRange = productDate >= sevenDaysAgo && productDate <= currentDate;
            console.log(`Product: ${product.name}, Date: ${productDate.toLocaleDateString('en-US')}, In Range: ${isInRange}`);
            return isInRange;
          });
          
          // Sort by creation date (newest first)
          const sortedProducts = newProducts.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          
          console.log('Products added in last 7 days:', sortedProducts.length);
          console.log('Filtered products:', sortedProducts.map(p => ({ name: p.name, createdAt: p.createdAt })));
          
          // إضافة معلومات تشخيص إضافية
          if (sortedProducts.length === 0) {
            console.log('No products found in last 7 days. Checking all products...');
            allProducts.forEach((product, index) => {
              console.log(`Product ${index + 1}:`, {
                name: product.name,
                createdAt: product.createdAt,
                date: new Date(product.createdAt).toLocaleDateString('en-US'),
                daysAgo: Math.ceil((new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24))
              });
            });
          }
          
          // Add liked status to products (same as dashboard)
          const productsWithLiked = sortedProducts.map(product => ({
            ...product,
            liked: product.liked || false,
            likes: product.likes || 0
          }));
          
          setProducts(productsWithLiked);
          setFilteredProducts(productsWithLiked);
        }
      } catch (error) {
        console.error('Error fetching new products:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
    
    // تحديث تلقائي كل دقيقة للتأكد من ظهور المنتجات الجديدة
    const interval = setInterval(() => {
      fetchNewProducts();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Search functionality
  useEffect(() => {
    try {
      if (searchQuery.trim()) {
        const filtered = products.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts(products);
      }
    } catch (error) {
      console.error('Error in search functionality:', error);
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  // Fetch favorite count
  useEffect(() => {
    const fetchFavoriteCount = async () => {
      try {
        const response = await fetch('/api/products/favorites/count', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setFavoriteCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error fetching favorite count:', error);
      }
    };

    fetchFavoriteCount();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'http://localhost:3002/';
  };

  const getProductCategory = (productName) => {
    const name = productName.toLowerCase();
    if (name.includes('قاعدة') || name.includes('base')) return 'قواعد المجوهرات';
    if (name.includes('كريستال') || name.includes('crystal')) return 'الكريستال';
    if (name.includes('توريد') || name.includes('supply')) return 'نماذج التوريد السريع';
    if (name.includes('طقم') || name.includes('kit')) return 'أطقم صنع المجوهرات';
    return 'أخرى';
  };

  const getDaysSinceAdded = (createdAt) => {
    const productDate = new Date(createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - productDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays <= 7) return `منذ ${diffDays} أيام`;
    return `منذ ${diffDays} يوم`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle like/unlike product (same as dashboard)
  const handleLike = async (productId) => {
    setLikeLoading(prev => ({ ...prev, [productId]: true }));
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/products/${productId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      setProducts(prev => prev.map(p =>
        p._id === productId ? { ...p, likes: data.likes, liked: data.liked } : p
      ));
      setFilteredProducts(prev => prev.map(p =>
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
    setLikeLoading(prev => ({ ...prev, [productId]: false }));
  };

  // Comment modal functions
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
    try {
      const response = await fetch(`/api/comments?product=${productId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
    setCommentsLoading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product: commentModal.product._id, content: commentText })
      });
      if (response.ok) {
        setCommentText('');
        if (commentModal.view) fetchComments(commentModal.product._id);
        else closeCommentModal();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle view product (same as dashboard)
  const handleViewProduct = (product) => {
    setViewProduct(product);
  };

  // Pagination functions
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="new-products-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/customer/dashboard')}>
            <ArrowLeft className="back-icon" />
            العودة للرئيسية
          </button>
          
          <h1 className="page-title">المنتجات الجديدة - آخر 7 أيام</h1>
          
          <div className="header-actions">
            <button 
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
            >
              {isDarkMode ? <Sun className="theme-icon" /> : <Moon className="theme-icon" />}
            </button>
            
            <button 
              className="favorites-btn"
              onClick={() => navigate('/customer/favorites')}
            >
              <Heart className="favorites-icon" />
              <span className="favorites-count">{favoriteCount}</span>
            </button>
            
            <button 
              className="profile-btn"
              onClick={() => navigate('/customer/profile')}
            >
              <User className="profile-icon" />
            </button>
            
            <button className="logout-btn" onClick={handleLogout}>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="البحث في المنتجات الجديدة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-section">
        <div className="products-info">
          <h2 className="section-title">المنتجات المضافة في آخر 7 أيام</h2>
          <p className="products-count">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'منتج جديد' : filteredProducts.length === 2 ? 'منتجان جديدان' : filteredProducts.length <= 10 ? 'منتجات جديدة' : 'منتج جديد'}
          </p>
          
          {/* Pagination Numbers - Always Show */}
          {filteredProducts.length > 0 && (
            <div className="pagination-numbers-top">
              <div className="pagination-info-top">
                <span className="pagination-text-top">
                  الصفحة {currentPage} من {totalPages}
                </span>
                <span className="pagination-count-top">
                  عرض {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} من {filteredProducts.length} منتج
                </span>
              </div>
              
              <div className="pagination-controls-top">
                <button
                  className={`pagination-btn-top prev-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  السابق
                </button>
                
                <div className="pagination-numbers-list">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
                    <button
                      key={pageNumber}
                      className={`pagination-number-top ${pageNumber === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
                
                <button
                  className={`pagination-btn-top next-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>جاري تحميل المنتجات الجديدة...</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              يرجى الانتظار بينما نبحث عن المنتجات المضافة في آخر 7 أيام
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            <div className="no-products-icon">📦</div>
            <h3>لا توجد منتجات جديدة</h3>
            <p>لم يتم إضافة أي منتجات جديدة في آخر 7 أيام</p>
            <div className="debug-info">
              <p><strong>معلومات التصحيح:</strong></p>
              <p>إجمالي المنتجات المحملة: {products.length}</p>
              <p>المنتجات المفلترة: {filteredProducts.length}</p>
              <p>نطاق التاريخ: آخر 7 أيام</p>
            </div>
            <div className="action-buttons">
              <button className="back-to-home-btn" onClick={() => navigate('/customer/dashboard')}>
                العودة للصفحة الرئيسية
              </button>
              <button 
                className="refresh-btn" 
                onClick={() => window.location.reload()}
              >
                تحديث الصفحة
              </button>
            </div>
          </div>
        ) : (
          <div className="products-grid">
            {currentProducts.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image-container">
                  <img 
                    src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300x300?text=Product'} 
                    alt={product.name} 
                    className="product-image" 
                  />
                  <div className="product-badge">
                    <span className="badge-text">جديد</span>
                  </div>
                </div>
                
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-category">{getProductCategory(product.name)}</p>
                  <div className="product-price">
                    {product.totalPrice && product.totalPrice.usd !== undefined
                      ? `$${Number(product.totalPrice.usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : 'السعر غير متوفر'}
                  </div>
                  <p className="product-date">
                    {getDaysSinceAdded(product.createdAt)} - {formatDate(product.createdAt)}
                  </p>
                  
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
                      className="view-product-btn"
                      onClick={() => handleViewProduct(product)}
                      title="عرض تفاصيل المنتج"
                    >
                      عرض المنتج
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
              </div>
            ))}
          </div>
        )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                <span className="pagination-text">
                  الصفحة {currentPage} من {totalPages}
                </span>
                <span className="pagination-count">
                  عرض {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} من {filteredProducts.length} منتج
                </span>
              </div>
              
              <div className="pagination-controls">
                <button
                  className={`pagination-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  السابق
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
                    <button
                      key={pageNumber}
                      className={`pagination-number ${pageNumber === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
                
                <button
                  className={`pagination-btn next-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        
      </section>

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
                          </div>
                          <div className="comment-content">{c.content}</div>
                          <div className="comment-date">{new Date(c.createdAt).toLocaleString('en-US')}</div>
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
                    src={viewProduct.images[imageIndexes[viewProduct._id] || 0]}
                    alt={viewProduct.name}
                    className="main-product-image"
                    onClick={() => setLightbox({ open: true, images: viewProduct.images, index: imageIndexes[viewProduct._id] || 0 })}
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <span>لا توجد صورة</span>
                  </div>
                )}
                
                {/* Thumbnail images */}
                {viewProduct.images && viewProduct.images.length > 1 && (
                  <div className="thumbnail-images">
                    {viewProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${viewProduct.name} ${index + 1}`}
                        className={`thumbnail-image ${(imageIndexes[viewProduct._id] || 0) === index ? 'active' : ''}`}
                        onClick={() => setImageIndexes(prev => ({ ...prev, [viewProduct._id]: index }))}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {/* Product details */}
              <div className="product-details-section">
                <h3 className="product-modal-title">{viewProduct.name}</h3>
                
                <div className="product-tags">
                  {viewProduct.material && <span className="product-tag">{viewProduct.material}</span>}
                  {viewProduct.productType && <span className="product-tag">{viewProduct.productType}</span>}
                  {(viewProduct.karat || viewProduct.carat) && <span className="product-tag">{viewProduct.karat || viewProduct.carat} عيار</span>}
                  {viewProduct.weight && <span className="product-tag">{viewProduct.weight} غرام</span>}
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
                  {viewProduct.gramWage && (
                    <div className="info-item">
                      <span className="info-label">أجار الغرام:</span>
                      <span className="info-value">{viewProduct.gramWage}</span>
                    </div>
                  )}
                  {viewProduct.description && (
                    <div className="info-item">
                      <span className="info-label">الوصف:</span>
                      <span className="info-value">{viewProduct.description}</span>
                    </div>
                  )}
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
                  <div className="meta-item">
                    <span className="meta-label">تاريخ الإضافة:</span>
                    <span className="meta-value">
                      {getDaysSinceAdded(viewProduct.createdAt)} - {formatDate(viewProduct.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="product-modal-actions">
                  <button
                    className={`like-btn ${viewProduct.liked ? 'liked' : ''}`}
                    disabled={likeLoading[viewProduct._id]}
                    onClick={() => handleLike(viewProduct._id)}
                    title={viewProduct.liked ? 'إلغاء الإعجاب' : 'إعجاب'}
                  >
                    <Heart className="heart-icon" />
                    <span className="likes-count">{viewProduct.likes || 0}</span>
                  </button>
                  
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setViewProduct(null);
                      openCommentModal(viewProduct, false);
                    }}
                  >
                    أضف تعليق
                  </button>
                  
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setViewProduct(null);
                      openCommentModal(viewProduct, true);
                    }}
                  >
                    عرض التعليقات
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightbox.open && (
        <div className="lightbox-overlay" onClick={() => setLightbox({ open: false, images: [], index: 0 })}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close-btn"
              onClick={() => setLightbox({ open: false, images: [], index: 0 })}
            >
              &times;
            </button>
            <img
              src={lightbox.images[lightbox.index]}
              alt="Product"
              className="lightbox-image"
            />
            {lightbox.images.length > 1 && (
              <>
                <button
                  className="lightbox-nav-btn prev"
                  onClick={() => setLightbox(prev => ({
                    ...prev,
                    index: prev.index > 0 ? prev.index - 1 : prev.images.length - 1
                  }))}
                >
                  ‹
                </button>
                <button
                  className="lightbox-nav-btn next"
                  onClick={() => setLightbox(prev => ({
                    ...prev,
                    index: prev.index < prev.images.length - 1 ? prev.index + 1 : 0
                  }))}
                >
                  ›
                </button>
                <div className="lightbox-indicators">
                  {lightbox.images.map((_, index) => (
                    <span
                      key={index}
                      className={`lightbox-indicator ${index === lightbox.index ? 'active' : ''}`}
                      onClick={() => setLightbox(prev => ({ ...prev, index }))}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewProductsPage;
