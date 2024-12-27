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
  
  export const GetIncome = async (req, res) => {
    try {
      // Aggregate to fetch credited transactions and sum the credited amounts
      const creditTransactions = await Money_Tracker.aggregate([
        { $match: { transactionType: 'credited' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDouble: "$amount" } }, // Sum of credited amounts
          },
        },
      ]);
  
      // Aggregate to fetch debited transactions and sum the debited amounts
      const debitTransactions = await Money_Tracker.aggregate([
        { $match: { transactionType: 'debited' } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDouble: "$amount" } }, // Sum of debited amounts
          },
        },
      ]);
  
      // If there are no credit transactions or debit transactions, ensure default values
      const totalCreditAmount = creditTransactions.length > 0 ? creditTransactions[0].totalAmount : 0;
      const totalDebitAmount = debitTransactions.length > 0 ? debitTransactions[0].totalAmount : 0;
  
      // Calculate the total income (credited amount - debited amount)
      const totalIncome = totalCreditAmount - totalDebitAmount;
  
      console.log("Credit Transactions:", creditTransactions);
      console.log("Debit Transactions:", debitTransactions);
      console.log("Total Income:", totalIncome);

  
      // Send a success response with the retrieved data and total amounts
      return res.status(200).json({
        totalIncome: totalIncome, // Calculated total income (credited - debited)
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




  export const Edit_Details = async (req, res) => {
    try {
      // Extract transaction ID and the updated details from the request body
      const { transactionId, account, transactionType, amount, name, date } = req.body;
  
      // Validate that all necessary fields are provided
      if (!transactionId || !account || !transactionType || !amount || !name || !date) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required',
        });
      }
  
      // Find the transaction by ID
      const transaction = await Money_Tracker.findById(transactionId);
  
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }
  
      // Update the transaction details
      transaction.account = account;
      transaction.transactionType = transactionType;
      transaction.amount = amount;
      transaction.name = name;
      transaction.date = date;
  
      // Save the updated transaction
      await transaction.save();
  
      return res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        data: transaction, // Return the updated transaction
      });
  
    } catch (error) {
      // Handle any errors and send an error response
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to edit transaction details",
        error: error.message,
      });
    }
  };
  

  export const Delete_SMS = async (req, res) => {
    try {
      // Assuming the expense or SMS is identified by an 'id' passed in the request params
      const { id } = req.body;
  
      // Ensure that an ID is provided
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "No transaction ID provided",
        });
      }
  
      // Assuming you are using a database model named 'Expense' or similar
      const deletedExpense = await Money_Tracker.findByIdAndDelete(id);
  
      // If no transaction is found with the provided ID
      if (!deletedExpense) {
        return res.status(404).json({
          success: false,
          message: "Expense not found",
        });
      }
  
      // If deletion is successful
      return res.status(200).json({
        success: true,
        message: "Expense deleted successfully",
      });
    } catch (error) {
      // Handle any errors and send an error response
      return res.status(500).json({
        success: false,
        message: "Failed to delete transaction",
        error,
      });
    }
  };
  