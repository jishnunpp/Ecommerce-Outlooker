const userSchema = require ('../model/usermodel')
const Product =require('../model/productmodel')
const Catogory = require('../model/catogorymodel');
const Banner = require('../model/bannermodel')
const Orders=require('../model/ordersmodel')
const Coupen=require('../model/coupenmodel')


const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const bcrypt = require ('bcrypt')
const saltround=10
const nodemailer= require('nodemailer')
const session=require('express-session');
const { request } = require('express');
require('dotenv').config()

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const serviceSid = process.env.SERVICE_SID;

const client = require('twilio')(accountSid,authToken)
const Razorpay = require('razorpay');
const crypto = require('crypto');







const loadHome = async(req,res)=>{
    try{
        const men = await Product.find({ catogory: 'men' }).limit(4);;
        const women = await Product.find({ catogory: 'women' }).limit(4);;
        const kids = await Product.find({ catogory: 'kids' }).limit(4);;
        const accessories = await Product.find({ catogory: 'accessories' }).limit(4);
       
        const products = await Product.find({})
        const catogory = await Catogory.find({})
        const banner  = await Banner .find({})
       
        res.render('user/home',{banner,products,catogory,men,women,kids,accessories })
      
    }catch(error){
      res.send(error,'not done')
    }
  }
const loadProductDetails = async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId); 

      if (!product) {
        return res.status(404).send('Product not found');
      }

      const categoryName = product.catogory;

      const catogory = await Product.find({ catogory: categoryName });
   
  
     
      res.render('user/productdetail', { product,catogory,categoryName });
    } catch (error) {
      console.error('Error loading product details:', error.message);
      res.status(500).send('Error loading product details');
    }
  };
  


  // login functions

const loadLogin =(req,res)=>{res.render('user/login')}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.render('user/login', { message: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('user/login', { message: 'Incorrect password' });
    }

    req.session.userId = user._id;
    

    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    res.render('user/login', { message: 'An error occurred. Please try again later.' });
  }
};



const checkBlockedUser = async (req, res, next) => {
 
  if (!req.session || !req.session.userId) {

    return next();
  }
  
  try {
    const user = await userSchema.findById(req.session.userId);

    if (user && user.isBlocked) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).send('An error occurred.');
        }
        console.log('User is blocked. Logging out.');
        return res.redirect('/login');
      });
      return;
    }
  } catch (error) {
    console.error('Error checking user status:', error);
    return res.status(500).send('An error occurred.');
  }

  next(); 
};





// signup functions

const loadSignup =(req,res)=>{res.render('user/signup')}
const registerUser = async (req,res)=>{

    try{
        const {name,email,phone,password} = req.body

        const user =await userSchema.findOne({email})

        if (user) return res.render('user/signup',{message:'User already exists'})

        const hashedpassword = await bcrypt.hash(password,saltround)

        const newUser = new userSchema({
            name,
            email,
            phone,
            password:hashedpassword
        })
        await newUser.save()
        res.render('user/login',{newuser:'user created successfully'})
    }
    catch(error){
        console.log(error);
    }


}
const logout =(req,res)=>{
    req.session.userId=null
    res.redirect('/')
}






// OTP functions

const loadOtp =(req,res)=>{res.render('user/otp')}
const loadOtpNumber =(req,res)=>{
    try{
        const {phone} = req.body
        client.verify.services(serviceSid).verifications.create({to:`+91${phone}`,channel:"sms",})

        res.render('user/otpfeild',{phone:phone})
    }catch(error){
        console.log(error);
    }
}
const otpCheck =async(req,res)=>{
  try{
      const {num1,num2,num3,num4,phone} = req.body
      const otp = [num1, num2, num3, num4].join('');
      const response = await client.verify
      .services(serviceSid)
      .verificationChecks.create({ to: "+919539848397", code: otp });

      // console.log('Verification Response:', response);

      if (response.valid) {
        console.log('OTP is valid!');
        const newUser = new userSchema({
          phone:phone,
         
        });
  
        await newUser.save();
        req.session.userId = newUser._id;
      res.redirect('/');
    } else {
      console.log('OTP is invalid.');
      res.render('user/otpfeild',{message:'invalid OTP'});
      
    }
  }catch(error){
      console.log(error);
  }
}






// forgot password functions

function generateOtp() {
  const digits = '1234567890';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)]; 
  }
  return otp; 
}
const sendVerificationEmail = async(email,otp)=>{
  try {
    const transporter = nodemailer.createTransport({
      service:'gmail',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      }

    })
    const mailOptions={
      from:process.env.NODEMAILER_EMAIL,
      to:email,
      subject:'your otp for password reset',
      text:`your otp is ${otp}`,
      html:`<b><h4>your otp is ${otp}</h4></b>`
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('email send:',info.messageId);
    return true;
  } catch (error) {
    console.log('error sending email',error);
    return false;
  }
}
const loadForgot=(req,res)=>{res.render('user/forgot')}
const loadForgotemail = async(req,res)=>{
  try{
      const {email} = req.body
      const user= await userSchema.findOne({email:email});
      if(user){
        const otp = generateOtp();
       
        
        const emailSent =await sendVerificationEmail(email,otp);
        if (emailSent){
          req.session.userOtp=otp;
          req.session.email=email;
          res.render('user/forgototp',{email:email})
          console.log('otp',otp);
        }else{
          res.json({success:false,message:'failed to send otp please try again'});
        }
        
      }else{
        res.render('user/forgot',{message:'user with this email does not exist'});
      }
      

   
  }catch(error){
      console.log(error);
  }
}
const verifyforgotOtp= async(req,res)=>{
 try {
  const enteredOtp=req.body.otp;
  if(enteredOtp===req.session.userOtp){
    res.json({success:true,redirectUrl:"/update-password"});
    
  }
  else{
    res.json({success:false,message:"OTP not matching"});
  }
 } catch (error) {
  console.log('an error occured please try again',error);
 }
}
const loadupdatepassword=(req,res)=>{res.render('user/confirmpassword')}

const  updatepassword=async(req,res)=>{
  try {
    const {newpass1,newpass2}=req.body;
    const email=req.session.email;
    if(newpass1===newpass2){
      const hashedpassword = await bcrypt.hash(newpass1,saltround)
      await userSchema.updateOne({email:email},{$set:{password:hashedpassword}})
      res.redirect('/login')

    }else{
      res.render('user/confirmpassword',{message:'password do not match'})
    }
    
  } catch (error) {
    console.log('an error occured please try again');
  }
}








// wishlist functions

const wishlist = async(req,res)=>{
  try{
      const userId = req.session.userId
      const user = await userSchema.findById(userId);
      const products= await Product.find({_id:{$in:user.wishlist}}).populate('catogory') 
     

   

  
   

    if (!user.wishlist || user.wishlist.length === 0) {
      return res.render('user/wishlist', { message: 'Your wishlist is empty.', products: [] });
    }

      res.render('user/wishlist',{products})
  }catch(error){
      console.log(error, 'wishlist');
  }
}

const addToWishlist = async (req, res) => {
  try {
    const productId = req.body.productId;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ status: false, message: 'User not authenticated' });
    }

    const user = await userSchema.findById(userId);
   

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (user.wishlist.includes(productId)) {
      return res.status(200).json({ status: false, message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({ status: true, message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};

const removeWishlist = async (req, res) => {
  try {
    const productId = req.body.productId;
    const userId = req.session.userId; 

    if (!userId) {
      return res.status(401).json({ status: false, message: 'User not authenticated' });
    }

    const user = await userSchema.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const index = user.wishlist.indexOf(productId);

    if (index === -1) {
      return res.status(400).json({ status: false, message: 'Product not in wishlist' });
    }

    user.wishlist.splice(index, 1);
    await user.save();

     res.redirect('/wishlist');
  } catch (error) {
    console.error('Error removing product from wishlist:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
};










// cart functions

const cart = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).render('user/cart', { message: 'Please log in to view your cart.', products: [] });
    }

    const user = await userSchema.findById(userId).lean();
    if (!user) {
      return res.status(404).render('user/cart', { message: 'User not found.', products: [] });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.render('user/cart', { message: 'Your cart is empty.', products: [] });
    }

    const validCartItems = user.cart.filter(item => mongoose.Types.ObjectId.isValid(item.item)); 

    if (validCartItems.length === 0) {
      return res.render('user/cart', { message: 'Your cart contains invalid items.', products: [] });
    }

    const productIds = validCartItems.map(item => item.item); 
    const products = await Product.find({ _id: { $in: productIds } }).populate('catogory').lean();

   
    const productsWithQuantityAndAmount = products.map(product => {
      const cartItem = validCartItems.find(item => item.item.toString() === product._id.toString());
      const quantity = cartItem ? cartItem.quantity : 0;
      const amount = quantity * product.price; 

      return {
        ...product,
        quantity, 
        amount: amount.toFixed(2) 
      };
    });

  
    const totalCartAmount = productsWithQuantityAndAmount.reduce((total, product) => {
      return total + parseFloat(product.amount);
    }, 0).toFixed(2); 

    if (!productsWithQuantityAndAmount || productsWithQuantityAndAmount.length === 0) {
      return res.render('user/cart', { message: 'No products found in your cart.', products: [] });
    }

   
    res.render('user/cart', { 
      products: productsWithQuantityAndAmount, 
      totalCartAmount
    });

  } catch (error) {
    console.error('Error loading cart:', error);
    res.status(500).render('user/cart', { message: 'An error occurred while loading your cart. Please try again later.', products: [] });
  }
};
const addToCart = async (req, res) => {
  try {
    const productId = req.body.productId;
    const userId = req.session.userId;

   
    if (!userId) {
      return res.status(401).json({ status: false, message: 'User not authenticated' });
    }

   
    if (!productId) {
      return res.status(400).json({ status: false, message: 'Product ID is required' });
    }

 
    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

   
    const productInCart = user.cart.find(item => item.item.toString() === productId);
    if (productInCart) {
      return res.status(200).json({ status: false, message: 'Product already in cart' });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ status: false, message: 'Product not found' });
    }

    // Get the price of the product
    const productPrice = product.price;

 
    user.cart.push({ item: productId, quantity: 1,amount: productPrice });
    await user.save();

  
    res.status(200).json({ status: true, message: 'Product added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
};
const removeCart = async (req, res) => {
  try {
    const productId = req.body.productId;
    const userId = req.session.userId;


    if (!userId) {
      return res.status(401).json({ status: false, message: 'User not authenticated' });
    }


    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

 
    const productIndex = user.cart.findIndex(item => item.item.toString() === productId);

    if (productIndex === -1) {
      return res.status(400).json({ status: false, message: 'Product not found in cart' });
    }

   
    user.cart.splice(productIndex, 1);
    await user.save();


    res.redirect('/cart');
  } catch (error) {
    console.error('Error removing product from cart:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
};
const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ status: false, message: 'User not authenticated' });
    }

    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    console.log('Request received:', { productId, quantity, userId });

   
    const cartItem = user.cart.find(item => item.item.toString() === productId);
    if (!cartItem) {
      return res.status(404).json({ status: false, message: 'Product not found in cart' });
    }

   
    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ status: false, message: 'Product not found' });
    }

    const productPrice = product.price;

    
    cartItem.quantity = parseInt(quantity, 10);
    cartItem.amount = (cartItem.quantity * productPrice).toFixed(2);

    
    await user.save();

    return res.status(200).json({ status: true, message: 'Cart updated successfully' });
  } catch (error) {
    console.log('Error updating cart quantity:', error.message);
    return res.status(500).json({ status: false, message: 'Server error occurred. Please try again later.' });
  }
};













// shop page functions

const allproducts = async (req, res) => {
  try {
   
    const category = await Catogory.find({});
    req.session.filteredProduct=null;
   
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

   
    const products = await Product.find({})
      .sort({ price: 1 }) 
      .skip(skip)
      .limit(limit);

   
    const totalproducts = await Product.countDocuments({});
    const totalPages = Math.ceil(totalproducts / limit);
    const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
    console.log(products);
  
    res.render('user/allproducts', {
      products,
      category,
      totalproducts,
      currentPage: page,
      totalPages,
      totalPagesArray,
    });
  } catch (error) {
    console.error('Error in allproducts:', error.message);
    res.status(500).send('Internal Server Error');
  }
};
const shop = async (req, res) => {
  try {
    const category = await Catogory.find({});

    // Pagination
    const page = parseInt(req.query.page) || 1; 
    const limit = 8;
    const skip = (page - 1) * limit; 

    let products;
    let totalProducts;

    if (req.session.filteredProduct) {
   
      const filteredProductIds = req.session.filteredProduct.map((p) => p._id);

      products = await Product.find({ _id: { $in: filteredProductIds } })
        .sort({ price: 1 }) 
        .skip(skip)
        .limit(limit);

      totalProducts = req.session.filteredProduct.length;
    } else {
     
      products = await Product.find({})
        .sort({ createdOn: -1 })
        .skip(skip)
        .limit(limit);

      totalProducts = await Product.countDocuments({});
    }

   
    const totalPages = Math.ceil(totalProducts / limit);
    const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

  
    res.render('user/allproducts', {
      products,
      category,
      totalProducts,
      currentPage: page,
      totalPages,
      totalPagesArray,
    });
  } catch (error) {
    console.error('Error in /shop route:', error.message);
    res.status(500).send('Internal Server Error');
  }
}; 
const SearchProduct = async (req, res) => {
  try {
    const searchQuery = req.body.product;
    const productCategory = req.session.filteredProduct; 
    const productPrice = req.session.filteredPrice; 

    console.log('searchQuery:', searchQuery);
    console.log('productCategory:', productCategory);
    console.log('productPrice:', productPrice);

    const filter = {};


    if (searchQuery) {
      filter.title = { $regex: new RegExp(searchQuery, 'i') };
    }


    if (productCategory && productCategory.length > 0) {
      const categoryIds = productCategory.map((p) => p.catogory); 
      filter.catogory = { $in: categoryIds };
    }


    if (productPrice && productPrice.gt !== undefined && productPrice.lt !== undefined) {
      filter.price = { $gte: productPrice.gt, $lte: productPrice.lt };
    }

    let products = await Product.find(filter);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 8; 
    const skip = (page - 1) * limit; 

    const totalProducts = products.length; 
    const totalPages = Math.ceil(totalProducts / limit);
    const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1); 

    products = products.slice(skip, skip + limit);

    const category = await Catogory.find({});

    res.render('user/allproducts', {
      products,
      category,
      totalProducts,
      currentPage: page,
      totalPages,
      totalPagesArray,
    });
  } catch (error) {
    console.error('Error in SearchProduct:', error.message);
    res.status(500).render('error', { message: 'Error searching products' });
  }
};
const FilterCategory = async (req, res) => {
  try {
    const categoryName =  req.params.catogoryname;
    
    let products;
    

    if (categoryName) {
      

      products = await Product.find({
        catogory: categoryName 
      });
      req.session.filteredProduct=products
      

    } else {
     
      products = await Product.find({});

}

 // Pagination
 const page = parseInt(req.query.page) || 1;
 const limit = 8;
 const skip = (page - 1) * limit;

 const totalProducts = products.length;
 const totalPages = Math.ceil(totalProducts / limit);
 const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

 
 products = products.slice(skip, skip + limit);

    const category = await Catogory.find({}); 
    const showFilterBox = !!(categoryName );

    res.render('user/allproducts', { products, category,categoryName,showFilterBox,
      totalProducts,
      currentPage: page,
      totalPages,
      totalPagesArray, });
  } catch (error) {
    console.error('Error filtering category:', error);
    res.status(500).send('Error performing category filter');
  }
};
const FilterPrice = async (req, res) => {
  try {

    const minPrice = parseInt(req.query.gt) || 0;
    const maxPrice = parseInt(req.query.lt) || Infinity;
    let categoryName;

    let products;

    
    if (req.session.filteredProduct) {
      const product = req.session.filteredProduct;
      
     
      product.forEach((p) => {
        categoryName = p.catogory ? p.catogory : 'No category available';
    
      });
    

      products = product.filter(
        (p) => p.price > minPrice && p.price < maxPrice
      );
      req.session.filteredPrice=products
    } else {
     
      products = await Product.find({
        price: { $gte: minPrice, $lte: maxPrice },
      });
    }

    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);

    
    products = products.slice(skip, skip + limit);

    const category = await Catogory.find({});
    const showFilterBox = !!(categoryName || minPrice);
  
    res.render('user/allproducts', { products, category,showFilterBox,minPrice,maxPrice,categoryName,
      totalProducts,
      currentPage: page,
      totalPages,
      totalPagesArray,});
  } catch (error) {
    console.error('Error performing price filter:', error.message);
    res.status(500).render('error', { message: 'Error performing price filter' });
  }
};





// profile functions

const loadProfile = async(req,res)=>{

  try {
    const userId = req.session.userId;

    if (!userId) {
        res.redirect('/login')
    }

    const user = await userSchema.findById(userId);

    if (!user) {
    
      res.status(500).send('User not found.');
    }

    res.render('user/profile',{user,failMsg: req.flash('failMsg')})
  } catch (error) {
    console.log(error);
  }
}
const updateProfile=async(req,res)=>{
  try {
    const userId = req.session.userId;

    if (!userId) {
        res.status(500).send('Error  no userId ');
    }
    

    const updatedData = req.body;
    console.log(updatedData);
    const result = await  userSchema.updateOne(
      { _id: userId},
      { $set: updatedData }
    );
    const user = await userSchema.findById(userId);

    if (!user) {
    
      res.status(500).send('User not found.');
    }


    if (result.modifiedCount > 0) {
      res.render('user/profile', { user, successMsg: "Profile updated successfully" });
    } else {
      req.flash('failMsg', 'No changes were made.');
      res.redirect('/profile');
    }
    
  } catch (error) {
    res.send('no changes',error);
  }
}
const loadAddress = async(req,res)=>{
  try {
    const userId = req.session.userId;
    if (!userId) {
      res.status(500).send('Error performing no userid');
  }

  const user = await userSchema.findById(userId);
  const address =user.address;

    res.render('user/address',{user,address})
  } catch (error) {
    console.log(error);
  }
}
const updateAddress=async(req,res)=>{
  try {
    const userId = req.session.userId;

    if (!userId) {
        res.status(500).send('Error  no userId ');
    }

    const newAddress = req.body; 
    console.log('New Address:', newAddress);

     const result = await userSchema.updateOne(
      { _id: userId },
      { $push: { address: newAddress } }
    );

    if (result.modifiedCount > 0) {
      return res.redirect('/profile');
    } else {
      return res.status(500).send('Error: No changes');
    }
  } catch (error) {
    res.send('no changes',error);
  }
}
const loadHistory=async(req,res)=>{
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).send('User not authenticated.');
    }

   
    
    const orderhistory = await Orders.find({ 'order.userId': userId }).select('order');
    // console.log('Order History:', orderhistory);

  
    const allOrders = orderhistory.map((orderObj) => {
      return {
        order: orderObj.order,
        orderId: orderObj._id,
      };
    });

    return res.render('user/orders', {orderhistory: allOrders});
  } catch (error) {
    console.log('error showhistory',error);
  }
}







// deliverydetails functions

const loaddeliveryDetails =async(req,res)=>{
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ status: false, message: 'User not authenticated' });
    }

    const user = await userSchema.findById(userId);
   

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    
    const  alladdress = user.address; 
     const cart = user.cart ; 
     const totalAmount = cart.reduce((total, item) => total + (item.amount || 0), 0);
   
    
   

    res.render('user/deliverydetails',{alladdress,totalAmount})
  } catch (error) {
    console.log(error);
  }
}
const deliveryDetails =async(req,res)=>{
  try {
    const userId = req.session.userId;
    const addressId = req.params.addressId;

    if (!userId) {
      return res.status(401).json({ status: false, message: 'User not authenticated' });
    }

    const user = await userSchema.findById(userId);
   

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const address = user.address.find(addr => addr._id.toString() === addressId);

    if (!address) {
     
      return res.status(404).json({ status: false, message: 'Address not found' });
    }
    const  alladdress = user.address; 
     const cart = user.cart ; 
     const totalAmount = cart.reduce((total, item) => total + (item.amount || 0), 0);
   
    

    res.render('user/deliverydetails',{alladdress,address,totalAmount})
  } catch (error) {
    console.log(error);
  }
}

const orderDetails = async (req, res) => {
  try {
    const {
      name,
      housename,
      streetaddress,
      towncity,
      pincode,
      phone,
      coupon,
      amount,
      payment,
    } = req.body;

    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).send('User not authenticated.');
    }

    const user = await userSchema.findById(userId);

    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(400).json({ status: false, message: 'Cart is empty or user not found.' });
    }

    const productDetails = user.cart.reduce((details, cartItem) => {
      details[cartItem.item] = {
        quantity: cartItem.quantity,
        amount: cartItem.amount,
      };
      return details;
    }, {});

   
    let discountedAmount = amount;
    let offer;
    const couponName = await Coupen.findOne({ coupename: coupon });
   
    if (couponName) {
      console.log('Coupon found:', couponName);

      let offer = couponName.offerprice; 
      const minPrice = couponName.minprice;
      const startDate = couponName.startdate;
      const endDate = couponName.enddate;

      const currentDate = new Date();
      if (currentDate < startDate || currentDate > endDate) {
        offer =0;
        console.log('Coupon is expired or not yet valid.');
      } else if (amount >= minPrice) {
        discountedAmount = amount - offer;
        console.log('Discount applied:', offer);
        res
      } else {
        console.log('Order amount does not meet the minimum price for this coupon.');
      }
    } else {
      offer =0;
      console.log('Coupon not found.');
    }

    

    
    const order = {
      userId,
      name,
      housename,
      streetaddress,
      towncity,
      pincode,
      phone,
      coupon,
      amount:discountedAmount,
      payment,
      status: payment === 'cod' ? 'placed' : 'created',
      createdAt: new Date(),
      productDetails,
      discount:offer,
    };

    

    const newOrder = new Orders({ order });
    await newOrder.save();

    if (payment === 'cod') {
      const userId = req.session.userId;
      const user = await userSchema.findById(userId);
  
      if (user) {
        user.cart = [];
        await user.save();
      }
      
      return res.redirect('/orderhistory');
    } else if (payment === 'online') {
     
      const razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY,
        key_secret: process.env.RAZORPAY_SECRET_KEY,
      });

      const options = {
        amount: discountedAmount * 100, 
        currency: 'INR',
        receipt: `order_rcptid_${newOrder._id}`,
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);

      // Save the Razorpay order ID
      newOrder.order.razorpayOrderId = razorpayOrder.id;
      await newOrder.save();

      return res.status(200).json({
        key_id: process.env.RAZORPAY_API_KEY,
        amount: amount * 100,
        currency: 'INR',
        order: razorpayOrder, 
      });
    }
  } catch (err) {
    console.error('Error adding order:', err);
    return res.status(500).send('Something went wrong while adding the order.');
  }
};

const verifyPayment = async (req, res) => {
  const RAZORPAY_SECRET_KEY=process.env.RAZORPAY_SECRET_KEY
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
     
    } = req.body;
    console.log(' ,   razorpay_payment_id,' ,razorpay_payment_id,'razorpay_order_id',razorpay_order_id);


    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_SECRET_KEY) 
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
       res.status(200).json({
      success: true,
      message: 'Payment verified and order placed successfully.',
    });

    const userId = req.session.userId;
    const user = await userSchema.findById(userId);

    if (user) {
      user.cart = [];
      await user.save();
    }
    }
    console.log('generatedSignature',generatedSignature);
    console.log('razorpay_signature',razorpay_signature);

    const updatedOrder = await Orders.findOneAndUpdate(
      { 'order.razorpayOrderId': razorpay_order_id }, 
      { $set: { 'order.status': 'placed' } },
      { new: true } 
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    


 

    
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error during payment verification.',
    });
  }
};
const vieworder = async (req, res) => {
  try {
   
    const orderId = req.params.orderId;
    if (!orderId) {
      return res.status(400).json({ status: false, message: 'Invalid order ID' });
    }

    const orderDocument = await Orders.findById(orderId);
    if (!orderDocument) {
      return res.status(404).json({ status: false, message: 'Order not found' });
    }

   
    const productDetails = orderDocument.order?.productDetails;
    if (!productDetails || typeof productDetails !== 'object' || Object.keys(productDetails).length === 0) {
      return res.status(400).json({ status: false, message: 'Invalid product details' });
    }

    console.log('Product Details:', productDetails);

   
    const productIds = Object.keys(productDetails);

   
    const products = await Product.find({ _id: { $in: productIds } });

    
    const allProducts = products.map((product) => {
      const details = productDetails[product._id.toString()] || {};
      return {
        productId: product._id,
        images: product.images,
        productName: product.title,
        productPrice: product.price,
        quantity: details.quantity || 0,
        amount: details.amount || 0,
      };
    });

   
    // console.log('All Products:', allProducts);


    res.render('user/vieworder', { products: allProducts });
  } catch (error) {
    console.error('Error fetching order:', error.message);
    res.status(500).json({ status: false, message: 'An error occurred while fetching the order.' });
  }
};













module.exports={
    loadHome,
    loadProductDetails,

    loadLogin,
    login,
    checkBlockedUser,



    loadSignup,
    registerUser,
    logout,

    loadForgot,
    loadForgotemail,
    verifyforgotOtp,
    loadupdatepassword,
    updatepassword,

    loadOtp,
    loadOtpNumber,
    otpCheck,




    wishlist,
    addToWishlist,
    removeWishlist,




    cart,
    addToCart,
    removeCart,
    updateCartQuantity,


   


    allproducts,
    shop,
    SearchProduct,
    FilterCategory,
    FilterPrice,
    



   
    loadProfile,
    updateProfile,
    loadAddress,
    updateAddress,
    loadHistory,






    loaddeliveryDetails,
    deliveryDetails,
    orderDetails,
    verifyPayment,
    vieworder,
    


}