
//library app // Main Server

const express=require('express');
const app = new express();
const multer = require('multer');
const cors=require('cors');
const jwt=require('jsonwebtoken');
const Bookdata=require('./src/model/Bookdata');
const Authordata=require('./src/model/Authordata')
const User = require('./src/model/Userdata');

email='admin@gmail.com';
password='Admin123@';

//PORT
const port=process.env.PORT || 8000;


app.use(cors());

// POST middleware
app.use(express.urlencoded({extended:true}));
app.use(express.json()); 


//middleware function..static
app.use(express.static('./public'));


// multer setup

// setting up storage folder destination and filename
const storage = multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, './public/images');
    },
    filename: function (req, file, callback) {
      callback(null, file.originalname);
    }
  });
  
 // specifying file type
  const fileFilter = (req,file,callback)=>{
   if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
   callback(null,true);
   }
   else{
       callback(null,false);
   }
  }
  
  
  const upload = multer({
      storage: storage,
      fileFilter:fileFilter
    });
  

// multer ends

//middleware for verifying token
function verifyToken(req, res, next) {
  if(!req.headers.authorization) {
    return res.status(401).send('Unauthorized request')
  }
  let token = req.headers.authorization.split(' ')[1]
  if(token === 'null') {
    return res.status(401).send('Unauthorized request')    
  }
  let payload = jwt.verify(token, 'secretKey')
  if(!payload) {
    return res.status(401).send('Unauthorized request')    
  }
  req.userId = payload.subject
  next()
}



// books
app.get('/books',function(req,res){
    res.header("Access-Control-Allow-Origin","*")
    res.header("Access-Control-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
        Bookdata.find()
        .then(function(books){
           res.send(books)     
        })
    })


 // addbook
app.post('/addbook',verifyToken,upload.single('image'),function (req,res){
    res.header("Access-Control-Allow-Origin","*")
    res.header("Access-Control-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    console.log(req.file);
 var item={
   title:req.body.title,
   author:req.body.author,
   genre:req.body.genre,
   content:req.body.content,
   image: 'http://localhost:8000/images/'+ req.file.filename
}
var book = Bookdata(item);
book.save();
})


//getting id
app.get('/book/:id',  (req, res) => {
  
  const id = req.params.id;
    Bookdata.findOne({"_id":id})
    .then((book)=>{
        res.send(book);
    });
})


//updatebook
app.put('/updatebook',upload.single('image'),(req,res)=>{
  console.log(req.file)
  console.log(req.body)
  id=req.body.id,
  title= req.body.title,
  author = req.body.author,
  genre = req.body.genre,
  content = req.body.content,
  image = 'http://localhost:8000/images/'+ req.file.filename
  
 Bookdata.findByIdAndUpdate({"_id":id},
                              {$set:{"title":title,
                              "author":author,
                              "genre":genre,
                              "content":content,
                              "image":image}})
 .then(function(){
     res.send();
 })
})


//delete book
app.delete('/delete/:id',(req,res)=>{
   
  id = req.params.id;
  Bookdata.findByIdAndDelete({"_id":id})
  .then(()=>{
      console.log('success')
      res.send();
  })
})
         
// ..................................................


 //author
app.get('/authors',function(req,res){
  res.header("Access-Control-Allow-Origin","*")
  res.header("Access-Control-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  Authordata.find()
  .then(function(authors){
     res.send(authors)     
  })
})

 // addauthor
 app.post('/addauthor',verifyToken,upload.single('image'),function (req,res){
  res.header("Access-Control-Allow-Origin","*")
  res.header("Access-Control-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  console.log(req.file);
 var item={
 author:req.body.author,
 content:req.body.content,
 image: 'http://localhost:8000/images/'+ req.file.filename
}
var author = Authordata(item);
author.save();
})


//getting id
app.get('/author/:id',  (req, res) => {
  
  const id = req.params.id;
    Authordata.findOne({"_id":id})
    .then((author)=>{
        res.send(author);
    });
})


//update author
app.put('/updateauthor',upload.single('image'),(req,res)=>{
  console.log(req.file)
  console.log(req.body)
  id=req.body.id,
  author = req.body.author,
  content = req.body.content,
  image = 'http://localhost:8000/images/'+ req.file.filename
  
 Authordata.findByIdAndUpdate({"_id":id},
                              {$set:{
                              "author":author,
                              "content":content,
                              "image":image}})
 .then(function(){
     res.send();
 })
})


//delete author
app.delete('/deleteauthor/:id',(req,res)=>{
   
  id = req.params.id;
  Authordata.findByIdAndDelete({"_id":id})
  .then(()=>{
      console.log('success')
      res.send();
  })
})


    //signup
    
      app.post('/signup', (req, res) => {
      res.header("Access-Control-Allow-Origin","*")
      res.header("Access-Control-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
      // console.log("hi")
        console.log(req.body);
         User.findOne({email : req.body.email}).exec(function(err,user){
        console.log(user);
        if(user) {
          res.status(401).send('User exists')
          console.log("user exists");
        } 

        else{

         var data = {
              firstname : req.body.firstname,
              lastname: req.body.lastname,
              email : req.body.email,
              password : req.body.password,
              phone: req.body.phone,
              address: req.body.address
    }
    var data = new User(data);
    data.save();
  }
})
 })
 


//login
app.post('/login', (req, res) => {
  res.header("Access-Control-Allow-Origin","*")
  res.header("Access-Control-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");

      
      if(req.body.email=="admin@gmail.com" && req.body.password=="Admin123@"){
        let payload={subject:email+password}
        let token=jwt.sign(payload,'secretKey')  
        res.status(200).send({token})
        console.log("token")
      }
      else{
        User.findOne({email: req.body.email, password:req.body.password},function(err,user){

          if(!user){ 
            res.status(401).send('User not registered')
          }
          else{
           res.status(200).send({user})
           console.log("success")
          }
        })
      }
    
  })
  

//port

app.listen(port,()=>{
    console.log("Server Ready at"+port);
});