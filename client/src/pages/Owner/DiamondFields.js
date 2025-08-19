import React, { useState } from 'react';
import { Plus, X, Diamond } from 'lucide-react';
import './styles/DiamondFields.css';

const DiamondFields = ({ data, onChange }) => {
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
  const [showAddStone, setShowAddStone] = useState(false);
  const [newStone, setNewStone] = useState({
    type: 'FL',
    color: 'D',
    count: 1,
    caratPriceUSD: 0,
    caratPriceSYP: 0,
    totalPriceUSD: 0,
    totalPriceSYP: 0,
    weight: 0,
  });

  const stoneTypes = [
    'FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'
  ];

  const stoneColors = [
    'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
  ];

  const addStone = () => {
    const stone = {
      id: Date.now().toString(),
      type: newStone.type,
      color: newStone.color,
      count: newStone.count,
      caratPriceUSD: newStone.caratPriceUSD,
      caratPriceSYP: newStone.caratPriceSYP,
      totalPriceUSD: newStone.totalPriceUSD !== undefined && newStone.totalPriceUSD !== null
        ? newStone.totalPriceUSD
        : newStone.count * newStone.caratPriceUSD,
      totalPriceSYP: newStone.totalPriceSYP !== undefined && newStone.totalPriceSYP !== null
        ? newStone.totalPriceSYP
        : newStone.count * newStone.caratPriceSYP,
      weight: newStone.weight,
    };

    const updatedStones = [...data.stones, stone];
    const updatedData = {
      stones: updatedStones,
      totalStoneWeight: updatedStones.reduce((sum, s) => sum + s.weight, 0),
      totalStonePrice: updatedStones.reduce((sum, s) => sum + s.totalPrice, 0),
    };

    onChange(updatedData);
    setNewStone({
      type: 'FL',
      color: 'D',
      count: 1,
      caratPriceUSD: 0,
      caratPriceSYP: 0,
      totalPriceUSD: 0,
      totalPriceSYP: 0,
      weight: 0,
    });
    setShowAddStone(false);
  };

  const removeStone = (id) => {
    const updatedStones = data.stones.filter(stone => stone.id !== id);
    const updatedData = {
      stones: updatedStones,
      totalStoneWeight: updatedStones.reduce((sum, s) => sum + s.weight, 0),
      totalStonePrice: updatedStones.reduce((sum, s) => sum + s.totalPrice, 0),
    };
    onChange(updatedData);
  };

  const updateStone = (id, field, value) => {
    const updatedStones = data.stones.map(stone => {
      if (stone.id === id) {
        const updatedStone = { ...stone, [field]: value };
        if (field === 'totalPriceUSD' || field === 'totalPriceSYP') {
          // Use the manually entered value
        } else if (field === 'count' || field === 'caratPriceUSD') {
          updatedStone.totalPriceUSD = updatedStone.totalPriceUSD !== undefined && updatedStone.totalPriceUSD !== null
            ? updatedStone.totalPriceUSD
            : updatedStone.count * updatedStone.caratPriceUSD;
        } else if (field === 'count' || field === 'caratPriceSYP') {
          updatedStone.totalPriceSYP = updatedStone.totalPriceSYP !== undefined && updatedStone.totalPriceSYP !== null
            ? updatedStone.totalPriceSYP
            : updatedStone.count * updatedStone.caratPriceSYP;
        }
        return updatedStone;
      }
      return stone;
    });

    const updatedData = {
      stones: updatedStones,
      totalStoneWeight: updatedStones.reduce((sum, s) => sum + s.weight, 0),
      totalStonePrice: updatedStones.reduce((sum, s) => sum + s.totalPrice, 0),
    };
    onChange(updatedData);
  };

  return (
    <div className="diamond-fields-container">
      <div className="diamond-fields-header">
        <div className="diamond-fields-icon">
          <Diamond className="h-5 w-5 text-black" />
        </div>
        <h3 className="diamond-fields-title">تفاصيل الأحجار الكريمة</h3>
      </div>

      {/* Existing Stones */}
      {data.stones.map((stone) => (
        <div key={stone.id} className="stone-card">
          <div className="stone-card-header">
            <h4 className="stone-card-title">
              حجر {stone.type} - {stone.color}
            </h4>
            <button
              onClick={() => removeStone(stone.id)}
              className="stone-remove-button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="stone-fields-grid">
            <div className="stone-field">
              <label className="stone-field-label">
                نوع الحجر
              </label>
              <select
                value={stone.type}
                onChange={(e) => updateStone(stone.id, 'type', e.target.value)}
                className="stone-field-select"
              >
                {stoneTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="stone-field">
              <label className="stone-field-label">
                لون الحجر
              </label>
              <select
                value={stone.color}
                onChange={(e) => updateStone(stone.id, 'color', e.target.value)}
                className="stone-field-select"
              >
                {stoneColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div className="stone-field">
              <label className="stone-field-label">
                العدد
              </label>
              <input
                type="text"
                value={formatNumber(stone.count)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[\d,]*$/.test(value)) {
                    updateStone(stone.id, 'count', parseFormattedNumber(value));
                  }
                }}
                className="stone-field-input"
                placeholder="0"
                inputMode="numeric"
              />
            </div>

            <div className="stone-field">
              <label className="stone-field-label">
                سعر القيراط (USD)
              </label>
              <input
                type="text"
                value={stone.caratPriceUSD || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isValidNumberInput(value)) {
                    updateStone(stone.id, 'caratPriceUSD', value);
                  }
                }}
                onBlur={(e) => {
                  const value = parseFormattedDecimalWithCommas(e.target.value);
                  updateStone(stone.id, 'caratPriceUSD', value);
                }}
                onFocus={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  updateStone(stone.id, 'caratPriceUSD', value);
                }}
                className="stone-field-input"
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>

            <div className="stone-field">
              <label className="stone-field-label">
                سعر القيراط (SYP)
              </label>
              <input
                type="text"
                value={formatNumber(stone.caratPriceSYP)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[\d,]*$/.test(value)) {
                    updateStone(stone.id, 'caratPriceSYP', parseFormattedNumber(value));
                  }
                }}
                className="stone-field-input"
                placeholder="0"
                inputMode="numeric"
              />
            </div>

            <div className="stone-field">
              <label className="stone-field-label">
                الوزن (قيراط)
              </label>
              <input
                type="text"
                value={stone.weight || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    updateStone(stone.id, 'weight', value);
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updateStone(stone.id, 'weight', value);
                }}
                className="stone-field-input"
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>

            <div className="stone-field">
              <label className="stone-field-label">
                السعر الكلي (USD)
              </label>
              <input
                type="text"
                value={stone.totalPriceUSD || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isValidNumberInput(value)) {
                    updateStone(stone.id, 'totalPriceUSD', value);
                  }
                }}
                onBlur={(e) => {
                  const value = parseFormattedDecimalWithCommas(e.target.value);
                  updateStone(stone.id, 'totalPriceUSD', value);
                }}
                onFocus={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  updateStone(stone.id, 'totalPriceUSD', value);
                }}
                className="stone-field-input"
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>
            <div className="stone-field">
              <label className="stone-field-label">
                السعر الكلي (SYP)
              </label>
              <input
                type="text"
                value={formatNumber(stone.totalPriceSYP)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[\d,]*$/.test(value)) {
                    updateStone(stone.id, 'totalPriceSYP', parseFormattedNumber(value));
                  }
                }}
                className="stone-field-input"
                placeholder="0"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add New Stone */}
      {showAddStone && (
        <div className="add-stone-card">
          <h4 className="add-stone-title">إضافة حجر جديد</h4>
          
          <div className="stone-fields-grid">
            <div className="stone-field">
              <label className="stone-field-label">
                نوع الحجر
              </label>
              <select
                value={newStone.type}
                onChange={(e) => setNewStone(prev => ({ ...prev, type: e.target.value }))}
                className="stone-field-select"
              >
                {stoneTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="stone-field">
              <label className="stone-field-label">
                لون الحجر
              </label>
              <select
                value={newStone.color}
                onChange={(e) => setNewStone(prev => ({ ...prev, color: e.target.value }))}
                className="stone-field-select"
              >
                {stoneColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div className="stone-field">
              <label className="stone-field-label">
                العدد
              </label>
              <input
                type="text"
                value={formatNumber(newStone.count)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[\d,]*$/.test(value)) {
                    setNewStone(prev => ({ ...prev, count: parseFormattedNumber(value) }));
                  }
                }}
                className="stone-field-input"
                placeholder="0"
                inputMode="numeric"
              />
            </div>

            <div className="stone-field">
              <label className="stone-field-label">سعر القيراط (USD)</label>
              <input
                type="text"
                value={newStone.caratPriceUSD || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isValidNumberInput(value)) {
                    setNewStone(prev => ({ ...prev, caratPriceUSD: value }));
                  }
                }}
                onBlur={(e) => {
                  const value = parseFormattedDecimalWithCommas(e.target.value);
                  setNewStone(prev => ({ ...prev, caratPriceUSD: value }));
                }}
                onFocus={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  setNewStone(prev => ({ ...prev, caratPriceUSD: value }));
                }}
                className="stone-field-input"
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>
            <div className="stone-field">
              <label className="stone-field-label">سعر القيراط (SYP)</label>
              <input
                type="text"
                value={formatNumber(newStone.caratPriceSYP)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[\d,]*$/.test(value)) {
                    setNewStone(prev => ({ ...prev, caratPriceSYP: parseFormattedNumber(value) }));
                  }
                }}
                className="stone-field-input"
                placeholder="0"
                inputMode="numeric"
              />
            </div>

            <div className="stone-field">
              <label className="stone-field-label">
                الوزن (قيراط)
              </label>
              <input
                type="text"
                value={newStone.weight || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setNewStone(prev => ({ ...prev, weight: value }));
                  }
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setNewStone(prev => ({ ...prev, weight: value }));
                }}
                className="stone-field-input"
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>

            <div className="stone-field">
              <label className="stone-field-label">
                السعر الكلي (USD)
              </label>
              <input
                type="text"
                value={newStone.totalPriceUSD || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isValidNumberInput(value)) {
                    setNewStone(prev => ({ ...prev, totalPriceUSD: value }));
                  }
                }}
                onBlur={(e) => {
                  const value = parseFormattedDecimalWithCommas(e.target.value);
                  setNewStone(prev => ({ ...prev, totalPriceUSD: value }));
                }}
                onFocus={(e) => {
                  const value = e.target.value.replace(/,/g, '');
                  setNewStone(prev => ({ ...prev, totalPriceUSD: value }));
                }}
                className="stone-field-input"
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>
            <div className="stone-field">
              <label className="stone-field-label">
                السعر الكلي (SYP)
              </label>
              <input
                type="text"
                value={formatNumber(newStone.totalPriceSYP)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^[\d,]*$/.test(value)) {
                    setNewStone(prev => ({ ...prev, totalPriceSYP: parseFormattedNumber(value) }));
                  }
                }}
                className="stone-field-input"
                placeholder="0"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="stone-actions">
            <button
              onClick={() => setShowAddStone(false)}
              className="stone-button cancel"
            >
              إلغاء
            </button>
            <button
              onClick={addStone}
              className="stone-button add"
            >
              إضافة الحجر
            </button>
          </div>
        </div>
      )}

      {/* Add Stone Button */}
      <button
        onClick={() => setShowAddStone(true)}
        className="add-stone-button"
      >
        <Plus className="h-5 w-5" />
        <span>إضافة حجر جديد</span>
      </button>

      {/* Summary */}
      {data.stones.length > 0 && (
        <div className="stones-summary">
          <h4 className="stones-summary-title">ملخص الأحجار</h4>
          <div className="stones-summary-grid">
            <div className="stones-summary-item">
              <span className="stones-summary-label">العدد الكلي:</span>
              <span className="stones-summary-value">
                {data.stones.reduce((sum, stone) => sum + (stone.count || 0), 0)}
              </span>
            </div>
            <div className="stones-summary-item">
              <span className="stones-summary-label">الوزن الكلي:</span>
              <span className="stones-summary-value">
                {data.stones.reduce((sum, stone) => sum + (stone.weight || 0), 0).toFixed(2)} قيراط
              </span>
            </div>
            <div className="stones-summary-item">
              <span className="stones-summary-label">السعر الكلي:</span>
              <div className="stones-summary-price">
                <span className="price-badge usd">
                  {data.stones.reduce((sum, stone) => sum + (stone.totalPriceUSD || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </span>
                <span className="price-badge syp">
                  {data.stones.reduce((sum, stone) => sum + (stone.totalPriceSYP || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SYP
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiamondFields; 