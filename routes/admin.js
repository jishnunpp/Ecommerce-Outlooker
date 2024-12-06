const express = require('express')
const router = express.Router()
const admincontroler = require('../controller/admincontroler')
const auth = require('../middleware/auth')


router.get('/admin',admincontroler.login)






module.exports=router