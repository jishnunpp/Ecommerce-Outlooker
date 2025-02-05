const express = require('express')
const router = express.Router()
const usercontroler = require('../controller/usercontroler')
const auth = require('../middleware/auth')
const passport = require('../config/passport')
const userSchema = require ('../model/usermodel')


router.get('/',usercontroler.loadHome)
router.get('/productdetails/:id',usercontroler.loadProductDetails)
router.get('/login',auth.isLogin,usercontroler.loadLogin)
router.post('/login',usercontroler.login)
router.get('/signup',usercontroler.loadSignup)
router.post('/register',usercontroler.registerUser)


router.get('/forgot-password',usercontroler.loadForgot)
router.post('/forgot-password',usercontroler.loadForgotemail)
router.post('/verify-forgot-otp',usercontroler.verifyforgotOtp)
router.get('/update-password',usercontroler.loadupdatepassword)
router.post('/update-password',usercontroler.updatepassword)



router.get('/otp',usercontroler.loadOtp)
router.post('/otp',usercontroler.loadOtpNumber)
router.post('/otp-check',usercontroler.otpCheck)



router.get('/logout',usercontroler.logout)
router.get('/profile',auth.checkSession, usercontroler.loadProfile)
router.post('/updateprofile',auth.checkSession, usercontroler.updateProfile)
router.get('/address',auth.checkSession,usercontroler.loadAddress)
router.post('/updateaddress',auth.checkSession, usercontroler.updateAddress)
router.get('/orderhistory',auth.checkSession, usercontroler.loadHistory)




router.get('/wishlist',auth.checkSession,usercontroler.wishlist)
router.post('/addtowishlist',usercontroler.addToWishlist)
router.post('/removewishlist',usercontroler.removeWishlist)



router.get('/cart',auth.checkSession,usercontroler.cart)
router.post('/addtocart',usercontroler.addToCart)
router.post('/removecart',usercontroler.removeCart)
router.post('/update-cart',usercontroler.updateCartQuantity)




router.get('/deliverydetails',usercontroler.loaddeliveryDetails)
router.get('/address/:addressId', usercontroler.deliveryDetails);
router.post('/submit-order', usercontroler.orderDetails)
router.post('/verify-payment', usercontroler.verifyPayment)
router.get('/view-order/:orderId',usercontroler.vieworder)





router.get('/allproducts',usercontroler.allproducts)
router.get('/shop',usercontroler.shop)
router.post('/filter-search',usercontroler.SearchProduct)
router.get('/search-catogory/:catogoryname',usercontroler.FilterCategory)
router.get('/filterprice',usercontroler.FilterPrice)


router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),async(req,res)=>{
    try {
        const { id} = req.user;
        req.session.userId = id;

        res.redirect('/');
      } catch (error) {
        console.error('Error in Google OAuth callback:', error);
      }
});






module.exports=router