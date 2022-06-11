const express = require("express");
const { check } = require("express-validator");
const teamCon = require("../controllers/team");

const {
  signUp,
  signIn,
  verifyUser,
  verify,
  resetPassword,
  signOut,
  forgotPassword,
  changeForgotPassword,
  changePassword,
  isValidReferral,
} = require("../controllers/auth");

var router = express.Router();

router.post(
  "/signUp",
  [
    check("name", "Name is required").trim(),
    check("email", "email is required").trim().isEmail().normalizeEmail(),
    check("password", "password should be at least 3 chars").isLength({
      min: 3,
    }),
    // check("confirmPassword")
    //   .trim()
    //   .custom((value, { req }) => {
    //     if (value !== req.body.password) {
    //       return Promise.reject("Password did not match!");
    //     }
    //   }),
  ],
  isValidReferral,
  signUp
);

router.post(
  "/signIn",
  [
    check("email", "email is required").trim().isEmail(),
    check("password", "password field is required").isLength({
      min: 1,
    }),
  ],
  signIn
);

router.get("/verifyUser/:token", verifyUser);
router.get(
  "/verifyTeamInvitation/:userId/:teamId",
  teamCon.verifyTeamInvitation
);

router.post("/verify", [check("email", "email is required").isEmail()], verify);

router.post(
  "/reset-password",
  [
    check("oldPassword", "Old password is required"),
    check("newPassword", "New Password is required"),
    check("email", "email is required").isEmail(),
  ],
  resetPassword
);

router.get("/sign-out", signOut);

router.post(
  "/forgot-password",
  [check("email", "Email is required").isEmail()],
  forgotPassword
);

router.get("/forget-password-token/:token", changeForgotPassword);

router.post(
  "/change-password",
  [
    check("password", "Password is required"),
    check("email", "Email is required").isEmail(),
  ],
  changePassword
);

module.exports = router;
