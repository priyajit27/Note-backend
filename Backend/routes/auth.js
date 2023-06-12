const express = require('express');
const User=require('../models/User')
const router= express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "ruppaul@yyy"
const fetchuser = require('../middleware/fetchuser')

// create a User using:POST "./api/auth/createUser" .Doesnot reqiure authentication
// Route 1
router.post('/createUser',
// express validation 
[
    body('name','Enter a valid name').isLength({ min: 3 }),
    body('email','Enter a valid mail').isEmail(),
    body('password','Enter a valid password').isLength({ min: 6 }),
],
async(req, res) => {
    let success = false;
    // If there are errors return 404 error message

    //See express validation docs 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: "Sorry a user with this email address already exists"});
    }
    // Check whether the user with same mail exits already
    try {
        
    let user=await User.findOne({ email:req.body.email});
    // if email is matxching with someone
    if(user){
        return res.status(400).json({error:"Sorry a user with this email already exists"})
    }
    // Length 10 ka one hash generates
    const salt =  bcrypt.genSaltSync(10);
    const securedPassword =  bcrypt.hashSync(req.body.password, salt);
    user=await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securedPassword,
      })
       
    
       const data={
        user:{
            id:user.id,
        }
       }
       const authtoken = jwt.sign(data,JWT_SECRET)
            console.log(authtoken);
             success=true;
            // res.json(user)
            res.json({success,authtoken})
    
    }
    
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured")
    }
})


//authenticate a  login  using:POST "./api/auth/login"
// Route 2
router.post('/login',
[
    body('email','Enter a valid mail').isEmail(),
    body('password','Password cannot be blank').exists(),
],
async(req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: "Sorry a user with this email address already exists"});
    }
   

     const {email,password}=req.body
    //  destructing
    try {   
    let user=await User.findOne({ email})
    if(!user){
        success = false
        return res.status(400).json({error:"Please try to login with correct credentials"});
    }
  
    const passswordCompare = await bcrypt.compare(password,user.password)

    if(!passswordCompare){
        success = false
        return res.status(400).json({ success,error:"Please try to login with correct credentials"});
    }
       const data={
        user:{
            id:user.id,
        }
       }
       const authtoken = jwt.sign(data,JWT_SECRET)
            console.log(authtoken);
            // res.json(user)
            success = true;
            res.json({success,authtoken})
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured")
    }
})


//get logged in user details  using:POST "./api/auth/getuser"login required
// Route 3

//              request  response  next          used in fetchuser.js
router.post('/getuser',fetchuser,async(req, res) => {
    try {   
       const userId=req.user.id;
    const user=await User.findOne({userId}).select("-password")
    res.send(user)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured")
    }
})

module.exports = router





