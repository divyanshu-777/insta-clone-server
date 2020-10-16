const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types

const UserSchema = mongoose.Schema({
    Username:
    {
        type: String,
        required: true
    },

    Email:
    {
        type: String,
        required: true,
        unique: true
    },

    Password:
    {
        type: String,
        required: true
    },

    Profilepic:
    {
        type: String,
    },

    ResetToken:
    {
        type: String
    },
    ExpireToken:
    {
        type: Date
    },

    Followers: [{ type: ObjectId, ref: "User" }],

    Following: [{ type: ObjectId, ref: "User" }]
});

module.exports = mongoose.model('User', UserSchema);