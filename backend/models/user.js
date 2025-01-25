const { Schema,model } = require("mongoose");
const { createHmac,randomBytes } = require("crypto");
const { createToken } = require("../services/authentication");

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    salt : {
        type:String,
    },
    password:{
        type:String,
        required:true,
    }
},{
    timestamps:true
});

userSchema.pre("save",function(next) {
    const user = this;
    if(!user.isModified("password")) return;
    const salt = randomBytes(20).toLocaleString();
    const hashedPassword = createHmac('sha256',salt).update(user.password);
    this.salt=salt;
    this.password=hashedPassword;
    next();
});

userSchema.static("matchPasswordAndCreateToken",async function(email,password) {
    const user = await this.findOne({email});
    if(!user)  throw new Error("User not found");
    const hashedPassword = createHmac("sha256",user.salt).update(password);
    if(hashedPassword != user.password) throw new Error("Incorrect Password!");
    return createToken(user);
})

const User = model("UsersMaplite",userSchema);
module.exports=User;