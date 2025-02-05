const mongoose = require('mongoose');



const coupenSchema = new mongoose.Schema({
    
    coupename: { type: String, required: true },
    startdate: {  type: Date,  required: true },
    enddate: {  type: Date,  required: true },
    offerprice: { type:Number, required: true },
    
    minprice: { type:Number, required: true },
});

module.exports = mongoose.model('Coupen',coupenSchema);