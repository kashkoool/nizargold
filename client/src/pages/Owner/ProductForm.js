import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Trash2 } from 'lucide-react';
import DiamondFields from './DiamondFields';
import ProductTypeFields from './ProductTypeFields';
import './styles/ProductForm.css';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  // Debug: Log the incoming product prop
  console.log('DEBUG ProductForm received product:', product);

  const [formData, setFormData] = useState({
    name: '',
    material: '', // was 'gold', now empty for placeholder
    productType: '', // was 'ring', now empty for placeholder
    description: '',
    carat: '', // was '18', now empty for placeholder
    weight: 0,
    craftingFee: 0,
    craftingFeeUSD: 0,
    pricePerGramUSD: 0,
    pricePerGramSYP: 0,
    totalPriceUSD: 0,
    totalPriceSYP: 0,
    images: [],
    isPinned: false,
    sizes: [],
    setComponents: [],
    diamonds: [],
  });

  const [diamondData, setDiamondData] = useState({
    stones: [],
    totalStoneWeight: 0,
    totalStonePrice: 0,
  });

  // تحديد المنتجات التي تستخدم "أجار القطعة" بدلاً من "أجار الغرام"
  const pieceBasedProducts = ['lira', 'half-lira', 'quarter-lira', 'ounce'];

  // التحقق من نوع المنتج
  const isPieceBasedProduct = pieceBasedProducts.includes(formData.productType);

  // دالة تنسيق الأرقام مع فواصل الآلاف
  const formatNumber = (number) => {
    if (number === null || number === undefined || number === '') return '';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // دالة إزالة فواصل الآلاف من النص
  const parseFormattedNumber = (formattedString) => {
    if (!formattedString) return 0;
    return parseFloat(formattedString.replace(/,/g, '')) || 0;
  };

  // دالة تنسيق الأرقام العشرية (للوزن)
  const formatDecimal = (number) => {
    if (number === null || number === undefined || number === '') return '';
    return parseFloat(number).toFixed(2);
  };

  // دالة إزالة التنسيق من الأرقام العشرية
  const parseFormattedDecimal = (formattedString) => {
    if (!formattedString) return 0;
    return parseFloat(formattedString) || 0;
  };

  // دالة تنسيق الأرقام مع فواصل الآلاف والفاصلة العشرية
  const formatDecimalWithCommas = (number) => {
    if (number === null || number === undefined || number === '') return '';
    const num = parseFloat(number);
    if (isNaN(num)) return '';
    
    // تقسيم الرقم إلى جزء صحيح وكسري
    const parts = num.toString().split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';
    
    // إضافة فواصل الآلاف للجزء الصحيح
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // إعادة تجميع مع الفاصلة العشرية
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  // دالة إزالة التنسيق من الأرقام مع فواصل الآلاف والفاصلة العشرية
  const parseFormattedDecimalWithCommas = (formattedString) => {
    if (!formattedString) return 0;
    return parseFloat(formattedString.replace(/,/g, '')) || 0;
  };

  // دالة للتحقق من صحة إدخال الأرقام مع الفواصل
  const isValidNumberInput = (value) => {
    // السماح بـ: أرقام، فواصل الآلاف، فاصلة عشرية واحدة، نقطة عشرية
    return value === '' || /^[\d,]*\.?\d*$/.test(value);
  };

  useEffect(() => {
    if (product) {
      // Debug: Log the product received for editing
      console.log('DEBUG useEffect setFormData from product:', product);
      setFormData({
        name: product.name || '',
        material: Object.keys(materialMap).find(key => materialMap[key] === product.material) || product.material || 'gold',
        productType: Object.keys(productTypeMap).find(key => productTypeMap[key] === product.productType) || product.productType || 'ring',
        description: product.description || '',
        carat: product.karat || product.carat || '18',
        weight: product.weight || 0,
        craftingFee: product.gramWage || product.craftingFee || 0,
        craftingFeeUSD: product.craftingFeeUSD || 0,
        pricePerGramUSD: (product.gramPrice && product.gramPrice.usd) || product.pricePerGramUSD || 0,
        pricePerGramSYP: (product.gramPrice && product.gramPrice.syp) || product.pricePerGramSYP || 0,
        totalPriceUSD: (product.totalPrice && product.totalPrice.usd) || product.totalPriceUSD || 0,
        totalPriceSYP: (product.totalPrice && product.totalPrice.syp) || product.totalPriceSYP || 0,
        images: product.images || [],
        isPinned: product.pinned || product.isPinned || false,
        sizes: product.ringSizes || product.sizes || [],
        setComponents: product.setAccessories || product.setComponents || [],
        diamonds: product.stones || product.diamonds || [],
      });
      if (product.stones || product.diamonds) {
        const stones = product.stones || product.diamonds || [];
        setDiamondData({
          stones: stones,
          totalStoneWeight: stones.reduce((sum, stone) => sum + (stone.weight || stone.totalWeight || 0), 0),
          totalStonePrice: stones.reduce((sum, stone) => sum + ((stone.totalPrice && (stone.totalPrice.usd || stone.totalPrice)) || 0), 0),
        });
      }
    }
  }, [product]);

  // Auto-calculation of total price based on product type
  useEffect(() => {
    const weight = parseFloat(formData.weight) || 0;
    const pricePerGramUSD = parseFloat(formData.pricePerGramUSD) || 0;
    const pricePerGramSYP = formData.pricePerGramSYP || 0;
    const craftingFeeUSD = parseFloat(formData.craftingFeeUSD) || 0;
    const craftingFeeSYP = formData.craftingFee || 0;
    const carat = parseFloat(formData.carat) || 0;

    let totalPriceUSD, totalPriceSYP;

    if (isPieceBasedProduct) {
      // للمنتجات القائمة على القطعة: (الوزن × سعر الغرام) + أجار القطعة
      totalPriceUSD = (weight * pricePerGramUSD) + craftingFeeUSD;
      totalPriceSYP = (weight * pricePerGramSYP) + craftingFeeSYP;
    } else {
      // للمنتجات العادية: (سعر الغرام + أجار الصياغة) × الوزن
      totalPriceUSD = (pricePerGramUSD + craftingFeeUSD) * weight;
      totalPriceSYP = (pricePerGramSYP + craftingFeeSYP) * weight;
    }

    setFormData(prev => ({
      ...prev,
      totalPriceUSD: Math.round(totalPriceUSD * 100) / 100, // Round to 2 decimal places
      totalPriceSYP: Math.round(totalPriceSYP * 100) / 100
    }));
  }, [formData.weight, formData.pricePerGramUSD, formData.pricePerGramSYP, formData.craftingFeeUSD, formData.craftingFee, formData.carat, isPieceBasedProduct]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Map frontend fields to backend schema
    let ringSizes = [];
    let setAccessories = [];
    const mappedType = productTypeMap[formData.productType] || formData.productType;
    if (mappedType === 'محبس' || mappedType === 'خاتم') {
      ringSizes = formData.sizes || [];
    } else if (mappedType === 'طقم') {
      setAccessories = formData.setComponents || [];
      if (setAccessories.includes('ring')) {
        ringSizes = formData.sizes || [];
      }
    }
    const productData = {
      id: product && (product.id || product._id) ? (product.id || product._id) : undefined,
      name: formData.name,
      material: materialMap[formData.material] || formData.material,
      stones: (formData.material === 'diamond' ? diamondData.stones : []).map(stone => ({
        type: stone.type,
        color: stone.color,
        count: stone.count,
        caratPrice: {
          usd: stone.caratPriceUSD || 0,
          syp: stone.caratPriceSYP || 0,
        },
        totalPrice: {
          usd: stone.totalPriceUSD || 0,
          syp: stone.totalPriceSYP || 0,
        },
        totalWeight: stone.weight || 0,
      })),
      productType: mappedType,
      ringSizes,
      setAccessories,
      description: formData.description,
      karat: formData.carat,
      weight: formData.weight,
      gramWage: formData.craftingFee,
      craftingFeeUSD: formData.craftingFeeUSD || 0,
      gramPrice: {
        usd: formData.pricePerGramUSD || 0,
        syp: formData.pricePerGramSYP || 0,
      },
      pricePerGramUSD: formData.pricePerGramUSD || 0,
      pricePerGramSYP: formData.pricePerGramSYP || 0,
      totalPrice: {
        usd: formData.totalPriceUSD || 0,
        syp: formData.totalPriceSYP || 0,
      },
      totalPriceUSD: formData.totalPriceUSD || 0,
      totalPriceSYP: formData.totalPriceSYP || 0,
      pinned: formData.isPinned,
      images: formData.images || [],
      sizes: formData.sizes || [],
      setComponents: formData.setComponents || [],
      diamonds: formData.diamonds || [],
      createdAt: product && product.createdAt ? product.createdAt : new Date(),
    };
    // Debug: Log productData and isFormData before submit
    console.log('DEBUG ProductForm handleSubmit:', { productData, isFormData: formData.images && formData.images.length > 0 });
    // If there are images, use FormData
    if (formData.images && formData.images.length > 0) {
      const form = new FormData();
      Object.keys(productData).forEach(key => {
        form.append(key, typeof productData[key] === 'object' ? JSON.stringify(productData[key]) : productData[key]);
      });
      formData.images.forEach(file => {
        form.append('images', file);
      });
      onSubmit(form, true); // pass true to indicate FormData
    } else {
      onSubmit(productData, false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images && prev.images.filter((_, i) => i !== index)
    }));
  };

  const productTypes = [
    { value: 'ring', label: 'خاتم' },
    { value: 'sized-ring', label: 'محبس' },
    { value: 'name', label: 'اسم' },
    { value: 'earring', label: 'حلق' },
    { value: 'bracelet', label: 'اسوارة' },
    { value: 'necklace', label: 'طوق' },
    { value: 'set', label: 'طقم' },
    { value: 'anklet', label: 'خلخال' },
    { value: 'lira', label: 'ليرة' },
    { value: 'half-lira', label: 'نصف ليرة' },
    { value: 'quarter-lira', label: 'ربع ليرة' },
    { value: 'ounce', label: 'أونصة' },
  ];

  const materialMap = {
    gold: 'ذهب',
    silver: 'فضة',
    diamond: 'ألماس',
  };

  const productTypeMap = {
    ring: 'خاتم',
    'sized-ring': 'محبس',
    necklace: 'طوق',
    name: 'اسم',
    earring: 'حلق',
    bracelet: 'اسوارة',
    set: 'طقم',
    anklet: 'خلخال',
    lira: 'ليرة',
    'half-lira': 'نصف ليرة',
    'quarter-lira': 'ربع ليرة',
    ounce: 'أونصة',
  };

  return (
    <div className="product-form-container">
      <div className="product-form-header">
        <h2 className="product-form-title">
          {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </h2>
        <button
          onClick={onCancel}
          className="product-form-close-button"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        {/* Basic Information */}
        <div className="form-basic-grid">
          <div className="form-field-group">
            <label className="form-field-label required">
              اسم المنتج
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="form-input"
            />
          </div>

          <div className="form-field-group">
            <label className="form-field-label required">
              مادة المنتج
            </label>
            <select
              required
              value={formData.material}
              onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
              className="form-select"
            >
              <option value="" disabled>اختيار مادة المنتج</option>
              <option value="gold">ذهب</option>
              <option value="silver">فضة</option>
              <option value="diamond">ألماس</option>
            </select>
          </div>
        </div>

        {/* Diamond Fields */}
        {formData.material === 'diamond' && (
          <DiamondFields
            data={diamondData}
            onChange={setDiamondData}
          />
        )}

        {/* Product Type */}
        <div className="form-field-group">
          <label className="form-field-label required">
            نوع المنتج
          </label>
          <select
            required
            value={formData.productType}
            onChange={(e) => {
              const newType = e.target.value;
              setFormData(prev => ({
                ...prev,
                productType: newType,
                sizes: newType === 'sized-ring' ? prev.sizes : [], // clear sizes if not sized-ring
              }));
            }}
            className="form-select"
          >
            <option value="" disabled>اختيار نوع المنتج</option>
            {productTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Product Type Specific Fields */}
        {formData.productType === 'set' ? (
          <ProductTypeFields
            productType={formData.productType}
            sizes={formData.sizes || []}
            setComponents={formData.setComponents || []}
            onSizesChange={(sizes) => setFormData(prev => ({ ...prev, sizes }))}
            onSetComponentsChange={(components) => setFormData(prev => ({ ...prev, setComponents: components }))}
          />
        ) : (
          // Show ringSizes field for certain product types
          (formData.productType === 'sized-ring' ||
            formData.productType === 'ring' ||
            (formData.productType === 'set' && formData.setComponents && formData.setComponents.includes('ring'))
          ) && (
            <div className="form-field-group">
              <label className="form-field-label">
                قياسات الخواتم (افصل بين المقاسات بنقطة)
              </label>
              <input
                type="text"
                value={formData.sizes ? formData.sizes.join('.') : ''}
                onChange={e => {
                  const sizes = e.target.value.split('.').map(s => s.trim()).filter(Boolean);
                  setFormData(prev => ({ ...prev, sizes }));
                }}
                placeholder="مثال: 6.7.8.9"
                className="form-input"
              />
            </div>
          )
        )}

        {/* Description */}
        <div className="form-field-group">
          <label className="form-field-label">
            وصف المنتج
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="form-textarea"
          />
        </div>

        {/* Carat and Weight */}
        <div className="form-advanced-grid">
          <div className="form-field-group">
            <label className="form-field-label required">
              العيار
            </label>
            <select
              required
              value={formData.carat}
              onChange={(e) => setFormData(prev => ({ ...prev, carat: e.target.value }))}
              className="form-select"
            >
              <option value="" disabled>اختيار العيار</option>
              <option value="18">18</option>
              <option value="21">21</option>
              <option value="22">22</option>
              <option value="24">24</option>
              <option value="925">925 (فضة)</option>
            </select>
          </div>

          <div className="form-field-group">
            <label className="form-field-label required">
              الوزن (غرام)
            </label>
            <input
              type="text"
              required
              value={formData.weight || ''}
              onChange={(e) => {
                const value = e.target.value;
                // السماح بإدخال الأرقام والفاصلة العشرية والنقطة
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setFormData(prev => ({ ...prev, weight: value }));
                }
              }}
              onBlur={(e) => {
                // تحويل إلى رقم عند الخروج من الحقل
                const value = parseFloat(e.target.value) || 0;
                setFormData(prev => ({ ...prev, weight: value }));
              }}
              className="form-input"
              placeholder="0.00"
              inputMode="decimal"
            />
          </div>

          <div className="form-field-group">
            <label className="form-field-label">
              {isPieceBasedProduct ? 'أجار القطعة (SYP)' : 'أجار الغرام (الصياغة - SYP)'}
            </label>
            <input
              type="text"
              value={formatNumber(formData.craftingFee || 0)}
              onChange={(e) => setFormData(prev => ({ ...prev, craftingFee: parseFormattedNumber(e.target.value) }))}
              className="form-input"
              placeholder="0"
              inputMode="numeric"
            />
          </div>

          <div className="form-field-group">
            <label className="form-field-label">
              {isPieceBasedProduct ? 'أجار القطعة (USD)' : 'أجار الغرام (الصياغة - USD)'}
            </label>
                          <input
                type="text"
                value={formData.craftingFeeUSD || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // السماح بإدخال الأرقام والفاصلة العشرية والنقطة والفواصل
                  if (isValidNumberInput(value)) {
                    setFormData(prev => ({ ...prev, craftingFeeUSD: value }));
                  }
                }}
                onBlur={(e) => {
                  // تحويل إلى رقم عند الخروج من الحقل وتنسيقه
                  const value = parseFormattedDecimalWithCommas(e.target.value);
                  setFormData(prev => ({ ...prev, craftingFeeUSD: value }));
                }}
                onFocus={(e) => {
                  // عند التركيز، عرض القيمة بدون تنسيق للتحرير
                  const value = e.target.value.replace(/,/g, '');
                  setFormData(prev => ({ ...prev, craftingFeeUSD: value }));
                }}
                className="form-input"
                placeholder="0.00"
                inputMode="decimal"
              />
          </div>
        </div>

        {/* Pricing - Show for all products */}
        <div className="form-pricing-grid">
          <div className="form-field-group">
            <label className="form-field-label required">سعر الغرام (USD)</label>
            <input
              type="text"
              required
              value={formData.pricePerGramUSD || ''}
              onChange={(e) => {
                const value = e.target.value;
                // السماح بإدخال الأرقام والفاصلة العشرية والنقطة والفواصل
                if (isValidNumberInput(value)) {
                  setFormData(prev => ({ ...prev, pricePerGramUSD: value }));
                }
              }}
              onBlur={(e) => {
                // تحويل إلى رقم عند الخروج من الحقل وتنسيقه
                const value = parseFormattedDecimalWithCommas(e.target.value);
                setFormData(prev => ({ ...prev, pricePerGramUSD: value }));
              }}
              onFocus={(e) => {
                // عند التركيز، عرض القيمة بدون تنسيق للتحرير
                const value = e.target.value.replace(/,/g, '');
                setFormData(prev => ({ ...prev, pricePerGramUSD: value }));
              }}
              className="form-input"
              placeholder="0.00"
              inputMode="decimal"
            />
          </div>
          <div className="form-field-group">
            <label className="form-field-label required">سعر الغرام (SYP)</label>
            <input
              type="text"
              required
              value={formatNumber(formData.pricePerGramSYP)}
              onChange={(e) => setFormData(prev => ({ ...prev, pricePerGramSYP: parseFormattedNumber(e.target.value) }))}
              className="form-input"
              placeholder="0"
              inputMode="numeric"
            />
          </div>
        </div>
          
        <div className="form-field-group">
          <label className="form-field-label">السعر الكلي (محسوب تلقائياً)</label>
          <div className="calculation-section">
            <div className="form-field-group">
              <label className="calculation-title">السعر الكلي (USD)</label>
              <input
                type="text"
                value={formData.totalPriceUSD || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // السماح بإدخال الأرقام والفاصلة العشرية والنقطة والفواصل
                  if (isValidNumberInput(value)) {
                    setFormData(prev => ({ ...prev, totalPriceUSD: value }));
                  }
                }}
                onBlur={(e) => {
                  // تحويل إلى رقم عند الخروج من الحقل وتنسيقه
                  const value = parseFormattedDecimalWithCommas(e.target.value);
                  setFormData(prev => ({ ...prev, totalPriceUSD: value }));
                }}
                onFocus={(e) => {
                  // عند التركيز، عرض القيمة بدون تنسيق للتحرير
                  const value = e.target.value.replace(/,/g, '');
                  setFormData(prev => ({ ...prev, totalPriceUSD: value }));
                }}
                className="form-input"
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>
            <div className="form-field-group">
              <label className="calculation-title">السعر الكلي (SYP)</label>
              <input
                type="text"
                value={formatNumber(formData.totalPriceSYP)}
                onChange={(e) => setFormData(prev => ({ ...prev, totalPriceSYP: parseFormattedNumber(e.target.value) }))}
                className="form-input"
                readOnly
              />
            </div>
            
        
          </div>
        </div>

        {/* Image Upload */}
        <div className="image-upload-section">
          <label className="form-field-label">
            صور المنتج
          </label>
          <div className="image-upload-area">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="image-upload-content"
            >
              <Upload className="image-upload-icon" />
              <span className="image-upload-text">انقر لاختيار الصور</span>
            </label>
          </div>
          {formData.images && formData.images.length > 0 && (
            <div className="image-gallery">
              {formData.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img
                    src={
                      image instanceof File
                        ? URL.createObjectURL(image)
                        : (image.url || image)
                    }
                    alt={`Product ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="image-remove-button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pin Option */}
        <div className="pin-option">
          <input
            type="checkbox"
            id="pin-product"
            checked={formData.isPinned}
            onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
            className="pin-checkbox"
          />
          <label htmlFor="pin-product" className="pin-label">
            تثبيت المنتج في بداية الموقع
          </label>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="form-button cancel"
          >
            <X className="h-5 w-5" />
            <span>إلغاء</span>
          </button>
          <button
            type="submit"
            className="form-button submit"
          >
            <Save className="h-5 w-5" />
            <span>{product ? 'تحديث المنتج' : 'إضافة المنتج'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 