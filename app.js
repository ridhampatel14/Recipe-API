//here is where you'll set up your server as shown in lecture code.
const express = require('express');
const app = express();
const configRoutes = require('./routes');
const session = require('express-session');

const objc={};

app.use(express.json());

app.use(session({
  name: 'AuthCookie',
  secret: "some secret string!",
  saveUninitialized: true,
  resave: false,
}));

app.use((req, res, next) => {
  console.log('URL:- ',req.url);
  console.log('HTTP verb:- ',req.method);
  const body=JSON.parse(JSON.stringify(req.body)); 
  if(body.password){
    delete body.password;
  }
  console.log('Request Body:- ',body)
  next();
});

app.use((req, res, next) => {
  if(req.originalUrl in objc){
    objc[req.originalUrl]=objc[req.originalUrl]+1
  }else{
    objc[req.originalUrl]=1
  }
  console.log(objc)
  next();
});

app.use('/login',(req, res, next) => {
  if(req.session.user){
    return res.status(401).json({error:'you are already logged-in'});
  }
  next();
});


app.use('/recipes', (req, res, next) => {
  if (!req.session.user) {
    if(req.method==="POST" || req.method==="PUT" || req.method==="PATCH"){
      return res.status(401).json({error:"you have to login toaccess this page"})
    }
  }
  next();
});

app.use('/recipes/:id/comments', (req, res, next) => {
  if (!req.session.user) {
      return res.status(401).json({error:"you have to login to access this page"})
  }
  next();
});

app.use('/recipes/:id/:commentid', (req, res, next) => {
  if (!req.session.user) {
      return res.status(401).json({error:"you have to login to access this page"})
  }
  next();
});

app.use('/recipes/:id/likes', (req, res, next) => {
  if (!req.session.user) {
      return res.status(401).json({error:"you have to login to access this page!!"})
  }
  next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});