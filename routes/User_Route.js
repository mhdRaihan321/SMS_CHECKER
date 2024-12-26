import express from 'express'
import { allCredited, allDebited, Fetch_SMS_FROM_PHONE, getAllMoneyTrackerData, GetIncome, Login, Register } from '../Controllers/UserAuth-Controller.js'
import { authenticate } from '../MiddileWire/authenticate.js'

const router = express.Router()

router.post('/register-user',Register)
router.post('/login-user',Login)
router.post('/fetch-sms-bank', Fetch_SMS_FROM_PHONE)
router.get('/get-all-info-fetched-sms-bank', getAllMoneyTrackerData);
router.get('/get-all-debited', allDebited)
router.get('/get-all-credited', allCredited)
router.get('/get-income', GetIncome)
router.get('/get-user',authenticate, (req,res)=>{
    res.status(200).json({
        status:true,
        message:'Logged',
        data: req.user
        // 1.27.01
    })
})


export default router
