const express = require('express')
const app = express();
const path = require('path')
const usercontoller =require('./controller/usercontroler')
const userRoutes = require ('./routes/user')
const adminRoutes = require ('./routes/admin');
const connectDB = require ('./db/connectDB')
const session=require('express-session');
const nocache=require('nocache');
require('dotenv').config()
const passport  = require('./config/passport')
const flash = require('connect-flash');
const userSchema = require ('./model/usermodel')





app.set('views',path.join(__dirname,'views'));
app.set('view engine','hbs');
app.use(express.static('public'));

const hbs = require('hbs');
const partialspath=path.join(__dirname,'views/partials');
hbs.registerPartials(partialspath)

hbs.registerHelper('add', (a, b) => a + b);
hbs.registerHelper('subtract', (a, b) => a - b);
hbs.registerHelper('eq', (a, b) => a === b);
hbs.registerHelper('lt', (a, b) => a < b);
hbs.registerHelper('gt', (a, b) => a > b);
hbs.registerHelper('or', function (a, b) {
    return a || b;
  });


app.use(usercontoller.checkBlockedUser)


app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(nocache());
app.use(session({
    secret:'mysecretKey',
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:1000*60*60*24}
}))
app.use('/uploads', express.static('uploads'));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use( async(req, res, next) => {
    const userId = req.session.userId;
    const user = await userSchema.findById(userId);
  
    res.locals.user = user
    next();
  });


app.use('/',userRoutes)
app.use('/admin',adminRoutes)







connectDB()

app.listen(3001,()=>{
    console.log('server running on 3001');
})