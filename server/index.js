const express=require('express');
const app=express();
require('./db/config');
const User=require('./db/User.js');
const Product=require('./db/Product.js');
const cors=require('cors');
// const multer =require('multer')
const Jwt=require('jsonwebtoken')
const jwtKey='e-com';



app.use(cors());
app.use(express.json());


app.post("/register",async(req,res)=>{
   let user=new User(req.body)
   let result=await user.save();
   result=result.toObject();
   delete result.password;
   Jwt.sign({result},jwtKey,{expiresIn:"2h"},(err,token)=>{
    if(err){
     res.send({result:"something went to wrong"})
    }
    res.send({result,auth:token})
 })
});


app.post('/login',async(req,res)=>{

    if(req.body.password && req.body.email){
        let user=await User.findOne(req.body).select("-password");
        if(user){
            Jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
               if(err){
                res.send({result:"something went to wrong"})
               }
               res.send({user,auth:token})
            })
           
        }else
        {
         res.send({result:"user not found"})
        }
    }
    else
        {
         res.send({result:"fill user email and password"})
        }
})



app.post('/addProduct',async(req,res)=>{
let product=new Product(req.body);
let result=await product.save();
res.send(result)
})



app.get('/products',async(req,res)=>{
    let products=await Product.find();
    if(products.length>0){
        res.send(products)
    }else{
        res.send({result:"no product found"})
    }
})    

app.delete('/product/:id',async(req,res)=>{
    let id=req.params.id;
    const result=await Product.deleteOne({_id:id})
    res.send(result)
})

app.get('/product/:id',async(req,res)=>{
    let result=await Product.findOne({_id:req.params.id});
    if(result){
    res.send(result)
    }else{
        res.send({result:"No record find"})
    }
})

app.put('/product/:id',async(req,res)=>{
    let id=req.params.id;
    let result=await Product.updateOne({_id:id},{
     $set:req.body
    }
    )
    res.send(result);
})

app.get('/search/:key',async(req,res)=>{
    let result=await Product.find({
        "$or":[
            {name:{$regex:req.params.key}},
            {company:{$regex:req.params.key}},
            {category:{$regex:req.params.key}},
            {price:{$regex:req.params.key}}
        ]
    })
    res.send(result);
})



app.listen(5000,()=>{
    console.log('server run 5000 port')
})