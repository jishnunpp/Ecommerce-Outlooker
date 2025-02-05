const multer = require('multer');
const path = require('path')


const checkSession = (req,res,next)=>{
    if(req.session.admin){
        next()
    }else{
        res.redirect('/admin')
    }
}

const isLogin = (req,res,next)=>{
    if(req.session.admin){
        
        res.redirect('/admin/dashboard')
    }else{
        next()
    }
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    },
});

const upload = multer({ storage });
const fileUpload = upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'images', maxCount: 5
        
     },
   
]);

const bannerUpload = upload.fields([
    { name: 'image', maxCount: 1 },
   
   
]);




module.exports={checkSession,isLogin,fileUpload,bannerUpload}