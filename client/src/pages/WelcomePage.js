import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // إظهار الصفحة بعد تحميل المكون
    setTimeout(() => setIsVisible(true), 100);
    
    // إظهار المحتوى بعد 500ms
    setTimeout(() => setShowContent(true), 500);
    
    // الانتقال إلى الصفحة الرئيسية بعد 9 ثوانٍ
    const timer = setTimeout(() => {
      navigate('/home');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSkip = () => {
    navigate('/home');
  };

  return (
    <div className={`welcome-page ${isVisible ? 'visible' : ''}`}>
      <div className="welcome-background">
        {/* خطوط متحركة في الخلفية */}
        <div className="animated-lines">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
        
        {/* دوائر متحركة */}
        <div className="floating-circles">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </div>
      </div>
      
      <div className="welcome-content">
        <div className={`welcome-text ${showContent ? 'show' : ''}`}>
          <div className="logo-section">
            <div className="geometric-logo">
              <div className="logo-hexagon"></div>
              <div className="logo-center-diamond"></div>
            </div>
          </div>
          
          <h1 className="welcome-title">
            <span className="title-line">بالتعاون مع</span>
            <span className="evanox">EVANOX</span>
            <span className="title-line">نضع بين أيديكم متجرنا الفاخر</span>
            <span className="title-line">أهلاً بكم في EvaNox</span>
          </h1>
          
          <div className="welcome-subtitle">
            <h2>مجموعة فاخرة من المجوهرات الذهبية والماسية</h2>
          </div>
          
          <div className="loading-container">
            <div className="circular-progress">
              <div className="circular-track"></div>
              <div className="circular-fill"></div>
              <div className="loading-text">جاري التحميل...</div>
            </div>
          </div>
          
          <button className="skip-button" onClick={handleSkip}>
            تخطي
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
