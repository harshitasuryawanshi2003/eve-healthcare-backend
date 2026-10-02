const mongoose = require("mongoose");

const userSchema = new mongoose.Schema( {
    name:{
        type: String,
        required: true,
        trim:true,
    },
    email: {
        type:String,
        required: true,
        trim:true,
        lowercase: true,
    },
    password:{
        type:String,
        required:true,
        minlength: 6,
    },
    role: {
        type: String,
        enum:["ADMIN", "USER"],
        default: "USER",
    }
});

module.exports = mongoose.model("user",userSchema);