const mongoose = require('mongoose');

/**
 * Stone Schema
 * 
 * Defines the structure for gemstone information
 */
const StoneSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    trim: true
  },
  color: { 
    type: String, 
    required: true,
    trim: true
  },
  count: { 
    type: Number, 
    required: true,
    min: 1
  },
  caratPrice: {
    usd: { 
      type: Number, 
      default: 0,
      min: 0
    },
    syp: { 
      type: Number, 
      default: 0,
      min: 0
    }
  },
  totalPrice: {
    usd: { 
      type: Number, 
      default: 0,
      min: 0
    },
    syp: { 
      type: Number, 
      default: 0,
      min: 0
    }
  },
  totalWeight: { 
    type: Number, 
    default: 0,
    min: 0
  }
});

/**
 * Product Schema
 * 
 * Defines the structure for jewelry products
 */
const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  material: { 
    type: String, 
    enum: ['ذهب', 'فضة', 'ألماس'], 
    required: true 
  },
  stones: [StoneSchema],
  productType: { 
    type: String, 
    enum: ['خاتم','محبس','اسم','حلق','اسوارة','طوق','طقم','خلخال','ليرة','نصف ليرة','ربع ليرة','أونصة'], 
    required: true 
  },
  ringSizes: [{ 
    type: String,
    trim: true
  }],
  setAccessories: [{ 
    type: String,
    trim: true
  }],
  sizes: [{ 
    type: String,
    trim: true
  }],
  setComponents: [{ 
    type: String,
    trim: true
  }],
  diamonds: [StoneSchema],
  description: { 
    type: String,
    trim: true,
    maxlength: 1000
  },
  karat: { 
    type: String, 
    enum: ['18','21','22','24','925'], 
    required: true 
  },
  weight: { 
    type: Number, 
    required: true,
    min: 0
  },
  gramWage: { 
    type: Number,
    min: 0
  },
  craftingFeeUSD: { 
    type: Number, 
    default: 0,
    min: 0
  },
  gramPrice: {
    usd: { 
      type: Number, 
      default: 0,
      min: 0
    },
    syp: { 
      type: Number, 
      default: 0,
      min: 0
    }
  },
  totalPrice: {
    usd: { 
      type: Number, 
      default: 0,
      min: 0
    },
    syp: { 
      type: Number, 
      default: 0,
      min: 0
    }
  },
  images: [{
    url: { 
      type: String, 
      required: true 
    },
    public_id: { 
      type: String,
      required: false 
    }
  }],
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  pinned: { 
    type: Boolean, 
    default: false 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Product', ProductSchema); 