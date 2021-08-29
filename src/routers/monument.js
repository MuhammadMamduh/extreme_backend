const express = require('express');
const sharp = require('sharp');
const moment = require('moment');
const Monument = require('../models/monument');
const User = require('../models/user');
const router = express.Router();
const {auth, authRole} = require('../middleware/auth');
const upload = require('../middleware/upload');


// POST Art
router.post('/art', auth, authRole("ADMIN"), upload.single('picture'), async(req, res)=>{
    console.log(req.body); // testing purposes
    console.log(req.user._id); // testing purposes
    const newMonument = new Monument({...req.body, createdBy: req.user._id});
    
    try{
        const buffer = await sharp(req.file.buffer).resize({width: 500, height: 400}).toBuffer();
        // const buffer = await sharp(req.file.buffer).resize({width: 500, height: 400}).png().toBuffer();
        newMonument.picture = buffer; // in order to access the buffer in 'req.file.buffer' i must remove the dest property while creating the multer object (see line: 6)
        await newMonument.save();

        res.status(201).send(newMonument);
    }catch(err){
        console.log(err);
        res.status(500).send({msg: "The server encountered an unexpected condition that prevented it from fulfilling the request."});
    }
}, 
(error, req, res, next)=>{
    res.status(400).send({msg: error});
});


// GET ALL Art
router.get('/art', async(req, res) => {
    try{
        let monuments = await Monument.find({deleted: false}).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit)).sort({'updatedAt': -1});

        res.status(200).send(monuments);
    }catch(err){
        console.log(err.message);

        res.status(500).send({msg: "The server encountered an unexpected condition that prevented it from fulfilling the request."});
    }
});

// Art Count
router.get('/art/count', async(req, res) => {
    try{
        let art = await Monument.find({deleted: false});

        res.status(200).send({length:art.length});
    }catch(err){
        console.log(err.message);
        res.status(500).send({msg: "The server encountered an unexpected condition that prevented it from fulfilling the request."});
    }
});

// GET a work of Art
router.get('/art/:id', async(req, res)=>{

    try{
        if(!Monument.validateId(req.params.id)){
            throw new Error("Resource Not Found");
        }

        const monument = await Monument.findOne({_id: req.params.id, deleted: false}).populate("createdBy");
        if(!monument)
        {
            throw new Error("Resource Not Found");
        }
        res.status(200).send(monument);
    }catch(err){
        console.log(err.message);

        if(err.message.includes("Resource Not Found"))
        {
            res.status(404).send({msg: err.message});
        }
        res.status(500).send({msg: "The server encountered an unexpected condition that prevented it from fulfilling the request."});
    }

});

// Update Art
router.patch('/art/:id', auth, authRole("ADMIN"), upload.single('picture'), async (req, res)=>{
    const allowed = ['artist', 'description', 'picture'];
    console.log(req.body);
    const upcoming = Object.keys(req.body);

    const validUpdate = upcoming.every((member)=>allowed.includes(member));

    if(!validUpdate)
    {
        res.status(403).send({error: 'A Field or more is NOT valid'});
    }
    if(!Monument.validateId(req.params.id)){
        return res.status(404).send({error: 'Resource Not Found'});
    }

    try{
        const monument = await Monument.findOne({_id: req.params.id, createdBy:req.user._id}); // AndUpdate(req.params.id,req.body, {new:true, runValidators:true}

        if(!monument)
        {
            res.status(404).send({error: 'Resource Not Found'});
        }
        upcoming.forEach((item)=> monument[item]=req.body[item]);

        await monument.save();
        res.status(200).send(monument);
    }catch(err){
        console.log(err);

        res.status(500).send({msg: "The server encountered an unexpected condition that prevented it from fulfilling the request."});
        
    }
});


// HardDelete Art
router.delete('/art/:id', auth, authRole("ADMIN"), async(req, res)=>{
    try{
        if(!Monument.validateId(req.params.id)){
            throw new Error("Resource Not Found");
        }

        const monument = await Monument.findOneAndRemove({_id: req.params.id})
        if(!monument)
        {
            throw new Error("Resource Not Found");
        }
        res.status(204).send({msg:"done"});
    }catch(err){
        console.log(err.message);

        if(err.message.includes("Resource Not Found"))
        {
            res.status(404).send({msg: err.message});
        }
        res.status(500).send({msg: "The server encountered an unexpected condition that prevented it from fulfilling the request."});
    }
});

// _____________________________________________________________________________________________________
// SoftDelete Art
router.patch('/art/delete/:id', auth, authRole("ADMIN"), async(req, res)=>{
    try{
        if(!Monument.validateId(req.params.id)){
            throw new Error("Resource Not Found");
        }

        const monument = await Monument.findOne({_id: req.params.id, deleted: false})
        if(!monument)
        {
            throw new Error("Resource Not Found");
        }
        monument.deleted = true;
        await monument.save();
        res.status(204).send({msg:"done"});
    }catch(err){
        console.log(err.message);

        if(err.message.includes("Resource Not Found"))
        {
            res.status(404).send({msg: err.message});
        }
        res.status(500).send({msg: "The server encountered an unexpected condition that prevented it from fulfilling the request."});
    }
});
// Get Art image ONLY
router.get('/monument/:id/image', async(req, res)=>{
    try {
        if(!Monument.validateId(req.params.id)){
            throw new Error("Resource Not Found");
        }
        const monument = await Monument.findById(req.params.id);
    
        if(!monument || !monument.image)
        {
            throw new Error("Resource Not Found");
        }

        res.set('Content-Type', 'image/png');
        res.status(200).send(monument.image);
    } catch (err) {
        res.status(404).send(err.message);
    }
});
module.exports = router;