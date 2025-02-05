const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order: 
    {
   
      userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users' },
      name: { type: String },
      housename: { type: String },
      streetaddress: { type: String },
      towncity: { type: String },
      pincode: { type: Number },
      phone: { type: Number },
      coupon: { type: String },
      amount: { type: Number },
      payment: { type: String },
      status: { type: String },
      createdAt: { type: Date, default: Date.now },
      productDetails: { type: Object },
      razorpayOrderId:{ type: String },
      discount:{ type: Number },
    },
  
});

module.exports = mongoose.model('orders', orderSchema);
