
const checkSession = (req,res,next)=>{
    if(req.session.userId){
        next()
    }else{
        res.redirect('/login')
    }
}

const isLogin = (req,res,next)=>{
    if(req.session.userId)
        {
        
        res.redirect('/profile')
    }else{
        next()
    }
}

module.exports={checkSession,isLogin}