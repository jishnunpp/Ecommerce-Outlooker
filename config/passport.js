require('dotenv').config()
const passport = require('passport');
const User = require ('../model/usermodel')
const googleStrategy = require('passport-google-oauth20').Strategy

passport.use(new googleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"http://localhost:3001/auth/google/callback",
},

async (accessToken,refreshToken,profile,done)=>{
    try {
        
        let user = await User.findOne({googleid:profile.id});
        if(!user){
            user = new User({
                name:profile.displayName,
                email:profile.emails[0].value,
                googleid:profile.id,
            });
            await user.save();
           
            return done(null,user);
            
            
        }
        else{
            
            return done(null,user);
            
        }
       
    } catch (error) {

        return done(error,null)
        
    }
}
));


passport.serializeUser((user,done)=>{
    done(null,user.id)
});

passport.deserializeUser((id,done)=>{
    User.findById(id)
    .then(user=>{
        done(null,user)
    })
    .catch(error=>{
        done(error,null)
    })
})


module.exports=passport