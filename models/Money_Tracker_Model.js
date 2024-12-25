import mongoose from "mongoose";


const Money_Tracker_Schema = new mongoose.Schema({
    account:{
        type: String,
        required: true,
    },
    transactionType:{
        type: String,
        required: true,
    },
    amount:{
        type: String,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    date:{
        type: String,
        required: true,
    },
},{timestamps:true})

const Money_Tracker = mongoose.model('Money-Tracker',Money_Tracker_Schema)

export default Money_Tracker