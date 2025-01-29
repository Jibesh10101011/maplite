const {Router} = require("express");
const router = Router();
const { handleSignIn,handleSignUp,handleTokenValidation } = require("../controllers/auth");

router.route("/sign-in").post(handleSignIn);
router.route("/sign-up").post(handleSignUp);
router.route("/validate-token").get(handleTokenValidation);

module.exports=router;