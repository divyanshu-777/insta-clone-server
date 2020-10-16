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
                       // console.log(user,posts);
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

module.exports = Route;