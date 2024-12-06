const userSchema = require ('../model/usermodel')
const bcrypt = require ('bcrypt')
const saltround=10

const loadHome =(req,res)=>{res.render('user/home')}
const loadLogin =(req,res)=>{res.render('user/login')}
const login= async(req,res)=>{
   try{
    const {email,password} = req.body
    const user =await userSchema.findOne({email})
  

    if (!user) return res.render('user/login',{message:'User does not exists'})

     const ismatch = await bcrypt.compare(password,user.password)

    if(!ismatch) return res.render('user/login',{message:'Incorrect password'})
     req.session.user = { id: user._id, email: user.email };
    //  res.render('user/profile', { message: 'Login successfull', user:user });
    res.render('user/home');
     loadprofile(user)

   }
   catch(error){

   }
}

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
    req.session.user=null
    res.redirect('/')
}

const loadOtp =(req,res)=>{res.render('user/otp')}
const loadOtpNumber =(req,res)=>{
    try{
        const {phone} = req.body
        res.render('user/otpfeild',{phone:phone})
    }catch(error){
        console.log(error);
    }
}

const loadprofile =(req,res)=>{res.render('user/profile')}
const loadaddress =(req,res)=>{res.render('user/address')}


module.exports={
    loadHome,
    loadLogin,
    login,
    loadSignup,
    registerUser,
    logout,
    loadOtp,
    loadOtpNumber,
   
    loadprofile,
    loadaddress,
}