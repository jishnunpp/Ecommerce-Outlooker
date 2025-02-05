const mongoose = require('mongoose');



const bannerSchema = new mongoose.Schema({
    
    bannername: { type: String, required: true },
    description: { type: String, required: true },
    offer: { type: String, required: true },
    link: { type: String, required: true },
    
    image: { type: String, required: true },
});

module.exports = mongoose.model('Banner',bannerSchema);