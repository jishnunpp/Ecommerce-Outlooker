const express = require('express')
const router = express.Router()
const usercontroler = require('../controller/usercontroler')
const auth = require('../middleware/auth')





router.get('/',usercontroler.loadHome)
router.get('/login',auth.isLogin,usercontroler.loadLogin)
router.post('/login',usercontroler.login)
router.get('/signup',usercontroler.loadSignup)
router.post('/register',usercontroler.registerUser)
router.get('/otp',usercontroler.loadOtp)
router.post('/otp',usercontroler.loadOtpNumber)

router.get('/logout',usercontroler.logout)
router.get('/profile',auth.checkSession, usercontroler.loadprofile)
router.get('/address',auth.checkSession,usercontroler.loadaddress)



















  

module.exports=router