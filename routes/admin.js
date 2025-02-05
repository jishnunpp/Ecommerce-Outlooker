const express = require('express')
const router = express.Router()
const admincontroler = require('../controller/admincontroler')
const Auth = require('../middleware/adminAuth')
const multer = require('multer');
const path = require('path')
const Product =require('../model/productmodel')


router.get('/',Auth.isLogin,admincontroler.loadlogin)
router.post('/login',admincontroler.login)
router.get('/logout',admincontroler.logout)

router.get('/dashboard',Auth.checkSession,admincontroler.dashboard)

router.get('/users',admincontroler.loadusers)
router.get('/search/users',admincontroler.usersearch)
router.post('/block/:id',admincontroler.block)
router.post('/unblock/:id',admincontroler.unblock)

router.get('/products',admincontroler.products)
router.get('/product/edit/:id',admincontroler.loadproductEdit)
router.post('/remove-image/:id',admincontroler.removeImage)
router.post('/product/edit/:id',Auth.fileUpload,admincontroler.productEdit)
router.post('/product/delete/:id',admincontroler.productDelete)
router.get('/addproduct',admincontroler.loadaddproduct)
router.post('/addproduct',Auth.fileUpload,admincontroler.addproduct)


router.get('/catogory',admincontroler.loadcatogory)
router.get('/addcatogory',admincontroler.loadaddcatogory)
router.post('/addcatogory',admincontroler.addNewCategory)
router.get('/catogory/edit/:id',admincontroler.loadeditCategory)
router.post('/catogory/edit/:id',admincontroler.updateCategory)
router.post('/catogory/delete/:id',admincontroler.deleteCategory)
router.get('/catogory/search',admincontroler.Categorysearch)


router.get('/banner',admincontroler.banner)
router.get('/addbanner',admincontroler.loadaddbanner)
router.post('/addbanner',Auth.bannerUpload,admincontroler.addNewbanner)
router.get('/banner/edit/:id',admincontroler.loadeditBanner)
router.post('/banner/edit/:id',Auth.bannerUpload,admincontroler.editBanner)
router.post('/banner/delete/:id',Auth.bannerUpload,admincontroler.deleteBanner)




router.get('/coupens',admincontroler.coupen)
router.get('/addcoupen',admincontroler.loadaddcoupen)
router.post('/addcoupen',admincontroler.addcoupen)
router.post('/coupen/delete/:id',admincontroler.deleteCoupen)
// router.post('/addbanner',admincontroler.addNewbanner)
// router.get('/banner/edit/:id',admincontroler.loadeditBanner)
// router.post('/banner/edit/:id',Auth.bannerUpload,admincontroler.editBanner)
// router.post('/banner/delete/:id',Auth.bannerUpload,admincontroler.deleteBanner)



router.get('/orders',admincontroler.orders)
router.get('/view-order/:orderId',admincontroler.vieworder)
router.post('/update/orderstatus/:orderId',admincontroler.updateStatus)



module.exports=router