import jwt  from "jsonwebtoken";
export const authenticate = (req,res,next)=>{

    try {
        const token = req.cookies.user_logged_In
        if (!token) {
            return res.status(403).json({
                message:"Unauthorized!.."
            })
        }
        
        const user = jwt.verify(token,process.env.JWT_SEC)

        req.user = user
        next()
    } catch (error) {
        res.status(403).json({
            message:"Unauthorized!",
            message:error.message
        })
    }
}