import express, { Router } from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Auth from './routes/User_Route.js'
import cookieParser from "cookie-parser";
import cors from 'cors'


dotenv.config()
const app = express()

const port  = 8080
const db = process.env.MONGODB


app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))

app.listen(port, ()=>{
    console.log("Server Is Running on Port: ",port);
    
})

// DB COnnection

mongoose.connect(db).then(()=>{
    console.log("DATABASE CONNECTED!")
}).catch((err)=>{
    console.log('Connection Failed',err)
})


// Routes


app.use('/api/auth/', Auth)