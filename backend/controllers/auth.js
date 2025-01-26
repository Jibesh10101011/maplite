const User = require("../models/user");

async function handleSignUp(req,res) {
    try {
        console.log("Accepted post-req signup")
        const {username,email,password} = req.body;
        if(!username && !email && !password) 
            return res.status(200).json({success:false,message:"username,email & password feilds are required"});
        
        await User.create({
            username,
            email,
            password
        });
        return res.json({success:true,redirect:"/auth/signin"});
    } catch(error) {
        console.log(error.message);
        return res.json({success:false,message:"Failed"});
    }
}

async function handleSignIn(req,res) {
    try {
        const {email,password} = req.body;
        console.log("Post req. in /auth/sign-in received");
        if(!email && !password) 
            return res.status(200).json({sucess:false,message:"Email and Password are required!"});
        
        const token = await User.matchPasswordAndCreateToken(email,password);
        console.log("Successfull SignIn");
        return res.cookie("token",token).json({success:true,token});
    } catch(error) {
        console.log(error.message);
        return res.json({success:false,message:"Invalid Username or Password"});
    }
}


module.exports={handleSignIn,handleSignUp};