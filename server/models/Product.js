const mongoose = require('mongoose');

const StoneSchema = new mongoose.Schema({
  type: { type: String, required: true }, // نوع الحجر
  color: { type: String, required: true }, // لون الحجر
  count: { type: Number, required: true }, // العدد الكلي للاحجار
  caratPrice: {
    usd: { type: Number, default: 0 },
    syp: { type: Number, default: 0 }
  }, // سعر القيراط
  totalPrice: {
    usd: { type: Number, default: 0 },
    syp: { type: Number, default: 0 }
  }, // السعر الكلي للاحجار
  totalWeight: { type: Number, default: 0 } // الوزن الكلي للاحجار
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true }, // اسم المنتج
  material: { type: String, enum: ['ذهب', 'فضة', 'ألماس'], required: true }, // مادة المنتج
  stones: [StoneSchema], // تفاصيل الاحجار
  productType: { type: String, enum: ['خاتم','محبس','اسم','حلق','اسوارة','طوق','طقم','خلخال','ليرة','نصف ليرة','ربع ليرة','أونصة'], required: true },
  ringSizes: [{ type: String ,required: false}], // قياسات المحبس
  setAccessories: [{ type: String }], // ملحقات الطقم
  description: { type: String }, // وصف المنتج
  karat: { type: String, enum: ['18','21','22','24','925'], required: true }, // العيار
  weight: { type: Number, required: true }, // الوزن
  gramWage: { type: Number }, // اجار الغرام (اختياري)
  craftingFeeUSD: { type: Number, default: 0 }, // اجار الغرام بالدولار
  gramPrice: {
    usd: { type: Number, default: 0 },
    syp: { type: Number, default: 0 }
  }, // سعر الغرام
  totalPrice: {
    usd: { type: Number, default: 0 },
    syp: { type: Number, default: 0 }
  }, // السعر الكلي للقطعة
  images: [{ type: String }], // روابط الصور
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // المستخدمون الذين أعجبوا بالمنتج
  pinned: { type: Boolean, default: false }, // مثبت
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // صاحب المنتج
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema); 