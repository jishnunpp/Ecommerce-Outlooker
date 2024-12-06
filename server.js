const express = require('express')
const app = express();
const path = require('path')
const userRoutes = require ('./routes/user')
const adminRoutes = require ('./routes/admin');
const connectDB = require ('./db/connectDB')
const session=require('express-session');
const nocache=require('nocache');


// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.set('views',path.join(__dirname,'views'));
app.set('view engine','hbs');
app.use(express.static('public'));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(nocache());
app.use(session({
    secret:'mysecretKey',
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:1000*60*60*24}
}))


app.use('/',userRoutes)
app.use('/admin',adminRoutes)







connectDB()

app.listen(3001,()=>{
    console.log('server running on 3001');
})