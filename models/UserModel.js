import mongoose from "mongoose";



const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
},{timestamps:true})

const User = mongoose.model('User-Data',UserSchema)

export default User