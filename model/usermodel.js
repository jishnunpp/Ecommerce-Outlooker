 const mongoose = require ('mongoose');
const { wishlist } = require('../controller/usercontroler');


 const userSchema = new mongoose.Schema({
    name:{
        type:String,
        //  required:true,
    },
     email:{
         type:String,
        //  required:true,
        //  unique:true,
     },
    phone:{
         type:String,
         required:false,
         unique:false,
         sparse:true,
         default:null,
     },
     googleid:{
         type:String,
         required:false,
         unique:true,
   },  
   password:{
         type:String,
         required:false
     },
     isBlocked: {
        type: Boolean,
        default: false 
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wishlist', 
    }],
    cart: [
        {
         _id:false,
          item: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
          quantity: { type: Number, required: true, default: 1 },
          amount:{type: Number, required: true,}
        },
        
      ],
    address: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, 
          name: { type: String},
          housename: { type: String },
          streetaddress: { type: String},
          towncity: { type: String},
          pincode: { type: Number},
          phone: { type: Number},
        },
    ],
    orderhistory: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, 
          name: { type: String},
          housename: { type: String },
          streetaddress: { type: String},
          towncity: { type: String},
          pincode: { type: Number},
          phone: { type: Number},
          coupon: { type: String},
          amount: { type: Number},
          payment: { type: String},
          status: { type: String},
          createdAt: { type: Number},
          productDetails: {
            type: Object, 
            
          },
        },
    ],
});




module.exports = mongoose.model('users',userSchema)


{/* <a href="/addtowishlist/{{this._id}}" > */}