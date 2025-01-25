const {Router} = require("express");
const router = Router();
const { handleSignIn,handleSignUp } = require("../controllers/auth");

router.route("/sign-in").post(handleSignIn);
router.route("/sign-up").post(handleSignUp);

module.exports=router;