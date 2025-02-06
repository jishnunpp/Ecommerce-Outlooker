const Admin = require ('../model/adminmodel');
const usermodel = require ('../model/usermodel')
const Catogory = require('../model/catogorymodel');
const Product =require('../model/productmodel')
const Banner = require('../model/bannermodel')
const Orders=require('../model/ordersmodel')
const Coupen=require('../model/coupenmodel')


const bcrypt = require ('bcrypt')
const { ObjectId } = require('mongodb');




const loadlogin =(req,res)=>{res.render('admin/login')}
const login =  async(req,res)=>{
    try{
        const {email,password} = req.body
       
        const admin =await Admin.findOne({email})
       
    
        if (!admin) return res.render('admin/login',{message:'User does not exists'})
        const ismatch = await bcrypt.compare(password,admin.password)

       if(!ismatch) return res.render('user/login',{message:'Incorrect password'})
         req.session.admin = true
        
         res.redirect('/admin/dashboard');

    }
    catch(err){
        console.log(err);
          
      res.status(500).send('Error performing search');
    }
}
const logout =(req,res)=>{
  req.session.admin=null
  res.redirect('/admin')
}




const dashboard = async (req, res) => {
  try {
    
    const products = await Product.find({})
      .sort({ _id: -1 })
      .limit(5);        
      const totalProduct = await Product.countDocuments();
      const totalUsers = await usermodel.countDocuments();
      const totalOrders = await Orders.countDocuments();

      const allOrders = await Orders.find();

     
      let totalAmount = 0;
      for (const orderDocument of allOrders) {
        totalAmount += orderDocument.order.amount || 0;
      }
      const placedCount = await Orders.countDocuments({ "order.status": "placed" });
      const shippedCount = await Orders.countDocuments({ "order.status": "Shipped" });
      const inProgressCount = await Orders.countDocuments({ "order.status": "In progress" });
      const deliveredCount = await Orders.countDocuments({ "order.status": "Delivered" });
      const createdCount = await Orders.countDocuments({ "order.status": "created" });
      // Store counts in an array
      console.log(placedCount,createdCount, shippedCount, inProgressCount, deliveredCount);
      const orderCounts = [createdCount,placedCount,inProgressCount, shippedCount,  deliveredCount];

      // Convert array to string
      const orderCount = orderCounts.join(',');

     
      
      
    res.render('admin/dashboard', { products,totalUsers,totalProduct,totalOrders,totalRevenue:totalAmount,orders:orderCount });
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).send('Error fetching products');
  }
};





const loadusers = async(req,res)=>{
    try{
        const users = await usermodel.find({})
        res.render('admin/users',{users})
        
    }catch(error){

    }
}
const block = async (req, res) => {
    try {
        const userId = req.params.id;
        await  usermodel.findByIdAndUpdate(userId, { isBlocked: true });
        res.redirect('/admin/users')
    } catch (error) {
        res.status(500).json({ error: 'Error blocking user' });
    }
}
const unblock = async (req, res) => {
    try {
        const userId = req.params.id;
        await  usermodel.findByIdAndUpdate(userId, { isBlocked: false });
        res.redirect('/admin/users')
    } catch (error) {
        res.status(500).json({ error: 'Error unblocking user' });
    }
}
const usersearch = async (req, res) => {
    try {
     const searchQuery = req.query.q;

        const users = await usermodel.find({
        name: { $regex: searchQuery, $options: 'i' } 
      })
       res.render('admin/users',{users})
    } catch (error) {
      
      res.status(500).send('Error performing search');
    } 
    
  };






// products functions
 
const products = async(req,res)=>{
  try{
      const products = await Product.find({})
      
      res.render('admin/products',{products })
     
    
  }catch(error){
    res.send(error,'not done')
  }
}
const loadproductEdit= async (req, res) => {
  try {
    const category = await Catogory.find({})
   
      const product = await Product.findById(req.params.id);
      const images=product.images
      const filteredCategories = category.filter(cat => cat.catogoryname !== product.catogory);
      res.render('admin/editproduct', { product ,category:filteredCategories,images});
  } catch (err) {
      res.status(500).send('Error loading product for editing: ' + err.message);
  }
};
const removeImage = async (req, res) => {
  try {
    const imagePath = decodeURIComponent(req.params.id); 

    if (!imagePath) {
      return res.status(400).json({ success: false, message: 'Image path is required' });
    }

    console.log('Image path received:', imagePath);

    const product = await Product.findOne({ images: imagePath }).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

  
    const updatedProduct = await Product.updateOne(
      { _id: product._id },
      { $pull: { images: imagePath } }
    );

    if (updatedProduct.modifiedCount > 0) {
      console.log('Image path successfully removed');
      return res.status(200).json({ success: true, message: 'Image path removed successfully' });
    } else {
      console.log('No changes made to the product');
      return res.status(500).json({ success: false, message: 'Failed to remove image path' });
    }
  } catch (error) {
    console.error('Error removing image:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while removing the image.' });
  }
};
const productEdit = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedData = { ...req.body };

    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found.');
    }

  
    if (req.files && req.files.images) {
      const newImages = [];
      if (Array.isArray(req.files.images)) {
      
        req.files.images.forEach((image) => {
          newImages.push(image.path);
        });
      } else {
      
        newImages.push(req.files.images.path);
      }

     
      const updatedImages = [...(product.images || []), ...newImages];
      updatedData.images = updatedImages;
    }
    

  
    const result = await Product.findByIdAndUpdate(productId, { $set: updatedData });

   

    if (result) {
      res.redirect('/admin/products'); 
    } else {
      res.status(400).send('No changes were made to the product.');
    }

    
  } catch (error) {
    console.error('Product Edit Error:', error);
    res.status(500).send('An error occurred while editing the product.');
  }
};
const productDelete =async (req,res)=>{
  try{
      const userId = req.params.id;

      const result = await Product.deleteOne({ _id: userId });
      
      if (result.deletedCount === 1) {
          res.redirect('/admin/products')
        }
    
  }
  catch(error){
     
      res.status(500).json( 'not deleted');
  }
}
const loadaddproduct = async(req,res)=>{
  try{
    const category = await Catogory.find({})
      
      res.render('admin/addproduct',{category})
     
    
  }catch(error){
    res.send(error,'not done')
  }
}
const addproduct = async (req, res) => {
  try {
      const {
          title,
          description,
          catogory,
          price,
          offer,
          rating,
          review,
          stock,
          size,
          meterial,
          
        
      } = req.body;

    
      const images = [];
      if (req.files.image1) images.push(req.files.image1[0].path);
    
     


if ( req.files.images) {
   
    if (Array.isArray(req.files.images)) {
        req.files.images.forEach(image => {
            images.push(image.path);
        });
    } 

    else {
        images.push(req.files.images.path);
    }
}

     

      const newProduct = new Product({
        title,
        description,
        catogory,
        price,
        offer,
        rating,
        review,
        stock,
        size,
        meterial,
        images
         
      });

 
      await newProduct.save();

      res.redirect('/admin/products'); 
      console.log(images);
  } catch (err) {
      console.error(err);
      res.status(500).send('Error adding product');
  }
};





// catogory functions

const loadcatogory = async(req,res)=>{
    try{
        const catogory = await Catogory.find({})
     
        res.render('admin/catogory',{catogory})
        
    }catch(error){

    }
}
const loadaddcatogory=(req,res)=>{res.render('admin/addcatogory')}

const addNewCategory = async (req,res) => {
  try {
    const {catogoryname} = req.body
    const newCategory = new Catogory({
      catogoryname
   
    });

    await newCategory.save();
    res.redirect('/admin/catogory')
  } catch (error) {
    console.error('Error adding category:', error);
  }
};
const loadeditCategory = async (req, res) => {
  try {
    const category = await Catogory.findById(req.params.id);
    if (!category) {
      return res.status(404).send('Category not found');
    }
    res.render('admin/editcategory', { category });
  } catch (err) {
    res.status(500).send('Error loading category for editing');
  }
};
const updateCategory =async (req,res)=>{
  try {
    const categoryId = req.params.id;
    const updatedData = {
      catogoryname: req.body.catogoryname, 
    };

    const result = await Catogory.updateOne(
      { _id: new ObjectId( categoryId) },
      { $set: updatedData }
    );

    if (result.modifiedCount === 1) {
      res.redirect('/admin/catogory'); 
    } 
    else{
      res.status(500).send('no changes');
    }
  } catch (error) {
    
    res.status(500).send('edit Error');
  }

}
const deleteCategory =async (req,res)=>{
    try{
        const userId = req.params.id;

        const result = await Catogory.deleteOne({ _id: userId });
        
        if (result.deletedCount === 1) {
            res.redirect('/admin/catogory')
          } else {
            res.status(404).json({ message: 'User not found' });
          }
      
    }
    catch(error){
       
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
const Categorysearch = async (req, res) => {
    try {
     const searchQuery = req.query.q;

     const catogory = await Catogory.find({
        catogory: { $regex: searchQuery, $options: 'i' }
      });
      console.log(catogory);
      res.render('admin/catogory',{catogory})
    } catch (error) {
      
      res.status(500).send('Error performing search');
    } 
    
  };






  
// banner functions

const  banner= async(req,res)=>{
  try {
     const banner = await Banner.find({})
     res.render('admin/banner',{banner})
  } catch (error) {
    console.log(error);
  }
}
const  loadaddbanner=(req,res)=>{res.render('admin/addbanner')}

const addNewbanner = async (req,res) => {
  try {
    const {bannername,description,offer,link} = req.body

    if ( !req.files.image) {
      return res.status(400).send('An image is required.');
    }
 
    const image = req.files.image[0].path;
  
    

    const newBanner = new Banner({
      bannername,
      description,
      offer,
      link,
      image,

   
    });

    await newBanner.save();
    res.redirect('/admin/banner')
  } catch (error) {
    console.error('Error adding newBanner', error);
  }
};
const loadeditBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).send('Category not found');
    }
    res.render('admin/editbanner', { banner });
  } catch (err) {
    res.status(500).send('Error loading category for editing');
  }
};

const editBanner =async (req,res)=>{
  try {
    const bannerId = req.params.id;
    const updatedData = req.body;
    
    if (req.files && req.files.image && req.files.image.length > 0) {
     
      const image = req.files.image[0].path;
      updatedData.image = image;
    }
  
   const result = await Banner.updateOne(
      { _id: bannerId },
      { $set: updatedData }
    );


    if (result.modifiedCount >0) {
      res.redirect('/admin/banner'); 
    } 
    else{
      res.status(500).send('no changes');
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('edit Error',error);
  }
}
const deleteBanner =async (req,res)=>{
  try{
      const bannerId = req.params.id;

      const result = await Banner.deleteOne({ _id: bannerId });
      
      if (result.deletedCount === 1) {
          res.redirect('/admin/banner')
        }
    
  }
  catch(error){
     
      res.status(500).json(error,'Internal Server Error' );
  }
}





const  coupen= async(req,res)=>{
  try {
     const coupen = await Coupen.find({})
     res.render('admin/coupens',{coupen})
  } catch (error) {
    console.log(error);
  }
}
const  loadaddcoupen=(req,res)=>{res.render('admin/addcoupen')}

const addcoupen= async (req,res)=>{
  try {

    const {coupename,startdate,enddate,offerprice,minprice} = req.body

    const newCoupen = new Coupen({
      coupename,
      startdate,
      enddate,
      offerprice,
      minprice

   
    });

    await newCoupen.save();
    res.redirect('/admin/coupens')
    
  } catch (error) {
    console.error('Error adding newCoupen', error);
  }
}
const deleteCoupen= async(req,res)=>{
  try{
    const coupenId = req.params.id;

    const result = await Coupen.deleteOne({ _id: coupenId });
    
    if (result.deletedCount === 1) {
        res.redirect('/admin/coupens')
      }
  
}
catch(error){
   
    res.status(500).json(error,'Internal Server Error' );
}
}









const orders = async (req, res) => {
  try {
    
    const orderHistory = await Orders.find().sort({ 'order.createdAt': -1 });

   
    const allOrders = orderHistory.map((orderObj) => {
      return {
        order: orderObj.order,
        orderId: orderObj._id,
      };
    });

  
    return res.render('admin/orders', { orders: allOrders });
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).send('Internal Server Error');
  }
};
const vieworder = async (req, res) => {
  try {
   
    const orderId = req.params.orderId;
    if (!orderId) {
      return res.status(400).json({ status: false, message: 'Invalid order ID' });
    }

    const orderDocument = await Orders.findById(orderId);
    if (!orderDocument) {
      return res.status(404).json({ status: false, message: 'Order not found' });
    }

    
    const productDetails = orderDocument.order?.productDetails;
    if (!productDetails || typeof productDetails !== 'object' || Object.keys(productDetails).length === 0) {
      return res.status(400).json({ status: false, message: 'Invalid product details' });
    }

    console.log('Product Details:', productDetails);

   
    const productIds = Object.keys(productDetails);

   
    const products = await Product.find({ _id: { $in: productIds } });

    
    const allProducts = products.map((product) => {
      const details = productDetails[product._id.toString()] || {};
      return {
        productId: product._id,
        images: product.images,
        productName: product.title,
        productPrice: product.price,
        quantity: details.quantity || 0,
        amount: details.amount || 0,
      };
    });


    res.render('admin/vieworder', { products: allProducts ,orderDocument});
  } catch (error) {
    console.error('Error fetching order:', error.message);
    res.status(500).json({ status: false, message: 'An error occurred while fetching the order.' });
  }
};

const updateStatus = async (req, res) => {
  const { orderId } = req.params; 
  const { status } = req.body;
   console.log('status',status);
  try {
   
    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).send('Order not found');
    }

    order.order.status = status;
    await order.save();

    res.redirect('/admin/orders');
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).send('Internal Server Error');
  }
};





module.exports={

    // admin login functions
    loadlogin,
    login,
    logout,
    dashboard,


    // users functions
    loadusers,
    usersearch,
    block,
    unblock,


    // product functions
    products,
    loadproductEdit,
    removeImage,
    productEdit,
    productDelete,
    loadaddproduct,
    addproduct,


    // catogory functions
    loadcatogory,
    loadaddcatogory,
    addNewCategory,
    loadeditCategory,
    updateCategory,
    deleteCategory,
    Categorysearch,



   // banner functions
    banner,
    loadaddbanner,
    addNewbanner,
    loadeditBanner,
    editBanner,
    deleteBanner,




   // coupen functions
    coupen,
    loadaddcoupen,
    addcoupen,
    deleteCoupen,





   // order functions
    orders,
    vieworder,
    updateStatus,
}