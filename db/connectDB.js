const mongoose = require('mongoose');

const connectDB = async ()=>{
 try{

const conn = await mongoose.connect('mongodb+srv://jishnunp397:hmovP3ykxTGPyFmK@cluster0.hmmmi.mongodb.net/Outlooker?retryWrites=true&w=majority&appName=Cluster0',{});
  // const conn = await mongoose.connect('mongodb://localhost:27017/Outlooker',{});

    console.log(`mongodb connected: ${conn.connection.host}`);
 }
 catch(error){
    console.log(error);
    process.exit(1);
 }
};




module.exports = connectDB




