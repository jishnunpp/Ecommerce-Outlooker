
const checkSession = (req,res,next)=>{
    if(req.session.user){
        next()
    }else{
        res.redirect('/login')
    }
}

const isLogin = (req,res,next)=>{
    if(req.session.user){
        
        res.redirect('/profile')
    }else{
        next()
    }
}

module.exports={checkSession,isLogin}