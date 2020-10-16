const mongoose = require('mongoose');
const {ObjectId} =mongoose.Schema.Types 

const PostSchema = mongoose.Schema({
    Title : 
    {
        type : String,
        required : true
    },

    Body : {
       type : String,
       required : true
    },

    Photo :
    {
        type : String,
        required : true
    },

   Comments : [{
       text : String,
       Postedby :{type:ObjectId,ref:"User"}
   }],

    Postedby :
     {
        type :ObjectId,
        ref : "User"
    }
},{timestamps:true});

module.exports = mongoose.model('Post', PostSchema);