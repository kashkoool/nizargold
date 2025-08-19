import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, Save, AlertCircle, CheckCircle, X, Calculator, Moon, Sun } from 'lucide-react';
import './styles/MaterialPriceManager.css';

const MaterialPriceManager = ({ onBack }) => {
  const [materialPrices, setMaterialPrices] = useState({
    ذهب: { 
      usd: 0, 
      syp: 0,
      goldKaratPrices: {
        '18': { usd: 0, syp: 0 },
        '21': { usd: 0, syp: 0 },
        '24': { usd: 0, syp: 0 }
      }
    },
    فضة: { usd: 0, syp: 0 },
    ألماس: { usd: 0, syp: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [autoUpdateProducts, setAutoUpdateProducts] = useState(false);
  
  // Fetch current material prices
  useEffect(() => {
    fetchMaterialPrices();
  }, []);

  const fetchMaterialPrices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/material-prices', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        const prices = await res.json();
        const formattedPrices = {};
        prices.forEach(price => {
          if (price.material === 'ذهب') {
            formattedPrices[price.material] = {
              usd: price.pricePerGram?.usd || 0,
              syp: price.pricePerGram?.syp || 0,
              goldKaratPrices: price.goldKaratPrices || {
                '18': { usd: 0, syp: 0 },
                '21': { usd: 0, syp: 0 },
                '24': { usd: 0, syp: 0 }
              }
            };
          } else {
            formattedPrices[price.material] = price.pricePerGram || { usd: 0, syp: 0 };
          }
        });
        setMaterialPrices(formattedPrices);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'فشل في تحميل أسعار المواد' });
    }
    setLoading(false);
  };

  // حساب أسعار العيارات الأخرى تلقائياً
  // دالة لتنسيق الأرقام وإضافة الفواصل
  const formatNumber = (number) => {
    if (number === null || number === undefined || number === '') return '';
    
    // تحويل الرقم إلى نص وإزالة الفواصل الموجودة
    const numStr = number.toString().replace(/,/g, '');
    
    // التحقق من أن القيمة رقم صحيح أو عشري
    if (isNaN(numStr)) return '';
    
    // تقسيم الرقم إلى جزء صحيح وعشري
    const parts = numStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';
    
    // إضافة فواصل للجزء الصحيح
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // إعادة تجميع الرقم مع الجزء العشري
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  // دالة لإزالة الفواصل من النص وتحويله إلى رقم
  const parseFormattedNumber = (formattedValue) => {
    if (!formattedValue) return 0;
    
    // إزالة الفواصل وتحويل إلى رقم
    const cleanValue = formattedValue.replace(/,/g, '');
    const number = parseFloat(cleanValue);
    
    return isNaN(number) ? 0 : number;
  };

  const calculateOtherKaratPrices = (karat21USD, karat21SYP) => {
    const karat18USD = (karat21USD * 18) / 21;
    const karat18SYP = (karat21SYP * 18) / 21;
    const karat24USD = (karat21USD * 24) / 21;
    const karat24SYP = (karat21SYP * 24) / 21;

    return {
      '18': {
        usd: Math.round(karat18USD * 100) / 100,
        syp: Math.round(karat18SYP * 100) / 100
      },
      '21': {
        usd: karat21USD,
        syp: karat21SYP
      },
      '24': {
        usd: Math.round(karat24USD * 100) / 100,
        syp: Math.round(karat24SYP * 100) / 100
      }
    };
  };

  const handlePriceChange = (material, currency, value) => {
    // تحويل القيمة المدخلة إلى رقم (إزالة الفواصل)
    const numericValue = parseFormattedNumber(value);
    
    if (material === 'ذهب') {
      // للذهب، نحدث عيار 21 ونحسب العيارات الأخرى تلقائياً
      const newKarat21USD = currency === 'usd' ? numericValue : materialPrices[material].goldKaratPrices['21'].usd;
      const newKarat21SYP = currency === 'syp' ? numericValue : materialPrices[material].goldKaratPrices['21'].syp;
      
      // حساب أسعار العيارات الأخرى
      const calculatedPrices = calculateOtherKaratPrices(newKarat21USD, newKarat21SYP);
      
      setMaterialPrices(prev => ({
        ...prev,
        [material]: {
          ...prev[material],
          goldKaratPrices: calculatedPrices
        }
      }));
    } else {
      setMaterialPrices(prev => ({
        ...prev,
        [material]: {
          ...prev[material],
          [currency]: numericValue
        }
      }));
    }
  };

  const updateMaterialPrice = async (material) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let requestBody;
      
      if (material === 'ذهب') {
        // للذهب، نرسل عيار 21 فقط
        const karat21Price = materialPrices[material].goldKaratPrices['21'];
        requestBody = {
          material,
          karat: '21',
          pricePerGram: karat21Price
        };
      } else {
        // للفضة والألماس، نرسل السعر العادي
        requestBody = {
          material,
          pricePerGram: materialPrices[material]
        };
      }
      
      // Log the request data
      console.log(`🔄 Updating ${material} price:`, requestBody);
      
      const res = await fetch('/api/material-prices', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const result = await res.json();
        console.log(`✅ Updated ${material} price result:`, result);
        
        // Auto-update products if enabled
        if (autoUpdateProducts) {
          setMessage({ type: 'success', text: `تم تحديث سعر ${material} بنجاح. جاري تحديث المنتجات...` });
          await updateAllProductsForMaterial(material);
        } else {
          setMessage({ type: 'success', text: `تم تحديث سعر ${material} بنجاح` });
        }
        
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        // تحديث الواجهة تلقائياً بعد الحفظ
        await fetchMaterialPrices();
      } else {
        const error = await res.json();
        console.log(`❌ Error updating ${material} price:`, error);
        setMessage({ type: 'error', text: error.message });
      }
    } catch (err) {
      console.log(`❌ Exception updating ${material} price:`, err);
      setMessage({ type: 'error', text: 'فشل في تحديث السعر' });
    }
    setLoading(false);
  };

  const updateAllProductsForMaterial = async (material) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const requestBody = { material };
      
      // Log the request data
      console.log(`🔄 Updating products for ${material}:`, requestBody);
      
      const res = await fetch('/api/material-prices/update-products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const result = await res.json();
        console.log(`✅ Updated products for ${material} result:`, result);
        setMessage({ 
          type: 'success', 
          text: `تم تحديث أسعار ${result.updatedCount} منتج من ${material} بنجاح` 
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        // تحديث الواجهة تلقائياً بعد تحديث المنتجات
        await fetchMaterialPrices();
      } else {
        const error = await res.json();
        console.log(`❌ Error updating products for ${material}:`, error);
        setMessage({ type: 'error', text: error.message });
      }
    } catch (err) {
      console.log(`❌ Exception updating products for ${material}:`, err);
      setMessage({ type: 'error', text: 'فشل في تحديث أسعار المنتجات' });
    }
    setUpdating(false);
  };



  const materials = [
    { name: 'ذهب', color: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-300' },
    { name: 'فضة', color: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-300' },
    { name: 'ألماس', color: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' }
  ];

  return (
    <div className="material-price-container">
      <div className="material-price-header">
        <div className="material-price-title-section">
          <div className="material-price-icon">
            <DollarSign className="h-6 w-6 text-black" />
          </div>
          <h2 className="material-price-title">إدارة أسعار المواد الأساسية</h2>
        </div>
        <div className="material-price-actions">
          <button
        
            onClick={fetchMaterialPrices}
            disabled={loading}
            className="material-action-button secondary"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث الأسعار
          </button>
          <button
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                window.history.back();
              }
            }}
            className="material-action-button back"
          >
            <X className="h-4 w-4" />
            العودة
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`material-message ${message.type === 'success' ? 'success' : 'error'}`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Auto Update Option */}
      <div className="update-options-section">
        <div className="update-options-content">
          <div className="update-options-info">
            <h3>خيارات التحديث</h3>
            <p>اختر كيفية تحديث المنتجات عند تغيير أسعار المواد</p>
          </div>
          <div className="update-options-control">
            <input
              type="checkbox"
              id="auto-update"
              checked={autoUpdateProducts}
              onChange={(e) => setAutoUpdateProducts(e.target.checked)}
              className="update-checkbox"
            />
            <label htmlFor="auto-update" className="update-checkbox-label">
              تحديث المنتجات تلقائياً عند حفظ السعر
            </label>
          </div>
        </div>
      </div>

      {/* Material Price Cards */}
      <div className="materials-grid">
        {materials.map((material) => (
          <div
            key={material.name}
            className={`material-card ${material.name === 'ذهب' ? 'gold' : material.name === 'فضة' ? 'silver' : 'diamond'}`}
          >
            <h3 className="material-card-title">
              {material.name}
            </h3>
            
            {material.name === 'ذهب' ? (
              // عرض العيارات المختلفة للذهب
              <div className="space-y-4">
                {/* معلومات المعادلة الرياضية */}
                <div className="calculation-info">
                  <div className="calculation-info-title">
                    <Calculator className="h-3 w-3" />
                    المعادلة الرياضية:
                  </div>
                  <div className="calculation-info-content">
                    <div>عيار 18 = (سعر عيار 21 × 18) ÷ 21</div>
                    <div>عيار 24 = (سعر عيار 21 × 24) ÷ 21</div>
                    <div className="calculation-info-tip">💡 سيتم حساب العيارات الأخرى تلقائياً</div>
                  </div>
                </div>

                {/* حقول إدخال السعر لعيار 21 فقط */}
                <div className="material-input-group">
                  <label className="material-input-label">
                    سعر الغرام (USD) - عيار 21 *
                  </label>
                  <input
                    type="text"
                    value={formatNumber(materialPrices[material.name].goldKaratPrices['21']?.usd || 0)}
                    onChange={(e) => handlePriceChange(material.name, 'usd', e.target.value)}
                    className="material-input"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
                
                <div className="material-input-group">
                  <label className="material-input-label">
                    سعر الغرام (SYP) - عيار 21 *
                  </label>
                  <input
                    type="text"
                    value={formatNumber(materialPrices[material.name].goldKaratPrices['21']?.syp || 0)}
                    onChange={(e) => handlePriceChange(material.name, 'syp', e.target.value)}
                    className="material-input"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>

                {/* عرض أسعار جميع العيارات (للقراءة فقط) */}
                <div className="karat-prices-display">
                  <div className="karat-prices-title">أسعار جميع العيارات (محسوبة تلقائياً):</div>
                  <div className="karat-prices-grid">
                    {['18', '21', '24'].map(karat => (
                      <div key={karat} className={`karat-price-item ${karat === '21' ? 'editable' : 'calculated'}`}>
                        <div className="karat-price-label">
                          عيار {karat}: 
                          {karat === '21' && <span className="mr-1"> (قابل للتعديل)</span>}
                          {karat !== '21' && <span className="mr-1"> (محسوب تلقائياً)</span>}
                        </div>
                        <div className="karat-price-values">
                          <div>USD: {formatNumber(materialPrices[material.name].goldKaratPrices[karat]?.usd || 0)}</div>
                          <div>SYP: {formatNumber(materialPrices[material.name].goldKaratPrices[karat]?.syp || 0)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="material-card-actions">
                  <button
                    onClick={() => updateMaterialPrice(material.name)}
                    disabled={loading}
                    className="material-card-button save"
                  >
                    <Save className="h-4 w-4" />
                    حفظ السعر
                  </button>
                  
                  <button
                    onClick={() => updateAllProductsForMaterial(material.name)}
                    disabled={updating}
                    className="material-card-button update"
                  >
                    <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
                    تحديث المنتجات
                  </button>
                </div>
              </div>
            ) : (
              // عرض السعر العادي للفضة والألماس
              <div className="space-y-4">
                <div className="material-input-group">
                  <label className="material-input-label">
                    سعر الغرام (USD)
                  </label>
                  <input
                    type="text"
                    value={formatNumber(materialPrices[material.name]?.usd || 0)}
                    onChange={(e) => handlePriceChange(material.name, 'usd', e.target.value)}
                    className="material-input"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
                
                <div className="material-input-group">
                  <label className="material-input-label">
                    سعر الغرام (SYP)
                  </label>
                  <input
                    type="text"
                    value={formatNumber(materialPrices[material.name]?.syp || 0)}
                    onChange={(e) => handlePriceChange(material.name, 'syp', e.target.value)}
                    className="material-input"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
                
                <div className="material-card-actions">
                  <button
                    onClick={() => updateMaterialPrice(material.name)}
                    disabled={loading}
                    className="material-card-button save"
                  >
                    <Save className="h-4 w-4" />
                    حفظ السعر
                  </button>
                  
                  <button
                    onClick={() => updateAllProductsForMaterial(material.name)}
                    disabled={updating}
                    className="material-card-button update"
                  >
                    <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
                    تحديث المنتجات
                  </button>
                </div>
              </div>
            )}
            
            <div className="material-card-info">
              <div className="material-card-tip">
                💡 انقر على "تحديث المنتجات" لتطبيق السعر الجديد على جميع منتجات {material.name}
              </div>
              
              <div className="material-card-calculation">
                <div className="material-card-calculation-title">العملية الحسابية:</div>
                <div>السعر الكلي = (سعر الغرام + أجار الصياغة) × الوزن</div>
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
};

export default MaterialPriceManager; 