import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, User, Moon, Sun, Search, Eye } from 'lucide-react';
import './styles/AllProductsPage.css';



const AllProductsPage = () => {
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



  // Fetch all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?limit=1000', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const allProducts = data.products || data;
          
          // Set 'liked' property for each product
          const userId = JSON.parse(localStorage.getItem('user') || '{}')._id || 
                        JSON.parse(localStorage.getItem('user') || '{}').id;
          
          const productsWithLiked = allProducts.map(p => ({
            ...p,
            likes: Array.isArray(p.likes) ? p.likes.length : (typeof p.likes === 'number' ? p.likes : 0),
            liked: Array.isArray(p.likes) && userId ? p.likes.some(id => id === userId || id._id === userId) : false
          }));
          
          setProducts(productsWithLiked);
          setFilteredProducts(productsWithLiked);
        }
      } catch (error) {
        console.error('Error fetching all products:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Filter products based on search
  useEffect(() => {
    let filtered = products;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
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
    }

    setFilteredProducts(filtered);
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

  // Handle like/unlike product
  const handleLike = async (productId) => {
    if (likeLoading[productId]) return;
    
    setLikeLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await fetch(`/api/products/${productId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Update the product's liked status
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product._id === productId 
              ? { 
                  ...product, 
                  liked: !product.liked,
                  likes: product.liked ? product.likes - 1 : product.likes + 1
                }
              : product
          )
        );
        
        // Update favorite count
        setFavoriteCount(prev => prev + (products.find(p => p._id === productId)?.liked ? -1 : 1));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikeLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'http://localhost:3002/';
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
    <div className="all-products-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/customer/dashboard')}>
            <ArrowLeft className="back-icon" />
            العودة للرئيسية
          </button>
          
          <h1 className="page-title">
            جميع المنتجات
          </h1>
          
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
            placeholder="البحث في المنتجات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-section">
        <div className="products-info">
          <h2 className="section-title">
            {searchQuery.trim() 
              ? `نتائج البحث: "${searchQuery}"` 
              : 'جميع المنتجات'
            }
          </h2>
          <p className="products-count">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'منتج' : filteredProducts.length === 2 ? 'منتجان' : 'منتجات'}
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
            <p>جاري تحميل المنتجات...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            <div className="no-products-icon">📦</div>
            <h3>لا توجد منتجات</h3>
            <p>
              {searchQuery.trim() 
                ? `لم يتم العثور على منتجات تطابق البحث: "${searchQuery}"`
                : 'لا توجد منتجات متاحة حالياً'
              }
            </p>
            <button className="back-to-home-btn" onClick={() => navigate('/customer/dashboard')}>
              العودة للصفحة الرئيسية
            </button>
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
                </div>
                
                <div className="product-info">
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
                  
                  <div className="product-actions">
                    <button className="view-product-btn">
                      <Eye className="eye-icon" />
                      <span>عرض التفاصيل</span>
                    </button>
                    
                    <button
                      className={`like-btn ${product.liked ? 'liked' : ''}`}
                      disabled={likeLoading[product._id]}
                      onClick={() => handleLike(product._id)}
                      title={product.liked ? 'إلغاء الإعجاب' : 'إعجاب'}
                    >
                      <Heart className="heart-icon" />
                      <span className="likes-count">{product.likes || 0}</span>
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
    </div>
  );
};

export default AllProductsPage;
