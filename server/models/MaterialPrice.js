const mongoose = require('mongoose');

/**
 * Material Price Schema
 * 
 * Defines the structure for material pricing information
 */

const MaterialPriceSchema = new mongoose.Schema({
  material: { 
    type: String, 
    enum: ['ذهب', 'فضة', 'ألماس'], 
    required: true,
    unique: true 
  },
  // Base prices (21k for gold, single price for silver/diamond)
  pricePerGram: {
    usd: { 
      type: Number, 
      required: true, 
      default: 0,
      min: 0
    },
    syp: { 
      type: Number, 
      required: true, 
      default: 0,
      min: 0
    }
  },
  // Gold karat-specific prices
  goldKaratPrices: {
    '18': {
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
    '21': {
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
    '24': {
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
    }
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('MaterialPrice', MaterialPriceSchema); 