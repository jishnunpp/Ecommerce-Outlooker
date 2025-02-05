const mongoose = require ('mongoose');


const catogorySchema = new mongoose.Schema({
     
    catogoryname:{
          type:String,
          required:true
      },
    
   
  });
  module.exports = mongoose.model('catogory',catogorySchema)
