import User from "../models/UserModel.js";
import bcrypt from 'bcrypt'
import e from "express";
import jwt from 'jsonwebtoken'
import Money_Tracker from "../models/Money_Tracker_Model.js";


export const Register = async (req,res)=>{
    try {
        const {username, email , password } = req.body
        
        // check if user is Register or not
        const checkRegistraionStatus = await User.findOne({ email })

        if(checkRegistraionStatus)
        {
            return res.status(409).json({
                success:false,
                message:"User Already Registered"
            })
        }


        // hashing Password
        const hashPassword = bcrypt.hashSync(password,10)


        const newUser  = new User({
            username, email , password: hashPassword
        })

        await newUser.save()

        res.status(200).json({
            success:true,
            message:'Registration Success'
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Registration Failed , Try Again!",
            error
        })
        console.log(error);
        
    }
}




export const Login = async (req,res)=>{
    try {
        const {email , password } = req.body
        
        // check if user is Register or not
        const user = await User.findOne({ email }).lean().exec()

        if(!user)
        {
            return res.status(403).json({
                success:false,
                message:"Invaild Login Credentials"
            })
        }


        // check Password

        const isVPassword = await bcrypt.compare(password,user.password)

        if(!isVPassword)
            {
                return res.status(403).json({
                    success:false,
                    message:"Invaild Login Credentials"
                })
            }

        delete user.password

        const token = jwt.sign(user , process.env.JWT_SEC)

        res.cookie('user_logged_In', token,{
            httpOnly:true,

        })
     

        res.status(200).json({
            success:true,
            message:'Login Success.'
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Registration Failed , Try Again!",
            error
        })
        console.log(error);
        
    }
}


export const Fetch_SMS_FROM_PHONE = async (req, res) => {
    try {
      console.log('Received request body:', req.body);  // Log the incoming request
      const { account, transactionType, amount, name, date } = req.body;
  
      const newM_T = new Money_Tracker({
        account, transactionType, amount, name, date
      });
  
      await newM_T.save();
      return res.status(200).json({
        message: "SMS received successfully",
        MONEY_TRACKER_INFO: newM_T,
      });
  
    } catch (error) {
      console.error('Error while processing SMS:', error);  // Log the error details
      return res.status(500).json({
        success: false,
        message: "SMS Failed to receive!",
        error: error.message || error,
      });
    }
  };
  

export const getAllMoneyTrackerData = async (req, res) => {
    try {
      // Fetch all documents from the Money_Tracker collection
      const allMoneyTrackerData = await Money_Tracker.find();
  
      // Send a success response with the retrieved data
      return res.status(200).json({
        message: "All transaction details fetched successfully",
        data: allMoneyTrackerData,
      });
    } catch (error) {
      // Handle any errors and send an error response
      return res.status(500).json({
        success: false,
        message: "Failed to fetch transaction details",
        error,
      });
    }
  };
  
  export const allDebited = async (req, res) => {
    try {
      // Use aggregate to fetch debited transactions and sum the debited amounts
      const debitedTransactions = await Money_Tracker.aggregate([
        { $match: { transactionType: 'debited' } }, // Filter debited transactions
        {
          $group: {
            _id: null, // No grouping, we're calculating the total sum
            totalAmount: { $sum: { $toDouble: "$amount" } }, // Sum of the 'amount' field (ensure it's a number)
          },
        },
      ]);
  
      // Fetch the details of debited transactions (excluding total)
      const transactionDetails = await Money_Tracker.find({ transactionType: 'debited' });
  
      // Send a success response with the retrieved data and total debited amount
      return res.status(200).json({
        message: "All transaction details fetched successfully",
        data: transactionDetails,
        totalAmount: debitedTransactions.length > 0 ? debitedTransactions[0].totalAmount : 0, // Total debited amount
      });
    } catch (error) {
      // Handle any errors and send an error response
      return res.status(500).json({
        success: false,
        message: "Failed to fetch transaction details",
        error,
      });
    }
  };


  
  export const allCredited = async (req, res) => {
    try {
      // Use aggregate to fetch credited transactions and sum the credited amounts
      const creditTransactions = await Money_Tracker.aggregate([
        { $match: { transactionType: 'credited' } }, // Filter credited transactions
        {
          $group: {
            _id: null, // No grouping, we're calculating the total sum
            totalAmount: { $sum: { $toDouble: "$amount" } }, // Sum of the 'amount' field (ensure it's a number)
          },
        },
      ]);
  
      // Fetch the details of credited transactions (excluding total)
      const transactionDetails = await Money_Tracker.find({ transactionType: 'credited' });
  
      // Send a success response with the retrieved data and total credited amount
      return res.status(200).json({
        message: "All credited transaction details fetched successfully",
        data: transactionDetails,
        totalAmount: creditTransactions.length > 0 ? creditTransactions[0].totalAmount : 0, // Total credited amount
      });
    } catch (error) {
      // Handle any errors and send an error response
      return res.status(500).json({
        success: false,
        message: "Failed to fetch credited transaction details",
        error,
      });
    }
  };
  