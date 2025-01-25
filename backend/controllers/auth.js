const User = require("../models/user");

async function handleSignUp(req,res) {
    try {
        console.log("Accepted post-req signup")
        const {username,email,password} = req.body;
        console.log({username,email,password});
        return res.json({success:true});
    } catch(error) {
        console.log(error.message);
        return res.json({success:true,message:"Failed"});
    }
}

async function handleSignIn(req,res) {
    
}


module.exports={handleSignIn,handleSignUp};