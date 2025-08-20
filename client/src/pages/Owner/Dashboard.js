import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Users, Plus, Search, Filter, DollarSign, BarChart3, X, Package, Star, Gem, Crown } from 'lucide-react';
import { apiCall } from '../../utils/api';
import Navbar from './Navbar';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import MaterialPriceManager from './MaterialPriceManager';
import PriceDebugger from './PriceDebugger';
import StatisticsPanel from './StatisticsPanel';
import './styles/Dashboard.css';
import './styles/ModalStyles.css';
import './styles/light-mode-fix.css';

// CSS مباشر - قواعد أساسية للوضع النهاري
const inlineStyles = `
  /* قواعد أساسية للوضع النهاري */
  [data-theme="light"] .search-filter-section .search-input,
  [data-theme="light"] .search-filter-section .filter-select {
    background: #FFFFFF !important;
    border: 2px solid #E0E0E0 !important;
    color: #000000 !important;
  }
  
  [data-theme="light"] .search-filter-section .search-input:focus,
  [data-theme="light"] .search-filter-section .filter-select:focus {
    border: 2px solid #D4AF37 !important;
    box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.15) !important;
  }
  
  [data-theme="light"] .search-filter-section .search-input::placeholder {
    color: #999999 !important;
  }
  
  [data-theme="light"] .search-filter-section .search-icon,
  [data-theme="light"] .search-filter-section .filter-icon {
    color: #666666 !important;
  }
`;

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
function useAutoLogout() {
  const timer = useRef();
  useEffect(() => {
    const resetTimer = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }, INACTIVITY_TIMEOUT);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);
}

function Dashboard() {
  const navigate = useNavigate();
  useAutoLogout();

  // إضافة CSS مباشر لخيارات "جميع" فقط
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* قواعد لخيارات "جميع" في الوضع الفاتح */
      [data-theme="light"] .filter-select option[value="all"],
      [data-theme="light"] select.filter-select option[value="all"],
      [data-theme="light"] .search-filter-section .filter-select option[value="all"],
      [data-theme="light"] option[value="all"] {
        color: #000000 !important;
        font-weight: 700 !important;
        background: #FFFFFF !important;
        -webkit-text-fill-color: #000000 !important;
        -webkit-text-stroke: 0 !important;
      }
      
      /* قواعد إضافية قوية لخيارات "جميع" */
      [data-theme="light"] .filter-select option[value="all"]:hover,
      [data-theme="light"] select.filter-select option[value="all"]:hover,
      [data-theme="light"] .search-filter-section .filter-select option[value="all"]:hover,
      [data-theme="light"] option[value="all"]:hover {
        color: #000000 !important;
        font-weight: 700 !important;
        background: #FFFFFF !important;
        -webkit-text-fill-color: #000000 !important;
        -webkit-text-stroke: 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showMaterialPrices, setShowMaterialPrices] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showPriceDebugger, setShowPriceDebugger] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('all');
  const [filterProductType, setFilterProductType] = useState('all');
  const [filterKarat, setFilterKarat] = useState('all');
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch products from backend on mount
  useEffect(() => {
    const fetchProducts = async (pageNum = 1) => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetchWithRefresh(`/api/products?page=${pageNum}&limit=10`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        let data = await res.json();
        const products = data.products.map(p => ({
          ...p,
          id: p._id || p.id || p.ID
        }));
        setProducts(products);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || products.length);
        setHasMore(data.hasMore || false);
      }
      setLoading(false);
    };
    fetchProducts(1);
    setCurrentPage(1);
  }, [showMaterialPrices, showStatistics, showPriceDebugger]); // إضافة جميع المتغيرات كتبعية للتحديث عند العودة

  // Memoized filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by search term (name, type, material, karat)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => {
        const name = product.name?.toLowerCase() || '';
        const type = product.productType?.toLowerCase() || '';
        const material = product.material?.toLowerCase() || '';
        const karat = product.karat?.toString() || '';
        
        return name.includes(searchLower) || 
               type.includes(searchLower) || 
               material.includes(searchLower) || 
               karat.includes(searchLower);
      });
    }

    // Filter by material
    if (filterMaterial !== 'all') {
      filtered = filtered.filter(product => {
        const productMaterial = product.material?.toLowerCase();
        const filterMaterialLower = filterMaterial.toLowerCase();
        return productMaterial === filterMaterialLower || 
               (filterMaterialLower === 'gold' && productMaterial === 'ذهب') ||
               (filterMaterialLower === 'silver' && productMaterial === 'فضة') ||
               (filterMaterialLower === 'diamond' && productMaterial === 'ألماس');
      });
    }

    // Filter by product type
    if (filterProductType !== 'all') {
      filtered = filtered.filter(product => {
        const productType = product.productType?.toLowerCase();
        const filterTypeLower = filterProductType.toLowerCase();
        return productType === filterTypeLower ||
               (filterTypeLower === 'ring' && productType === 'خاتم') ||
               (filterTypeLower === 'sized-ring' && productType === 'محبس') ||
               (filterTypeLower === 'name' && productType === 'اسم') ||
               (filterTypeLower === 'earring' && productType === 'حلق') ||
               (filterTypeLower === 'bracelet' && productType === 'اسوارة') ||
               (filterTypeLower === 'necklace' && productType === 'طوق') ||
               (filterTypeLower === 'set' && productType === 'طقم') ||
               (filterTypeLower === 'anklet' && productType === 'خلخال') ||
               (filterTypeLower === 'lira' && productType === 'ليرة') ||
               (filterTypeLower === 'half-lira' && productType === 'نصف ليرة') ||
               (filterTypeLower === 'quarter-lira' && productType === 'ربع ليرة') ||
               (filterTypeLower === 'ounce' && productType === 'أونصة');
      });
    }

    // Filter by karat
    if (filterKarat !== 'all') {
      filtered = filtered.filter(product => {
        const productKarat = product.karat?.toString();
        return productKarat === filterKarat;
      });
    }

    // Sort (pinned first, then by date)
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [products, searchTerm, filterMaterial, filterProductType, filterKarat]);

  const addProduct = async (product, isFormData = false) => {
    try {
      const token = localStorage.getItem('token');
      let options = {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: product,
      };

      if (!isFormData) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(product);
      }

      const res = await fetchWithRefresh('/api/products', options);
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || 'فشل حفظ المنتج');
        return;
      }
      const savedProduct = await res.json();
      setProducts(prev => [savedProduct, ...prev]);
      setShowForm(false);
    } catch (err) {
      alert('حدث خطأ أثناء حفظ المنتج');
    }
  };

  const updateProduct = async (product, isFormData = false) => {
    try {
      const token = localStorage.getItem('token');
      const id = product.id || product._id;
      let options = {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: product,
      };

      if (!isFormData) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(product);
      }

      const res = await fetchWithRefresh(`/api/products/${id}`, options);
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || 'فشل تحديث المنتج');
        return;
      }
      const updatedProduct = await res.json();
      setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? updatedProduct : p));
      setEditingProduct(null);
      setShowForm(false);
    } catch (err) {
      alert('حدث خطأ أثناء تحديث المنتج');
    }
  };

  // Instead of calling deleteProduct directly, open modal
  const handleDeleteClick = (product) => {
    console.log('DEBUG: handleDeleteClick product:', product);
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const deleteProduct = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetchWithRefresh(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || 'فشل حذف المنتج');
        return;
      }
      setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
    } catch (err) {
      alert('حدث خطأ أثناء حذف المنتج');
    }
  };

  const togglePin = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetchWithRefresh(`/api/products/${id}/pin`, {
        method: 'PATCH',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => {
          const updated = prev.map(p =>
            (p._id === id || p.id === id) ? { ...p, pinned: data.pinned } : p
          );
          // Resort so pinned products are at the top
          return [...updated].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
        });
      } else {
        alert('فشل تثبيت المنتج');
      }
    } catch (err) {
      alert('حدث خطأ أثناء تثبيت المنتج');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    // Support both English and Arabic material names
    const materialMap = {
      gold: ['gold', 'ذهب'],
      silver: ['silver', 'فضة'],
      diamond: ['diamond', 'ألماس'],
    };
    const matchesMaterial =
      filterMaterial === 'all' ||
      (materialMap[filterMaterial]
        ? materialMap[filterMaterial].includes(product.material)
        : product.material === filterMaterial);
    return matchesSearch && matchesMaterial;
  });

  // Helper to get product id
  const getProductId = (product) => product?._id || product?.id || product?.ID || '';

  const fetchProducts = async (pageNum) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetchWithRefresh(`/api/products?page=${pageNum}&limit=10`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    if (res.ok) {
      let data = await res.json();
      const products = data.products.map(p => ({
        ...p,
        id: p._id || p.id || p.ID
      }));
      setProducts(products);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalProducts || products.length);
      setHasMore(data.hasMore || false);
      setCurrentPage(pageNum);
    }
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchProducts(newPage);
    }
  };

  // Helper: fetch with auto-refresh on 401
  async function fetchWithRefresh(url, options = {}, retry = true) {
    let res = await apiCall(url, options);
    if (res.status === 401 && retry) {
      // Try to refresh the access token
      const refreshRes = await apiCall('/api/users/refresh', { method: 'POST', credentials: 'include' });
      if (refreshRes.ok) {
        // Retry the original request
        res = await apiCall(url, options);
      } else {
        // Refresh failed, force logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
    return res;
  }

  return (
    <div className="dashboard-container" dir="rtl">
      <style>{inlineStyles}</style>
      <Navbar onAddProduct={() => {
        setEditingProduct(null);
        setShowForm(true);
      }} />

      <main className="dashboard-main">
        {showForm ? (
          <ProductForm
            product={editingProduct}
            onSubmit={editingProduct ? updateProduct : addProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        ) : showMaterialPrices ? (
          <MaterialPriceManager onBack={() => {
            setShowMaterialPrices(false);
            // تحديث المنتجات عند العودة
            window.location.reload();
          }} />
        ) : showPriceDebugger ? (
          <PriceDebugger onBack={() => {
            setShowPriceDebugger(false);
          }} />
        ) : showStatistics ? (
          <StatisticsPanel onBack={() => {
            setShowStatistics(false);
          }} />
        ) : (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="search-filter-section">
              <h3 className="search-filter-title">البحث والفلترة المتقدمة</h3>
              <div className="search-filter-container">
                {/* Search Row */}
                <div className="search-filter-row">
                  <div className="search-container">
                    <Search className="search-icon" />
                    <input
                      type="text"
                      placeholder="البحث في الاسم، النوع، المادة، العيار..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
                
                {/* Filters Row */}
                <div className="search-filter-row">
                  <div className="filter-container">
                    <Filter className="filter-icon" />
                    <select
                      value={filterMaterial}
                      onChange={(e) => setFilterMaterial(e.target.value)}
                      className="filter-select"
                    >
                     <option value="all" style={{ color: "black" }}>
  جميع المواد
</option>
                      <option value="gold">ذهب</option>
                      <option value="silver">فضة</option>
                      <option value="diamond">ألماس</option>
                    </select>
                  </div>
                  
                  <div className="filter-container">
                    <Package className="filter-icon" />
                    <select
                      value={filterProductType}
                      onChange={(e) => setFilterProductType(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">جميع الأنواع</option>
                      <option value="ring">خاتم</option>
                      <option value="sized-ring">محبس</option>
                      <option value="name">اسم</option>
                      <option value="earring">حلق</option>
                      <option value="bracelet">اسوارة</option>
                      <option value="necklace">طوق</option>
                      <option value="set">طقم</option>
                      <option value="anklet">خلخال</option>
                      <option value="lira">ليرة</option>
                      <option value="half-lira">نصف ليرة</option>
                      <option value="quarter-lira">ربع ليرة</option>
                      <option value="ounce">أونصة</option>
                    </select>
                  </div>
                </div>
                
                {/* Second Filters Row */}
                <div className="search-filter-row">
                  <div className="filter-container">
                    <Gem className="filter-icon" />
                    <select
                      value={filterKarat}
                      onChange={(e) => setFilterKarat(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">جميع العيارات</option>
                      <option value="18">18 قيراط</option>
                      <option value="21">21 قيراط</option>
                      <option value="24">24 قيراط</option>
                      <option value="925">925 فضة</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterMaterial('all');
                      setFilterProductType('all');
                      setFilterKarat('all');
                    }}
                    className="clear-filters-button"
                  >
                    <X className="clear-icon" />
                    مسح جميع الفلاتر
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h3 className="quick-actions-title">إجراءات سريعة</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setShowMaterialPrices(true);
                    setShowForm(false);
                    setShowStatistics(false);
                  }}
                  className="action-button success"
                >
                  <DollarSign className="h-5 w-5" />
                  إدارة أسعار المواد
                </button>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setShowMaterialPrices(false);
                    setShowStatistics(false);
                    setEditingProduct(null);
                  }}
                  className="action-button secondary"
                >
                  <Plus className="h-5 w-5" />
                  إضافة منتج جديد
                </button>
                <button
                  onClick={() => {
                    setShowStatistics(true);
                    setShowForm(false);
                    setShowMaterialPrices(false);
                  }}
                  className="action-button purple"
                >
                  <BarChart3 className="h-5 w-5" />
                  إحصائيات المنتجات
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="stats-container">
              {/* Cards for Large Screens (5 in a row) */}
              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stats-label">إجمالي المنتجات</p>
                    <p className="stats-number">{products.length}</p>
                  </div>
                  <div className="stats-icon">
                    <Package className="h-6 w-6 text-black" />
                  </div>
                </div>
              </div>
              <div className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stats-label">المنتجات المثبتة</p>
                    <p className="stats-number">
                      {products.filter(p => p.pinned).length}
                    </p>
                  </div>
                  <div className="stats-icon">
                    <Star className="h-6 w-6 text-black" />
                  </div>
                </div>
              </div>
              <div className="stats-card gold">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stats-label">منتجات الذهب</p>
                    <p className="stats-number">
                      {products.filter(p => p.material === 'gold' || p.material === 'ذهب').length}
                    </p>
                  </div>
                  <div className="stats-icon gold">
                    <Crown className="h-6 w-6 text-black" />
                  </div>
                </div>
              </div>
              <div className="stats-card silver">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stats-label">منتجات الفضة</p>
                    <p className="stats-number">
                      {products.filter(p => p.material === 'silver' || p.material === 'فضة').length}
                    </p>
                  </div>
                  <div className="stats-icon silver">
                    <Gem className="h-6 w-6 text-black" />
                  </div>
                </div>
              </div>
              <div className="stats-card diamond">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stats-label">منتجات الألماس</p>
                    <p className="stats-number">
                      {products.filter(p => p.material === 'diamond' || p.material === 'ألماس').length}
                    </p>
                  </div>
                  <div className="stats-icon diamond">
                    <Gem className="h-6 w-6 text-black" />
                  </div>
                </div>
              </div>
              
              {/* Top Row - 2x2 Grid for Small/Medium Screens */}
              <div className="stats-top-row">
                <div className="stats-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stats-label">إجمالي المنتجات</p>
                      <p className="stats-number">{products.length}</p>
                    </div>
                    <div className="stats-icon">
                      <Package className="h-6 w-6 text-black" />
                    </div>
                  </div>
                </div>
                <div className="stats-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stats-label">المنتجات المثبتة</p>
                      <p className="stats-number">
                        {products.filter(p => p.pinned).length}
                      </p>
                    </div>
                    <div className="stats-icon">
                      <Star className="h-6 w-6 text-black" />
                    </div>
                  </div>
                </div>
                <div className="stats-card gold">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stats-label">منتجات الذهب</p>
                      <p className="stats-number">
                        {products.filter(p => p.material === 'gold' || p.material === 'ذهب').length}
                      </p>
                    </div>
                    <div className="stats-icon gold">
                      <Crown className="h-6 w-6 text-black" />
                    </div>
                  </div>
                </div>
                <div className="stats-card silver">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stats-label">منتجات الفضة</p>
                      <p className="stats-number">
                        {products.filter(p => p.material === 'silver' || p.material === 'فضة').length}
                      </p>
                    </div>
                    <div className="stats-icon silver">
                      <Gem className="h-6 w-6 text-black" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Row - Single Wide Card for Small/Medium Screens */}
              <div className="stats-bottom-row">
                <div className="stats-card diamond stats-wide">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stats-label">منتجات الألماس</p>
                      <p className="stats-number">
                        {products.filter(p => p.material === 'diamond' || p.material === 'ألماس').length}
                      </p>
                    </div>
                    <div className="stats-icon diamond">
                      <Gem className="h-6 w-6 text-black" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product List */}
            <ProductList
              products={filteredAndSortedProducts}
              onEdit={(product) => {
                // Ensure both id and _id are present and log for debugging
                const fullProduct = {
                  ...product,
                  id: product._id || product.id || product.ID,
                  _id: product._id || product.id || product.ID,
                };
                console.log('DEBUG onEdit fullProduct:', fullProduct);
                setEditingProduct(fullProduct);
                setShowForm(true);
              }}
              onDelete={handleDeleteClick}
              onTogglePin={togglePin}
              onView={setViewProduct}
              loadingMore={loading}
            />

            {/* Pagination - في نهاية الصفحة */}
            <div className="pagination-container">
              <div className="pagination-info">
                <span>الصفحة {currentPage} من {totalPages}</span>
                <span>إجمالي المنتجات: {totalProducts}</span>
              </div>
              
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="pagination-button prev"
                >
                  السابق
                </button>
                
                <div className="pagination-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                        disabled={loading}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="pagination-button next"
                >
                  التالي
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-sm w-full text-center">
            <h2 className="modal-title text-red-400">تأكيد الحذف</h2>
            <p className="mb-6 text-gray-300">هل أنت متأكد أنك تريد حذف المنتج <span className="font-bold text-white">{productToDelete?.name}</span>؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex justify-center gap-4">
              <button
                className="action-button secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                إلغاء
              </button>
              <button
                className="action-button danger"
                onClick={async () => {
                  const id = getProductId(productToDelete);
                  console.log('DEBUG: Modal delete button productToDelete:', productToDelete, 'Resolved id:', id);
                  if (!id) {
                    alert('تعذر العثور على معرف المنتج');
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                    return;
                  }
                  await deleteProduct(id);
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
            {/* Product Details Modal */}
      {viewProduct && (
        <div className="modal-overlay">
          <div className="modal-content max-w-6xl w-full relative max-h-[90vh] p-0">
            <div className="modal-header p-6 pb-4 border-b border-border-color">
              <button
                className="modal-close-button"
                onClick={() => setViewProduct(null)}
                title="إغلاق"
                type="button"
                style={{
                  background: document.documentElement.getAttribute('data-theme') === 'light' ? '#D4AF37' : '#D4AF37',
                  color: '#FFFFFF',
                  border: 'none',
                  width: window.innerWidth <= 768 ? (window.innerWidth <= 480 ? '35px' : '40px') : '45px',
                  height: window.innerWidth <= 768 ? (window.innerWidth <= 480 ? '35px' : '40px') : '45px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: window.innerWidth <= 768 ? (window.innerWidth <= 480 ? '1rem' : '1.1rem') : '1.3rem',
                  fontWeight: 'bold',
                  position: 'absolute',
                  top: window.innerWidth <= 768 ? (window.innerWidth <= 480 ? '0.6rem' : '0.8rem') : '1rem',
                  right: window.innerWidth <= 768 ? (window.innerWidth <= 480 ? '0.6rem' : '0.8rem') : '1rem',
                  zIndex: 1000,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#C9A94F';
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#D4AF37';
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'scale(0.95)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                }}
                onTouchStart={(e) => {
                  e.target.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  setTimeout(() => {
                    e.target.style.transform = 'scale(1)';
                  }, 150);
                }}
              >
                ✕
              </button>
              
              <h2 className="modal-title">تفاصيل المنتج</h2>
            </div>
            
            <div className="modal-body overflow-y-auto max-h-[calc(90vh-140px)] p-0">
            
            <div className="product-details-layout">
              {/* Right Column - Images */}
              <div className="product-images-section">
                {/* Main Image */}
                {viewProduct.images && viewProduct.images.length > 0 ? (
                  <img
                    src={viewProduct.images[0]}
                    alt={viewProduct.name}
                    className="product-modal-image"
                    onClick={() => setLightbox({ open: true, images: viewProduct.images, index: 0 })}
                  />
                ) : (
                  <div className="product-modal-image-placeholder">
                    لا صورة متاحة
                  </div>
                )}
                
                {/* Thumbnail Images */}
                {viewProduct.images && viewProduct.images.length > 1 && (
                  <div className="thumbnail-container">
                    {viewProduct.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`صورة ${idx + 1}`}
                        className="thumbnail-image"
                        onClick={() => setLightbox({ open: true, images: viewProduct.images, index: idx })}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Left Column - Details */}
              <div className="product-info-section">
                {/* Product Name and Badges */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">{viewProduct.name}</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="product-badge golden">{viewProduct.material}</span>
                    <span className="product-badge">{viewProduct.productType}</span>
                    <span className="product-badge">{(viewProduct.karat || viewProduct.carat)} عيار</span>
                    <span className="product-badge">{viewProduct.weight} غرام</span>
                  </div>
                </div>

                {/* Product Info Grid */}
                <div className="product-info-grid">
                  <div className="product-info-item">
                    <div className="product-info-label">العيار</div>
                    <div className="product-info-value">{viewProduct.karat || viewProduct.carat}</div>
                  </div>
                  <div className="product-info-item">
                    <div className="product-info-label">الوزن</div>
                    <div className="product-info-value">{viewProduct.weight} غرام</div>
                  </div>
                  <div className="product-info-item">
                    <div className="product-info-label">أجار الغرام</div>
                    <div className="product-info-value">{viewProduct.gramWage || 'غير محدد'}</div>
                  </div>
                  <div className="product-info-item">
                    <div className="product-info-label">أجار الصنعة USD</div>
                    <div className="product-info-value">{viewProduct.craftingFeeUSD || 0} USD</div>
                  </div>
                </div>

                {/* Prices */}
                <div className="space-y-3">
                  <h4 className="info-card-title">الأسعار</h4>
                  
                  {/* Gram Prices */}
                  <div className="space-y-2">
                    <h5 className="text-golden font-semibold text-sm mb-2">أسعار الغرام</h5>
                    {viewProduct.gramPrice && viewProduct.gramPrice.usd !== undefined && (
                      <div className="price-card">
                        <div className="price-label">سعر الغرام</div>
                        <div className="price-value">{viewProduct.gramPrice.usd} USD</div>
                      </div>
                    )}
                    {viewProduct.gramPrice && viewProduct.gramPrice.syp !== undefined && (
                      <div className="price-card">
                        <div className="price-label">سعر الغرام</div>
                        <div className="price-value">{viewProduct.gramPrice.syp} SYP</div>
                      </div>
                    )}
                  </div>

                  {/* Total Prices */}
                  <div className="space-y-2">
                    <h5 className="text-golden font-semibold text-sm mb-2">الأسعار الكلية</h5>
                    {viewProduct.totalPrice && viewProduct.totalPrice.usd !== undefined && (
                      <div className="price-card usd">
                        <div className="price-label">السعر الكلي</div>
                        <div className="price-value">{viewProduct.totalPrice.usd.toFixed(2)} USD</div>
                      </div>
                    )}
                    {viewProduct.totalPrice && viewProduct.totalPrice.syp !== undefined && (
                      <div className="price-card syp">
                        <div className="price-label">السعر الكلي</div>
                        <div className="price-value">{viewProduct.totalPrice.syp.toFixed(2)} SYP</div>
                      </div>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="additional-info">
                    <div className="additional-info-title">ملخص الأسعار</div>
                    <div className="additional-info-content">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>الوزن الإجمالي:</strong> {viewProduct.weight} غرام</div>
                        <div><strong>أجار الصنعة:</strong> {viewProduct.craftingFeeUSD || 0} USD</div>
                        {viewProduct.stones && viewProduct.stones.length > 0 && (
                          <>
                            <div><strong>عدد الأحجار:</strong> {viewProduct.stones.length}</div>
                            <div><strong>إجمالي وزن الأحجار:</strong> {viewProduct.stones.reduce((sum, stone) => sum + (stone.totalWeight || 0), 0).toFixed(2)} قيراط</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {viewProduct.description && viewProduct.description.trim() !== '' && (
                  <div className="product-description">
                    <h4 className="info-card-title">الوصف</h4>
                    <p>{viewProduct.description.trim()}</p>
                  </div>
                )}

                {/* Additional Info */}
                <div className="space-y-3">
                  {viewProduct.stones && viewProduct.stones.length > 0 && (
                    <div className="additional-info stones">
                      <div className="additional-info-title">الأحجار</div>
                      <div className="additional-info-content mb-3">
                        إجمالي عدد الأحجار: {viewProduct.stones.length} حجر
                      </div>
                      <ul className="stones-list">
                        {viewProduct.stones.map((stone, idx) => (
                          <li key={idx}>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><strong>النوع:</strong> {stone.type}</div>
                              <div><strong>اللون:</strong> {stone.color}</div>
                              <div><strong>العدد:</strong> {stone.count}</div>
                              <div><strong>الوزن الكلي:</strong> {stone.totalWeight} قيراط</div>
                              <div><strong>سعر القيراط USD:</strong> {stone.caratPrice && stone.caratPrice.usd} USD</div>
                              <div><strong>سعر القيراط SYP:</strong> {stone.caratPrice && stone.caratPrice.syp} SYP</div>
                              <div><strong>السعر الكلي USD:</strong> {stone.totalPrice && stone.totalPrice.usd} USD</div>
                              <div><strong>السعر الكلي SYP:</strong> {stone.totalPrice && stone.totalPrice.syp} SYP</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {viewProduct.ringSizes && viewProduct.ringSizes.length > 0 && (
                    <div className="additional-info ring-sizes">
                      <div className="additional-info-title">قياسات المحبس</div>
                      <div className="additional-info-content mb-2">
                        عدد القياسات المتاحة: {viewProduct.ringSizes.length} قياس
                      </div>
                      <div className="additional-info-content">
                        القياسات: {viewProduct.ringSizes.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  {viewProduct.setAccessories && viewProduct.setAccessories.length > 0 && (
                    <div className="additional-info accessories">
                      <div className="additional-info-title">ملحقات الطقم</div>
                      <div className="additional-info-content mb-2">
                        عدد الملحقات: {viewProduct.setAccessories.length} قطعة
                      </div>
                      <div className="additional-info-content">
                        الملحقات: {viewProduct.setAccessories.join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Product Info */}
                <div className="space-y-3">
                  <h4 className="info-card-title">معلومات إضافية</h4>
                  
                  {/* Likes Count */}
                  <div className="additional-info">
                    <div className="additional-info-title">عدد الإعجابات</div>
                    <div className="additional-info-content">
                      {viewProduct.likes && viewProduct.likes.length > 0 ? viewProduct.likes.length : 0} إعجاب
                    </div>
                  </div>

                  {/* Product Status */}
                  <div className="additional-info">
                    <div className="additional-info-title">حالة المنتج</div>
                    <div className="additional-info-content">
                      {viewProduct.pinned ? 'مثبت في الأعلى' : 'عادي'}
                    </div>
                  </div>

                  {/* Product ID */}
                  <div className="additional-info">
                    <div className="additional-info-title">رقم المنتج</div>
                    <div className="additional-info-content">
                      {viewProduct._id || viewProduct.id || 'غير متوفر'}
                    </div>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="product-meta">
                  <div className="product-meta-item">
                    <div className="product-meta-label">تاريخ الإضافة</div>
                    <div className="product-meta-value">
                      {viewProduct.createdAt && new Date(viewProduct.createdAt).toLocaleString('ar-EG')}
                    </div>
                  </div>
                  <div className="product-meta-item">
                    <div className="product-meta-label">آخر تحديث</div>
                    <div className="product-meta-value">
                      {viewProduct.updatedAt && new Date(viewProduct.updatedAt).toLocaleString('ar-EG')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for product images */}
      {lightbox.open && (
        <div className="modal-overlay">
          <button
            className="absolute top-4 left-4 text-white text-2xl font-bold hover:text-gray-300 transition-colors"
            onClick={() => setLightbox({ ...lightbox, open: false })}
            aria-label="إغلاق"
          >
            <X className="h-8 w-8" />
          </button>
          <button
            className="absolute left-8 top-1/2 -translate-y-1/2 text-white text-3xl font-bold px-2 hover:text-gray-300 transition-colors"
            onClick={() => setLightbox(l => ({ ...l, index: (l.index - 1 + l.images.length) % l.images.length }))}
            aria-label="السابق"
            style={{ zIndex: 51 }}
          >
            &#8592;
          </button>
          <img
            src={lightbox.images[lightbox.index]}
            alt={`صورة ${lightbox.index + 1}`}
            className="max-h-[80vh] max-w-[90vw] rounded-lg border-4 border-silver-gray"
            style={{ zIndex: 52, borderColor: '#B0B0B0', boxShadow: '0 4px 20px rgba(176, 176, 176, 0.3)' }}
          />
          <button
            className="absolute right-8 top-1/2 -translate-y-1/2 text-white text-3xl font-bold px-2 hover:text-gray-300 transition-colors"
            onClick={() => setLightbox(l => ({ ...l, index: (l.index + 1) % l.images.length }))}
            aria-label="التالي"
            style={{ zIndex: 51 }}
          >
            &#8594;
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
