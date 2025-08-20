import React, { useState, useEffect } from 'react';
import { LogOut, ChevronDown, Gem, Package, Sun, Moon } from 'lucide-react';
import './styles/Navbar.css';

const productTypes = [
  { value: 'ring', label: 'خاتم', category: 'مجوهرات' },
  { value: 'sized-ring', label: 'محبس', category: 'مجوهرات' },
  { value: 'name', label: 'اسم', category: 'مجوهرات' },
  { value: 'earring', label: 'حلق', category: 'مجوهرات' },
  { value: 'bracelet', label: 'اسوارة', category: 'مجوهرات' },
  { value: 'necklace', label: 'طوق', category: 'مجوهرات' },
  { value: 'set', label: 'طقم', category: 'مجوهرات' },
  { value: 'anklet', label: 'خلخال', category: 'مجوهرات' },
  { value: 'lira', label: 'ليرة', category: 'سبائك' },
  { value: 'half-lira', label: 'نصف ليرة', category: 'سبائك' },
  { value: 'quarter-lira', label: 'ربع ليرة', category: 'سبائك' },
  { value: 'ounce', label: 'أونصة', category: 'سبائك' },
];

// Only types relevant to diamonds/stones (customize as needed)
const diamondTypes = [
  { value: 'diamond', label: 'ألماس' },
  { value: 'set', label: 'طقم' },
  { value: 'ring', label: 'خاتم مرصع' },
  { value: 'earring', label: 'حلق مرصع' },
  // Add more if needed
];

const Navbar = ({ onAddProduct }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openDiamondMenu, setOpenDiamondMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const menuRef = useRef(null);
  const diamondMenuRef = useRef(null);

  // تحميل الوضع المحفوظ عند بدء التطبيق
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // تبديل الوضع المظلم/الفاتح
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // دالة لإخفاء أيقونات الفلترة
  const hideFilterIcons = () => {
    const filterElements = document.querySelectorAll('.filter-icons, [class*="filter"], .filter-section, .filter-buttons, .filter-controls, .dashboard-filters, .control-panel, .mobile-filters');
    filterElements.forEach(element => {
      element.style.zIndex = '1';
      element.style.opacity = '0.1';
      element.style.pointerEvents = 'none';
      element.style.visibility = 'hidden';
      element.style.transition = 'all 0.3s ease';
    });
  };

  // دالة لإظهار أيقونات الفلترة
  const showFilterIcons = () => {
    const filterElements = document.querySelectorAll('.filter-icons, [class*="filter"], .filter-section, .filter-buttons, .filter-controls, .dashboard-filters, .control-panel, .mobile-filters');
    filterElements.forEach(element => {
      element.style.zIndex = '';
      element.style.opacity = '';
      element.style.pointerEvents = '';
      element.style.visibility = '';
      element.style.transition = '';
    });
  };

  // دالة لفتح قائمة المنتجات
  const handleProductMenuToggle = () => {
    const newState = !openMenu;
    setOpenMenu(newState);
    
    if (newState) {
      hideFilterIcons();
    } else {
      showFilterIcons();
    }
  };

  // دالة لفتح قائمة الأحجار الكريمة
  const handleDiamondMenuToggle = () => {
    const newState = !openDiamondMenu;
    setOpenDiamondMenu(newState);
    
    if (newState) {
      hideFilterIcons();
    } else {
      showFilterIcons();
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
        showFilterIcons();
      }
      if (diamondMenuRef.current && !diamondMenuRef.current.contains(event.target)) {
        setOpenDiamondMenu(false);
        showFilterIcons();
      }
    };
    if (openMenu || openDiamondMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenu, openDiamondMenu]);

  // إظهار أيقونات الفلترة عند إغلاق القوائم
  useEffect(() => {
    if (!openMenu && !openDiamondMenu) {
      showFilterIcons();
    }
  }, [openMenu, openDiamondMenu]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand">
          مجوهرات نزار
        </div>
        
        {/* Main nav */}
        <div className="navbar-main">
          {/* Crystals & Beads / Diamonds menu */}
          <div className="relative" ref={diamondMenuRef}>
            <button
              className={`nav-link ${openDiamondMenu ? 'active' : ''}`}
              onClick={handleDiamondMenuToggle}
            >
              <Gem className="nav-icon" />
              <span>الأحجار الكريمة والألماس</span>
              <ChevronDown className={`chevron-icon ${openDiamondMenu ? 'rotated' : ''}`} />
            </button>
            {openDiamondMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <Gem className="dropdown-header-icon" />
                  <span>الأحجار الكريمة</span>
                </div>
                <div className="dropdown-grid single">
                  {diamondTypes.map((type) => (
                    <a
                      key={type.value}
                      href={`#${type.value}`}
                      className="dropdown-item"
                    >
                      {type.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Products menu */}
          <div className="relative" ref={menuRef}>
            <button
              className={`nav-link ${openMenu ? 'active' : ''}`}
              onClick={handleProductMenuToggle}
            >
              <Package className="nav-icon" />
              <span>المنتجات</span>
              <ChevronDown className={`chevron-icon ${openMenu ? 'rotated' : ''}`} />
            </button>
            {/* Dropdown */}
            {openMenu && (
              <div className="dropdown-menu" style={{display: 'block', visibility: 'visible', opacity: 1}}>
                <div className="dropdown-header">
                  <Package className="dropdown-header-icon" />
                  <span>جميع أنواع المنتجات</span>
                </div>
                
                {/* مجوهرات */}
                <div className="dropdown-section">
                  <div className="dropdown-section-title">
                    <span>💎 مجوهرات</span>
                  </div>
                  <div className="dropdown-grid double">
                    {productTypes
                      .filter(type => type.category === 'مجوهرات')
                      .map((type) => (
                        <a
                          key={type.value}
                          href={`#${type.value}`}
                          className="dropdown-item"
                        >
                          {type.label}
                        </a>
                      ))}
                  </div>
                </div>

                {/* سبائك */}
                <div className="dropdown-section">
                  <div className="dropdown-section-title">
                    <span>🥇 سبائك</span>
                  </div>
                  <div className="dropdown-grid double">
                    {productTypes
                      .filter(type => type.category === 'سبائك')
                      .map((type) => (
                        <a
                          key={type.value}
                          href={`#${type.value}`}
                          className="dropdown-item"
                        >
                          {type.label}
                        </a>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* أزرار الإجراءات */}
        <div className="navbar-actions">
          {/* زر تبديل الوضع المظلم/الفاتح */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-button"
            title={isDarkMode ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع المظلم"}
          >
            {isDarkMode ? (
              <Sun className="button-icon" />
            ) : (
              <Moon className="button-icon" />
            )}
            <span className="theme-toggle-text">
              {isDarkMode ? "فاتح" : "مظلم"}
            </span>
          </button>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="logout-button"
            title="تسجيل الخروج"
          >
            <LogOut className="button-icon" />
            <span className="logout-text">تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 