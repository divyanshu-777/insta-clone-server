const express = require('express');
const mongoose = require('mongoose');
const Post = mongoose.model("Post")
const verifyJwtToken = require('../helper/jwt');
const User = mongoose.model("User")

const Route = express.Router();

Route.get('/users-profile/:id', verifyJwtToken, (req, res) => {
    User.findOne({ _id: req.params.id })
        .select("-Password")
        .then(user => {
            Post.find({ Postedby: req.params.id })
                .populate("Postedby", "_id name")
                .exec((err, posts) => {
                    if (err) {
                        return res.status(422).send({
                            err
                        })
                    }
                   
                    else {
                       return res.send({
                            user,
                            posts
                        })
                    }
                })
        })
        .catch(err => {
            return res.send({
                err,
                message: "User not found"
            })
        })
})


Route.post('/search-users',(req,res)=>{
    let pattern = new RegExp("^"+req.body.query)
    if(req.body.query!==""){
    User.find({Email : {$regex : pattern}})
    .select("_id Email")
    .then(user=>{
        res.json({
            user
        })
    })
    .catch(err=>{
        console.log(err);
    })
}
})

Route.get('/all-users',verifyJwtToken,(req,res)=>{
    User.find({})
    .select("_id Email Username Profilepic")
    .then(user=>{
        res.status(200).json({
            user
        })
    })
    .catch(err=>{
        res.json({
            err
        })
    })
})


module.exports = Route;