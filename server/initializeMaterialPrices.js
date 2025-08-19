const mongoose = require('mongoose');
const MaterialPrice = require('./models/MaterialPrice');
require('dotenv').config();

// Default material prices (you can modify these)
const defaultPrices = [
  {
    material: 'ذهب',
    pricePerGram: {
      usd: 65.50, // Example gold price per gram in USD (عيار 21)
      syp: 85000  // Example gold price per gram in SYP (عيار 21)
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
      usd: 0.85,  // Example silver price per gram in USD
      syp: 1100   // Example silver price per gram in SYP
    }
  },
  {
    material: 'ألماس',
    pricePerGram: {
      usd: 5000,  // Example diamond price per gram in USD
      syp: 6500000 // Example diamond price per gram in SYP
    }
  }
];

async function initializeMaterialPrices() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connected to MongoDB');

    for (const priceData of defaultPrices) {
      const existing = await MaterialPrice.findOne({ material: priceData.material });
      
      if (!existing) {
        const materialPrice = new MaterialPrice(priceData);
        await materialPrice.save();
        console.log(`✅ Created price for ${priceData.material}`);
        
        if (priceData.material === 'ذهب') {
          console.log(`   عيار 18: USD ${priceData.goldKaratPrices['18'].usd}, SYP ${priceData.goldKaratPrices['18'].syp}`);
          console.log(`   عيار 21: USD ${priceData.goldKaratPrices['21'].usd}, SYP ${priceData.goldKaratPrices['21'].syp}`);
          console.log(`   عيار 24: USD ${priceData.goldKaratPrices['24'].usd}, SYP ${priceData.goldKaratPrices['24'].syp}`);
        }
      } else {
        console.log(`⚠️  Price for ${priceData.material} already exists`);
      }
    }

    console.log('✅ Material prices initialization completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error initializing material prices:', err);
    process.exit(1);
  }
}

initializeMaterialPrices(); 