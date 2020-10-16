const config = require('config');
const jwt = require('jsonwebtoken');
const  mongoose  = require('mongoose');
const User = mongoose.model("User");

module.exports = (req,res,next)=>{
    
    const AuthHeader = req.headers.authorization;

    if(AuthHeader){
        const token = AuthHeader.split(" ")[1];
        jwt.verify(token,config.get("jwt_secret"),(err,payload)=>{
            
            if(err){
              
                res.status(401).send({
                    message : "Invalid token"
                });
            }
            else{
              User.findOne({Email :payload}).then(userdata=>{
                  req.user = userdata;
                  next();
              });
            }
        })
    }

    else{
        res.status(403).send({
            message : "Unauthorise Access"
        });
    }
};
