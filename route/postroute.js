const joi = require('joi');
const express = require('express');
const config = require('config');
const Post = require('../models/Post');
const verifyJwtToken = require('../helper/jwt');
const User = require('../models/User');
const { verify } = require('jsonwebtoken');


const Route = express.Router();

Route.post('/create-post', verifyJwtToken, async (req, res) => {

    const { Title, Body, Pic } = req.body;
    try {
        req.user.Password = undefined;
        const post = new Post({
            Title,
            Body,
            Photo: Pic,
            Postedby: req.user
        });

        const savedData = await post.save();
        res.status(200).send({
            post: savedData,
            message: "Posted Successfully"
        });
    }
    catch (error) {
        res.status(500).send({
            error: error
        });
    }
})


Route.get('/all-post', verifyJwtToken, (req, res) => {

    Post.find()
        .populate("Postedby", " _id Username")
        .populate("Comments.Postedby", "_id Username")
        .sort('-CreatedAt')
        .then(post => {
            res.status(200).send({
                post
            })
        })
        .catch(error => {
            res.status(403).send({
                error
            })
        })
})


Route.get('/my-post', verifyJwtToken, (req, res) => {
    Post.find({ Postedby: req.user._id })
        .populate("Postedby", "_id name")
        .then(mypost => {
            res.status(200).send({
                mypost
            })
        })
        .catch(error => {
            res.send(error);
        })
})

Route.put('/comments', verifyJwtToken, (req, res) => {
    const comment = {
        text: req.body.text,
        Postedby: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { Comments: comment }
    }, {
        useFindAndModify: false,
        new: true
    })
        .populate("Comments.Postedby", " _id Username")
        .populate("Postedby", "_id Username")
        .exec((err, result) => {
            if (err) {
                return res.status(422).send({
                    error
                })
            }
            else {
                res.json(result);
            }
        })
})

Route.delete('/delete-post/:postId', verifyJwtToken, (req, res) => {
    Post.findOne({ _id: req.params.postId })
        .populate("Postedby", "_id")
        .exec((err, post) => {
            if (err || !post) {
                return res.status(422).send({
                    error
                })
            }
            if (post.Postedby._id.toString() === req.user._id.toString()) {
                post.remove()
                    .then(result => {
                        res.json({
                            result
                        });
                    })
                    .catch(err => {
                        res.send({
                            error
                        })
                    })
            }
            else {
                res.send({
                    message: "You are not allowed to delete this post"
                })
            }
        })
})


Route.put('/follow', verifyJwtToken, (req, res) => {
    User.findByIdAndUpdate(req.body.followId, {
        $push: { Followers: req.user._id }
    },
        {
            new: true,
            useFindAndModify: false,
        },
        (err, result) => {
            if (err) {
                return res.status(422).send({
                    err
                })
            }
            User.findByIdAndUpdate(req.user._id, {
                $push: { Following: req.body.followId }
            },
                {
                    new: true,
                    useFindAndModify: false,
                })
                .select("-Password")
                .then(data => {
                    return res.send({
                        data
                    })
                })
                .catch(err => {
                    return res.send({
                        err
                    })
                })
        })
})


Route.put('/unfollow', verifyJwtToken, (req, res) => {
    User.findByIdAndUpdate(req.body.unfollowId, {
        $pull: { Followers: req.user._id }
    },
        {
            new: true,
            useFindAndModify: false,
        },
        (err, result) => {
            if (err) {
                return res.status(422).send({
                    err
                })
            }
            User.findByIdAndUpdate(req.user._id, {
                $pull: { Following: req.body.unfollowId }
            },
                {
                    new: true,
                    useFindAndModify: false,
                })
                .select("-Password")
                .then(data => {
                    return res.send({
                        data
                    })
                })
                .catch(err => {
                    return res.send({
                        err
                    })
                })
        })
})


Route.delete('/delete-user',verifyJwtToken,(req,res)=>{
    User.findByIdAndRemove(req.user._id,{
        new: true,
        useFindAndModify: false,
    })
    .then(result=>{
       Post.deleteMany({Postedby:req.user._id},
        {
            new: true,
            useFindAndModify: false,
        })
        .then(posts=>{
            res.send({
                result,
                posts
            })
        })
        .catch(err=>{
            res.send({
                err
            })
        })
    })
    .catch(err=>{
        res.send({
            err
        })
    })
})

module.exports = Route;