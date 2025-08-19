import React, { useState } from 'react';
import { Plus, X, Edit3 } from 'lucide-react';

const ProductTypeFields = ({
  productType,
  sizes,
  setComponents,
  onSizesChange,
  onSetComponentsChange,
}) => {
  const [showAddSize, setShowAddSize] = useState(false);
  const [newSize, setNewSize] = useState('');
  const [editingSize, setEditingSize] = useState(null);

  const availableSetComponents = [
    { value: 'ring', label: 'خاتم' },
    { value: 'bracelet', label: 'اسوارة' },
    { value: 'earring', label: 'حلق' },
    { value: 'necklace', label: 'طوق' }, // Added necklace
  ];

  const addSize = () => {
    if (newSize.trim()) {
      onSizesChange([...sizes, newSize.trim()]);
      setNewSize('');
      setShowAddSize(false);
    }
  };

  const removeSize = (index) => {
    onSizesChange(sizes.filter((_, i) => i !== index));
  };

  const updateSize = (index, value) => {
    const updatedSizes = sizes.map((size, i) => i === index ? value : size);
    onSizesChange(updatedSizes);
    setEditingSize(null);
  };

  const toggleSetComponent = (component) => {
    const isSelected = setComponents.includes(component);
    if (isSelected) {
      onSetComponentsChange(setComponents.filter(c => c !== component));
    } else {
      onSetComponentsChange([...setComponents, component]);
    }
  };

  // Show size input for both 'ring' and 'sized-ring'
  if (productType === 'ring' || productType === 'sized-ring') {
    return (
      <div className="product-type-fields-container">
        <div className="product-type-header">
          <Edit3 className="product-type-icon" />
          <h3 className="product-type-title">مقاسات الخاتم / المحبس</h3>
        </div>
        
        {/* Existing Sizes */}
        <div className="ring-sizes-section">
          <div className="ring-sizes-grid">
            {sizes.map((size, index) => (
              <div key={index} className="ring-size-item">
                {editingSize?.index === index ? (
                  <div className="flex items-center space-x-reverse space-x-2 w-full">
                    <input
                      type="text"
                      value={editingSize.value}
                      onChange={(e) => setEditingSize({ index, value: e.target.value })}
                      className="ring-size-edit"
                      onBlur={() => updateSize(index, editingSize.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateSize(index, editingSize.value);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <span
                      className="ring-size-text"
                      onClick={() => setEditingSize({ index, value: size })}
                    >
                      {size}
                    </span>
                    <button
                      onClick={() => removeSize(index)}
                      className="ring-size-remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Add Size */}
        {showAddSize && (
          <div className="add-size-section">
            <div className="flex items-center space-x-reverse space-x-2">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="أدخل المقاس الجديد"
                className="add-size-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSize();
                  }
                }}
              />
              <button
                onClick={addSize}
                className="add-size-button"
              >
                إضافة
              </button>
              <button
                onClick={() => {
                  setShowAddSize(false);
                  setNewSize('');
                }}
                className="cancel-size-button"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setShowAddSize(true)}
          className="add-new-size-button"
        >
          <Plus className="h-5 w-5" />
          <span>إضافة مقاس جديد</span>
        </button>
      </div>
    );
  }

  // For 'set', if 'ring' is selected as a set component, show size input for the ring
  if (productType === 'set') {
    return (
      <div className="product-type-fields-container">
        <div className="product-type-header">
          <Edit3 className="product-type-icon" />
          <h3 className="product-type-title">مكونات الطقم</h3>
        </div>
        
        <div className="set-components-section">
          <div className="set-components-grid">
            {availableSetComponents.map((component) => (
              <div key={component.value} className="set-component-item">
                <input
                  type="checkbox"
                  id={`component-${component.value}`}
                  checked={setComponents.includes(component.value)}
                  onChange={() => toggleSetComponent(component.value)}
                  className="set-component-checkbox"
                />
                <label
                  htmlFor={`component-${component.value}`}
                  className="set-component-label"
                >
                  {component.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Show ringSizes input if ring is checked */}
        {setComponents.includes('ring') && (
          <div className="ring-sizes-section">
            <label className="form-field-label">
              قياسات الخواتم (افصل بين المقاسات بنقطة)
            </label>
            <input
              type="text"
              value={sizes ? sizes.join('.') : ''}
              onChange={e => {
                const newSizes = e.target.value.split('.').map(s => s.trim()).filter(Boolean);
                onSizesChange(newSizes);
              }}
              placeholder="مثال: 6.7.8.9"
              className="form-input"
            />
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ProductTypeFields; 