const express = require('express');

const User = require('../models/user');
const Monument = require('../models/monument');
const router = express.Router();
const auth = require('../middleware/auth');

// Sign Up
router.post('/user', async(req, res)=>{
    try{
        const newUser = new User(req.body);
        await newUser.save(); // create
        
        // This is another approach, to 
        // const token = await newUser.generateAuthToken(); // & authorize

        res.status(201).send({newUser});
    }catch(err){
        console.log(err);

        if(err.message.includes("duplicate key error collection"))
        {
            res.status(409).send({title: "Conflict", msg: "This Username is already taken"}); 
        }
        else if(err.message.includes("Role should be either ADMIN or GUEST"))
        {
            res.status(400).send({title: "Bad Request", msg: "Role should be either ADMIN or GUEST"}); 
        }
        else if(err.errors.password)
        {
            res.status(400).send({title: "Bad Request", msg: "The passwors should contain at least 7 chars"}); 
        }
        else if(err.errors.phone)
        {
            res.status(400).send({title: "Bad Request", msg: "This is NOT a valid phone number"}); 
        }
        else{
            res.status(500).send({title: "Internal Server Error", msg: "The server encountered an unexpected condition that prevented it from fulfilling the request."}); 
        }
    }
});

// Login
router.post('/login', async(req, res)=>{
    try{    
        const user = await User.findUserByCredentials(req.body.username, req.body.password);
        const token = await user.generateAuthToken();

        res.status(200).send({user, token}); // it's VIP to send the generated token back to the user, because thats what he'll use to authenticate in the future.
    }catch(err){
        console.log(err);
        
        res.status(400).send({msg: err.message});
    }
});

// Logout
router.post('/logout', auth, async(req, res)=>{
    try{
        const token = req.token;

        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token;
        })

        await req.user.save();

        res.status(200).send({msg: "Logged Out"})
    }catch(err){
        console.log(err);

        res.status(400).send(err);
    }
});

// Hard-Logout
router.post('/logoutAll', auth, async(req, res)=>{
    try{
        req.user.tokens = [];

        await req.user.save();

        res.status(200).send({msg: "Logged Out From All the devices"})
    }catch(err){
        console.log(err);

        res.status(400).send(err);
    }
});

// User's Profile
router.get('users/me', (req, res)=>{

});


// get all users (Testing)
router.get('/users', async (req, res) => {
    try{
        const users = await User.find({});
        res.status(200).send({users});
    }catch(err){
        console.log(err);
        
        es.status(500).send({err: "sth went wrong"});
    }
});

module.exports = router;
