const mongoose = require('mongoose');
const MaterialPrice = require('./models/MaterialPrice');
require('dotenv').config();

/**
 * Material Prices Initialization Script
 * 
 * Sets up default material prices for the jewelry store system.
 * Run this script once to initialize the pricing structure.
 */

// Default material prices configuration
const defaultPrices = [
  {
    material: 'ذهب',
    pricePerGram: {
      usd: 65.50, // Gold price per gram in USD (21k)
      syp: 85000  // Gold price per gram in SYP (21k)
    },
    goldKaratPrices: {
      '18': {
        usd: 56.14, // (65.50 * 18) / 21
        syp: 72857  // (85000 * 18) / 21
      },
      '21': {
        usd: 65.50,
        syp: 85000
      },
      '24': {
        usd: 74.86, // (65.50 * 24) / 21
        syp: 97143  // (85000 * 24) / 21
      }
    }
  },
  {
    material: 'فضة',
    pricePerGram: {
      usd: 0.85,  // Silver price per gram in USD
      syp: 1100   // Silver price per gram in SYP
    }
  },
  {
    material: 'ألماس',
    pricePerGram: {
      usd: 5000,  // Diamond price per gram in USD
      syp: 6500000 // Diamond price per gram in SYP
    }
  }
];

/**
 * Initialize material prices in database
 */
async function initializeMaterialPrices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    // Initialize each material price
    for (const priceData of defaultPrices) {
      const existing = await MaterialPrice.findOne({ material: priceData.material });
      
      if (!existing) {
        const materialPrice = new MaterialPrice(priceData);
        await materialPrice.save();
        // Display gold karat prices
        if (priceData.material === 'ذهب') {
          }
      } else {
        }
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Run the initialization
initializeMaterialPrices(); 