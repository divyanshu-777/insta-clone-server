const joi = require('joi');
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');
const validation = require('../helper/validation');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Route = express.Router();

const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'divyanshucoolrocks@gmail.com',
        pass: config.get("password")
    }
})



Route.post('/sign-up',
    validation(joi.object({
        Username: joi.string().required().max(15),
        Email: joi.string().email().required().trim(),
        Password: joi.string().min(5).max(10).required(),
        Profilepic: joi.string().required()
    })),

    async (req, res) => {
        const { Username, Email, Password, Profilepic } = req.body;
        try {
            let finduser = await User.findOne({ Email: req.body.Email });

            if (finduser) {
                res.status(422).send({
                    message: "Email Already registered",
                    status: "422",
                    data: null
                })
            }
            else {
                bcrypt.hash(Password, 10, async (err, hash) => {

                    if (err) {
                        return res.status(500).send({
                            Error: err
                        });
                    }

                    const user = new User({
                        Username,
                        Email,
                        Profilepic,
                        Password: hash
                    });

                    const Saveuser = await user.save();

                    res.status(200).send({
                        data: Saveuser,
                        message: "user created Successfully",
                        status: "200"
                    });

                    transporter.sendMail({
                        to: Saveuser.Email,
                        from: 'divyanshucoolrocks@gmail.com',
                        subject: "Account Created Successfully",
                        html: "<h1> Welcome to Instagram App</h1>"
                    })
                    .then(res => {
                        console.log("Email send");
                    })
                    .catch(err => console.log(err))
                })
            }
        }
        catch (error) {
            res.status(500).json({
                message: "Internal server error",
                error,
                status: "500"
            });
        }

    })


Route.post('/sign-in',
    validation(joi.object({
        Email: joi.string().trim().email().required(),
        Password: joi.string().min(5).max(10).required()
    })),
    async (req, res) => {
        try {
            var data = await User.findOne({ Email: req.body.Email });
            if (!data) {
                res.status(422).send({
                    message: "Invalid credentails",
                    status: "422"
                });
            }
            else {
                bcrypt.compare(req.body.Password, data.Password, (err, result) => {
                    if (err) {
                        return res.status(401).json({
                            message: "Auth failed",
                            status: "401"
                        })
                    }
                    if (result) {
                        const accessToken = jwt.sign(data.Email, config.get("jwt_secret"));
                        const { _id, Username, Email, Followers, Following, Profilepic } = data;
                        res.status(200).json({
                            token: accessToken,
                            user: { _id, Username, Email, Followers, Following, Profilepic },
                            message: 'Sign in successful',
                            status: "200"
                        });
                    }

                })
            }
        } catch (error) {
            console.log("ERROR -> ", error);
            res.status(500).json({
                message: "Internal server error",
                status: "500"
            });
        }
    }
);


Route.post('/reset-password', (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
        }
        else {
            const token = buffer.toString("hex")

            User.findOne({ Email: req.body.Email })
                .then(user => {
                    if (!user) {
                        return res.status(422).send({
                            err: "User doesn't Exist"
                        })
                    }
                    user.ResetToken = token;
                    user.ExpireToken = Date.now() + 3600000;
                    user.save().then(result => {
                        transporter.sendMail({
                            to: user.Email,
                            from: 'divyanshucoolrocks@gmail.com',
                            subject: "Password Reset",
                            html: `<p>You requested for Password reset</p>
                               <h5> Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset your Password</h5>`
                        })
                        res.send({
                            message: "Check your Email"
                        })
                    })
                        .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
        }
    })
})

Route.post('/new-password', (req, res) => {
    const { newPass, sentToken } = req.body;
    User.findOne({ ResetToken: sentToken, ExpireToken: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                return res.status(422).send({
                    message: "Session Expired"
                })
            }
            bcrypt.hash(newPass, 10).then(hashedPass => {
                user.Password = hashedPass,
                    user.ResetToken = undefined,
                    user.ExpireToken = undefined
                user.save()
                    .then(saveduser => {
                        res.json({
                            message: "Password Updated Successfully"
                        })
                    })
                    .catch(err => console.log(err))
            })
        })
        .catch(err => console.log(err));
})

module.exports = Route;


