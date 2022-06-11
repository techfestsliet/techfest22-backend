const { validationResult, body } = require("express-validator");
const User = require("../models/user");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { failAction, successAction } = require("../utils/response");
const verifyToken = require("../models/verifyToken");
const mail = require("../utils/mail");
const ejs = require("ejs");

exports.signIn = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(208).json({
      title: "Error",
      message: errors.array()[0].msg,
      isError: true,
    });
  }

  const { email, password } = req.body;

  User.findOne({ email }, async (err, user) => {
    if (err || !user) {
      return res.status(208).json({
        isError: true,
        title: "Error",
        message: "The email is not register!",
      });
    }

    if (!user.isVerified) {
      return res.status(208).json({
        isError: true,
        title: "Error",
        message: "Not verified! Please verify your mail now!",
      });
    }

    try {
      const condition = await bcrypt.compare(password, user.password);
      if (condition) {
        const token = await jwt.sign(
          { id: user._id, role: user.role },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: 7 * 3600 * 60 * 60 * 1000 }
        );
        res.cookie("token", token, { expire: new Date() + 1000 });
        return res.status(200).json({
          token: token,
          userId: user._id,
          isSuccess: true,
          userRole: user.role,
        });
      } else {
        return res.status(208).json({
          isError: true,
          title: "Error",
          message: "The credentials are wrong!",
        });
      }
    } catch (error) {
      return res.status(500);
    }
  });
};

exports.signUp = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(200).json({
      message: errors.array(),
      isError: true,
    });
  }

  if (await User.findOne({ email: req.body.email })) {
    return res.status(208).json({
      title: "Error",
      message: "The email is already registered",
      isError: true,
    });
  }

  const refferalCode = req.body.referralCode;
  const uid = uuid.v4();
  const eArr = req.body.email.split("@");
  const domain = eArr[1];
  const userId = `#TF-${uid}${Date.now().toString()}${eArr[0]}`;
  const password = req.body.password;
  const referralCode =
    `#TF22-` + crypto.randomBytes(3).toString("hex") + eArr[0];
  let payload;

  try {
    const encryptedPassword = await bcrypt.hash(password, 10);
    if (domain === "sliet.ac.in") {
      payload = {
        ...{
          email: req.body.email,
          name: req.body.name,
          verificationCode: uuid.v4(),
          password: encryptedPassword,
          collegeName: "Sant Longowal Institute of Engineering and Technology",
          userId: userId,
          hasPaidEntry: true,
          paymentDetails: {
            isSuccess: true,
            subscriptionType: 599,
            paymentStatus: "Sliet mail Domain",
          },
          regNo: eArr[0],
          referralCode: referralCode,
          institution: "sliet",
        },
      };
    } else {
      payload = {
        ...{
          email: req.body.email,
          name: req.body.name,
          userId: userId,
          referralCode: referralCode,
          password: encryptedPassword,
          verificationCode: uuid.v4(),
          institution: "other",
        },
      };
    }
  } catch (error) {
    return res
      .status(208)
      .json({ isError: true, title: "Error", message: "Something went wrong" });
  }

  if (refferalCode) {
    try {
      User.findOneAndUpdate(
        { referralCode: refferalCode },
        { $inc: { referrals: 1 } },
        (err, user) => {
          console.log(user);
          if (err) {
            return res.status(208).json({
              isError: true,
              title: "Error",
              message: "The referral code is invalid",
            });
          }
        }
      );
    } catch (err) {
      return res.status(200).json({
        title: "Error",
        message: "The referral code is invalid",
        isError: true,
      });
    }
  }

  const user = new User(payload);

  try {
    const token = crypto.randomBytes(32).toString("hex");

    await verifyToken({
      token: token,
      email: req.body.email,
    }).save();

    const uri = `https://api.techfestsliet.com/verifyUser/${token}`;

    mail.sendMail({
      to: req.body.email,
      subject: "Verification Email",
      html: `<h3>Click on the link to verify your email: <br></h3>
      <p><a href=${uri}>Click here</a></p>`,
    });
  } catch (err) {
    return res.status(400).json(failAction(err));
  }

  user.save((err, user) => {
    if (err || !user) {
      console.log(err);
      return res.status(208).json({
        isError: true,
        title: "Error",
        message: "Error in SignUp. Some error occurred",
      });
    }
    return res.status(201).json({
      message: "Verification link has been sent to your mail now!",
      title: "Success",
    });
  });
};

exports.verify = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(
      failAction({
        error: errors.array[0].msg,
      })
    );
  }

  User.findOne({ email: req.body.email }, async (err, user) => {
    if (err || !user) {
      return res.status(400).json(failAction("The user is not registered"));
    }
    try {
      const token = crypto.randomBytes(32).toString("hex");

      await verifyToken({
        token: token,
        email: req.body.email,
      }).save();

      const uri = `http://api.techfestsliet.com/verifyUser/${token}`;

      mail.sendMail({
        to: req.body.email,
        subject: "Verification Email",
        html: `<h3>Click on the link to verify your email: <br></h3>
        <p><a href=${uri}>Click here</a></p>`,
      });

      res
        .status(200)
        .json(successAction("The verification email is successfully sent"));
    } catch (err) {
      return res.status(400).json(failAction(err));
    }
  });
};

module.exports.verifyUser = async (req, res) => {
  const token = await req.params.token;
  if (token) {
    const verify = await verifyToken.findOne({ token: token });
    if (verify) {
      let user = await User.findOne({ email: verify.email });
      user.isVerified = true;
      await user.save();
      await verifyToken.findOneAndDelete({ token: token });

      return res.render("verifyuser", {
        isError: false,
        message: "The user is verified successfully!",
      });
      // return res.status(200).json(successAction("The user is verified"));
    } else {
      return res.render("verifyuser", {
        isError: true,
        message: "The token is expired!",
      });
      // return res.status(404).json(failAction("The token is expired"));
    }
  } else {
    return res.render("verifyuser", {
      isError: true,
      message: "Cannot get token",
    });
    // return res.status(404).json(failAction("Cannot get token"));
  }
};

module.exports.resetPassword = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array()[0].msg);
    return res
      .status(208)
      .json({ title: "Error", message: errors.array()[0].msg });
  }

  User.findOne({ email: req.body.email }, async (err, user) => {
    if (err || !user) {
      return res
        .status(208)
        .json({ title: "Error", message: "User not found" });
    } else {
      try {
        const condition = await bcrypt.compare(
          req.body.oldPassword,
          user.password
        );
        if (condition) {
          const encryptedPassword = (
            await bcrypt.hash(req.body.oldPassword, 10)
          ).toString();
          User.findOneAndUpdate(
            { user: user.userId },
            { $set: { password: encryptedPassword } },
            (err, user) => {
              if (err && !user) {
                console.log(err);
                return res
                  .status(208)
                  .json({ title: "Error", message: "Cannot update password" });
              } else {
                return res
                  .status(200)
                  .json({ title: "Success", message: "Password is changed" });
              }
            }
          );
        } else {
          return res
            .status(208)
            .json({ title: "Error", message: "The email is not registered" });
        }
      } catch (err) {
        return res.status(208).json(failAction("Cannot update password"));
      }
    }
  });
};

module.exports.signOut = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json(successAction("Signed Out successfully"));
};

exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors.array);
    return res.status(200).json({
      isError: true,
      title: "Error",
      message: "Email is required",
    });
  }

  const { email } = await req.body;

  User.findOne({ email: email }, async (err, user) => {
    if (err || !user) {
      return res.status(200).json({
        isError: true,
        title: "Error",
        message: "The email is not registered",
      });
    }
    try {
      await verifyToken.findOneAndDelete({ email: email });

      const token = crypto.randomBytes(32).toString("hex");

      await verifyToken({
        token: token,
        email: req.body.email,
      }).save();

      const uri = `https://api.techfestsliet.com/forget-password-token/${token}`;

      mail.sendMail({
        to: req.body.email,
        subject: "Forgot Password Email",
        html: `<h3>Click on the link to verify your email: <br></h3>
        <p><a href=${uri}>Click here</a></p>`,
      });

      res.status(200).json({
        title: "Error",
        message: "The verification email is successfully sent",
      });
    } catch (err) {
      return res.status(200).json({
        isError: true,
        title: "Error",
        message: err,
      });
    }
  });
};

exports.changeForgotPassword = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json(failAction(errors.array()[0]));
  }

  const token = req.params.token;

  verifyToken.findOne({ token: token }, async (err, token) => {
    if (err || !token) {
      return res
        .status(401)
        .json(failAction("Token not found or token expired"));
    }

    try {
      res.render("forgotPassword.ejs", { email: token.email });
    } catch (err) {
      return res.status(404).json("Some error occured" + err);
    }
  });
};

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  console.log(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    console.log(body);
    return res.status(400).json(failAction(errors));
  }

  const { email, password } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);

  try {
    User.findOneAndUpdate(
      { email: email },
      { $set: { password: encryptedPassword } },
      (err, user) => {
        if (err && !user) {
          console.log(err);
          return res.status(404).json({ message: "Cannot update password" });
        }
        return res.status(200).json({ message: "Password is changed" });
      }
    );
  } catch (err) {
    return res.status(201).json({ message: err });
  }
};

//middlewares

module.exports.isValidReferral = (req, res, next) => {
  if (req.body.referralCode == "" || !req.body.referralCode) {
    next();
  } else {
    User.findOne({ referralCode: req.body.referralCode }, (err, user) => {
      if (err || !user) {
        return res
          .status(200)
          .json({ isError: true, message: "Invalid referral code" });
      } else {
        next();
      }
    });
  }
};
