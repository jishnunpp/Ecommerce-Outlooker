const mongoose = require('mongoose');



const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    catogory: { type: String, required: true },
    price: { type: Number, required: true },
    
    offer: { type: Number, required: true },
    rating: { type: Number, required: true },
    review: { type: Number, required: true },
    stock: { type: Number, required: true },
    size: { type: String, required: true },
    meterial: { type: String, required: true },
    images: { type: [String], required: true },
});

module.exports = mongoose.model('Product', productSchema);
